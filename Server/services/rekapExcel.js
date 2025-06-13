// // Fungsi untuk mengekspor rekap penilaian user ke Excel
// export async function exportRekapUserToExcelByNip(req, res) {
//   try {
//     const { evaluatorNip } = req.params;

//     // 1) Fetch raw results
//     const hasil = await HasilPenilaian.find({ evaluatorNip })
//       .populate({
//         path: "penilaianUser",
//         populate: [
//           { path: "user", model: "User", select: "nip username" },
//           { path: "penilai", model: "User", select: "nip username" },
//         ],
//       })
//       .lean();

//     // 2) Per-question stats
//     const perQuestion = await HasilPenilaian.aggregate([
//       { $match: { evaluatorNip } },
//       { $unwind: "$jawaban" },
//       {
//         $group: {
//           _id: "$jawaban.pertanyaan",
//           avgNilai: { $avg: "$jawaban.nilai" },
//           maxNilai: { $max: "$jawaban.nilai" },
//           minNilai: { $min: "$jawaban.nilai" },
//           total: { $sum: 1 },
//           posCount: { $sum: { $cond: [{ $gte: ["$jawaban.nilai", 5] }, 1, 0] } },
//           negCount: { $sum: { $cond: [{ $lte: ["$jawaban.nilai", 3] }, 1, 0] } },
//         },
//       },
//       { $lookup: { from: "pertanyaans", localField: "_id", foreignField: "_id", as: "q" } },
//       { $unwind: "$q" },
//       {
//         $project: {
//           pertanyaan: "$q.teks",
//           avgNilai: 1,
//           maxNilai: 1,
//           minNilai: 1,
//           total: 1,
//           percentPositive: { $multiply: [{ $divide: ["$posCount", "$total"] }, 100] },
//           percentNegative: { $multiply: [{ $divide: ["$negCount", "$total"] }, 100] },
//         },
//       },
//     ]);

//     // 3) Per-aspect per user
//     const perAspekPerUser = await HasilPenilaian.aggregate([
//       { $match: { evaluatorNip } },
//       { $unwind: "$jawaban" },
//       { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
//       { $unwind: "$pq" },
//       {
//         $group: {
//           _id: { penilaianUser: "$penilaianUser", aspek: "$pq.aspek" },
//           avgNilai: { $avg: "$jawaban.nilai" },
//         },
//       },
//       { $lookup: { from: "aspeks", localField: "_id.aspek", foreignField: "_id", as: "a" } },
//       { $unwind: "$a" },
//       {
//         $project: {
//           userId: "$_id.penilaianUser",
//           aspek: "$a.nama",
//           avgNilai: 1,
//         },
//       },
//     ]);

//     // 4) Overall per user
//     const detailPerAspekPertanyaan = await HasilPenilaian.aggregate([
//       { $match: { evaluatorNip } },
//       { $unwind: "$jawaban" },
//       {
//         $lookup: {
//           from: "pertanyaans",
//           localField: "jawaban.pertanyaan",
//           foreignField: "_id",
//           as: "pq",
//         },
//       },
//       { $unwind: "$pq" },
//       {
//         $lookup: {
//           from: "aspeks",
//           localField: "pq.aspek",
//           foreignField: "_id",
//           as: "a",
//         },
//       },
//       { $unwind: "$a" },
//       {
//         $lookup: {
//           from: "nilai360",
//           localField: "penilaianUser",
//           foreignField: "_id",
//           as: "pu",
//         },
//       },
//       { $unwind: "$pu" },
//       {
//         $lookup: {
//           from: "users",
//           localField: "pu.penilai",
//           foreignField: "_id",
//           as: "u",
//         },
//       },
//       { $unwind: "$u" },
//       {
//         $project: {
//           userNip: "$u.nip",
//           userName: "$u.username",
//           aspek: "$a.nama",
//           pertanyaan: "$pq.teks",
//           nilai: "$jawaban.nilai",
//         },
//       },
//       {
//         $sort: {
//           userName: 1,
//           aspek: 1,
//           pertanyaan: 1,
//         },
//       },
//     ]);

