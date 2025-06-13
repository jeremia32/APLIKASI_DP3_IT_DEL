// models/HasilPenilaian.js
import mongoose from "mongoose";

const jawabanSchema = new mongoose.Schema(
  {
    pertanyaan: { type: mongoose.Schema.Types.ObjectId, ref: "Pertanyaan", required: true },
    nilai: { type: Number, required: true, min: 1, max: 7 },
  },
  { _id: false }
);

const hasilPenilaianSchema = new mongoose.Schema(
  {
    penilaianUser: {
      // referensi ke assignment PenilaianUser (yang berisi userDinilai)
      type: mongoose.Schema.Types.ObjectId,
      // ref: "PenilaianUser",
      ref: "Nilai360", // Mengacu ke model Nilai360

      required: true,
    },

    evaluatorNip: { type: String, required: true }, // NIP penilai
    jawaban: [jawabanSchema],
  },
  { timestamps: true }
);

export default mongoose.model("HasilPenilaian", hasilPenilaianSchema);
//
