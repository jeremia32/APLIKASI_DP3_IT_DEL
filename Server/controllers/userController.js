import User from "../models/UserModel.js";

// Controller untuk mendapatkan semua user dengan role "dosen"
export const getAllDosen = async (req, res) => {
  try {
    // Cari user dengan role "dosen"
    const dosenList = await User.find({ role: "dosen" });

    // Periksa apakah ada data dosen
    if (dosenList.length === 0) {
      return res.status(404).json({ message: "Tidak ada dosen yang ditemukan" });
    }

    res.status(200).json(dosenList);
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
  }
};

// export const updateUser = async (req, res) => {
//   try {
//     const { nip } = req.params; // Ambil NIP dari parameter URL
//     const updateData = req.body; // Data yang akan diupdate

//     // Cari user berdasarkan NIP dan update datanya
//     const updatedUser = await User.findOneAndUpdate(
//       { nip },
//       updateData,
//       { new: true, runValidators: true } // Mengembalikan data terbaru & validasi
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User tidak ditemukan" });
//     }

//     res.status(200).json({ message: "User berhasil diperbarui", user: updatedUser });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

export const getUserByNIP = async (req, res) => {
  try {
    const { nip } = req.params;

    const user = await User.findOne({ nip });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ message: "User ditemukan", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { nip } = req.params;
    const updateData = req.body;

    // Update hanya atribut yang dikirim
    const updatedUser = await User.findOneAndUpdate(
      { nip },
      { $set: updateData }, // Pastikan hanya atribut yang ada diubah
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({ message: "User berhasil diperbarui", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
