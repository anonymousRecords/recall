import { useCallback, useRef } from "react";
import { createAIClient } from "../../../lib/ai";
import {
	formatMessagesForAI,
	getCodeAnalysisPrompt,
	getGreetingPrompt,
	getReportPrompt,
	getSystemPrompt,
	getUserMessagePrompt,
} from "../../../lib/ai/prompts";
import type { AIProvider, AIRequest, AIUsage } from "../../../types";

interface UseAIClientOptions {
	provider: AIProvider;
	apiKey: string;
}

export function useAIClient({ provider, apiKey }: UseAIClientOptions) {
	const tokenUsageRef = useRef<{
		totalPromptTokens: number;
		totalCompletionTokens: number;
		callCount: number;
	}>({ totalPromptTokens: 0, totalCompletionTokens: 0, callCount: 0 });

	const accumulateTokenUsage = useCallback((usage: AIUsage) => {
		tokenUsageRef.current.totalPromptTokens += usage.promptTokens;
		tokenUsageRef.current.totalCompletionTokens += usage.completionTokens;
		tokenUsageRef.current.callCount += 1;
	}, []);

	const resetTokenUsage = useCallback(() => {
		tokenUsageRef.current = {
			totalPromptTokens: 0,
			totalCompletionTokens: 0,
			callCount: 0,
		};
	}, []);

	const getTokenUsage = useCallback(() => ({ ...tokenUsageRef.current }), []);

	const sendToAI = useCallback(
		async (request: AIRequest): Promise<string> => {
			if (!apiKey) {
				throw new Error("API 키가 설정되지 않았습니다.");
			}

			try {
				const client = createAIClient(provider, apiKey);
				let content: string;

				switch (request.type) {
					case "greeting": {
						const aiResponse = await client.chat([
							{
								role: "system",
								content: getSystemPrompt(
									request.interviewerStyle,
									request.problemInfo,
								),
							},
							{ role: "user", content: getGreetingPrompt() },
						]);

						accumulateTokenUsage(aiResponse.usage);
						content = aiResponse.content;
						break;
					}

					case "user_message": {
						const aiResponse = await client.chat([
							{
								role: "system",
								content: getSystemPrompt(
									request.interviewerStyle,
									request.problemInfo,
								),
							},
							...formatMessagesForAI(request.messages),
							{
								role: "user",
								content: getUserMessagePrompt(
									request.content,
									request.codeContext,
								),
							},
						]);

						accumulateTokenUsage(aiResponse.usage);
						content = aiResponse.content;
						break;
					}

					case "code_changed": {
						const aiResponse = await client.chat([
							{
								role: "system",
								content: getSystemPrompt(
									request.interviewerStyle,
									request.problemInfo,
								),
							},
							...formatMessagesForAI(request.messages),
							{
								role: "user",
								content: getCodeAnalysisPrompt(
									request.previousCode,
									request.currentCode,
									request.pauseDuration,
								),
							},
						]);

						accumulateTokenUsage(aiResponse.usage);
						content = aiResponse.content;

						const visiblePart = content.split("#NOTES#")[0].trim();
						if (visiblePart.toUpperCase() === "SKIP") {
							return "";
						}
						break;
					}

					case "generate_report": {
						const aiResponse = await client.chat(
							[
								{
									role: "system",
									content:
										"당신은 코딩 면접 평가자입니다. 반드시 유효한 JSON 형식으로만 응답하세요.",
								},
								{
									role: "user",
									content: getReportPrompt(
										request.problemInfo,
										request.messages,
										request.finalCode,
										request.duration,
									),
								},
							],
							{ maxTokens: 1024 },
						);

						accumulateTokenUsage(aiResponse.usage);
						content = aiResponse.content;
						break;
					}

					default:
						throw new Error("알 수 없는 요청 타입입니다.");
				}

				return content;
			} catch (err) {
				throw new Error(`AI 응답에서 오류가 발생했습니다: ${err}`);
			}
		},
		[provider, apiKey, accumulateTokenUsage],
	);

	return {
		sendToAI,
		resetTokenUsage,
		getTokenUsage,
	};
}
