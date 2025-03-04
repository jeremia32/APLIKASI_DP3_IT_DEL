import Admin from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

// Fungsi untuk menandatangani token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Fungsi untuk mengirim token ke Cookie dan Local Storage
const createSendResToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const isDev = process.env.NODE_ENV !== "production";

  const cookieOptions = {
    expires: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    httpOnly: true, // Cookie tidak bisa diakses dari JavaScript (lebih aman)
    secure: isDev, // Hanya untuk HTTPS jika production
    sameSite: "strict",
  };

  // Simpan token di Cookie
  res.cookie("jwt", token, cookieOptions);

  // Hapus password sebelum mengirim respons
  user.password = undefined;

  // Kirim token ke frontend agar bisa disimpan di Local Storage juga
  res.status(statusCode).json({
    message: "Login berhasil",
    token, // Simpan di Local Storage di frontend
    admin: {
      id: user._id,
      username: user.username,
    },
  });
};

// Login Admin
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password salah" });
    }

    createSendResToken(admin, 200, res);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id, "username email");
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }
    res.status(200).json({ username: admin.username, email: admin.email });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil profil", error: error.message });
  }
};

const validatePasswordChange = [
  body("oldPassword").notEmpty().withMessage("Password lama tidak boleh kosong"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password baru harus memiliki minimal 8 karakter")
    .matches(/[0-9]/)
    .withMessage("Password baru harus mengandung angka")
    .matches(/[A-Z]/)
    .withMessage("Password baru harus mengandung huruf kapital"),
];

export const changePassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(404).json({ message: "Admin tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password lama salah" });
    }

    // jangan di hash
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
  // res.send("oke")
};

export const logoutAdmin = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    message: "Logout berhasil",
  });
};
export { validatePasswordChange };
