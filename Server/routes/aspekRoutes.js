import express from "express";
import { getAllAspek, addAspek, getAspekById, updateAspek, deleteAspek, toggleAspekStatus, getAspekByRole } from "../controllers/aspekController.js";

const router = express.Router();

router.get("/", getAllAspek);
router.post("/", addAspek);
router.get("/:id", getAspekById);
router.put("/:id", updateAspek);
router.delete("/:id", deleteAspek);
router.patch("/:id/status", toggleAspekStatus);
router.get("/user/:userId", getAspekByRole); // Contoh route untuk ambil aspek berdasarkan role user

export default router;
