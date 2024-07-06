import axios from "axios";
import { DataParam } from "./common/data-param";
import {
  fetchCsrfToken,
  getTranslateSyncResponse,
} from "./common/tb-conversion";
import { Server, WebSocketServer } from "ws";
import { defaultPromtMessage, genAI } from "./constant";
import { ModelConfig } from "./common/model-config";
import { GoogleGenerativeAI } from "@google/generative-ai";

// You can use a class if you prefer
class TibetanMlKit {
  wss: WebSocketServer;

  /**
   *
   * @param server
   * @param modelConfig
   */
  constructor(server: any, modelConfig: ModelConfig) {
    this.wss = new WebSocketServer({ server });

    /**
     * Initaite the websocket server
     */
    this.wss.on("connection", (ws) => {
      this.handleConnection(ws, modelConfig);
    });
  }

  handleConnection(ws: import("ws"), modelConfig: ModelConfig) {
    const genAI = new GoogleGenerativeAI(modelConfig.apiKey);

    const model = genAI.getGenerativeModel({
      model: modelConfig.modelName,
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: modelConfig.promptMessage
                ? modelConfig.promptMessage
                : defaultPromtMessage,
            },
          ],
        },
        {
          role: "model",
          parts: [{ text: "Sure things. What would you like to know?" }],
        },
        {
          role: "user",
          parts: [{ text: "Tashi Delek" }],
        },
      ],
      generationConfig: { maxOutputTokens: 100 },
    });

    ws.on("message", async (message) => {
      const msg = message.toString();

      displayChatsTokenCount(model, chat, msg);

      const result = await chat.sendMessage(msg);
      const response = result.response;
      if (response && response.candidates) {
        let en = response.candidates[0].content.parts[0].text;
        console.log("en===>", en);
        const { csrfToken, cookie } = await fetchCsrfToken();

        let tb: any = await getTranslateSyncResponse({
          input: en ?? "",
          direction: "bo",
          cookie: cookie ?? "",
          csrfToken: csrfToken,
        });
        ws.send(
          JSON.stringify({
            en: en,
            tb: tb["generated_text"],
          })
        );
      }
    });
  }

  static async translateWithAsync({
    input,
    direction = "en",
  }: DataParam): Promise<any> {
    const formData = new FormData();
    formData.append("input", input);
    formData.append("direction", direction);

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
        return finalData;
      });

      response.data.on("error", (err: any) => {
        console.error("Stream error:", err);
        return finalData;
      });
    } catch (error) {
      console.error("Error calling stream API:", error);
      throw error;
    }
  }

  /**
   *
   * @param DataParam
   * @returns translateWithSync
   */
  static async translateWithSync({
    input,
    direction = "en",
    csrfToken,
    cookie,
  }: DataParam) {
    return await getTranslateSyncResponse({
      input,
      direction,
      csrfToken,
      cookie,
    });
  }

  /**
   *
   * @param DataParam
   * @returns
   */

  static async chatSync({ input, direction = "en" }: DataParam): Promise<any> {}
}
async function displayTokensCount(model: any, request: any) {
  const { totalTokens } = await model.countTokens(request);
  console.log("Token count: ", totalTokens);
}

async function displayChatsTokenCount(model: any, chat: any, msg: string) {
  const history = await chat.getHistory();
  const msgContent = { role: "user", parts: [{ text: msg }] };
  await displayTokensCount(model, { contents: [...history, msgContent] });
}
export { TibetanMlKit, DataParam as PostDataParams };
