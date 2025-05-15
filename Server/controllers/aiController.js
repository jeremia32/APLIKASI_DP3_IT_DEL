import axios from "axios";

export const generateAnswer = async (req, res) => {
  const { model, input } = req.body;
  const apiKey = process.env.DASHSCOPE_API_KEY;

  try {
    const response = await axios.post(
      "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        model,
        input: {
          messages: [
            { role: "system", content: "You are a helpful assistant" },
            { role: "user", content: input },
          ],
        },
        parameters: {
          result_format: "message",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.output.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error("❌ AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Gagal memproses permintaan AI." });
  }
};
