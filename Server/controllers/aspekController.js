import Aspek from "../models/Aspek.js";
import Kategori from "../models/Kategori.js";
import User from "../models/userModel.js";

// Ambil aspek berdasarkan role user (berdasarkan kategori yang diizinkan)
export async function getAspekByRole(req, res) {
  try {
    // Cari user berdasarkan id (dikirim lewat params)
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Ambil kategori yang aktif dan yang role-nya sesuai dengan user
    const allowedCategories = await Kategori.find({
      roles: { $in: [user.role] },
      isActive: true,
    }).select("_id");

    const allowedCategoryIds = allowedCategories.map((cat) => cat._id);

    // Ambil aspek yang termasuk kategori yang diizinkan dan yang aktif
    const aspects = await Aspek.find({
      kategori: { $in: allowedCategoryIds },
      isActive: true,
    }).populate("kategori", "nama");

    res.status(200).json(aspects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Ambil semua aspek (bisa filter berdasarkan kategori dan status aktif)
export async function getAllAspek(req, res) {
  try {
    const { kategoriId, isActive } = req.query;
    let filter = {};

    if (kategoriId) {
      filter.kategori = kategoriId;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true"; // Konversi dari string ke boolean
    }

    const aspek = await Aspek.find(filter).populate("kategori", "nama");
    res.status(200).json(aspek);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Tambah aspek baru
// Tambah aspek baru
export async function addAspek(req, res) {
  try {
    const { nama, kategori, deskripsi } = req.body;

    const kategoriExists = await Kategori.findOne({ _id: kategori, isActive: true });
    if (!kategoriExists) {
      return res.status(404).json({ message: "Kategori tidak ditemukan atau tidak aktif" });
    }

    const aspek = new Aspek({
      nama,
      kategori,
      deskripsi,
      isActive: true, // default aktif
    });

    await aspek.save();
    res.status(201).json({ message: "Aspek berhasil ditambahkan", aspek });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Ambil aspek by ID
export async function getAspekById(req, res) {
  try {
    const aspek = await Aspek.findById(req.params.id).populate("kategori", "nama");
    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan" });
    }
    res.status(200).json(aspek);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update aspek
// Update aspek
// export async function updateAspek(req, res) {
//   try {
//     const { nama, kategori, deskripsi } = req.body;

//     const kategoriExists = await Kategori.findOne({ _id: kategori, isActive: true });
//     if (!kategoriExists) {
//       return res.status(404).json({ message: "Kategori tidak ditemukan atau tidak aktif" });
//     }

//     const aspek = await Aspek.findByIdAndUpdate(req.params.id, { nama, kategori, deskripsi }, { new: true, runValidators: true });

//     if (!aspek) {
//       return res.status(404).json({ message: "Aspek tidak ditemukan" });
//     }

//     res.status(200).json({ message: "Aspek berhasil diperbarui", aspek });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }
export async function updateAspek(req, res) {
  try {
    const { nama, kategori, deskripsi, isActive } = req.body;

    // Cek kategori aktif seperti sebelumnya…
    const kategoriExists = await Kategori.findOne({ _id: kategori, isActive: true });
    if (!kategoriExists) {
      return res.status(404).json({ message: "Kategori tidak ditemukan atau tidak aktif" });
    }

    // Sekarang sertakan isActive dalam update
    const aspek = await Aspek.findByIdAndUpdate(req.params.id, { nama, kategori, deskripsi, isActive }, { new: true, runValidators: true });

    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan" });
    }

    res.status(200).json({ message: "Aspek berhasil diperbarui", aspek });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Hapus aspek
export async function deleteAspek(req, res) {
  try {
    const aspek = await Aspek.findByIdAndDelete(req.params.id);
    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan" });
    }
    res.status(200).json({ message: "Aspek berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Ubah status aktif/non-aktif aspek
export async function toggleAspekStatus(req, res) {
  try {
    const { isActive } = req.body;

    const aspek = await Aspek.findById(req.params.id);
    if (!aspek) {
      return res.status(404).json({ message: "Aspek tidak ditemukan" });
    }

    aspek.isActive = isActive;
    await aspek.save();

    res.status(200).json({
      message: `Status aspek berhasil diubah menjadi ${isActive ? "aktif" : "non-aktif"}`,
      aspek,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
