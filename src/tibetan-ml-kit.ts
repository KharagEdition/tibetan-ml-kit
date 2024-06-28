import axios from "axios";
import { DataParam } from "./common/data-param";
import { getTranslateSyncResponse } from "./common/tb-conversion";
import { WebSocketServer } from "ws";
import { defaultPromtMessage } from "./constant";
import { ModelConfig } from "./common/model-config";
import { GoogleGenerativeAI } from "@google/generative-ai";

// You can use a class if you prefer
class TibetanMlKit {
  /**
   *
   * @param server
   * @param modelConfig
   */

  static initSocketConnection(server: any, modelConfig: ModelConfig) {
    /**
     * Initaite the websocket server
     */
    let wss = new WebSocketServer({ server });
    wss.on("connection", (ws) => {
      this.handleConnection(ws, modelConfig);
    });
  }

  static handleConnection(ws: import("ws"), modelConfig: ModelConfig) {
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
          parts: [{ text: "Great to meet you. What would you like to know?" }],
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

        let tb: any = await getTranslateSyncResponse({
          input: en ?? "",
          direction: "bo",
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

  /**
   *
   * @param DataParam
   * @returns translateWithSync
   */
  static async translateWithSync({ input, direction = "en" }: DataParam) {
    return await getTranslateSyncResponse({ input, direction });
  }

  /**
   *
   * @param DataParam
   * @returns
   */
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
export { TibetanMlKit, DataParam };
