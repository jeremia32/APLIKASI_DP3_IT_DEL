import mongoose from "mongoose";

// Fungsi validasi agar setidaknya satu role diisi
function arrayMinLength(val) {
  return val && val.length > 0;
}

const kategoriSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    deskripsi: {
      type: String,
      trim: true,
    },
    roles: {
      type: [String],
      enum: ["Staff", "dosen", "Mahasiswa", "dekan", "kaprodi"],
      required: true,
      validate: [arrayMinLength, "Setidaknya satu role harus dipilih"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true }, // aktifkan virtuals di toObject
    toJSON: { virtuals: true }, // aktifkan virtuals di toJSON
  }
);

// **Virtual** untuk populate Aspek → Kategori
kategoriSchema.virtual("aspek", {
  ref: "Aspek", // model tujuan
  localField: "_id", // field di Kategori
  foreignField: "kategori", // field di Aspek
});

// export model
export default mongoose.model("Kategori", kategoriSchema);
