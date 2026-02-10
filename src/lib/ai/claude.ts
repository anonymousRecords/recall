import type { AIClient } from "../../types";

export class ClaudeClient implements AIClient {
	private apiKey: string;
	private baseUrl = "https://api.anthropic.com/v1";
	private model = "claude-3-haiku-20240307";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async chat(
		messages: { role: string; content: string }[],
		options?: { maxTokens?: number },
	): Promise<string> {
		const systemMessage =
			messages.find((m) => m.role === "system")?.content || "";
		const chatMessages = messages
			.filter((m) => m.role !== "system")
			.map((m) => ({
				role: m.role === "user" ? ("user" as const) : ("assistant" as const),
				content: m.content,
			}));

		if (chatMessages.length === 0) {
			chatMessages.push({ role: "user", content: "시작해주세요." });
		}

		const response = await fetch(`${this.baseUrl}/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
				"anthropic-dangerous-direct-browser-access": "true",
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: options?.maxTokens ?? 300,
				system: systemMessage,
				messages: chatMessages,
			}),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(
				`Claude API 오류: ${response.status} - ${error.error?.message || "알 수 없는 오류"}`,
			);
		}

		const data = await response.json();
		return data.content[0]?.text || "";
	}

	async testConnection(): Promise<boolean> {
		try {
			await this.chat([{ role: "user", content: "Hi" }]);
			return true;
		} catch {
			return false;
		}
	}
}