//     // 5) Stats per aspect (incl. percentiles)
//     const aspekStats = await HasilPenilaian.aggregate([
//       { $match: { evaluatorNip } },
//       { $unwind: "$jawaban" },
//       { $lookup: { from: "pertanyaans", localField: "jawaban.pertanyaan", foreignField: "_id", as: "pq" } },
//       { $unwind: "$pq" },
//       {
//         $group: {
//           _id: "$pq.aspek",
//           nilaiList: { $push: "$jawaban.nilai" },
//           avgNilai: { $avg: "$jawaban.nilai" },
//           maxNilai: { $max: "$jawaban.nilai" },
//           minNilai: { $min: "$jawaban.nilai" },
//         },
//       },
//       { $lookup: { from: "aspeks", localField: "_id", foreignField: "_id", as: "aspek" } },
//       { $unwind: "$aspek" },
//     ]);

//     // Helper for percentile
//     function percentile(arr, p) {
//       if (!arr.length) return null;
//       const s = arr.slice().sort((a, b) => a - b);
//       const idx = (p / 100) * (s.length - 1);
//       const lo = Math.floor(idx),
//         hi = Math.ceil(idx);
//       return lo === hi ? s[lo] : s[lo] + (idx - lo) * (s[hi] - s[lo]);
//     }

//     // Build Excel workbook
//     const wb = new ExcelJS.Workbook();
//     wb.creator = "RekapApp";
//     wb.created = new Date();

//     // Sheet 1: Per Question
//     const sheetQ = wb.addWorksheet("PerQuestion");
//     sheetQ.columns = [
//       { header: "Pertanyaan", key: "pertanyaan", width: 50 },
//       { header: "Avg", key: "avgNilai" },
//       { header: "Max", key: "maxNilai" },
//       { header: "Min", key: "minNilai" },
//       { header: "Total", key: "total" },
//       { header: "%Positive", key: "percentPositive" },
//       { header: "%Negative", key: "percentNegative" },
//     ];
//     perQuestion.forEach((r) => sheetQ.addRow(r));

//     // Sheet 2: Per Aspect per User
//     const sheetAU = wb.addWorksheet("PerAspekUser");
//     sheetAU.columns = [
//       { header: "UserID", key: "userId" },
//       { header: "Aspek", key: "aspek" },
//       { header: "AvgNilai", key: "avgNilai" },
//     ];
//     perAspekPerUser.forEach((r) => sheetAU.addRow(r));

//     // Sheet 3: Overall per User
//     // const sheetD = wb.addWorksheet("DetailPerAspekPertanyaan");
//     // sheetD.columns = [
//     //   { header: "UserNIP", key: "userNip" },
//     //   { header: "UserName", key: "userName" },
//     //   { header: "Aspek", key: "aspek" },
//     //   { header: "Pertanyaan", key: "pertanyaan", width: 50 },
//     //   { header: "Nilai", key: "nilai" },
//     // ];
//     // detailPerAspekPertanyaan.forEach((r) => sheetD.addRow(r));
//     // Sheet 3: Detail Per Aspek & Pertanyaan (Pivot + Formulas)
//     // 1) Buat worksheet
//     const sheetD = wb.addWorksheet("DetailPerAspekPertanyaan");

//     // 2) Kumpulkan daftar user unik untuk header
//     const users = Array.from(new Set(detailPerAspekPertanyaan.map((r) => `${r.userNip}-${r.userName}`)));

//     // 3) Definisikan kolom
//     sheetD.columns = [
//       { header: "Aspek", key: "aspek", width: 20 },
//       { header: "Pertanyaan", key: "pertanyaan", width: 50 },
//       // kolom nilai tiap user
//       ...users.map((u) => ({ header: u, key: `u_${u}`, width: 18 })),
//       { header: "MIN", key: "min", width: 10 },
//       { header: "MAX", key: "max", width: 10 },
//       { header: "RANGE", key: "range", width: 10 },
//       { header: "SKOR", key: "skor", width: 12 },
//       { header: "PERSENTIL", key: "persentil", width: 15 },
//     ];

