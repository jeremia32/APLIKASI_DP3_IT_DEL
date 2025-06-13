// controllers/hasilPenilaianController.js
import HasilPenilaian from "../models/HasilPenilaian.js";
import Pertanyaan from "../models/Pertanyaan.js";
import Nilai360 from "../models/Nilai360.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import User from "../models/userModel.js";
import Saran from "../models/saran.js";

// export const getDetailPenilaianUser = async (req, res) => {
//   try {
//     // Ambil data HasilPenilaian berdasarkan penilaianUser
//     const daftar = await HasilPenilaian.find()
//       .populate({
//         path: "penilaianUser",
//         model: "Nilai360",
//         populate: {
//           path: "user",
//           model: "User",
//           select: "nip username",
//         },
//       })
//       .populate({
//         path: "jawaban.pertanyaan",
//         model: "Pertanyaan",
//         select: "teks", // Ambil teks pertanyaan
//       });

//     // Cek jika data tidak ditemukan
//     if (!daftar || daftar.length === 0) {
//       return res.status(404).json({ message: "Data tidak ditemukan" });
//     }

//     const grouped = [];

//     for (let item of daftar) {
//       // Ambil data evaluator berdasarkan evaluatorNip
//       const evaluator = await User.findOne({ nip: item.evaluatorNip });

//       // Jika evaluator ditemukan, tambahkan data evaluator ke hasil
//       if (evaluator) {
//         grouped.push({
//           penilaianUser: {
//             _id: item.penilaianUser._id,
//             user: item.penilaianUser.user,
//             role: item.penilaianUser.role,
//             tanggal: item.penilaianUser.tanggal,
//           },
//           evaluator: {
//             nip: evaluator.nip,
//             username: evaluator.username,
//           },
//           jawaban: item.jawaban.map((jawaban) => ({
//             pertanyaan: jawaban.pertanyaan.teks, // Teks pertanyaan
//             nilai: jawaban.nilai,
//           })),
//           tanggal: item.updatedAt,
//         });
//       } else {
//         // Jika evaluator tidak ditemukan, tambahkan data tanpa evaluator
//         grouped.push({
//           penilaianUser: {
//             _id: item.penilaianUser._id,
//             user: item.penilaianUser.user,
//             role: item.penilaianUser.role,
//             tanggal: item.penilaianUser.tanggal,
//           },
//           evaluator: null, // Jika evaluator tidak ditemukan
//           jawaban: item.jawaban.map((jawaban) => ({
//             pertanyaan: jawaban.pertanyaan.teks,
//             nilai: jawaban.nilai,
//           })),
//           tanggal: item.updatedAt,
//         });
//       }
//     }

//     // Kembalikan response
//     res.status(200).json(grouped);
//   } catch (error) {
//     console.error("Error:", error.message || error);
//     res.status(500).json({ message: error.message || "Terjadi kesalahan saat mengambil detail penilaian." });
//   }
// };
/**
 * 0) GET /api/hasil-penilaian/by-evaluator/:evaluatorNip
 *    Mengembalikan daftar penilaianUser yang sudah dinilai oleh evaluator
 */

export const getDetailPenilaianUser = async (req, res) => {
  try {
    // 1) Ambil semua hasil penilaian dengan populate
    let daftar = await HasilPenilaian.find()
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
        select: "teks",
      })
      .lean();

    // 2) Buang entries tanpa penilaianUser (null)
    daftar = daftar.filter((item) => item.penilaianUser && item.penilaianUser.user);

    if (!daftar.length) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    // 3) Grup dan map
    const grouped = [];
    for (const item of daftar) {
      const pu = item.penilaianUser; // sudah pasti ada
      const { user, role, tanggal } = pu; // destructure
      // Cari evaluator berdasarkan evaluatorNip
      const evaluator = await User.findOne({ nip: item.evaluatorNip }).select("nip username").lean();

      grouped.push({
        penilaianUser: {
          _id: pu._id,
          user,
          role,
          tanggal,
        },
        evaluator: evaluator ? { nip: evaluator.nip, username: evaluator.username } : null,
        jawaban: item.jawaban.map((j) => ({
          pertanyaan: j.pertanyaan?.teks || "-",
          nilai: j.nilai,
        })),
        tanggal: item.updatedAt,
      });
    }

    return res.status(200).json(grouped);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat mengambil detail penilaian." });
  }
};

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

    // 1.a) Kumpulkan semua _id HasilPenilaian untuk query saran
    const hasilIds = hasil.map((h) => h._id);

    // 1.b) Ambil semua saran yang berkaitan dengan hasil‐hasil di atas
    const saran = await Saran.find({
      penilaianUser: { $in: hasilIds },
    })
      .select("pertanyaan isi user penilaianUser createdAt")
      .populate({ path: "user", select: "nip username" })

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
      saran,
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

