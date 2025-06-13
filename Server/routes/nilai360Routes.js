import express from "express";
import { assignPenilai, deleteEvaluation, getEvaluations, deactivateEvaluation, sendAccount, activateEvaluation } from "../controllers/nilai360Controller.js";

const router = express.Router();
// Endpoint untuk menetapkan penilai dalam sistem Nilai360
router.post("/assign", assignPenilai);

// Endpoint untuk mengambil semua evaluasi
router.get("/", getEvaluations);
// routes/nilai360Routes.js
router.delete("/:id", deleteEvaluation);

// Endpoint untuk menonaktifkan evaluasi
router.put("/:id/deactivate", deactivateEvaluation);
// Tambahkan endpoint untuk mengaktifkan evaluasi
router.put("/:id/activate", activateEvaluation);

// Endpoint untuk mengirim akun
router.post("/:id/send-account", sendAccount);
// router.post("/:nip/send-account", sendAccount);

export default router;
