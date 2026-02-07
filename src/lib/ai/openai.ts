import type { AIClient } from "../../types";

export class OpenAIClient implements AIClient {
	private apiKey: string;
	private baseUrl = "https://api.openai.com/v1";
	private model = "gpt-4o-mini";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async chat(messages: { role: string; content: string }[]): Promise<string> {
		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				model: this.model,
				messages: messages.map((m) => ({
					role: m.role as "system" | "user" | "assistant",
					content: m.content,
				})),
				max_tokens: 300,
				temperature: 0.7,
			}),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(
				`OpenAI API 오류: ${response.status} - ${error.error?.message || "알 수 없는 오류"}`,
			);
		}

		const data = await response.json();
		return data.choices[0]?.message?.content || "";
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
