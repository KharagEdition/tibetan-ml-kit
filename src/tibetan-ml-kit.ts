import axios from "axios";
import { DataParam } from "./common/data-param";
import { getTranslateSyncResponse } from "./common/tb-conversion";

// You can use a class if you prefer
class TibetanMlKit {
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
  static async translateWithSync({ input, direction = "en" }: DataParam) {
    return await getTranslateSyncResponse({ input, direction });
  }

  /**
   *
   * @param DataParam
   * @returns
   */

  static async chatSync({ input, direction = "en" }: DataParam): Promise<any> {
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

      return new Promise((resolve, reject) => {
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

        // Resolve the promise with final data when the stream ends
        response.data.on("end", () => {
          resolve({
            generated_text: finalData.message
              ? finalData.message?.generated_text
              : finalData.generated_text,
          });
        });

        // Reject the promise in case of an error
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
}

export { TibetanMlKit, DataParam as PostDataParams };
