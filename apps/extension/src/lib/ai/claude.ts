import type { AIClient, AIResponse } from "../../types";
import { INTERVIEW_REPORT_JSON_SCHEMA } from "./schemas";

export class ClaudeClient implements AIClient {
	private apiKey: string;
	private baseUrl = "https://api.anthropic.com/v1";
	private model = "claude-3-haiku-20240307";

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async chat(
		messages: { role: string; content: string }[],
		options?: { maxTokens?: number; jsonMode?: boolean },
	): Promise<AIResponse> {
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

		const body: Record<string, unknown> = {
			model: this.model,
			max_tokens: options?.maxTokens ?? 300,
			system: systemMessage,
			messages: chatMessages,
		};

		if (options?.jsonMode) {
			body.tools = [
				{
					name: "submit_report",
					description: "면접 평가 리포트를 제출합니다.",
					input_schema: INTERVIEW_REPORT_JSON_SCHEMA,
				},
			];
			body.tool_choice = { type: "tool", name: "submit_report" };
		}

		const response = await fetch(`${this.baseUrl}/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": this.apiKey,
				"anthropic-version": "2023-06-01",
				"anthropic-dangerous-direct-browser-access": "true",
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({}));
			throw new Error(
				`Claude API 오류: ${response.status} - ${error.error?.message || "알 수 없는 오류"}`,
			);
		}

		const data = await response.json();

		if (options?.jsonMode) {
			const toolUseBlock = data.content?.find(
				(b: { type: string }) => b.type === "tool_use",
			);
			return {
				content: JSON.stringify(toolUseBlock?.input ?? {}),
				usage: {
					promptTokens: data.usage?.input_tokens ?? 0,
					completionTokens: data.usage?.output_tokens ?? 0,
				},
			};
		}

		return {
			content: data.content[0]?.text || "",
			usage: {
				promptTokens: data.usage?.input_tokens ?? 0,
				completionTokens: data.usage?.output_tokens ?? 0,
			},
		};
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
