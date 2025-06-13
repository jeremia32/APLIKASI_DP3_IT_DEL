import express from "express";
import { getAllKategori,getQusionerByRole, getTreeKuisioner, getKategoriById, addKategori, updateKategori, deleteKategori, getKategoriByRole } from "../controllers/KategoriController.js";

const router = express.Router();

// Middleware untuk validasi ObjectId (MongoDB)
const validateObjectId = (req, res, next) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID tidak valid" });
  }
  next();
};

router.get("/tree", getTreeKuisioner); // 🔹 Route untuk ambil struktur kuisioner lengkap
router.get("/by-role/:role", getQusionerByRole);

// Routes
router.get("/", getAllKategori); // Mendapatkan semua kategori
router.get("/:id", validateObjectId, getKategoriById); // Mendapatkan kategori berdasarkan ID
router.get("/user/:userId", validateObjectId, getKategoriByRole); // 🔹 Mendapatkan kategori berdasarkan role user
router.post("/", addKategori); // Menambahkan kategori baru
router.put("/:id", validateObjectId, updateKategori); // Mengupdate kategori berdasarkan ID
router.delete("/:id", validateObjectId, deleteKategori); // Menghapus kategori berdasarkan ID

export default router;
