import axios from "axios";
import express from "express";
import { TranslateResponse } from "./response/translate-response";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { genAI } from "./constant";
import { displayChatTokenCount, streamToStdout } from "./common/common";

const bodyParser = require("body-parser");
import http from "http";
import { Server } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const port = 3000;
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// POST endpoint
app.post("/api/translate", async (req, res) => {
  let input = req.body.query;
  const direction = req.body.direction;
  input = input.replace(/\n/g, " ");
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
      console.log("Response:" + chunk);
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

// chat ask
app.get("/api/llm", async (req, res) => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Hello, I am a Tibetan user, I might ask you question related to tibetan subject matter, I might use tibetan phrase as well. please keep in mind",
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const msg1 = "Tashi delek";
  displayChatTokenCount(model, chat, msg1);
  const result1 = await chat.sendMessageStream(msg1);
  await streamToStdout(result1.stream);

  const msg2 = "can you say tibetan mantra?";
  displayChatTokenCount(model, chat, msg2);
  const result2 = await chat.sendMessageStream(msg2);
  await streamToStdout(result2.stream);

  // Display history
  console.log(JSON.stringify(await chat.getHistory(), null, 2));

  // Display the last aggregated response
  const response = await result2.response;
  console.log(JSON.stringify(response, null, 2));

  return res.status(200).json({ code: 200, message: "LLm request success" });
});

//////////
wss.on("connection", (ws) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest",
  });
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Hello, I am a Tibetan user, I might ask you question related to tibetan subject matter, I might use tibetan phrase as well. please keep in mind, If I ask anything please make sure to response in english no other language including tibetan as well.",
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
    generationConfig: { maxOutputTokens: 100 },
  });

  ws.on("message", async (message) => {
    const msg = message.toString();

    displayChatsTokenCount(model, chat, msg);

    // stream message

    // const result = await chat.sendMessageStream(msg);

    // for await (const chunk of result.stream) {
    //   const chunkText = chunk.text();
    //   ws.send(chunkText);
    // }

    // const response = await result.response;
    // ws.send(JSON.stringify(response));

    const result = await chat.sendMessage(msg);
    const response = result.response;
    if (response && response.candidates) {
      let en = response.candidates[0].content.parts[0].text;
      console.log("input==>" + en);

      let tb = await getTbVersionResponse(en);
      console.log("output==>" + tb);
      ws.send(
        JSON.stringify({
          en: en,
          tb: tb,
        })
      );
    }
  });
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});

async function displayTokensCount(model: any, request: any) {
  const { totalTokens } = await model.countTokens(request);
  console.log("Token count: ", totalTokens);
}

async function displayChatsTokenCount(model: any, chat: any, msg: string) {
  const history = await chat.getHistory();
  const msgContent = { role: "user", parts: [{ text: msg }] };
  await displayTokensCount(model, { contents: [...history, msgContent] });
}
async function getTbVersionResponse(en: string | undefined) {
  en = en?.replace(/\n/g, " ");

  try {
    // Create form data
    const formData = new FormData();
    formData.append("input", en ?? ""); // 'input' is the query
    formData.append("direction", "bo"); // 'direction' is set to 'en'

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

    return new Promise((resolve, reject) => {
      let finalData: TranslateResponse | null = null;

      // Collect stream data
      response.data.on("data", (chunk: any) => {
        console.log("Response:" + chunk);
        if (chunk.toString().includes("\n")) {
          const lines = chunk.toString().split("\n");

          lines.forEach((line: any) => {
            if (line.trim().startsWith("data:")) {
              const json = JSON.parse(line.replace("data:", "").trim());
              if (json.token && json.token.special) {
                finalData = json;
              }
            }
          });
        }
      });

      // Resolve the final data when the stream ends
      response.data.on("end", () => {
        if (finalData) {
          resolve(
            finalData.message
              ? finalData.message?.generated_text
              : finalData.generated_text
          );
        } else {
          resolve("failed while translating data");
        }
      });

      response.data.on("error", (err: any) => {
        console.error("Stream error:", err);
        reject(err);
      });
    });
  } catch (error) {
    console.error("Error calling stream API:", error);
    throw error;
  }
}
