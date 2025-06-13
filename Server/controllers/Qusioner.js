import Kategori from "../models/Kategori.js";

// Get all categories
export const getAllKategori = async (req, res) => {
  try {
    const kategori = await Kategori.find();
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single category by ID
export const getKategoriById = async (req, res) => {
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
