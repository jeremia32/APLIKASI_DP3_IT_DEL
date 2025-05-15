import Kategori from "../models/Kategori.js";
import User from "../models/userModel.js";
import Saran from "../models/saran.js";

// export async function getTreeKuisioner(req, res) {
//   try {
//     const { role } = req.query; // Bisa difilter berdasarkan role user
//     const categorias = await Kategori.find({
//       isActive: true, // Hanya kategori yang aktif
//       ...(role ? { roles: { $in: [role] } } : {}), // Filter berdasarkan role jika ada
//     })
//       .select("nama deskripsi roles") // Pilih field yang diperlukan
//       .populate({
//         path: "aspek", // Populate aspek yang terkait dengan kategori
//         match: { isActive: true }, // Hanya aspek yang aktif
//         select: "nama deskripsi", // Pilih field yang diperlukan
//         populate: {
//           path: "pertanyaan", // Populate pertanyaan yang terkait dengan aspek
//           match: { isActive: true }, // Hanya pertanyaan yang aktif
//           select: "teks bobot", // Pilih field yang diperlukan
//           populate: {
//             path: "rubrik", // Populate rubrik yang terkait dengan pertanyaan
//             match: { isActive: true }, // Hanya rubrik yang aktif
//             select: "label skor", // Pilih field yang diperlukan
//           },
//         },
//       })
//       .lean(); // Gunakan lean untuk hasil dalam bentuk objek JavaScript biasa

//     res.json(categorias); // Kirimkan hasil ke client
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Gagal load kuisioner." });
//   }
// }

// // Fungsi untuk mengambil kuisioner berdasarkan role
// export async function getQusionerByRole(req, res) {
//   try {
//     // ambil role baik dari params (by‑role/:role) atau query (?role=...)
//     const role = req.params.role || req.query.role;

//     // bangun filter: hanya kategori aktif, dan jika ada role → filter roles
//     const filter = { isActive: true };
//     if (role) filter.roles = { $in: [role] };

//     const categorias = await Kategori.find(filter)
//       .select("nama deskripsi roles")
//       .populate({
//         path: "aspek",
//         match: { isActive: true },
//         select: "nama deskripsi",
//         populate: {
//           path: "pertanyaan",
//           match: { isActive: true },
//           select: "teks bobot",
//           populate: {
//             path: "rubrik",
//             match: { isActive: true },
//             select: "label skor",
//           },
//         },
//       })
//       .lean();

//     if (!categorias.length) {
//       return res.status(404).json({ message: "Tidak ada kuisioner untuk role ini." });
//     }

//     res.json(categorias);
//   } catch (err) {
//     console.error("getTreeKuisioner:", err);
//     res.status(500).json({ message: "Gagal load kuisioner." });
//   }
// }
// 🔹 Get categories by user role

export async function getTreeKuisioner(req, res) {
  try {
    const { role } = req.query;
    // 1) Filter kategori
    const categorias = await Kategori.find({
      isActive: true,
      ...(role ? { roles: { $in: [role] } } : {}),
    })
      .select("nama deskripsi roles periodePenilaian")
      .populate({
        path: "aspek",
        match: { isActive: true },
        select: "nama deskripsi",
        populate: {
          path: "pertanyaan",
          match: { isActive: true },
          select: "teks bobot",
          populate: {
            path: "rubrik",
            match: { isActive: true },
            select: "label skor",
          },
        },
      })
      .lean();

    // 2) Kumpulkan semua _id pertanyaan
    const allPertanyaanIds = [];
    categorias.forEach((kat) => (kat.aspek || []).forEach((asp) => (asp.pertanyaan || []).forEach((q) => allPertanyaanIds.push(q._id))));

    // 3) Query semua Saran yang terkait
    const saran = await Saran.find({
      pertanyaan: { $in: allPertanyaanIds },
    })
      .select("pertanyaan isi penilaianUser createdAt user")
      .populate({ path: "user", select: "name email" })
      .lean();

    // 4) Kirim tree + saran sebagai satu response
    return res.json({ tree: categorias, saran });
  } catch (err) {
    console.error("getTreeKuisioner:", err);
    return res.status(500).json({ message: "Gagal load kuisioner." });
  }
}

// ————————————————————————————————————————————————

