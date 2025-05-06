import Penilaian from "../models/Penilaian.js";
import Rubrik from "../models/Rubrik.js";
import HasilPenilaian from "../models/HasilPenilaian.js"; // asumsikan model untuk jawaban kuesioner

// export async function submitPenilaian(req, res) {
//   try {
//     const { penilaiId, dinilaiId, rubrikId, skor } = req.body;

//     // Cek apakah rubrik ada
//     const rubrikExists = await Rubrik.findById(rubrikId);
//     if (!rubrikExists) return res.status(404).json({ message: "Rubrik tidak ditemukan" });

//     const penilaian = new Penilaian({
//       penilai: penilaiId,
//       dinilai: dinilaiId,
//       rubrik: rubrikId,
//       skor,
//     });

//     await penilaian.save();
//     res.status(201).json({ message: "Penilaian berhasil disimpan", penilaian });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }
// Controller for submitPenilaian
export async function submitPenilaian(req, res) {
  try {
    const { penilaiId, dinilaiId, rubrikId, skor } = req.body;

    // Validasi input
    if (!penilaiId || !dinilaiId || !rubrikId || skor === undefined) {
      return res.status(400).json({ message: "Semua data harus diisi" });
    }

    // Cek apakah rubrik ada
    const rubrikExists = await Rubrik.findById(rubrikId);
    if (!rubrikExists) {
      return res.status(404).json({ message: "Rubrik tidak ditemukan" });
    }

    // Cek apakah penilaian sudah pernah dilakukan oleh penilai terhadap dinilai untuk rubrik ini
    const existing = await Penilaian.findOne({ penilai: penilaiId, dinilai: dinilaiId, rubrik: rubrikId });
    if (existing) {
      return res.status(409).json({ message: "Penilaian sudah pernah dilakukan sebelumnya" });
    }

    // Simpan penilaian
    const penilaian = new Penilaian({
      penilai: penilaiId,
      dinilai: dinilaiId,
      rubrik: rubrikId,
      skor,
    });

    await penilaian.save();

    // Update status 'active' to false after evaluation
    await Penilaian.updateOne({ _id: penilaian._id }, { $set: { active: false } });

    res.status(201).json({ message: "Penilaian berhasil disimpan", penilaian });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