// Fungsi untuk mengekspor rekap penilaian user ke Excel
export async function exportRekapUserToExcelByNip(req, res) {
  try {
    const { evaluatorNip } = req.params;

    // 1) Fetch raw results
    const hasil = await HasilPenilaian.find({ evaluatorNip })
      .populate({
        path: "penilaianUser",
        populate: [
          { path: "user", model: "User", select: "nip username" },
          { path: "penilai", model: "User", select: "nip username" },
        ],
      })
      .lean();

    // 2) Per-question stats
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
      { $lookup: { from: "pertanyaans", localField: "_id", foreignField: "_id", as: "q" } },
      { $unwind: "$q" },
      {
        $project: {
          pertanyaan: "$q.teks",
          avgNilai: 1,
          maxNilai: 1,
          minNilai: 1,
          total: 1,
          percentPositive: { $multiply: [{ $divide: ["$posCount", "$total"] }, 100] },
          percentNegative: { $multiply: [{ $divide: ["$negCount", "$total"] }, 100] },
        },
      },
    ]);

    // 3) Per-aspect per user
    const perAspekPerUser = await HasilPenilaian.aggregate([
      { $match: { evaluatorNip } },
      { $unwind: "$jawaban" },
      { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
      { $unwind: "$pq" },
      {
        $group: {
          _id: { penilaianUser: "$penilaianUser", aspek: "$pq.aspek" },
          avgNilai: { $avg: "$jawaban.nilai" },
        },
      },
      { $lookup: { from: "aspeks", localField: "_id.aspek", foreignField: "_id", as: "a" } },
      { $unwind: "$a" },
      {
        $project: {
          userId: "$_id.penilaianUser",
          aspek: "$a.nama",
          avgNilai: 1,
        },
      },
    ]);

    // 4) Overall per user
    const detailPerAspekPertanyaan = await HasilPenilaian.aggregate([
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
        $lookup: {
          from: "aspeks",
          localField: "pq.aspek",
          foreignField: "_id",
          as: "a",
        },
      },
      { $unwind: "$a" },
      {
        $lookup: {
          from: "nilai360",
          localField: "penilaianUser",
          foreignField: "_id",
          as: "pu",
        },
      },
      { $unwind: "$pu" },
      {
        $lookup: {
          from: "users",
          localField: "pu.penilai",
          foreignField: "_id",
          as: "u",
        },
      },
      { $unwind: "$u" },
      {
        $project: {
          userNip: "$u.nip",
          userName: "$u.username",
          aspek: "$a.nama",
          pertanyaan: "$pq.teks",
          nilai: "$jawaban.nilai",
        },
      },
      {
        $sort: {
          userName: 1,
          aspek: 1,
          pertanyaan: 1,
        },
      },
    ]);

    // 5) Stats per aspect (incl. percentiles)
    const aspekStats = await HasilPenilaian.aggregate([
      { $match: { evaluatorNip } },
      { $unwind: "$jawaban" },
      { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
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
      { $lookup: { from: "aspeks", localField: "_id", foreignField: "_id", as: "aspek" } },
      { $unwind: "$aspek" },
    ]);

    // Helper for percentile
    function percentile(arr, p) {
      if (!arr.length) return null;
      const s = arr.slice().sort((a, b) => a - b);
      const idx = (p / 100) * (s.length - 1);
      const lo = Math.floor(idx),
        hi = Math.ceil(idx);
      return lo === hi ? s[lo] : s[lo] + (idx - lo) * (s[hi] - s[lo]);
    }

    // Build Excel workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "RekapApp";
    wb.created = new Date();

    // Sheet 1: Per Question
    const sheetQ = wb.addWorksheet("PerQuestion");
    sheetQ.columns = [
      { header: "Pertanyaan", key: "pertanyaan", width: 50 },
      { header: "Avg", key: "avgNilai" },
      { header: "Max", key: "maxNilai" },
      { header: "Min", key: "minNilai" },
      { header: "Total", key: "total" },
      { header: "%Positive", key: "percentPositive" },
      { header: "%Negative", key: "percentNegative" },
    ];
    perQuestion.forEach((r) => sheetQ.addRow(r));

    // Sheet 2: Per Aspect per User
    const sheetAU = wb.addWorksheet("PerAspekUser");
    sheetAU.columns = [
      { header: "UserID", key: "userId" },
      { header: "Aspek", key: "aspek" },
      { header: "AvgNilai", key: "avgNilai" },
    ];
    perAspekPerUser.forEach((r) => sheetAU.addRow(r));

    // Sheet 3: Overall per User
    // const sheetD = wb.addWorksheet("DetailPerAspekPertanyaan");
    // sheetD.columns = [
    //   { header: "UserNIP", key: "userNip" },
    //   { header: "UserName", key: "userName" },
    //   { header: "Aspek", key: "aspek" },
    //   { header: "Pertanyaan", key: "pertanyaan", width: 50 },
    //   { header: "Nilai", key: "nilai" },
    // ];
    // detailPerAspekPertanyaan.forEach((r) => sheetD.addRow(r));
    // Sheet 3: Detail Per Aspek & Pertanyaan (Pivot + Formulas)
    // 1) Buat worksheet
    const sheetD = wb.addWorksheet("DetailPerAspekPertanyaan");

    // 2) Kumpulkan daftar user unik untuk header
    const users = Array.from(new Set(detailPerAspekPertanyaan.map((r) => `${r.userNip}-${r.userName}`)));

    // 3) Definisikan kolom
    sheetD.columns = [
      { header: "Aspek", key: "aspek", width: 20 },
      { header: "Pertanyaan", key: "pertanyaan", width: 50 },
      // kolom nilai tiap user
      ...users.map((u) => ({ header: u, key: `u_${u}`, width: 18 })),
      { header: "MIN", key: "min", width: 10 },
      { header: "MAX", key: "max", width: 10 },
      { header: "RANGE", key: "range", width: 10 },
      { header: "SKOR", key: "skor", width: 12 },
      { header: "PERSENTIL", key: "persentil", width: 15 },
    ];

    // 4) Group data per (aspek + pertanyaan)
    const groupKey = (r) => `${r.aspek}||${r.pertanyaan}`;
    const groups = detailPerAspekPertanyaan.reduce((acc, r) => {
      const k = groupKey(r);
      (acc[k] = acc[k] || []).push(r);
      return acc;
    }, {});

    // 5) Isi baris data + rumus MIN/MAX/RANGE
    let rowIdx = 2;
    for (const k of Object.keys(groups)) {
      const [aspek, pertanyaan] = k.split("||");
      const row = { aspek, pertanyaan };

      // masukkan nilai tiap user
      users.forEach((u) => {
        const hit = groups[k].find((r) => `${r.userNip}-${r.userName}` === u);
        row[`u_${u}`] = hit ? hit.nilai : null;
      });

      sheetD.addRow(row);

      // kolom user mulai di 3, berakhir di (2+users.length)
      const startCol = sheetD.getColumn(3).letter;
      const endCol = sheetD.getColumn(2 + users.length).letter;

      // rumus MIN, MAX, RANGE
      sheetD.getCell(`${sheetD.getColumn("min").letter}${rowIdx}`).value = { formula: `COUNT(${startCol}${rowIdx}:${endCol}${rowIdx})*1` };

      sheetD.getCell(`${sheetD.getColumn("max").letter}${rowIdx}`).value = { formula: `COUNT(${startCol}${rowIdx}:${endCol}${rowIdx})*7` };

      sheetD.getCell(`${sheetD.getColumn("range").letter}${rowIdx}`).value = {
        formula: `${sheetD.getColumn("max").letter}${rowIdx}-${sheetD.getColumn("min").letter}${rowIdx}`,
      };

      rowIdx++;
    }

    // 6) Baris TOTAL
    const firstDataRow = 2;
    const lastDataRow = rowIdx - 1;

    sheetD.addRow({ aspek: "TOTAL", pertanyaan: "" });

    sheetD.getCell(`${sheetD.getColumn("min").letter}${rowIdx}`).value = {
      formula: `SUM(${sheetD.getColumn("min").letter}${firstDataRow}:${sheetD.getColumn("min").letter}${lastDataRow})`,
    };
    sheetD.getCell(`${sheetD.getColumn("max").letter}${rowIdx}`).value = {
      formula: `SUM(${sheetD.getColumn("max").letter}${firstDataRow}:${sheetD.getColumn("max").letter}${lastDataRow})`,
    };
    sheetD.getCell(`${sheetD.getColumn("range").letter}${rowIdx}`).value = {
      formula: `${sheetD.getColumn("max").letter}${rowIdx}-${sheetD.getColumn("min").letter}${rowIdx}`,
    };

    // 7) Baris SKOR TOTAL (sum semua nilai user)
    rowIdx++;
    sheetD.addRow({ aspek: "SKOR TOTAL", pertanyaan: "" });

    const userStart = sheetD.getColumn(3).letter;
    const userEnd = sheetD.getColumn(2 + users.length).letter;

    sheetD.getCell(`${sheetD.getColumn("skor").letter}${rowIdx}`).value = {
      formula: `SUM(${userStart}${firstDataRow}:${userEnd}${lastDataRow})`,
    };

    // 8) Baris PERSENTIL = ((SKOR_TOTAL−MIN_TOTAL)/RANGE_TOTAL)*100
    rowIdx++;
    sheetD.addRow({ aspek: "PERSENTIL", pertanyaan: "" });

    sheetD.getCell(`${sheetD.getColumn("persentil").letter}${rowIdx}`).value = {
      formula: `=(${sheetD.getColumn("skor").letter}${rowIdx - 1}-${sheetD.getColumn("min").letter}${rowIdx - 2})/${sheetD.getColumn("range").letter}${rowIdx - 2}*100`,
    };

    // Sheet 4: Aspect Stats
    const sheetAS = wb.addWorksheet("AspectStats");
    sheetAS.columns = [
      { header: "Aspek", key: "aspek" },
      { header: "Avg", key: "avgNilai" },
      { header: "Max", key: "maxNilai" },
      { header: "Min", key: "minNilai" },
      { header: "Range", key: "range" },
      { header: "P25", key: "p25" },
      { header: "P50", key: "p50" },
      { header: "P75", key: "p75" },
    ];
    aspekStats.forEach((item) => {
      sheetAS.addRow({
        aspek: item.aspek.nama,
        avgNilai: item.avgNilai,
        maxNilai: item.maxNilai,
        minNilai: item.minNilai,
        range: item.maxNilai - item.minNilai,
        p25: percentile(item.nilaiList, 25),
        p50: percentile(item.nilaiList, 50),
        p75: percentile(item.nilaiList, 75),
      });
    });

    // Stream Excel to response
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=rekap_${evaluatorNip}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportRekapByEvaluatorToExcel error:", err);
    res.status(500).json({ message: "Gagal mengekspor rekap ke Excel." });
  }
}
// Fungsi untuk backup data user ke Excel

