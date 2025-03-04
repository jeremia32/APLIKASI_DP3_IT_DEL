import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const regisUser = async (req, res) => {
  try {
    const { nip, username, role, grup, posisi, jabatan, unit_kerja, status, jenis_kelamin, email, password } = req.body;

    // Periksa apakah username atau email sudah digunakan
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username atau Email sudah digunakan" });
    }

    // Jika password tidak diberikan, buat password otomatis
    const generatedPassword = password || uuidv4().slice(0, 8);

    // Buat user baru (password akan di-hash secara otomatis oleh model)
    const newUser = new User({
      nip,
      username,
      role,
      grup,
      posisi,
      jabatan,
      unit_kerja,
      status,
      jenis_kelamin,
      email,
      password: generatedPassword,
    });

    await newUser.save();

    // Buat token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User berhasil didaftarkan",
      token,
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      password: generatedPassword, // Mengembalikan password jika auto-generate
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
