// import express from "express";
// import { getEvaluations, getEvaluationsForPenilai } from "../controllers/PenilaiaUser.js";
// import { protect } from "../middleware/PenilaianUser.js";

// const router = express.Router();

// // Endpoint untuk semua evaluasi (admin atau role lain yang diizinkan)
// router.get("/evaluations", protect, getEvaluations);

// // Endpoint untuk penilai yang login — hanya tampilkan data yang sesuai dengan user login
// router.get("/evaluationsForPenilai", protect, getEvaluationsForPenilai);

// export default router;
import express from "express";
import { getEvaluations, getEvaluationsForPenilai, deactivateEvaluation } from "../controllers/PenilaiaUser.js";
import { protect } from "../middleware/PenilaianUser.js";

const router = express.Router();

// Endpoint untuk semua evaluasi (admin atau role lain yang diizinkan)
router.get("/evaluations", protect, getEvaluations);

// Endpoint untuk penilai yang login — hanya tampilkan data yang sesuai dengan user login
router.get("/evaluationsForPenilai", protect, getEvaluationsForPenilai);

// Endpoint untuk menonaktifkan evaluasi setelah penilaian
router.put("/evaluations/:evaluationId/deactivate", protect, deactivateEvaluation);

export default router;
