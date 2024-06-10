import axios from "axios";
import express from "express";
import { TranslateResponse } from "./response/translate-response";
const bodyParser = require("body-parser");

const app = express();
const port = 3000;
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// POST endpoint
app.post("/api/translate", async (req, res) => {
  const input = req.body.query;
  const direction = req.body.direction;

  if (typeof input !== "string") {
    return res
      .status(400)
      .json({ code: 400, message: "Query must be a string." });
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append("input", input); // 'input' is the query
    formData.append("direction", direction ?? "en"); // 'direction' is set to 'en'

    // Make a POST request to the stream API with custom headers
    const response = await axios({
      method: "post",
      url: "https://monlam-file-api-latest.onrender.com/mt/playground/stream",
      data: formData,
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://monlam.ai",
        Referer: "https://monlam.ai/",
        "Sec-Ch-Ua":
          '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Gpc": "1",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
      },
      responseType: "stream",
    });

    let finalData: any = null;

    // Collect stream data
    response.data.on("data", (chunk: any) => {
      const lines = chunk.toString().split("\n");
      lines.forEach((line: any) => {
        if (line.trim().startsWith("data:")) {
          const json = JSON.parse(line.replace("data:", "").trim());
          if (json.token && json.token.special) {
            finalData = json;
          }
        }
      });
    });

    // Send the final data when the stream ends
    response.data.on("end", () => {
      if (finalData) {
        res.status(200).json({ code: 200, message: finalData });
      } else {
        res
          .status(204)
          .json({ code: 204, message: "No special token found in stream." });
      }
      console.log("Stream ended");
    });

    response.data.on("error", (err: any) => {
      console.error("Stream error:", err);
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
  } catch (error) {
    console.error("Error calling stream API:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

// chat ask
app.post("/api/chat", async (req, res) => {
  const input = req.body.query;
  const direction = req.body.direction;

  if (typeof input !== "string") {
    return res
      .status(400)
      .json({ code: 400, message: "Query must be a string." });
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append("input", input); // 'input' is the query
    formData.append("direction", direction ?? "en"); // 'direction' is set to 'en'

    // Make a POST request to the stream API with custom headers
    const response = await axios({
      method: "post",
      url: "https://monlam-file-api-latest.onrender.com/mt/playground/stream",
      data: formData,
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://monlam.ai",
        Referer: "https://monlam.ai/",
        "Sec-Ch-Ua":
          '"Brave";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?1",
        "Sec-Ch-Ua-Platform": '"Android"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Gpc": "1",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36",
      },
      responseType: "stream",
    });

    let finalData: TranslateResponse | null = null;

    // Collect stream data
    response.data.on("data", (chunk: any) => {
      const lines = chunk.toString().split("\n");
      lines.forEach((line: any) => {
        if (line.trim().startsWith("data:")) {
          const json = JSON.parse(line.replace("data:", "").trim());
          if (json.token && json.token.special) {
            finalData = json;
          }
        }
      });
    });

    // Send the final data when the stream ends
    response.data.on("end", () => {
      if (finalData) {
        res.status(200).json({ code: 200, message: finalData });
      } else {
        res
          .status(204)
          .json({ code: 204, message: "No special token found in stream." });
      }
      console.log("Stream ended");
    });

    response.data.on("error", (err: any) => {
      console.error("Stream error:", err);
      res.status(500).json({ code: 500, message: "Internal server error" });
    });
  } catch (error) {
    console.error("Error calling stream API:", error);
    res.status(500).json({ code: 500, message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
