import type { AIClient, AIProvider } from "../../types";
import { ClaudeClient } from "./claude";
import { OpenAIClient } from "./openai";

export function createAIClient(provider: AIProvider, apiKey: string): AIClient {
	switch (provider) {
		case "openai":
			return new OpenAIClient(apiKey);
		case "claude":
			return new ClaudeClient(apiKey);
		default:
			throw new Error(`지원하지 않는 AI 제공자: ${provider}`);
	}
}

export { ClaudeClient } from "./claude";
export * from "./cost";
export { OpenAIClient } from "./openai";
export * from "./prompts";
