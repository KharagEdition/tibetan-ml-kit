import express from "express";

const bodyParser = require("body-parser");
import http from "http";
import { TibetanMlKit } from "./tibetan-ml-kit";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);
const tibetanMlKit = new TibetanMlKit(server, {
  apiKey: process.env.API_KEY ?? "",
  modelName: "gemini-1.5-flash-latest",
});

const port = 3000;
// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Server is up and running" });
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

server.listen(port, () => {
  console.log("Server is listening on port 3000");
});
