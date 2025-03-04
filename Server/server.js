import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import adminRoutes from "./routes/adminRoutes.js";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", // Sesuaikan dengan domain frontend
    credentials: true, // Izinkan pengiriman cookies dalam request
  })
);
app.use(express.json());
app.use(cookieParser());
// Rute utama
app.get("/", (req, res) => {
  res.json({ message: "Backend Express.js berjalan!" });
});

// Gunakan rute admin
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

// Koneksi ke MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Terhubung ke MongoDB");
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Koneksi MongoDB gagal:", err));
