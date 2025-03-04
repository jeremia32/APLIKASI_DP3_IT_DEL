import express from "express";
import { loginAdmin, getAdminProfile, logoutAdmin, changePassword } from "../controllers/adminController.js";
import { regisAdmin } from "../controllers/regisAdmin.js";
import { protect } from "../middleware/authMiddleware.js"; // Pastikan middleware dipakai dengan benar

const router = express.Router();

// Rute untuk login dan registrasi admin
router.post("/login", loginAdmin);
router.post("/register", regisAdmin);
router.post("/logout", logoutAdmin);

// Rute yang membutuhkan autentikasi (dilindungi oleh middleware)
router.get("/profile", protect, getAdminProfile);
router.put("/change-password", protect, changePassword);
router.get("/Dashboard", protect, (req, res) => {
  res.json({ message: "Selamat datang di dashboard admin" });
});

export default router;
