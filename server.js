import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
const upload = multer({ dest: "uploads/" });

app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // convert image to base64
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await axios.post(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        model: "google/gemma-3n-e4b-it",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this product image and return JSON:
{
"title": "",
"description": "",
"keywords": "",
"features": "",
"color": "",
"material": "",
"stone": ""
}`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    fs.unlinkSync(imagePath);

    let text =
      response.data.choices?.[0]?.message?.content || "";

    console.log("NVIDIA RAW:", text);

    // extract JSON safely
    function extractJSON(text) {
      const match = text.match(/{[\s\S]*}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return { error: "JSON parse failed", raw: text };
        }
      }
      return { result: text };
    }

    const parsed = extractJSON(text);

    res.json(parsed);

  } catch (err) {
    console.error("ERROR:", err);

    res.json({
      title: "Error",
      description: "Something went wrong",
      keywords: "",
      features: "",
      color: "",
      material: "",
      stone: ""
    });
  }
});

app.listen(3000, () => {
  console.log("🚀 NVIDIA AI SERVER RUNNING");
});
