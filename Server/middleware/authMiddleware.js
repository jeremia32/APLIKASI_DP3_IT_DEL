
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const authMiddleware = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]; // Ambil token dari Authorization Header
  }

  if (!token && req.cookies.jwt) {
    token = req.cookies.jwt; // Jika tidak ada di Header, coba dari Cookie
  }

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan, akses ditolak" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id).select("-password");

    if (!req.admin) {
      return res.status(401).json({ message: "Admin tidak ditemukan" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};

export { authMiddleware as protect }; // Pastikan namanya cocok dengan import di routes
