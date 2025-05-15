// // routes/hasilPenilaianRoutes.js
// import express from "express";
// import { getAllUserRecap, getOverallRecap, getByEvaluator, createHasilPenilaian, getRekapByEvaluator, exportRekapExcel, exportRekapPDF } from "../controllers/hasilPenilaianController.js";

// const router = express.Router();

// router.get("/rekap/:evaluatorNip", getRekapByEvaluator);
// router.get("/rekap/:evaluatorNip/export/excel", exportRekapExcel);
// router.get("/rekap/:evaluatorNip/export/pdf", exportRekapPDF);
// router.get("/by-evaluator/:evaluatorNip", getByEvaluator);
// router.post("/", createHasilPenilaian);
// router.get("/rekap/users", getAllUserRecap);
// router.get("/rekap/overall", getOverallRecap);

// export default router;
// routes/hasilPenilaianRoutes.js
import express from "express";
import {
  exportAllRecapToExcel,
  getAllUserRecap,
  getOverallRecap,
  createHasilPenilaian,
  getRekapByEvaluator,
  exportRekapPDF,
  exportRekapExcel,
  exportRekapUserPDF,
  getRekapUserJSON,
  exportRekapUserToExcel,
  getDetailPenilaianUser,
  exportAllDetailToExcel,
  exportRekapUserToExcelByNip,
} from "../controllers/hasilPenilaianController.js";

const router = express.Router();
// Route baru: semua hasil penilaian

// 1. Rekap admin: per‐user & keseluruhan
router.get("/rekap/users", getAllUserRecap);
router.get("/rekap/overall", getOverallRecap);
router.get("/rekap/export/excel", exportRekapExcel);
router.get("/rekap/export/pdf", exportRekapUserPDF);
router.get("/rekap/detail-penilaian", getDetailPenilaianUser);
router.get("/export/user", exportRekapUserToExcel);
router.get("/Backup/user", exportAllDetailToExcel);
// 2. Rekap evaluator spesifik & export
router.get("/export/rekap/:evaluatorNip", exportRekapUserToExcelByNip);
router.get("/DetailLaporanPage/:evaluatorNip", getRekapByEvaluator);

// router.get("/rekap/:evaluatorNip/export/excel", exportRekapExcel);
router.get("/rekap/:evaluatorNip/export/pdf", exportRekapPDF);
// router.get("/rekap/user/:userId/export/excel", exportHasilPenilaianToExcel);
router.get("/rekap/all/export/excel", exportAllRecapToExcel);
// routes/hasilPenilaianRoutes.js
// Ekspor rekap keseluruhan per evaluator
// Route untuk mendapatkan daftar penilaianUser
// 4. Simpan hasil penilaian
router.post("/", createHasilPenilaian);
router.get("/json/user", getRekapUserJSON);

export default router;
