import express from "express";
import { getAllDosen, getUsersByRole, getUserByNIP, updateUser, getAllStaff, getAllUsers, getUserCountByRole, getSejawatUsers, getAlldekan, getAllkaprodi } from "../controllers/userController.js";
import upload from "../middleware/uploadMiddleware.js"; // ✅ Gunakan middleware yang sudah dibuat
import { regisUser, checkUnique } from "../controllers/regisUser.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Endpoint untuk mendapatkan semua dosen
router.get("/dosen", getAllDosen);
router.get("/StafData", getAllStaff);
router.get("/dekan", getAlldekan);
router.get("/kaprodi", getAllkaprodi);
router.post("/register", regisUser);
router.get("/getUsersByRole", getUsersByRole);
router.get("/check-unique", checkUnique);

// Endpoint untuk mendapatkan user berdasarkan NIP
router.get("/usercount", getUserCountByRole);
router.get("/:nip", getUserByNIP);
// router.get("/:id", getUserById);

router.get("/", getAllUsers);
router.get("/UserDinilai", getSejawatUsers);

// Endpoint untuk memperbarui user (dengan dukungan upload file)
// router.put("/:nip", upload.single("bukti_prestasi"), updateUser);
router.put("/:nip", upload.fields([{ name: "bukti_prestasi", maxCount: 3 }]), updateUser);

export default router;