export async function exportAllDetailToExcel(req, res) {
  try {
    // 1) Ambil semua evaluatorNip unik
    const semuaNip = await HasilPenilaian.distinct("evaluatorNip");

    // 2) Buat satu workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "RekapApp";
    wb.created = new Date();

    // Helper internal untuk percentile (dipakai di sheet Stats)
    function percentile(arr, p) {
      if (!arr.length) return null;
      const s = arr.slice().sort((a, b) => a - b);
      const idx = (p / 100) * (s.length - 1);
      const lo = Math.floor(idx),
        hi = Math.ceil(idx);
      return lo === hi ? s[lo] : s[lo] + (idx - lo) * (s[hi] - s[lo]);
    }

    // 3) Loop setiap evaluatorNip dan copy-paste logika exportRekapUserToExcelByNip
    for (const evaluatorNip of semuaNip) {
      // 3a) Per-question stats
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
        { $lookup: { from: "pertanyaans", localField: "_id", foreignField: "_id", as: "q" } },
        { $unwind: "$q" },
        {
          $project: {
            pertanyaan: "$q.teks",
            avgNilai: 1,
            maxNilai: 1,
            minNilai: 1,
            total: 1,
            percentPositive: { $multiply: [{ $divide: ["$posCount", "$total"] }, 100] },
            percentNegative: { $multiply: [{ $divide: ["$negCount", "$total"] }, 100] },
          },
        },
      ]);
      const sheetQ = wb.addWorksheet(`PerQuestion_${evaluatorNip}`);
      sheetQ.columns = [
        { header: "Pertanyaan", key: "pertanyaan", width: 50 },
        { header: "Avg", key: "avgNilai" },
        { header: "Max", key: "maxNilai" },
        { header: "Min", key: "minNilai" },
        { header: "Total", key: "total" },
        { header: "%Positive", key: "percentPositive" },
        { header: "%Negative", key: "percentNegative" },
      ];
      perQuestion.forEach((r) => sheetQ.addRow(r));

      // 3b) Per-aspect per user
      const perAspekPerUser = await HasilPenilaian.aggregate([
        { $match: { evaluatorNip } },
        { $unwind: "$jawaban" },
        { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
        { $unwind: "$pq" },
        {
          $group: {
            _id: { penilaianUser: "$penilaianUser", aspek: "$pq.aspek" },
            avgNilai: { $avg: "$jawaban.nilai" },
          },
        },
        { $lookup: { from: "aspeks", localField: "_id.aspek", foreignField: "_id", as: "a" } },
        { $unwind: "$a" },
        {
          $project: {
            userId: "$_id.penilaianUser",
            aspek: "$a.nama",
            avgNilai: 1,
          },
        },
      ]);
      const sheetAU = wb.addWorksheet(`PerAspekUser_${evaluatorNip}`);
      sheetAU.columns = [
        { header: "UserID", key: "userId" },
        { header: "Aspek", key: "aspek" },
        { header: "AvgNilai", key: "avgNilai" },
      ];
      perAspekPerUser.forEach((r) => sheetAU.addRow(r));

      // 3c) Detail per-aspect & pertanyaan (pivot + formulas)
      const detail = await HasilPenilaian.aggregate([
        { $match: { evaluatorNip } },
        { $unwind: "$jawaban" },
        { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
        { $unwind: "$pq" },
        { $lookup: { from: "aspeks", localField: "pq.aspek", foreignField: "_id", as: "a" } },
        { $unwind: "$a" },
        { $lookup: { from: "nilai360", localField: "penilaianUser", foreignField: "_id", as: "pu" } },
        { $unwind: "$pu" },
        { $lookup: { from: "users", localField: "pu.penilai", foreignField: "_id", as: "u" } },
        { $unwind: "$u" },
        {
          $project: {
            userNip: "$u.nip",
            userName: "$u.username",
            aspek: "$a.nama",
            pertanyaan: "$pq.teks",
            nilai: "$jawaban.nilai",
          },
        },
        { $sort: { userName: 1, aspek: 1, pertanyaan: 1 } },
      ]);
      const sheetD = wb.addWorksheet(`Detail_${evaluatorNip}`);
      const usersList = [...new Set(detail.map((r) => `${r.userNip}-${r.userName}`))];
      sheetD.columns = [
        { header: "Aspek", key: "aspek", width: 20 },
        { header: "Pertanyaan", key: "pertanyaan", width: 50 },
        ...usersList.map((u) => ({ header: u, key: `u_${u}`, width: 18 })),
        { header: "MIN", key: "min" },
        { header: "MAX", key: "max" },
        { header: "RANGE", key: "range" },
      ];
      let idx = 0;
      while (idx < detail.length) {
        const { aspek, pertanyaan } = detail[idx];
        const group = [];
        while (idx < detail.length && detail[idx].aspek === aspek && detail[idx].pertanyaan === pertanyaan) {
          group.push(detail[idx++]);
        }
        const rowObj = { aspek, pertanyaan };
        usersList.forEach((u) => {
          const hit = group.find((r) => `${r.userNip}-${r.userName}` === u);
          rowObj[`u_${u}`] = hit ? hit.nilai : null;
        });
        const row = sheetD.addRow(rowObj);
        const rn = row.number;
        const start = sheetD.getColumn(3).letter + rn;
        const end = sheetD.getColumn(2 + usersList.length).letter + rn;
        row.getCell("min").value = { formula: `MIN(${start}:${end})` };
        row.getCell("max").value = { formula: `MAX(${start}:${end})` };
        row.getCell("range").value = { formula: `MAX(${start}:${end})-MIN(${start}:${end})` };
      }

      // 3d) AspectStats
      const aspekStats = await HasilPenilaian.aggregate([
        { $match: { evaluatorNip } },
        { $unwind: "$jawaban" },
        { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
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
        { $lookup: { from: "aspeks", localField: "_id", foreignField: "_id", as: "a" } },
        { $unwind: "$a" },
      ]);
      const sheetAS = wb.addWorksheet(`Stats_${evaluatorNip}`);
      sheetAS.columns = [
        { header: "Aspek", key: "aspek" },
        { header: "Avg", key: "avgNilai" },
        { header: "Min", key: "minNilai" },
        { header: "Max", key: "maxNilai" },
        { header: "Range", key: "range" },
        { header: "P25", key: "p25" },
        { header: "P50", key: "p50" },
        { header: "P75", key: "p75" },
      ];
      aspekStats.forEach((it) => {
        sheetAS.addRow({
          aspek: it.a.nama,
          avgNilai: it.avgNilai,
          minNilai: it.minNilai,
          maxNilai: it.maxNilai,
          range: it.maxNilai - it.minNilai,
          p25: percentile(it.nilaiList, 25),
          p50: percentile(it.nilaiList, 50),
          p75: percentile(it.nilaiList, 75),
        });
      });
    }

    // 4) Kirim workbook
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").setHeader("Content-Disposition", `attachment; filename=rekap_semua_${Date.now()}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportAllDetailToExcel error:", err);
    res.status(500).json({ message: "Gagal mengekspor semua rekap ke Excel." });
  }
}
/**
 * 2) controller untuk all user
 *    Simpan hasil penilaian dan tandai Nilai360 non-aktif
 */

