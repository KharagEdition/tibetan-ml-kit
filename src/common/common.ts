import {
  ChatSession,
  CountTokensRequest,
  EnhancedGenerateContentResponse,
  GenerativeModel,
} from "@google/generative-ai";

export async function streamToStdout(
  stream: AsyncGenerator<EnhancedGenerateContentResponse>
) {
  console.log("Streaming...\n");
  for await (const chunk of stream) {
    // Get first candidate's current text chunk
    const chunkText = chunk.text();
    // Print to console without adding line breaks
    process.stdout.write(chunkText);
  }
  // Print blank line
  console.log("\n");
}

export async function displayTokenCount(
  model: GenerativeModel,
  request: CountTokensRequest
) {
  const { totalTokens } = await model.countTokens(request);
  console.log("Token count: ", totalTokens);
}

export async function displayChatTokenCount(
  model: GenerativeModel,
  chat: ChatSession,
  msg: string
) {
  const history = await chat.getHistory();
  const msgContent = { role: "user", parts: [{ text: msg }] };
  await displayTokenCount(model, { contents: [...history, msgContent] });
}
