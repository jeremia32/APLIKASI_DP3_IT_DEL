import express from "express";
import { getAllRubrik, getRubrikById, addRubrik, updateRubrik, deleteRubrik, toggleRubrikStatus } from "../controllers/rubrikController.js";

const router = express.Router();

// Endpoint untuk mendapatkan semua rubrik (bisa dikirim query ?isActive=true)
router.get("/", getAllRubrik);

// Endpoint untuk mendapatkan rubrik berdasarkan ID
router.get("/:id", getRubrikById);

// Endpoint untuk membuat rubrik baru
router.post("/create", addRubrik);

// Endpoint untuk memperbarui rubrik berdasarkan ID
router.put("/:id", updateRubrik);

// Endpoint untuk menghapus rubrik berdasarkan ID
router.delete("/:id", deleteRubrik);

// Endpoint untuk toggle status rubrik
router.patch("/:id/status", toggleRubrikStatus);

export default router;