export async function exportRekapUserToExcel(req, res) {
  try {
    // 1) Ambil semua penilaianUser (Nilai360) tanpa filter NIP apa pun
    const nilai360List = await Nilai360.find().populate({ path: "user", select: "nip username" }).lean();
    const penilaianIds = nilai360List.map((n) => n._id);

    // 2) Ambil semua HasilPenilaian untuk semua penilaianUser
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

    // 3) Siapkan workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "Rekap360";
    wb.created = new Date();

    // —— Sheet 1: Raw Data —— //
    const wsRaw = wb.addWorksheet("Raw Data");
    wsRaw.columns = [
      { header: "ID Penilaian", key: "id", width: 20 },
      { header: "Evaluator NIP", key: "evalNip", width: 15 },
      { header: "User NIP", key: "userNip", width: 15 },
      { header: "User Name", key: "userName", width: 20 },
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
          userNip: item.penilaianUser.user.nip,
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
      { header: "Nilai 1", key: "v1", width: 8 },
      { header: "Nilai 2", key: "v2", width: 8 },
      { header: "Nilai 3", key: "v3", width: 8 },
      { header: "Nilai 4", key: "v4", width: 8 },
      { header: "Nilai 5", key: "v5", width: 8 },
      { header: "Min (×1)", key: "minVal", width: 12 },
      { header: "Max (×7)", key: "maxVal", width: 12 },
      { header: "Range", key: "rangeVal", width: 10 },
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

    // Isi worksheet Stats dengan data mentah + formula Excel
    Object.values(grupByUser).forEach((u) => {
      const row = wsStats.addRow({
        userNip: u.nip,
        userName: u.name,
        v1: u.vals[0] || null,
        v2: u.vals[1] || null,
        v3: u.vals[2] || null,
        v4: u.vals[3] || null,
        v5: u.vals[4] || null,
      });

      const r = row.number;
      const cStart = `C${r}`;
      const cEnd = `G${r}`;
      const colMin = wsStats.getColumn("minVal").letter;
      const colMax = wsStats.getColumn("maxVal").letter;
      const colRange = wsStats.getColumn("rangeVal").letter;
      const colSkor = wsStats.getColumn("skor").letter;
      const colPct = wsStats.getColumn("persentil").letter;

      // Formula Excel
      wsStats.getCell(`${colMin}${r}`).value = { formula: `COUNT(${cStart}:${cEnd})*1` };
      wsStats.getCell(`${colMax}${r}`).value = { formula: `COUNT(${cStart}:${cEnd})*7` };
      wsStats.getCell(`${colRange}${r}`).value = { formula: `${colMax}${r}-${colMin}${r}` };
      wsStats.getCell(`${colSkor}${r}`).value = { formula: `SUM(${cStart}:${cEnd})` };
      wsStats.getCell(`${colPct}${r}`).value = {
        formula: `IF(${colRange}${r}=0,0,(${colSkor}${r}-${colMin}${r})/${colRange}${r}*100)`,
      };
    });

    // 4) Kirim file ke client
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="rekap_all_users.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportAllRekapToExcel error:", err);
    res.status(500).json({ message: "Gagal men‐generate Excel." });
  }
}