//     // 4) Group data per (aspek + pertanyaan)
//     const groupKey = (r) => `${r.aspek}||${r.pertanyaan}`;
//     const groups = detailPerAspekPertanyaan.reduce((acc, r) => {
//       const k = groupKey(r);
//       (acc[k] = acc[k] || []).push(r);
//       return acc;
//     }, {});

//     // 5) Isi baris data + rumus MIN/MAX/RANGE
//     let rowIdx = 2;
//     for (const k of Object.keys(groups)) {
//       const [aspek, pertanyaan] = k.split("||");
//       const row = { aspek, pertanyaan };

//       // masukkan nilai tiap user
//       users.forEach((u) => {
//         const hit = groups[k].find((r) => `${r.userNip}-${r.userName}` === u);
//         row[`u_${u}`] = hit ? hit.nilai : null;
//       });

//       sheetD.addRow(row);

//       // kolom user mulai di 3, berakhir di (2+users.length)
//       const startCol = sheetD.getColumn(3).letter;
//       const endCol = sheetD.getColumn(2 + users.length).letter;

//       // rumus MIN, MAX, RANGE
//       sheetD.getCell(`${sheetD.getColumn("min").letter}${rowIdx}`).value = { formula: `COUNT(${startCol}${rowIdx}:${endCol}${rowIdx})*1` };

//       sheetD.getCell(`${sheetD.getColumn("max").letter}${rowIdx}`).value = { formula: `COUNT(${startCol}${rowIdx}:${endCol}${rowIdx})*7` };

//       sheetD.getCell(`${sheetD.getColumn("range").letter}${rowIdx}`).value = {
//         formula: `${sheetD.getColumn("max").letter}${rowIdx}-${sheetD.getColumn("min").letter}${rowIdx}`,
//       };

//       rowIdx++;
//     }

//     // 6) Baris TOTAL
//     const firstDataRow = 2;
//     const lastDataRow = rowIdx - 1;

//     sheetD.addRow({ aspek: "TOTAL", pertanyaan: "" });

//     sheetD.getCell(`${sheetD.getColumn("min").letter}${rowIdx}`).value = {
//       formula: `SUM(${sheetD.getColumn("min").letter}${firstDataRow}:${sheetD.getColumn("min").letter}${lastDataRow})`,
//     };
//     sheetD.getCell(`${sheetD.getColumn("max").letter}${rowIdx}`).value = {
//       formula: `SUM(${sheetD.getColumn("max").letter}${firstDataRow}:${sheetD.getColumn("max").letter}${lastDataRow})`,
//     };
//     sheetD.getCell(`${sheetD.getColumn("range").letter}${rowIdx}`).value = {
//       formula: `${sheetD.getColumn("max").letter}${rowIdx}-${sheetD.getColumn("min").letter}${rowIdx}`,
//     };

//     // 7) Baris SKOR TOTAL (sum semua nilai user)
//     rowIdx++;
//     sheetD.addRow({ aspek: "SKOR TOTAL", pertanyaan: "" });

//     const userStart = sheetD.getColumn(3).letter;
//     const userEnd = sheetD.getColumn(2 + users.length).letter;

//     sheetD.getCell(`${sheetD.getColumn("skor").letter}${rowIdx}`).value = {
//       formula: `SUM(${userStart}${firstDataRow}:${userEnd}${lastDataRow})`,
//     };

//     // 8) Baris PERSENTIL = ((SKOR_TOTAL−MIN_TOTAL)/RANGE_TOTAL)*100
//     rowIdx++;
//     sheetD.addRow({ aspek: "PERSENTIL", pertanyaan: "" });

//     sheetD.getCell(`${sheetD.getColumn("persentil").letter}${rowIdx}`).value = {
//       formula: `=(${sheetD.getColumn("skor").letter}${rowIdx - 1}-${sheetD.getColumn("min").letter}${rowIdx - 2})/${sheetD.getColumn("range").letter}${rowIdx - 2}*100`,
//     };

