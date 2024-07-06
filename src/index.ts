import express from "express";

const bodyParser = require("body-parser");
import http from "http";
import { TibetanMlKit } from "./tibetan-ml-kit";
import cors from "cors";
import { fetchCsrfToken } from "./common/tb-conversion";

const app = express();
/**
 * Cors
 */
// Define allowed origins (replace with your trusted domains)
const allowedOrigins = [
  "https://kharagedition.com",
  "https://kharagedition.web.app",
];

// CORS configuration
const corsOptions = {
  origin: function (origin: any, callback: any) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Enable CORS with options
app.use(cors(corsOptions));
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
app.post("/api/translate", async (req, res) => {
  try {
    const data = await TibetanMlKit.translateWithSync({
      input: "working now",
      direction: "bo",
      cookie: req.body.cookie,
      csrfToken: req.body.csrfToken,
    });
    return res.json(data);
  } catch (error) {
    return res.status(500).send({ error: "error while translating data" });
  }
});

app.get("/api/token", async (req, res) => {
  try {
    const { csrfToken, cookie } = await fetchCsrfToken();
    return res.json({
      csrfToken,
      cookie,
    });
  } catch (error) {
    return res.status(500).send({ error: "error while fetching token" });
  }
});

/**
 * Listen to port
 */
server.listen(port, () => {
  console.log("Server is listening on port 3000");
});