export async function getRekapUserJSON(req, res) {
  try {
    // 1. Ambil semua data Nilai360, populate 'user' (termasuk nip, username, posisi)
    const nilai360List = await Nilai360.find()
      .populate({
        path: "user",
        select: "nip username posisi",
      })
      .lean();

    // 2. Kumpulkan semua ID Nilai360 untuk filtering hasil penilaian
    const penilaianIds = nilai360List.map((n) => n._id);

    // 3. Ambil HasilPenilaian terkait, populate:
    //    - penilaianUser (select: role + relation ke user & penilai)
    //    - jawaban.pertanyaan (untuk teks pertanyaan jika perlu)
    const hasilRaw = await HasilPenilaian.find({
      penilaianUser: { $in: penilaianIds },
    })
      .populate({
        path: "penilaianUser",
        select: "role user penilai", // ambil juga field 'role'
        populate: [
          { path: "user", model: "User", select: "nip username posisi" },
          { path: "penilai", model: "User", select: "nip username" },
        ],
      })
      .populate({
        path: "jawaban.pertanyaan",
        model: "Pertanyaan",
        select: "teks",
      })
      .lean();

    // 4. Proses data per user (grouping berdasarkan NIP)
    const dataPerUser = {};
    hasilRaw.forEach((item) => {
      const u = item.penilaianUser.user; // user yang dinilai
      const nip = u.nip;

      if (!dataPerUser[nip]) {
        dataPerUser[nip] = {
          nip,
          username: u.username,
          posisi: u.posisi, // tambahkan posisi
          rolePenilaian: item.penilaianUser.role, // tambahkan role penilaian (Sejawat/Atasan/Bawahan)
          penilai: [], // nanti kita isi nama penilai
          nilai: [], // nanti kita isi nilai setiap jawaban
        };
      }

      // Isi daftar nama penilai (hindari duplikat)
      item.penilaianUser.penilai.forEach((p) => {
        if (!dataPerUser[nip].penilai.includes(p.username)) {
          dataPerUser[nip].penilai.push(p.username);
        }
      });

      // Masukkan semua nilai jawaban
      item.jawaban.forEach((j) => {
        dataPerUser[nip].nilai.push(j.nilai);
      });
    });

    // 5. Hitung total skor dan persentil, susun array final
    const finalData = Object.values(dataPerUser).map((u) => {
      const totalSkor = u.nilai.reduce((sum, x) => sum + x, 0);
      const min = u.nilai.length * 1;
      const max = u.nilai.length * 7;
      const range = max - min;
      const persentil = range === 0 ? 0 : ((totalSkor - min) / range) * 100;

      return {
        nip: u.nip,
        username: u.username,
        posisi: u.posisi, // keluarkan posisi
        rolePenilaian: u.rolePenilaian, // keluarkan role penilaian
        penilai: u.penilai.join(", "),
        totalSkor,
        persentil: persentil.toFixed(2),
      };
    });

    // 6. Kirim response JSON
    res.json(finalData);
  } catch (err) {
    console.error("getRekapUserJSON error:", err);
    res.status(500).json({ message: "Gagal mengambil data." });
  }
}

