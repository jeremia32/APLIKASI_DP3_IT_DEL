import mongoose from "mongoose";

const pertanyaanSchema = new mongoose.Schema(
  {
    teks: { type: String, required: true },
    aspek: { type: mongoose.Schema.Types.ObjectId, ref: "Aspek", required: true },
    bobot: { type: Number, default: 1 },
    rubrik: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rubrik" }],
    // Field untuk status aktif/non-aktif pertanyaan, default aktif (true)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Pertanyaan", pertanyaanSchema);
