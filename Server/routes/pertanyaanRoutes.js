// import express from "express";
// import { getAllPertanyaan, addPertanyaan, getPertanyaanById, updatePertanyaan, deletePertanyaan } from "../controllers/pertanyaanController.js";

// const router = express.Router();

// router.get("/", getAllPertanyaan);
// router.post("/", addPertanyaan);
// router.get("/:id", getPertanyaanById);
// router.put("/:id", updatePertanyaan);
// router.delete("/:id", deletePertanyaan);

// export default router;
import express from "express";
import { getAllPertanyaan, addPertanyaan, getPertanyaanById, updatePertanyaan, deletePertanyaan, togglePertanyaanStatus } from "../controllers/pertanyaanController.js";

const router = express.Router();

// Middleware untuk validasi request
const validatePertanyaan = (req, res, next) => {
  const { teks, aspek, bobot, rubrik } = req.body;
  if (!teks || !aspek || !rubrik || rubrik.length !== 7) {
    return res.status(400).json({
      message: "Data tidak valid. Pastikan 'teks', 'aspek' dan tepat 7 rubrik tersedia dalam 'rubrik'.",
    });
  }
  next();
};

// Routes CRUD
router.get("/", getAllPertanyaan);
router.post("/", validatePertanyaan, addPertanyaan);
router.get("/:id", getPertanyaanById);
router.put("/:id", validatePertanyaan, updatePertanyaan);
router.delete("/:id", deletePertanyaan);
router.patch("/:id/status", togglePertanyaanStatus);

export default router;
