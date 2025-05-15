// import mongoose from "mongoose";

// const rubrikSchema = new mongoose.Schema({
//   aspek: { type: mongoose.Schema.Types.ObjectId, ref: "Aspek", required: true },
//   pertanyaan: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pertanyaan" }], // Pertanyaan terkait aspek
//   totalSkor: { type: Number, default: 0 }, // Total nilai yang dihitung dari semua pertanyaan
// });

// export default mongoose.model("Rubrik", rubrikSchema);
// // rubrikModel.js
// import mongoose from "mongoose";

// const rubrikSchema = new mongoose.Schema(
//   {
//     label: { type: String, required: true },
//     Deskripsi: { type: String, required: true },
//     skor: { type: Number, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Rubrik", rubrikSchema);

import mongoose from "mongoose";

const rubrikSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    deskripsi: { type: String, required: true }, // Gunakan huruf kecil untuk konsistensi
    skor: {
      type: Number,
      required: true,
      min: 0, // Pastikan skor tidak negatif
      max: 100, // Sesuaikan batas maksimal sesuai kebutuhan
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // Menyimpan createdAt dan updatedAt otomatis
);

export default mongoose.model("Rubrik", rubrikSchema);
