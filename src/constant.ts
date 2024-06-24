import { GoogleGenerativeAI } from "@google/generative-ai";
require("dotenv").config();

export const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
