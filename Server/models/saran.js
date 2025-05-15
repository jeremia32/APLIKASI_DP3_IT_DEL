import mongoose from "mongoose";

const saranSchema = new mongoose.Schema({
  pertanyaan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pertanyaan",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isi: {
    type: String,
    required: false, // <-- Boleh dikosongkan (opsional)
    trim: true,
  },
  penilaianUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HasilPenilaian", // opsional, jika ingin tahu saran ini milik penilaian ke berapa
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Saran", saranSchema);
