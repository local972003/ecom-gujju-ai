import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import axios from "axios";

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

// IMAGE ANALYSIS ROUTE
app.post("/analyze-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ error: "No image uploaded" });
    }

    const imageBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });

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
                text: `Analyze this product image and return:
Title, Description, Keywords`
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
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    fs.unlinkSync(req.file.path);

    const result = response.data.choices[0].message.content;

    res.json({
      result
    });

  } catch (err) {
    console.error(err);
    res.json({ result: "Error analyzing image" });
  }
});

app.listen(3000, () => console.log("🚀 IMAGE AI BACKEND RUNNING"));
