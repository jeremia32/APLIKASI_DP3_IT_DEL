import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Get jumlah user berdasarkan role
export const getSejawatUsers = async (req, res) => {
  try {
    const { nip } = req.query; // Ambil nip dari query parameter

    // Cari evaluator berdasarkan nip untuk mendapatkan role-nya
    const evaluator = await User.findOne({ nip });
    if (!evaluator) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Normalisasi role evaluator
    const evaluatorRole = evaluator.role.trim().toLowerCase();

    // Ambil semua user yang memiliki role yang sama dengan evaluator (case-insensitive)
    const sejawatUsers = await User.find({
      role: { $regex: `^${evaluator.role}$`, $options: "i" },
    });

    // Filter atasan sesuai aturan
    let atasanUsers = [];
    if (evaluatorRole === "dosen") {
      // Jika evaluator adalah dosen, atasan adalah user dengan role "kaprodi" atau "dekan"
      atasanUsers = await User.find({
        role: { $in: ["kaprodi", "dekan"] },
      });
    } else if (evaluatorRole === "kaprodi") {
      // Jika evaluator adalah kaprodi, atasan adalah user dengan role "dekan" (case-insensitive)
      atasanUsers = await User.find({
        role: { $regex: "^dekan$", $options: "i" },
      });
    }
    // Jika evaluator adalah dekan, atasanUsers tetap kosong karena tidak ada atasan

    res.status(200).json({
      evaluator,
      sejawatUsers,
      atasanUsers,
    });
  } catch (error) {
    console.error("Error mengambil data evaluasi:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
// Get jumlah user berdasarkan role
export const getUserCountByRole = async (req, res) => {
  try {
    const roles = ["kaprodi", "Staff", "dosen", "dekan"];
    const userCounts = {};

    for (const role of roles) {
      const count = await User.countDocuments({ role });
      // console.log(`Role: ${role}, Count: ${count}`); // ✅ Debugging
      userCounts[role] = count;
    }

    res.status(200).json(userCounts);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params; // Mengambil parameter role dari URL

    // Validasi role yang diperbolehkan
    const validRoles = ["kaprodi", "Staff", "dosen", "dekan"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Mengambil user berdasarkan role
    const users = await User.find({ role });

    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Controller untuk mendapatkan semua user
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Mengambil semua user dari database
    res.status(200).json(users); // Mengirimkan data user sebagai JSON
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pengguna", error: error.message });
  }
};

// Controller untuk mendapatkan semua user dengan role "dosen"
export const getAllDosen = async (req, res) => {
  try {
    // Cari user dengan role "dosen"
    const dosenList = await User.find({ role: "dosen" });

    // Periksa apakah ada data dosen
    if (dosenList.length === 0) {
      return res.status(404).json({ message: "Tidak ada dosen yang ditemukan" });
    }

    res.status(200).json(dosenList);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};
export const getAllStaff = async (req, res) => {
  try {
    // Cari user dengan role "STAFF"
    const Stafflist = await User.find({ role: "Staff" });

    // Periksa apakah ada data STAFF
    if (Stafflist.length === 0) {
      return res.status(404).json({ message: "Tidak ada staff yang ditemukan" });
    }

    res.status(200).json(Stafflist);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};
export const getAlldekan = async (req, res) => {
  try {
    // Cari user dengan role "dekan"
    const Stafflist = await User.find({ role: "dekan" });

    // Periksa apakah ada data dekan
    if (Stafflist.length === 0) {
      return res.status(404).json({ message: "Tidak ada dekan yang ditemukan" });
    }

    res.status(200).json(Stafflist);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};
export const getAllkaprodi = async (req, res) => {
  try {
    // Cari user dengan role "dekan"
    const Stafflist = await User.find({ role: "kaprodi" });

    // Periksa apakah ada data dekan
    if (Stafflist.length === 0) {
      return res.status(404).json({ message: "Tidak ada dekan yang ditemukan" });
    }

    res.status(200).json(Stafflist);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};
// ====================================================================================================================
export const getUserByNIP = async (req, res) => {
  try {
    const { nip } = req.params;

    const user = await User.findOne({ nip });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ message: "User ditemukan", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { nip } = req.params;
    const user = await User.findOne({ nip });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Log untuk debugging
    console.log("Data update:", req.body);

    // Update field-field yang dikirim. Jika password ada dan berbeda, update juga
    Object.keys(req.body).forEach((key) => {
      // Jika field password dikirim, pastikan untuk update nilainya
      if (key === "password" && req.body.password) {
        user.password = req.body.password;
      } else {
        user[key] = req.body[key];
      }
    });

    // Jika ada file yang diunggah untuk bukti_prestasi
    if (req.files && req.files.bukti_prestasi) {
      user.bukti_prestasi = req.files.bukti_prestasi.map((file) => `/api/uploads/${file.filename}`);
    }

    // Simpan user yang telah diperbarui (pre-save hook akan dipanggil)
    const updatedUser = await user.save();

    res.status(200).json({ message: "User berhasil diperbarui", user: updatedUser });
  } catch (error) {
    console.error("Error saat memperbarui user:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// ===================================================================================\
// controller untuk login user
// Fungsi untuk menandatangani token JWT
// Fungsi untuk menandatangani token JWT
const signToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "2h",
  });
};

// Fungsi untuk mengirim token ke Cookie dan Local Storage
const createSendResToken = (user, statusCode, res) => {
  const token = signToken(user); // Perbaikan: kirim objek user, bukan user._id
  const isDev = process.env.NODE_ENV !== "production";

  const cookieOptions = {
    expires: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: !isDev,
    sameSite: "strict",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    message: "Login berhasil",
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role,
    },
  });
};

// Login User tanpa hashing
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Username salah mohon cek kembali" });
    }

    // Bandingkan password secara langsung (TANPA hashing)
    if (password !== user.password) {
      return res.status(401).json({ message: "Password salah mohon cek kembali " });
    }

    createSendResToken(user, 200, res);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "username email role");
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil profil", error: error.message });
  }
};



// Logout User
export const logoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(200).json({ message: "Logout berhasil" });
};
