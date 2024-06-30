import { GoogleGenerativeAI } from "@google/generative-ai";
require("dotenv").config();

export const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
export const defaultPromtMessage =
  "Hello, I am a Tibetan user. I might ask you questions related to Tibetan subject matter and might use Tibetan phrases as well. Please keep in mind the following:1.  Always respond in plain English text. No emojis, markdown, or any other styles. 2. User is always Tibetan, so questions may be related to Tibetan topics. 3. Always provide concise and to-the-point answers.";
