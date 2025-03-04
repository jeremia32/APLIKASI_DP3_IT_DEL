import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";

export const regisAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Periksa apakah username atau email sudah digunakan
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ message: "Username atau Email sudah digunakan" });
    }

    // Buat admin baru (password akan di-hash secara otomatis oleh model)
    const newAdmin = new Admin({
      username,
      email,
      password, // Tidak perlu hashing manual
    });

    await newAdmin.save();

    // Buat token JWT
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "Admin berhasil didaftarkan",
      token,
      adminId: newAdmin._id,
      username: newAdmin.username,
      email: newAdmin.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
