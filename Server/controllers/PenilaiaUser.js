import jwt from "jsonwebtoken";
import Nilai360 from "../models/Nilai360.js";

// Fungsi untuk mendapatkan semua evaluasi (admin atau role lain yang diizinkan)
export const getEvaluations = async (req, res) => {
  try {
    const user = req.user;

    let evaluations;
    if (user.role === "penilai") {
      evaluations = await Nilai360.find({ penilai: user._id, active: true }).populate("penilai", "nip username email role prestasi").populate("user", "nip username email role prestasi");
    } else {
      evaluations = await Nilai360.find({ active: true }).populate("penilai", "nip username email role prestasi").populate("user", "nip username email role prestasi");
    }

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mendapatkan evaluasi untuk penilai tertentu
export const getEvaluationsForPenilai = async (req, res) => {
  try {
    const user = req.user;

    const evaluations = await Nilai360.find({ penilai: user._id, active: true }).populate("penilai", "nip username email prestasi role ").populate("user", "nip username email role prestasi posisi");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk menonaktifkan evaluasi setelah penilaian
export const deactivateEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params; // ID evaluasi yang ingin dinonaktifkan

    // Cari evaluasi berdasarkan ID
    const evaluation = await Nilai360.findById(evaluationId);
    if (!evaluation) {
      return res.status(404).json({ message: "Evaluasi tidak ditemukan" });
    }

    // Perbarui status evaluasi menjadi non-aktif
    evaluation.active = false;
    await evaluation.save();

    res.status(200).json({ message: "Evaluasi berhasil dinonaktifkan", evaluation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
