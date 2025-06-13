import express from "express";
import { submitPenilaian } from "../controllers/penilaianController.js";

const router = express.Router();

// Endpoint untuk menyimpan hasil penilaian
router.post("/submit", submitPenilaian);

export default router;

