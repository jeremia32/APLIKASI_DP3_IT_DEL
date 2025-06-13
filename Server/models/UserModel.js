import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid"; // Untuk auto-generate password jika diperlukan

const UserSchema = new mongoose.Schema({
  nip: {
    type: String,
    required: [true, "NIP harus diisi ya "],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Username harus diisi ya"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["Staff", "dosen", "Mahasiswa", "dekan", "kaprodi"],
    required: [true, "role harus diisi ya "],
  },
  password: {
    type: String,
    required: [true, "Password harus diisi"],
    minlength: [6, "Password minimal 6 karakter"],
    default: () => uuidv4().replace(/-/g, "").slice(0, 15), // Auto-generate password 15 karakter
  },
  posisi: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: [true, "Email harus diisi"],
    unique: true,
    match: [/.+\@.+\..+/, "Email tidak valid"],
  },
  prestasi: {
    type: [String], // Ubah dari string menjadi array of strings
    required: false,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);
// const User = mongoose.model("User", UserSchema);
export default User;
