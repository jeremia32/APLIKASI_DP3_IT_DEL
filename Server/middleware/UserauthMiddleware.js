import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: "Token tidak ditemukan, akses ditolak" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token tidak valid" });
  }
};
