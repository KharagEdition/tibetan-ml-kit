import axios from "axios";
import express from "express";
import { TranslateResponse } from "./response/translate-response";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { genAI } from "./constant";
import { displayChatTokenCount, streamToStdout } from "./common/common";

const bodyParser = require("body-parser");
import http from "http";
import { Server } from "ws";
import { TibetanMlKit } from "./tibetan-ml-kit";
import { getTranslateSyncResponse } from "./common/tb-conversion";

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

const port = 3000;
// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/**
 * Translates API
 */
app.get("/api/translate", async (req, res) => {
  try {
    const data = await TibetanMlKit.translateWithSync({
      input: "test",
      direction: "bo",
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).send("Error calling API");
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

      let tb = await getTranslateSyncResponse({
        input: en ?? "",
        direction: "bo",
      });
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
