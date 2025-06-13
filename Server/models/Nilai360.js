import mongoose from "mongoose";

const nilai360Schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User yang dinilai
  role: { type: String, enum: ["Sejawat", "Atasan", "Client"], required: true }, // Peran dalam 360° review
  penilai: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // User lain yang bisa menilai
  active: { type: Boolean, default: true },
  accountSent: { type: Boolean, default: false },
  tanggal: { type: Date, default: Date.now }, // Tanggal penilaian
  rubrik: { type: mongoose.Schema.Types.ObjectId, ref: "Rubrik" }, // hapus required: true
  skor: { type: Number, default: 0 }, // hapus required: true
});

export default mongoose.model("Nilai360", nilai360Schema);
