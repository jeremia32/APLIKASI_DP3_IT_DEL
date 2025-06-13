import Nilai360 from "../models/Nilai360.js";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";

export async function assignPenilai(req, res) {
  try {
    const { userId, role, penilaiIds } = req.body;

    // Cari user berdasarkan NIP, bukan berdasarkan _id
    const userExists = await User.findOne({ nip: userId });
    if (!userExists) return res.status(404).json({ message: "User tidak ditemukan" });

    // Simpan dokumen dengan user: userExists.nip
    const nilai360 = new Nilai360({
      user: userExists._id, // Benar: mengirimkan ObjectId dari user
      role,
      penilai: penilaiIds,
    });

    await nilai360.save();
    res.status(201).json({ message: "Penilai berhasil ditambahkan", nilai360 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// controllers/nilai360Controller.js
export async function deleteEvaluation(req, res) {
  try {
    await Nilai360.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Penilaian dihapus" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getEvaluations = async (req, res) => {
  try {
    const evaluations = await Nilai360.find().populate("penilai", "nip username email role").populate("user", "nip username email role");
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint untuk menonaktifkan evaluasi (Nonaktifkan Penilaian)
export const deactivateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await Nilai360.findByIdAndUpdate(id, { active: false }, { new: true });
    if (!evaluation) return res.status(404).json({ message: "Evaluasi tidak ditemukan" });
    res.status(200).json({
      message: "Evaluasi berhasil dinonaktifkan",
      evaluation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint untuk mengaktifkan evaluasi (Aktifkan Penilaian)
export const activateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await Nilai360.findByIdAndUpdate(id, { active: true }, { new: true });
    if (!evaluation) return res.status(404).json({ message: "Evaluasi tidak ditemukan" });
    res.status(200).json({
      message: "Evaluasi berhasil diaktifkan",
      evaluation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendAccount = async (req, res) => {
  try {
    const { id } = req.params; // id di sini merupakan _id evaluasi
    if (!id) {
      return res.status(400).json({ message: "Parameter ID diperlukan" });
    }

    // Cari evaluasi berdasarkan _id
    const evaluation = await Nilai360.findByIdAndUpdate(id, { accountSent: true }, { new: true }).populate("penilai", "nip username email role password");

    if (!evaluation) {
      return res.status(404).json({ message: "Evaluasi tidak ditemukan" });
    }

    // Pastikan field penilai tidak kosong
    if (!evaluation.penilai || evaluation.penilai.length === 0) {
      return res.status(404).json({ message: "Penilai tidak ditemukan" });
    }

    const penilai = evaluation.penilai[0];

    // Validasi data penilai
    if (!penilai.nip || !penilai.username || !penilai.email || !penilai.password) {
      return res.status(400).json({ message: "Data penilai tidak lengkap" });
    }

    // Konfigurasi transporter menggunakan Gmail
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Gunakan false untuk TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Periksa kredensial sebelum mengirim email (opsional untuk debug)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({ message: "Kredensial email tidak diset" });
    }

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: penilai.email,
      subject: "Selamat Datang di DP3 IT DEL - Akun Anda",
      html: `
          <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 10px;">
              <div style="text-align: center;">
                  <img src="cid:logo" alt="DP3 IT DEL" style="width: 150px; margin-bottom: 20px;">
              </div>
              <h2 style="color: #2e6da4; text-align: center;">Selamat Datang di DP3 IT DEL</h2>
              <p style="text-align: center;">Berikut adalah akun Anda:</p>
              <table style="width: 100%; max-width: 400px; margin: auto; border-collapse: collapse; background: #ffffff; border-radius: 5px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Username:</td>
                      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f3f3f3;">${penilai.username}</td>
                  </tr>
                  <tr>
                      <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Password:</td>
                      <td style="padding: 10px; border: 1px solid #ddd; background-color: #f3f3f3;">${penilai.password}</td>
                  </tr>
              </table>
              <p style="text-align: center; margin-top: 20px;">Semoga Anda sukses dan terus berkembang bersama kami.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                  <h3 style="color: #2e6da4;">Cara Melakukan Penilaian</h3>
                  <img src="cid:panduan" alt="Cara Penilaian" style="width: 100%; max-width: 500px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
              </div>
          </div>
      `,
      attachments: [
        {
          filename: "ITDEL.jpg",
          path: "../src/assets/ITDEL.jpg",
          cid: "logo", // Logo di atas
        },
        {
          filename: "panduan_penilaian.jpg",
          path: "../src/assets/panduan_penilaian.jpg",
          cid: "panduan", // Gambar panduan di bagian bawah
        },
      ],
    };

    // Kirim email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Akun berhasil dikirim melalui email",
      evaluation,
    });
  } catch (error) {
    console.error("Error sending account:", error);
    res.status(500).json({ message: error.message });
  }
};
