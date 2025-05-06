import Pertanyaan from "../models/Pertanyaan.js";
import Aspek from "../models/Aspek.js";

// Get all pertanyaan with aspek and rubrik details
export async function getAllPertanyaan(req, res) {
  try {
    const { aspekId, isActive } = req.query;
    let filter = {};
    if (aspekId) {
      filter.aspek = aspekId;
    }
    if (isActive !== undefined) {
      filter.isActive = isActive === "true"; // Konversi dari string ke boolean
    }
    const pertanyaan = await Pertanyaan.find(filter).populate("aspek", "nama").populate("rubrik", "label skor");
    res.status(200).json(pertanyaan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get pertanyaan by ID
export async function getPertanyaanById(req, res) {
  try {
    const pertanyaan = await Pertanyaan.findById(req.params.id).populate("aspek", "nama").populate("rubrik", "label skor");
    if (!pertanyaan) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }
    res.status(200).json(pertanyaan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Tambahkan fungsi toggle status aktif/non-aktif untuk pertanyaan
export async function togglePertanyaanStatus(req, res) {
  try {
    const { isActive } = req.body;
    const pertanyaan = await Pertanyaan.findById(req.params.id);
    if (!pertanyaan) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }
    pertanyaan.isActive = isActive;
    await pertanyaan.save();
    res.status(200).json({
      message: `Status pertanyaan berhasil diubah menjadi ${isActive ? "aktif" : "non-aktif"}`,
      pertanyaan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add a new pertanyaan (tanpa membuat rubrik; rubrik dapat dibuat secara terpisah melalui RubrikController)
export async function addPertanyaan(req, res) {
  try {
    const { teks, aspek, bobot, rubrik } = req.body;

    // Cek apakah aspek ada dan aktif
    const aspekExists = await Aspek.findById(aspek);
    if (!aspekExists) {
      return res.status(404).json({ message: "Aspek tidak ditemukan" });
    }

    if (!aspekExists.isActive) {
      return res.status(400).json({ message: "Aspek tidak aktif" });
    }

    const pertanyaanBaru = new Pertanyaan({ teks, aspek, bobot, rubrik });
    const savedPertanyaan = await pertanyaanBaru.save();
    res.status(201).json({ message: "Pertanyaan berhasil ditambahkan", pertanyaan: savedPertanyaan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update pertanyaan
export async function updatePertanyaan(req, res) {
  try {
    const { teks, aspek, bobot, rubrik } = req.body;

    // Cek apakah aspek ada dan aktif
    const aspekExists = await Aspek.findById(aspek);
    if (!aspekExists) {
      return res.status(404).json({ message: "Aspek tidak ditemukan" });
    }

    if (!aspekExists.isActive) {
      return res.status(400).json({ message: "Aspek tidak aktif" });
    }

    const updatedPertanyaan = await Pertanyaan.findByIdAndUpdate(req.params.id, { teks, aspek, bobot, rubrik }, { new: true, runValidators: true });

    if (!updatedPertanyaan) {
      return res.status(404).json({ message: "Pertanyaan tidak ditemukan" });
    }

    res.status(200).json({ message: "Pertanyaan berhasil diperbarui", pertanyaan: updatedPertanyaan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete pertanyaan
export async function deletePertanyaan(req, res) {
  try {
    await Pertanyaan.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Pertanyaan berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
