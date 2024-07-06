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
    if (!dataParam.input.endsWith(".")) {
      dataParam.input = dataParam.input + ".";
    }

    const url = `https://monlam.ai/api/translation/stream?text=${encodeURIComponent(
      dataParam.input
    )}&target=${dataParam.direction}&token=${dataParam.csrfToken}`;

    // Make a GET request to the stream API with custom headers
    const response = await axios({
      method: "get",
      url: url,
      headers: {
        Accept: "text/event-stream",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Cookie: dataParam.cookie,
        Referer: "https://monlam.ai/model/mt?source=en",
        "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Gpc": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
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
              if (json.token.special) {
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

export async function fetchCsrfToken() {
  try {
    const response = await axios({
      method: "get",
      url: "https://monlam.ai/model/mt",
      params: {
        source: "en",
        _data: "root",
      },
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://monlam.ai/model/mt?source=fr",
        "Sec-Ch-Ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Gpc": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
    });
    const csrfToken = response.data.csrfToken;
    const setCookie = response.headers["set-cookie"];

    // Extract the first Set-Cookie value
    const firstSetCookie = setCookie ? setCookie[0].split(";")[0] : null;

    return { csrfToken, cookie: firstSetCookie };
  } catch (error) {
    console.error("Error fetching CSRF token:", error);
    throw error;
  }
}
