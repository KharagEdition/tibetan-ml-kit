import axios from "axios";
import { TranslateResponse } from "../response/translate-response";
import { DataParam } from "./data-param";

/**
 *
 * @param dataParam
 * @returns translate response sync
 */
export async function getTranslateSyncResponse(dataParam: DataParam) {
  dataParam.input = dataParam.input?.replace(/\n/g, " ");

  try {
    // Create form data
    const formData = new FormData();
    formData.append("input", dataParam.input ?? ""); // 'input' is the query
    formData.append("direction", dataParam.direction ?? "en"); // 'direction' is set to 'en'

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
          resolve({
            generated_text: finalData.message
              ? finalData.message?.generated_text
              : finalData.generated_text,
          });
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
