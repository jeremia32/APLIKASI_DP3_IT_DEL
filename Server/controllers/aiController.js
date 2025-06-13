import axios from "axios";

// export const generateAnswer = async (req, res) => {
//   const { model, input } = req.body;
//   const apiKey = process.env.DASHSCOPE_API_KEY;

//   try {
//     const response = await axios.post(
//       "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
//       {
//         model,
//         input: {
//           messages: [
//             { role: "system", content: "You are a helpful assistant" },
//             { role: "user", content: input },
//           ],
//         },
//         parameters: {
//           result_format: "message",
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const result = response.data.output.choices[0].message.content;
//     res.json({ result });
//   } catch (error) {
//     console.error("❌ AI Error:", error.response?.data || error.message);
//     res.status(500).json({ error: "Gagal memproses permintaan AI." });
//   }
// };
// controllers/aiController.js

import faqList from "../faq.json" assert { type: "json" };

export const getFaqAnswer = (req, res) => {
  const { question } = req.body;

  // Validasi input
  if (!question || typeof question !== "string" || question.trim() === "") {
    return res.status(400).json({ message: "Pertanyaan tidak boleh kosong." });
  }

  const input = question.toLowerCase();
  let bestMatch = {
    score: 0,
    answer: "Maaf, saya tidak menemukan jawaban yang sesuai.Silahkan Menghubungi email berikut: dpitdelvokasi@gmail.com untuk pertanyaan lebih lanjut.",
  };

  // Cari pertanyaan yang paling mirip berdasarkan jumlah kata yang cocok
  for (const { question: q, answer } of faqList) {
    const keywords = q.toLowerCase().split(/\s+/); // Pisah kata
    const matchedWords = keywords.filter((word) => input.includes(word));
    const matchScore = matchedWords.length / keywords.length;

    if (matchScore > bestMatch.score && matchScore > 0.3) {
      bestMatch = { score: matchScore, answer };
    }
  }

  return res.status(200).json({ answer: bestMatch.answer });
};
