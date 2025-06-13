import express from "express";
import { loginUser, getUserProfile, logoutUser } from "../controllers/userController.js";
import { protectUser } from "../middleware/UserauthMiddleware.js";

const router = express.Router();

// Rute login user
router.post("/login", loginUser);

// Rute mendapatkan profil user (hanya untuk user yang sudah login)
// router.get("/profile", protect, getUserProfile);
router.get("/profile", protectUser, getUserProfile);

// Rute logout user
router.post("/logout", logoutUser);

export default router;
