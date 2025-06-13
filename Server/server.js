import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminRoutes from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import KategoriRoutes from "./routes/KategoriRoutes.js";
import aspekRoutes from "./routes/aspekRoutes.js";
import pertanyaanRoutes from "./routes/pertanyaanRoutes.js";
import rubrikRoutes from "./routes/rubrikRoutes.js";
import nilai360Routes from "./routes/nilai360Routes.js";
import PenilaianUser from "./routes/userPenilaian.js";
import penilaianRoutes from "./routes/penilaianRoutes.js";
import UserloginRouter from "./routes/UserloginRoutes.js";
import fs from "fs";
import upload from "./middleware/uploadMiddleware.js";
import User from "./models/userModel.js"; // Pastikan model User diimpor
import hasilPenilaianRoutes from "./routes/hasilPenilaianRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // Sesuaikan dengan domain frontend
    credentials: true, // Izinkan pengiriman cookies dalam request
  })
);
app.use(express.json());
app.use(cookieParser());

// Rute utama
app.get("/", (req, res) => {
  res.json({ message: "Backend Express.js berjalan!" });
});

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log("📁 Folder uploads dibuat");
}
app.use("/api/ai", aiRoutes);

// Gunakan rute admin
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/userslogin", UserloginRouter);
// Menggunakan route kategori
app.use("/api/kategori", KategoriRoutes);
app.use("/api/aspek", aspekRoutes);
app.use("/api/PenilaianUser", PenilaianUser);
app.use("/api/pertanyaan", pertanyaanRoutes);
app.use("/api/rubrik", rubrikRoutes);
app.use("/api/nilai360", nilai360Routes);
app.use("/api/penilaian", penilaianRoutes);
app.use("/api/hasil-penilaian", hasilPenilaianRoutes);

// Menyediakan akses ke file upload secara statis
app.use("/api/uploads", express.static("uploads"));

// Endpoint untuk upload file menggunakan POST
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Tidak ada file yang diupload" });
  }
  // Kembalikan URL file yang telah diupload
  res.status(200).json({ url: `/api/uploads/${req.file.filename}` });
});

app.put("/api/users/:nip", async (req, res) => {
  try {
    const { nip } = req.params;
    const updateData = { ...req.body };

    const updatedUser = await User.findOneAndUpdate({ nip }, { $set: updateData }, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ message: "User berhasil diperbarui", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate data", error: error.message });
  }
});

// Koneksi ke MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Terhubung ke MongoDB");
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Koneksi MongoDB gagal:", err));
