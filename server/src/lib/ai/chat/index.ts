import { ChatProvider } from "./chat";
import { GeminiService } from "./gemini/gemini.service";
import { OllamaLocalService } from "./ollama/ollama.local.service";
import { OllamaService } from "./ollama/ollama.service";

function _chatProvider(
  provider: string | undefined = process.env.CHAT_PROVIDER,
): ChatProvider {
  switch (provider) {
    case "ollama":
      return new OllamaService();
    case "gemini":
      return new GeminiService();
    case "local":
      return new OllamaLocalService();
    default:
      return new OllamaLocalService();
  }
}

export const chatProvider = _chatProvider();