export async function getQusionerByRole(req, res) {
  try {
    const role = req.params.role || req.query.role;
    const filter = { isActive: true };
    if (role) filter.roles = { $in: [role] };

    const categorias = await Kategori.find(filter)
      .select("nama deskripsi roles periodePenilaian")
      .setOptions({ strictPopulate: false }) // <-- tambahkan ini

      .populate({
        path: "aspek",
        match: { isActive: true },
        select: "nama deskripsi",
        populate: {
          path: "pertanyaan",
          match: { isActive: true },
          select: "teks bobot",
          populate: {
            path: "rubrik",
            match: { isActive: true },
            select: "label skor",
          },
        },
      })
      .lean();

    if (!categorias.length) {
      return res.status(404).json({ message: "Tidak ada kuisioner untuk role ini." });
    }

    // (opsional) ulangi langkah extract IDs & fetch saran jika mau
    const allPertanyaanIds = [];
    categorias.forEach((kat) => (kat.aspek || []).forEach((asp) => (asp.pertanyaan || []).forEach((q) => allPertanyaanIds.push(q._id))));

    const saran = await Saran.find({
      pertanyaan: { $in: allPertanyaanIds },
    })
      .select("pertanyaan isi penilaianUser createdAt user")
      .populate({ path: "user", select: "name email" })
      .lean();

    return res.json({ tree: categorias, saran });
  } catch (err) {
    console.error("getQusionerByRole:", err);
    return res.status(500).json({ message: "Gagal load kuisioner." });
  }
}

export async function getKategoriByRole(req, res) {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Ambil kategori yang memiliki role yang sesuai dengan user dan yang aktif
    const kategori = await Kategori.find({
      roles: { $in: [user.role] },
      isActive: true,
    });

    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 🔹 Get all categories
export async function getAllKategori(req, res) {
  try {
    const kategori = await Kategori.find();
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 🔹 Get a single category by ID
export async function getKategoriById(req, res) {
  try {
    const kategori = await Kategori.findById(req.params.id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }
    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 🔹 Add a new category
// export async function addKategori(req, res) {
//   try {
//     const { nama, deskripsi, roles, isActive } = req.body;

//     // Validasi: Pastikan roles adalah array dengan setidaknya satu role
//     if (!roles || !Array.isArray(roles) || roles.length === 0) {
//       return res.status(400).json({ message: "Setidaknya satu role harus dipilih" });
//     }

//     // Simpan kategori baru; field isActive akan di-set sesuai yang dikirim atau default (true) dari schema
//     const kategoriBaru = new Kategori({ nama, deskripsi, roles, isActive });
//     await kategoriBaru.save();

//     res.status(201).json(kategoriBaru);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }
export async function addKategori(req, res) {
  try {
    const { nama, deskripsi, roles, isActive, periodePenilaian } = req.body;

    // Validasi: Pastikan roles adalah array dengan setidaknya satu role
    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: "Setidaknya satu role harus dipilih" });
    }

    // Validasi format periodePenilaian (jika ingin validasi manual juga)
    if (!/^\d{4}\/\d{4}$/.test(periodePenilaian)) {
      return res.status(400).json({ message: "Format periode penilaian tidak valid (misal: 2024/2045)" });
    }

    const kategoriBaru = new Kategori({
      nama,
      deskripsi,
      roles,
      isActive,
      periodePenilaian,
    });

    await kategoriBaru.save();

    res.status(201).json(kategoriBaru);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 🔹 Update a category
// export async function updateKategori(req, res) {
//   try {
//     const { nama, deskripsi, roles, isActive } = req.body;

//     // Jika roles dikirim, lakukan validasi
//     if (roles && (!Array.isArray(roles) || roles.length === 0)) {
//       return res.status(400).json({ message: "Roles harus berupa array dengan setidaknya satu role" });
//     }

//     const updateData = { nama, deskripsi };
//     if (roles) {
//       updateData.roles = roles;
//     }
//     if (typeof isActive !== "undefined") {
//       updateData.isActive = isActive;
//     }

//     const kategori = await Kategori.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

//     if (!kategori) {
//       return res.status(404).json({ message: "Kategori tidak ditemukan" });
//     }

//     res.json(kategori);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }
export async function updateKategori(req, res) {
  try {
    const { nama, deskripsi, roles, isActive, periodePenilaian } = req.body;

    if (roles && (!Array.isArray(roles) || roles.length === 0)) {
      return res.status(400).json({ message: "Roles harus berupa array dengan setidaknya satu role" });
    }

    const updateData = {};
    if (nama !== undefined) updateData.nama = nama;
    if (deskripsi !== undefined) updateData.deskripsi = deskripsi;
    if (roles !== undefined) updateData.roles = roles;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (periodePenilaian !== undefined) {
      if (!/^\d{4}\/\d{4}$/.test(periodePenilaian)) {
        return res.status(400).json({ message: "Format periode penilaian tidak valid (misal: 2024/2045)" });
      }
      updateData.periodePenilaian = periodePenilaian;
    }

    const kategori = await Kategori.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.json(kategori);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// 🔹 Delete a category
export async function deleteKategori(req, res) {
  try {
    const kategori = await Kategori.findByIdAndDelete(req.params.id);
    if (!kategori) {
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    }

    res.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
