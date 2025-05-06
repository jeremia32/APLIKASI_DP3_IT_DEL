// controllers/hasilPenilaianController.js
import HasilPenilaian from "../models/HasilPenilaian.js";
import Pertanyaan from "../models/Pertanyaan.js";
import Nilai360 from "../models/Nilai360.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import User from "../models/userModel.js";

export const getDetailPenilaianUser = async (req, res) => {
  try {
    // Ambil data HasilPenilaian berdasarkan penilaianUser
    const daftar = await HasilPenilaian.find()
      .populate({
        path: "penilaianUser",
        model: "Nilai360",
        populate: {
          path: "user",
          model: "User",
          select: "nip username",
        },
      })
      .populate({
        path: "jawaban.pertanyaan",
        model: "Pertanyaan",
        select: "teks", // Ambil teks pertanyaan
      });

    // Cek jika data tidak ditemukan
    if (!daftar || daftar.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const grouped = [];

    for (let item of daftar) {
      // Ambil data evaluator berdasarkan evaluatorNip
      const evaluator = await User.findOne({ nip: item.evaluatorNip });

      // Jika evaluator ditemukan, tambahkan data evaluator ke hasil
      if (evaluator) {
        grouped.push({
          penilaianUser: {
            _id: item.penilaianUser._id,
            user: item.penilaianUser.user,
            role: item.penilaianUser.role,
            tanggal: item.penilaianUser.tanggal,
          },
          evaluator: {
            nip: evaluator.nip,
            username: evaluator.username,
          },
          jawaban: item.jawaban.map((jawaban) => ({
            pertanyaan: jawaban.pertanyaan.teks, // Teks pertanyaan
            nilai: jawaban.nilai,
          })),
          tanggal: item.updatedAt,
        });
      } else {
        // Jika evaluator tidak ditemukan, tambahkan data tanpa evaluator
        grouped.push({
          penilaianUser: {
            _id: item.penilaianUser._id,
            user: item.penilaianUser.user,
            role: item.penilaianUser.role,
            tanggal: item.penilaianUser.tanggal,
          },
          evaluator: null, // Jika evaluator tidak ditemukan
          jawaban: item.jawaban.map((jawaban) => ({
            pertanyaan: jawaban.pertanyaan.teks,
            nilai: jawaban.nilai,
          })),
          tanggal: item.updatedAt,
        });
      }
    }

    // Kembalikan response
    res.status(200).json(grouped);
  } catch (error) {
    console.error("Error:", error.message || error);
    res.status(500).json({ message: error.message || "Terjadi kesalahan saat mengambil detail penilaian." });
  }
};
/**
 * 0) GET /api/hasil-penilaian/by-evaluator/:evaluatorNip
 *    Mengembalikan daftar penilaianUser yang sudah dinilai oleh evaluator
 */
export async function getRekapByEvaluator(req, res) {
  try {
    const { evaluatorNip } = req.params;

    // 1) Ambil data Nilai360 yang diberikan evaluator ini, dan populate user+penilai
    const hasil = await HasilPenilaian.find({ evaluatorNip })
      .populate({
        path: "penilaianUser",
        populate: [
          { path: "user", model: "User", select: "nip username" },
          { path: "penilai", model: "User", select: "nip username" },
        ],
      })
      .lean();

    // 2) Analisis A: Statistik per pertanyaan
    const perQuestion = await HasilPenilaian.aggregate([
      { $match: { evaluatorNip } },
      { $unwind: "$jawaban" },
      {
        $group: {
          _id: "$jawaban.pertanyaan",
          avgNilai: { $avg: "$jawaban.nilai" },
          maxNilai: { $max: "$jawaban.nilai" },
          minNilai: { $min: "$jawaban.nilai" },
          total: { $sum: 1 },
          posCount: { $sum: { $cond: [{ $gte: ["$jawaban.nilai", 5] }, 1, 0] } },
          negCount: { $sum: { $cond: [{ $lte: ["$jawaban.nilai", 3] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "pertanyaans",
          localField: "_id",
          foreignField: "_id",
          as: "q",
        },
      },
      { $unwind: "$q" },
      {
        $project: {
          pertanyaanId: "$_id",
          teks: "$q.teks",
          avgNilai: 1,
          maxNilai: 1,
          minNilai: 1,
          total: 1,
          percentPositive: { $multiply: [{ $divide: ["$posCount", "$total"] }, 100] },
          percentNegative: { $multiply: [{ $divide: ["$negCount", "$total"] }, 100] },
        },
      },
    ]);

    // 3) Analisis B: Rata‐rata per aspek per user
    const perAspekPerUser = await HasilPenilaian.aggregate([
      { $match: { evaluatorNip } },
      { $unwind: "$jawaban" },
      {
        $lookup: {
          from: "pertanyaans",
          localField: "jawaban.pertanyaan",
          foreignField: "_id",
          as: "pq",
        },
      },
      { $unwind: "$pq" },
      {
        $group: {
          _id: { penilaianUser: "$penilaianUser", aspek: "$pq.aspek" },
          avgNilai: { $avg: "$jawaban.nilai" },
        },
      },
      {
        $lookup: {
          from: "aspeks",
          localField: "_id.aspek",
          foreignField: "_id",
          as: "a",
        },
      },
      { $unwind: "$a" },
      {
        $project: {
          penilaianUser: "$_id.penilaianUser",
          aspekId: "$_id.aspek",
          aspekNama: "$a.nama",
          avgNilai: 1,
        },
      },
    ]);

    // 4) Analisis C: Rata‐rata keseluruhan per user
    const perUserOverall = await HasilPenilaian.aggregate([
      { $match: { evaluatorNip } },
      { $unwind: "$jawaban" },
      {
        $group: {
          _id: "$penilaianUser",
          avgTotal: { $avg: "$jawaban.nilai" },
        },
      },
      {
        $lookup: {
          from: "nilai360", // <-- pastikan ini benar!
          localField: "_id",
          foreignField: "_id",
          as: "pu",
        },
      },
      { $unwind: { path: "$pu", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "users",
          localField: "pu.penilai",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: { path: "$u", preserveNullAndEmptyArrays: false } },
      {
        $project: {
          penilaianUser: "$_id",
          userNip: "$u.nip",
          userName: "$u.username",
          avgTotal: 1,
          penilaiNames: "$penilaiUsers.username", // array of names
        },
      },
    ]);

    // 5) Analisis D: Statistik per Aspek (max, min, range, persentil, rata-rata)
    const statistikAspekEvaluator = await HasilPenilaian.aggregate([
      { $match: { evaluatorNip } },
      { $unwind: "$jawaban" },
      {
        $lookup: {
          from: "pertanyaans",
          localField: "jawaban.pertanyaan",
          foreignField: "_id",
          as: "pq",
        },
      },
      { $unwind: "$pq" },
      {
        $group: {
          _id: "$pq.aspek",
          nilaiList: { $push: "$jawaban.nilai" },
          avgNilai: { $avg: "$jawaban.nilai" },
          maxNilai: { $max: "$jawaban.nilai" },
          minNilai: { $min: "$jawaban.nilai" },
        },
      },
      {
        $project: {
          aspekId: "$_id",
          avgNilai: 1,
          maxNilai: 1,
          minNilai: 1,
          range: { $subtract: ["$maxNilai", "$minNilai"] },
          nilaiList: 1,
        },
      },
      {
        $lookup: {
          from: "aspeks",
          localField: "aspekId",
          foreignField: "_id",
          as: "aspek",
        },
      },
      { $unwind: "$aspek" },
      {
        $project: {
          aspekId: 1,
          aspekNama: "$aspek.nama",
          avgNilai: 1,
          maxNilai: 1,
          minNilai: 1,
          range: 1,
          nilaiList: 1,
        },
      },
    ]);

    // Fungsi bantu untuk hitung persentil
    function hitungPersentil(arr, persentil) {
      if (!arr.length) return null;
      const sorted = arr.slice().sort((a, b) => a - b);
      const index = (persentil / 100) * (sorted.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      if (lower === upper) return sorted[lower];
      return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
    }

    // Proses nilai persentil
    const statistikAspekEvaluatorFinal = statistikAspekEvaluator.map((item) => {
      const p25 = hitungPersentil(item.nilaiList, 25);
      const p50 = hitungPersentil(item.nilaiList, 50);
      const p75 = hitungPersentil(item.nilaiList, 75);
      return {
        aspekId: item.aspekId,
        aspekNama: item.aspekNama,
        avgNilai: item.avgNilai,
        maxNilai: item.maxNilai,
        minNilai: item.minNilai,
        range: item.range,
        persentil25: p25,
        persentil50: p50,
        persentil75: p75,
      };
    });

    // Final Response
    return res.json({
      hasil,
      perQuestion,
      perAspekPerUser,
      perUserOverall,
      statistikAspekEvaluator: statistikAspekEvaluatorFinal,
    });
  } catch (err) {
    console.error("getDetailByEvaluator error:", err);
    return res.status(500).json({ message: "Gagal mengambil detail penilaian." });
  }
}

/**
 * 2) POST /api/hasil-penilaian
 *    Simpan hasil penilaian dan tandai Nilai360 non-aktif
 */

export async function exportRekapUserToExcel(req, res) {
  try {
    const { nip } = req.params; // NIP user yang dinilai

    // 1) Cari penilaianUser untuk user dengan NIP ini
    const nilai360List = await Nilai360.find({ "user.nip": nip });
    const penilaianIds = nilai360List.map((n) => n._id);

    // 2) Ambil semua HasilPenilaian untuk penilaianUser tersebut
    const hasilRaw = await HasilPenilaian.find({
      penilaianUser: { $in: penilaianIds },
    })
      .populate({
        path: "penilaianUser",
        populate: [
          { path: "user", model: "User", select: "nip username" },
          { path: "penilai", model: "User", select: "nip username" },
        ],
      })
      .populate({
        path: "jawaban.pertanyaan",
        model: "Pertanyaan",
        select: "teks",
      })
      .lean();

    // 3) Siapkan workbook & worksheet
    const wb = new ExcelJS.Workbook();
    wb.creator = "Rekap360";
    wb.created = new Date();

    // —— Sheet 1: Raw Data —— //
    const wsRaw = wb.addWorksheet("Raw Data");
    wsRaw.columns = [
      { header: "ID Penilaian", key: "id", width: 20 },
      { header: "Evaluator NIP", key: "evalNip", width: 15 },
      { header: "Nama User", key: "userName", width: 20 },
      { header: "Role", key: "role", width: 12 },
      { header: "Penilai", key: "penilai", width: 20 },
      { header: "Pertanyaan", key: "pertanyaan", width: 40 },
      { header: "Nilai", key: "nilai", width: 8 },
    ];

    hasilRaw.forEach((item) => {
      const penilaiNames = item.penilaianUser.penilai.map((u) => u.username).join(", ");
      item.jawaban.forEach((j) => {
        wsRaw.addRow({
          id: item.penilaianUser._id.toString(),
          evalNip: item.evaluatorNip,
          userName: item.penilaianUser.user.username,
          role: item.penilaianUser.role,
          penilai: penilaiNames,
          pertanyaan: j.pertanyaan.teks,
          nilai: j.nilai,
        });
      });
    });

    // —— Sheet 2: Stats Per User —— //
    const wsStats = wb.addWorksheet("Stats Per User");
    wsStats.columns = [
      { header: "User NIP", key: "userNip", width: 15 },
      { header: "User Name", key: "userName", width: 20 },
      // Kolom C–G untuk masing‑masing nilai jawaban (maksimal 5 jawaban):
      { header: "Nilai 1", key: "v1", width: 8 },
      { header: "Nilai 2", key: "v2", width: 8 },
      { header: "Nilai 3", key: "v3", width: 8 },
      { header: "Nilai 4", key: "v4", width: 8 },
      { header: "Nilai 5", key: "v5", width: 8 },
      // Kolom selanjutnya untuk statistik:
      { header: "Min (1×Count)", key: "minVal", width: 12 },
      { header: "Max (7×Count)", key: "maxVal", width: 12 },
      { header: "Range", key: "rangeVal", width: 10 },
      // Dua kolom baru:
      { header: "Skor", key: "skor", width: 10 },
      { header: "Persentil (%)", key: "persentil", width: 12 },
    ];

    // Kelompokkan nilai per user
    const grupByUser = {};
    hasilRaw.forEach((item) => {
      const key = item.penilaianUser.user.nip;
      if (!grupByUser[key]) {
        grupByUser[key] = {
          nip: key,
          name: item.penilaianUser.user.username,
          vals: [],
        };
      }
      item.jawaban.forEach((j) => grupByUser[key].vals.push(j.nilai));
    });

    // Isi worksheet Stats
    // Isi worksheet Stats
    // Isi worksheet Stats, tulis nilai mentah saja
    Object.values(grupByUser).forEach((u) => {
      // Buat baris hanya dengan data mentah:
      const wsRow = wsStats.addRow({
        userNip: u.nip,
        userName: u.name,
        v1: u.vals[0] || null,
        v2: u.vals[1] || null,
        v3: u.vals[2] || null,
        v4: u.vals[3] || null,
        v5: u.vals[4] || null,
        // kolom minVal…persentil dibiarkan kosong, nanti Excel yang isi
      });

      const r = wsRow.number; // nomor baris baru
      const c1 = "C" + r,
        c5 = "G" + r; // kolom C sampai G (v1…v5)
      const colMin = wsStats.getColumn("minVal").number; // kolom H
      const colMax = wsStats.getColumn("maxVal").number; // kolom I
      const colRange = wsStats.getColumn("rangeVal").number; // kolom J
      const colSkor = wsStats.getColumn("skor").number; // kolom K
      const colPerc = wsStats.getColumn("persentil").number; // kolom L

      // Set formula di sel-sel statistik:
      wsStats.getCell(r, colMin).value = { formula: `COUNT(${c1}:${c5})*1` };
      wsStats.getCell(r, colMax).value = { formula: `COUNT(${c1}:${c5})*7` };
      wsStats.getCell(r, colRange).value = { formula: `${wsStats.getColumn("maxVal").letter}${r}-${wsStats.getColumn("minVal").letter}${r}` };
      wsStats.getCell(r, colSkor).value = { formula: `SUM(${c1}:${c5})` };
      wsStats.getCell(r, colPerc).value = {
        formula: `IF(${wsStats.getColumn("rangeVal").letter}${r}=0,0,(${wsStats.getColumn("skor").letter}${r}-${wsStats.getColumn("minVal").letter}${r})/${wsStats.getColumn("rangeVal").letter}${r}*100)`,
      };
    });

    // 4) Kirim file ke client
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="rekap_${nip}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportRekapUserToExcel error:", err);
    res.status(500).json({ message: "Gagal men‐generate Excel." });
  }
}

export async function createHasilPenilaian(req, res) {
  try {
    const { penilaianUser, evaluatorNip, jawaban } = req.body;

    if (!penilaianUser || !evaluatorNip || !Array.isArray(jawaban)) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    const invalid = jawaban.some((j) => typeof j.nilai !== "number" || j.nilai < 1 || j.nilai > 7);
    if (invalid) {
      return res.status(400).json({ message: "Nilai harus dalam rentang 1–7" });
    }

    // 1️⃣ Simpan hasil penilaian
    const hasil = new HasilPenilaian({ penilaianUser, evaluatorNip, jawaban });
    await hasil.save();

    console.log("penilaianUser ID:", penilaianUser);

    // 2️⃣ Tandai Nilai360 non-aktif
    const updateRes = await Nilai360.findByIdAndUpdate(penilaianUser, { active: false }, { new: true });
    console.log("Nilai360 updated:", updateRes);

    return res.status(201).json({ message: "Hasil penilaian berhasil disimpan", data: hasil });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal menyimpan hasil penilaian" });
  }
}

/**
 * 2) GET /api/hasil-penilaian/rekap/:evaluatorNip/export/excel
 *    Export semua statistik ke Excel (multi-sheet)
 */

// controllers/hasilPenilaianController.js
export const exportAllRecapToExcel = async (req, res) => {
  try {
    // panggil helper getOverallStats atau HasilPenilaian.aggregate(...)
    const overall = await HasilPenilaian.aggregate([{ $unwind: "$jawaban" }, { $group: { _id: null, avgNilai: { $avg: "$jawaban.nilai" } /* … */ } }]);
    // buat workbook mirip exportHasilPenilaianToExcel, tapi sheet tunggal
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Rekap Keseluruhan");
    ws.addRow(["Avg", "Min", "Max", "TotalJawaban"]);
    ws.addRow([overall[0].avgNilai, overall[0].minNilai, overall[0].maxNilai, overall[0].totalJawaban]);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="rekap-keseluruhan.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal eksport rekap keseluruhan" });
  }
};

export const exportRekapExcel = async (req, res) => {
  try {
    // Ambil data hasil penilaian
    const data = await HasilPenilaian.find().lean(); // atau populate jika butuh info user

    // Group by nama user
    const grouped = {};

    data.forEach((item) => {
      const key = item.penilaianUser.user; // Gunakan penilaianUser.user untuk grouping berdasarkan user yang dinilai

      // Jika user belum ada di grouped, buat entri baru
      if (!grouped[key]) {
        grouped[key] = {
          nama: item.penilaianUser.user.nama, // Ambil nama dari user
          nip: item.penilaianUser.user.nip, // Ambil NIP dari user
          evaluators: new Set(), // Set evaluator untuk menghindari duplikasi
        };
      }

      // Gabungkan evaluator dari setiap hasil penilaian
      grouped[key].evaluators.add(item.evaluatorNip);
    });

    // Data yang sudah dikelompokkan
    const finalData = Object.values(grouped).map((item) => ({
      nama: item.nama,
      nip: item.nip,
      evaluators: Array.from(item.evaluators).join(", "), // Gabungkan evaluator jadi string
    }));

    // Buat file Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekap Evaluator");

    worksheet.columns = [
      { header: "Nama", key: "nama", width: 30 },
      { header: "NIP", key: "nip", width: 20 },
      { header: "Evaluator", key: "evaluators", width: 50 },
    ];

    finalData.forEach((row) => {
      worksheet.addRow(row);
    });

    // Header respons
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=rekap-evaluator.xlsx");

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengunduh rekap Excel" });
  }
};

/**
 * 4) GET /api/hasil-penilaian/rekap/:evaluatorNip/export/pdf
 *    Export ringkasan ke PDF
 */
export async function exportRekapPDF(req, res) {
  try {
    const { evaluatorNip } = req.params;
    const { perUserOverall } = await getRekapStats(evaluatorNip);

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="rekap-${evaluatorNip}.pdf"`);
    doc.pipe(res);

    doc.fontSize(18).text("Rekap Penilaian per Responden", { align: "center" }).moveDown();

    perUserOverall.forEach((item) => {
      doc
        .fontSize(12)
        .text(`NIP: ${item.userNip}   Nama: ${item.userName}`)
        .text(`Rata-rata Total: ${item.avgTotal.toFixed(2)}`)
        .moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal export PDF" });
  }
}

/**
 * Helper untuk mendapatkan semua statistik
 */
async function getRekapStats(evaluatorNip) {
  const perQuestion = await HasilPenilaian.aggregate(/* ... pipeline A ... */);
  const perAspekPerUser = await HasilPenilaian.aggregate(/* ... pipeline B ... */);
  const perUserOverall = await HasilPenilaian.aggregate(/* ... pipeline C ... */);
  return { perQuestion, perAspekPerUser, perUserOverall };
}

/**
 * GET /api/admin/rekap/users
 * Rekap nilai per user (rata-rata semua evaluasi yang diterima setiap user)
 */
export async function getAllUserRecap(req, res) {
  try {
    // Aggregasi rata-rata per user yang dinilai (Nilai360.user)
    const recap = await HasilPenilaian.aggregate([
      { $unwind: "$jawaban" },
      {
        $group: {
          _id: "$penilaianUser",
          avgNilai: { $avg: "$jawaban.nilai" },
          totalEvaluasi: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "nilai360s",
          localField: "_id",
          foreignField: "_id",
          as: "n",
        },
      },
      { $unwind: "$n" },
      {
        $lookup: {
          from: "users",
          localField: "n.user",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      {
        $project: {
          penilaianUser: "$_id",
          nip: "$u.nip",
          name: "$u.username",
          avgNilai: 1,
          totalEvaluasi: 1,
        },
      },
    ]);
    res.json(recap);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil rekap per user" });
  }
}

/**
 * GET /api/admin/rekap/overall
 * Rekap keseluruhan (rata-rata dari semua jawaban)
 */
export async function getOverallRecap(req, res) {
  try {
    const overall = await HasilPenilaian.aggregate([
      { $unwind: "$jawaban" },
      {
        $group: {
          _id: null,
          avgNilai: { $avg: "$jawaban.nilai" },
          minNilai: { $min: "$jawaban.nilai" },
          maxNilai: { $max: "$jawaban.nilai" },
          totalJawaban: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          avgNilai: 1,
          minNilai: 1,
          maxNilai: 1,
          totalJawaban: 1,
        },
      },
    ]);
    res.json(overall[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil rekap keseluruhan" });
  }
}