//     // Sheet 4: Aspect Stats
//     const sheetAS = wb.addWorksheet("AspectStats");
//     sheetAS.columns = [
//       { header: "Aspek", key: "aspek" },
//       { header: "Avg", key: "avgNilai" },
//       { header: "Max", key: "maxNilai" },
//       { header: "Min", key: "minNilai" },
//       { header: "Range", key: "range" },
//       { header: "P25", key: "p25" },
//       { header: "P50", key: "p50" },
//       { header: "P75", key: "p75" },
//     ];
//     aspekStats.forEach((item) => {
//       sheetAS.addRow({
//         aspek: item.aspek.nama,
//         avgNilai: item.avgNilai,
//         maxNilai: item.maxNilai,
//         minNilai: item.minNilai,
//         range: item.maxNilai - item.minNilai,
//         p25: percentile(item.nilaiList, 25),
//         p50: percentile(item.nilaiList, 50),
//         p75: percentile(item.nilaiList, 75),
//       });
//     });

//     // Stream Excel to response
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", `attachment; filename=rekap_${evaluatorNip}.xlsx`);
//     await wb.xlsx.write(res);
//     res.end();
//   } catch (err) {
//     console.error("exportRekapByEvaluatorToExcel error:", err);
//     res.status(500).json({ message: "Gagal mengekspor rekap ke Excel." });
//   }
// }
// // Fungsi untuk backup data user ke Excel
// export async function exportAllDetailToExcel(req, res) {
//   try {
//     // Ambil semua data HasilPenilaian + populate user dan penilai
//     const hasil = await HasilPenilaian.find()
//       .populate({
//         path: "penilaianUser",
//         populate: [
//           { path: "user", model: "User", select: "nip username" },
//           { path: "penilai", model: "User", select: "nip username" },
//         ],
//       })
//       .populate("jawaban.pertanyaan") // ✅ populate pertanyaan dalam jawaban array
//       .populate("jawaban.pertanyaan.aspek") // ✅ populate aspek dalam pertanyaan
//       .lean();

//     // Susun data mentah Detail Per Aspek & Pertanyaan
//     const detail = hasil.flatMap((item) => {
//       console.log("Contoh jawaban:", JSON.stringify(item.jawaban[0], null, 2));
//       return item.jawaban.map((jawaban) => ({
//         userNip: item.penilaianUser?.user?.nip || "-",
//         userName: item.penilaianUser?.user?.username || "-",
//         penilaiNip: item.penilaianUser?.penilai?.nip || "-",
//         penilaiName: item.penilaianUser?.penilai?.username || "-",
//         aspek: jawaban?.pertanyaan?.aspek?.nama || "-",
//         pertanyaan: jawaban?.pertanyaan?.teks || "-",
//         aspek: jawaban?.pertanyaan?.aspek?.nama || "-",

//         nilai: jawaban?.nilai ?? null,
//       }));
//     });

//     // Buat Workbook Excel
//     const wb = new ExcelJS.Workbook();
//     const sheet = wb.addWorksheet("DetailPerAspekPertanyaan");
//     console.log("Jawaban: ", JSON.stringify(hasil[0]?.jawaban?.[0], null, 2));

//     // Definisikan kolom
//     sheet.columns = [
//       { header: "User NIP", key: "userNip", width: 15 },
//       { header: "User Name", key: "userName", width: 25 },
//       { header: "Penilai NIP", key: "penilaiNip", width: 15 },
//       { header: "Penilai Name", key: "penilaiName", width: 25 },
//       { header: "Aspek", key: "aspek", width: 20 },
//       { header: "Pertanyaan", key: "pertanyaan", width: 50 },
//       { header: "Nilai", key: "nilai", width: 10 },
//     ];

//     // Tambahkan data ke sheet
//     detail.forEach((row) => sheet.addRow(row));

//     // Set header response
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.setHeader("Content-Disposition", "attachment; filename=detail_per_aspek.xlsx");

//     // Tulis Excel ke response
//     await wb.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("Gagal ekspor detail:", error);
//     res.status(500).json({ message: "Gagal mengekspor detail ke Excel." });
//   }
// }