export async function exportRekapUserPDF(req, res) {
  try {
    // 1. Ambil data rekap JSON seperti di getRekapUserJSON
    const nilai360List = await Nilai360.find().populate({ path: "user", select: "nip username posisi" }).lean();

    const ids360 = nilai360List.map((n) => n._id);
    const hasilList = await HasilPenilaian.find({ penilaianUser: { $in: ids360 } })
      .populate({
        path: "penilaianUser",
        select: "role user penilai",
        populate: [
          { path: "user", model: "User", select: "nip username posisi" },
          { path: "penilai", model: "User", select: "username" },
        ],
      })
      .populate({ path: "jawaban.pertanyaan", select: "teks" })
      .lean();

    // 2. Group & hitung skor + persentil
    const mapUser = {};
    for (const h of hasilList) {
      const pu = h.penilaianUser;
      if (!pu?.user) continue;
      const nip = pu.user.nip;
      if (!mapUser[nip]) {
        mapUser[nip] = {
          nip,
          username: pu.user.username,
          posisi: pu.user.posisi,
          role: pu.role,
          penilaiSet: new Set(),
          nilaiArr: [],
        };
      }
      pu.penilai?.forEach((p) => p.username && mapUser[nip].penilaiSet.add(p.username));
      h.jawaban?.forEach((j) => typeof j.nilai === "number" && mapUser[nip].nilaiArr.push(j.nilai));
    }

    const data = Object.values(mapUser)
      .map((u) => {
        const total = u.nilaiArr.reduce((a, b) => a + b, 0);
        const count = u.nilaiArr.length;
        const min = count * 1,
          max = count * 7,
          range = max - min;
        const perc = range > 0 ? ((total - min) / range) * 100 : 0;
        return {
          nip: u.nip,
          username: u.username,
          posisi: u.posisi,
          role: u.role,
          penilai: Array.from(u.penilaiSet).join(", "),
          totalSkor: total,
          persentil: perc.toFixed(2),
        };
      })
      // 3. Sort by persentil descending
      .sort((a, b) => parseFloat(b.persentil) - parseFloat(a.persentil));
    // Setup response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=Surat_Keterangan_Rekap_Penilaian.pdf");

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
    });
    doc.pipe(res);

    // ====== HEADER ======
    const headerHeight = 40;
    doc.rect(0, 0, doc.page.width, headerHeight).fill("#0074D9");
    doc.fillColor("#ffffff").fontSize(16).font("Helvetica-Bold").text("SURAT KETERANGAN REKAP PENILAIAN 360° DP3 IT DEL", {
      align: "center",
      baseline: "middle",
      height: headerHeight,
    });

    doc
      .moveTo(doc.page.margins.left, headerHeight + 5)
      .lineTo(doc.page.width - doc.page.margins.right, headerHeight + 5)
      .strokeColor("#cccccc")
      .stroke();

    // ====== TANGGAL ======
    const tgl = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc
      .moveDown(1)
      .fillColor("#000000")
      .fontSize(10)
      .font("Helvetica")
      .text(`Jakarta, ${tgl}`, {
        align: "right",
      })
      .moveDown(1);

    // ====== INTRO ======
    const intro = "Berikut ini adalah rekapitulasi hasil penilaian 360° karyawan, diurutkan berdasarkan persentil tertinggi:";
    doc.fontSize(11).font("Helvetica").text(intro, { align: "justify", lineGap: 4 }).moveDown(1);

    // ====== TABEL ======
    const startY = doc.y;
    const colWidths = [60, 90, 80, 70, 130, 60, 60];
    const headers = ["NIP", "Username", "Posisi", "Role", "Penilai", "Skor", "Persentil"];

    // Header row background
    doc
      .fillColor("#001f3f")
      .rect(
        doc.page.margins.left,
        startY,
        colWidths.reduce((a, b) => a + b),
        20
      )
      .fill();

    // Header text
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    let x = doc.page.margins.left;
    headers.forEach((h, i) => {
      doc.text(h, x + 4, startY + 4, {
        width: colWidths[i] - 8,
        align: "left",
      });
      x += colWidths[i];
    });

    // Rows
    let y = startY + 20;
    data.forEach((row, idx) => {
      // Zebra stripe
      if (idx % 2 === 0) {
        doc
          .fillColor("#f2f2f2")
          .rect(
            doc.page.margins.left,
            y,
            colWidths.reduce((a, b) => a + b),
            20
          )
          .fill();
      }

      // Row text
      doc.fillColor("#000000").font("Helvetica").fontSize(9);
      x = doc.page.margins.left;
      const vals = [row.nip, row.username, row.posisi, row.role, row.penilai, String(row.totalSkor), row.persentil + "%"];
      vals.forEach((text, i) => {
        doc.text(text, x + 4, y + 4, {
          width: colWidths[i] - 8,
          align: "left",
        });
        x += colWidths[i];
      });

      y += 20;
      // Halaman baru jika perlu
      if (y > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        y = doc.page.margins.top;
      }
    });

    // ====== FOOTER ======
    doc
      .moveTo(doc.page.margins.left, y + 15)
      .lineTo(doc.page.width - doc.page.margins.right, y + 15)
      .strokeColor("#cccccc")
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(11)
      .text("Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.", doc.page.margins.left, y + 25, { width: 300, align: "justify" });

    doc
      .font("Helvetica-Bold")
      .text("Hormat kami,", doc.page.margins.left + 300, y + 80)
      .moveDown(3)
      .text("__________________", { indent: 300 })
      .text("(DP3 IT DEL)", { indent: 300, font: "Helvetica-Oblique", lineGap: 2 });

    doc.end();
  } catch (err) {
    console.error("exportRekapUserPDF error:", err);
    res.status(500).json({ message: "Gagal generate PDF.", error: err.message });
  }
}

