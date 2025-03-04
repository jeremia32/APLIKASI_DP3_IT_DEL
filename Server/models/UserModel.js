import mongoose from "mongoose";
import bcrypt from "bcryptjs";
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
    enum: ["staff", "dosen", "mahasiswa", "pegawai"],
    required: [true, "role harus diisi ya "]
  },
  password: {
    type: String,
    required: true,
    default: () => uuidv4().slice(0, 8), // Auto-generate password 8 karakter
  },
  grup: {
    type: String,
    required: false,
  },
  posisi: {
    type: String,
    required: false,
  },
  jabatan: {
    type: String,
    required: false,
  },
  unit_kerja: {
    type: String,
    enum: ["IT DEL", "Yayasan Cabang", "Yayasan Pusat"],
    required: false,
  },
  status: {
    type: String,
    enum: ["aktif", "non-aktif", "TSDP", "Meninggal"],
    default: "aktif",
  },
  jenis_kelamin: {
    type: String,
    enum: ["laki-laki", "perempuan"],
    required: true,
  },
  email: {
    type: String,
    required: [true, "Email harus diisi"],
    unique: true,
    match: [/.+\@.+\..+/, "Email tidak valid"],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Hash password sebelum menyimpan user baru
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", UserSchema);
export default User;
