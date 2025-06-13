import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const regisUser = async (req, res) => {
  try {
    const { nip, username, role, posisi, email, password, prestasi } = req.body;

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username atau Email sudah digunakan" });
    }

    // Buat password acak jika tidak dikirim
    const generatedPassword = password || uuidv4().replace(/-/g, "").slice(0, 15);

    // Buat user baru
    const newUser = new User({
      nip,
      username,
      role,
      posisi,
      email,
      password: generatedPassword,
      prestasi: prestasi || [], // default array kosong jika tidak dikirim
    });

    await newUser.save();

    // Buat token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User berhasil didaftarkan",
      token,
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      password: generatedPassword, // ditampilkan kalau memang kamu izinkan
    });
  } catch (error) {
    console.error("Error saat registrasi:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * Endpoint untuk mengecek keunikan field (nip atau username atau email)
 * GET /api/users/check-unique?field=nip&value=12345
 */
export const checkUnique = async (req, res) => {
  try {
    const { field, value } = req.query;

    if (!["nip", "username", "email"].includes(field)) {
      return res.status(400).json({ message: "Field tidak valid" });
    }

    const filter = {};
    filter[field] = value;

    const exists = await User.exists(filter);
    return res.json({ exists: Boolean(exists) });
  } catch (err) {
    console.error("Error di checkUnique:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
