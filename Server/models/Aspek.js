import mongoose from "mongoose";

const aspekSchema = new mongoose.Schema(
  {
    nama: { type: String, required: true },
    kategori: { type: mongoose.Schema.Types.ObjectId, ref: "Kategori", required: true },
    deskripsi: { type: String },
    // Field untuk status aktif/nonaktif aspek, default true (aktif)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true } // Menambahkan createdAt dan updatedAt
);
// Menambahkan virtual untuk relasi dengan 'Pertanyaan'
aspekSchema.virtual("pertanyaan", {
  ref: "Pertanyaan", // Nama model 'Pertanyaan'
  localField: "_id", // Field yang ada di model Aspek
  foreignField: "aspek", // Field yang ada di model Pertanyaan yang mengacu pada Aspek
});

aspekSchema.set("toObject", { virtuals: true });
aspekSchema.set("toJSON", { virtuals: true });
export default mongoose.model("Aspek", aspekSchema);
