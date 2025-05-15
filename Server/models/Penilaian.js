import mongoose from "mongoose";

const penilaianSchema = new mongoose.Schema({
  penilai: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Siapa yang menilai
  dinilai: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Siapa yang dinilai
  rubrik: { type: mongoose.Schema.Types.ObjectId, ref: "Rubrik", required: true }, // Rubrik yang digunakan
  skor: { type: Number, required: true }, // Skor yang diberikan
  tanggal: { type: Date, default: Date.now }, // Tanggal penilaian
  active: { type: Boolean, default: true }, // << Tambahkan ini
});

export default mongoose.model("Penilaian", penilaianSchema);
