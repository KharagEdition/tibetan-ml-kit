import { GoogleGenerativeAI } from "@google/generative-ai";
require("dotenv").config();

export const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
export const defaultPromtMessage =
  "Hello, I am a Tibetan user, I might ask you question related to Tibetan subject matter, I might use Tibetan phrase as well. Please keep in mind, If I ask anything please make sure to respond in simple plain English no other language including Tibetan as well.";
