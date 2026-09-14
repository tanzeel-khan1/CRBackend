const openai = require("../config/openai");

const askAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      input: message,
    });

    return res.status(200).json({
      success: true,
      reply: response.output_text,
    });
  } catch (error) {
    console.error("OpenAI error:", error);

    return res.status(500).json({
      success: false,
      message: "AI response failed",
    });
  }
};

module.exports = {
  askAI,
};