// export async function createHasilPenilaian(req, res) {
//   try {
//     const { penilaianUser, evaluatorNip, jawaban } = req.body;

//     if (!penilaianUser || !evaluatorNip || !Array.isArray(jawaban)) {
//       return res.status(400).json({ message: "Data tidak lengkap" });
//     }

//     const invalid = jawaban.some((j) => typeof j.nilai !== "number" || j.nilai < 1 || j.nilai > 7);
//     if (invalid) {
//       return res.status(400).json({ message: "Nilai harus dalam rentang 1–7" });
//     }

//     // 1️⃣ Simpan hasil penilaian
//     const hasil = new HasilPenilaian({ penilaianUser, evaluatorNip, jawaban });
//     await hasil.save();

//     console.log("penilaianUser ID:", penilaianUser);

//     // 2️⃣ Tandai Nilai360 non-aktif
//     const updateRes = await Nilai360.findByIdAndUpdate(penilaianUser, { active: false }, { new: true });
//     console.log("Nilai360 updated:", updateRes);

//     return res.status(201).json({ message: "Hasil penilaian berhasil disimpan", data: hasil });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Gagal menyimpan hasil penilaian" });
//   }
// }

export async function createHasilPenilaian(req, res) {
  try {
    const { penilaianUser, evaluatorNip, jawaban, saran } = req.body;

    // validasi dasar
    if (!penilaianUser || !evaluatorNip || !Array.isArray(jawaban)) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }
    const invalid = jawaban.some((j) => typeof j.nilai !== "number" || j.nilai < 1 || j.nilai > 7);
    if (invalid) {
      return res.status(400).json({ message: "Nilai harus dalam rentang 1–7" });
    }

    // 1️⃣ simpan hasil penilaian
    const hasil = new HasilPenilaian({ penilaianUser, evaluatorNip, jawaban });
    await hasil.save();

    // 2️⃣ tandai Nilai360 non-aktif
    await Nilai360.findByIdAndUpdate(penilaianUser, { active: false }, { new: true });

    // 3️⃣ simpan saran (jika ada)
    if (Array.isArray(saran) && saran.length) {
      // cari user evaluator dulu (menggunakan field nip)
      const evaluatorUser = await User.findOne({ nip: evaluatorNip });
      if (!evaluatorUser) {
        console.warn("User evaluator tidak ditemukan, skip simpan saran");
      } else {
        // bangun array dokumen Saran
        const docs = saran
          .filter((item) => item.isi && item.pertanyaan)
          .map((item) => ({
            pertanyaan: item.pertanyaan,
            user: evaluatorUser._id,
            isi: item.isi.trim(),
            penilaianUser: hasil._id,
          }));
        if (docs.length) {
          await Saran.insertMany(docs);
        }
      }
    }

    // 4️⃣ response sukses
    return res.status(201).json({ message: "Hasil penilaian dan saran berhasil disimpan", data: hasil });
  } catch (err) {
    console.error("createHasilPenilaian:", err);
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
