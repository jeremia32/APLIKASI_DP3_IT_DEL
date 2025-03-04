import express from "express";
import { regisUser } from "../controllers/regisUser.js";
// import { getAllDosen, updateUser } from "../controllers/userController.js";
import { getAllDosen, updateUser, getUserByNIP } from "../controllers/userController.js";

const router = express.Router();

// Route untuk registrasi user
router.post("/register", regisUser);

// Rute untuk mendapatkan semua user dengan role "dosen"
router.get("/dosen", getAllDosen);

// Route untuk update data user berdasarkan NIP
// router.put("/users/:nip", updateUser);
router.put("/:nip", updateUser); // ⬅️ Tambahkan `/update/`
router.get("/:nip", getUserByNIP); // ⬅️ Tambahkan rute untuk GET user by NIP

export default router;
