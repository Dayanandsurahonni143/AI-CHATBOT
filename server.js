// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Chat route — Hugging Face API
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ reply: "No message provided." });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: userMessage,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.json({ reply: `⚠️ ${data.error}` });
    }

    res.json({
      reply: data[0]?.generated_text || "No response from model.",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "API request failed." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
