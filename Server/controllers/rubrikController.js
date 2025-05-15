import Rubrik from "../models/Rubrik.js";
import Pertanyaan from "../models/Pertanyaan.js";

// Get all rubrik, bisa ditambahkan filter status jika diperlukan
export async function getAllRubrik(req, res) {
  try {
    const { isActive } = req.query;
    let filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }
    const rubrik = await Rubrik.find(filter);
    res.status(200).json(rubrik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get rubrik by ID
export async function getRubrikById(req, res) {
  try {
    const rubrik = await Rubrik.findById(req.params.id);
    if (!rubrik) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }
    res.status(200).json(rubrik);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Add a new rubrik
export async function addRubrik(req, res) {
  try {
    const { label, deskripsi, skor } = req.body;

    const newRubrik = new Rubrik({ label, deskripsi, skor, isActive: true });
    const savedRubrik = await newRubrik.save();

    res.status(201).json({ message: "Rubrik berhasil ditambahkan", rubrik: savedRubrik });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update rubrik
export async function updateRubrik(req, res) {
  try {
    // Tambahkan isActive (atau field lain) di destruktur
    const { label, deskripsi, skor, isActive } = req.body;

    // Lakukan update mencakup semua field
    const updatedRubrik = await Rubrik.findByIdAndUpdate(req.params.id, { label, deskripsi, skor, isActive }, { new: true, runValidators: true });

    if (!updatedRubrik) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }
    res.status(200).json({ message: "Rubrik berhasil diperbarui", rubrik: updatedRubrik });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete rubrik
export async function deleteRubrik(req, res) {
  try {
    const rubrik = await Rubrik.findByIdAndDelete(req.params.id);
    if (!rubrik) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }

    // Hapus referensi rubrik dari Pertanyaan
    await Pertanyaan.updateMany({ rubrik: rubrik._id }, { $pull: { rubrik: rubrik._id } });

    res.status(200).json({ message: "Rubrik berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Toggle status aktif/non-aktif rubrik
export async function toggleRubrikStatus(req, res) {
  try {
    const { isActive } = req.body;

    const rubrik = await Rubrik.findById(req.params.id);
    if (!rubrik) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }

    rubrik.isActive = isActive;
    await rubrik.save();

    res.status(200).json({
      message: `Status rubrik berhasil diubah menjadi ${isActive ? "aktif" : "non-aktif"}`,
      rubrik,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
