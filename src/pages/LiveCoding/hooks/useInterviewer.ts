import { useCallback, useRef, useState } from "react";
import { createAIClient } from "../../../lib/ai";
import { calculateCost } from "../../../lib/ai/cost";
import {
	formatMessagesForAI,
	getCodeAnalysisPrompt,
	getGreetingPrompt,
	getReportPrompt,
	getSystemPrompt,
	getUserMessagePrompt,
} from "../../../lib/ai/prompts";
import type {
	AIProvider,
	AIRequest,
	AIUsage,
	ChatMessage,
	ProblemInfo,
	SessionReport,
} from "../../../types";

interface UseInterviewerOptions {
	provider: AIProvider;
	apiKey: string;
}

export function useInterviewer({ provider, apiKey }: UseInterviewerOptions) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const usageRef = useRef<{
		totalPromptTokens: number;
		totalCompletionTokens: number;
		callCount: number;
	}>({ totalPromptTokens: 0, totalCompletionTokens: 0, callCount: 0 });

	const accumulateUsage = useCallback((usage: AIUsage) => {
		usageRef.current.totalPromptTokens += usage.promptTokens;
		usageRef.current.totalCompletionTokens += usage.completionTokens;
		usageRef.current.callCount += 1;
	}, []);

	const resetUsage = useCallback(() => {
		usageRef.current = {
			totalPromptTokens: 0,
			totalCompletionTokens: 0,
			callCount: 0,
		};
	}, []);

	const sendToAI = useCallback(
		async (request: AIRequest): Promise<string> => {
			if (!apiKey) {
				throw new Error("API 키가 설정되지 않았습니다.");
			}

			setIsLoading(true);
			setError(null);

			try {
				const client = createAIClient(provider, apiKey);
				let content: string;

				switch (request.type) {
					case "greeting": {
						const systemPrompt = getSystemPrompt(
							request.interviewerStyle,
							request.problemInfo,
						);
						const aiResponse = await client.chat([
							{ role: "system", content: systemPrompt },
							{ role: "user", content: getGreetingPrompt() },
						]);
						accumulateUsage(aiResponse.usage);
						content = aiResponse.content;
						break;
					}

					case "user_message": {
						const systemPrompt = getSystemPrompt(
							request.interviewerStyle,
							request.problemInfo,
						);
						const formattedMessages = formatMessagesForAI(request.messages);
						const aiResponse = await client.chat([
							{ role: "system", content: systemPrompt },
							...formattedMessages,
							{
								role: "user",
								content: getUserMessagePrompt(
									request.content,
									request.codeContext,
								),
							},
						]);
						accumulateUsage(aiResponse.usage);
						content = aiResponse.content;
						break;
					}

					case "code_changed": {
						const systemPrompt = getSystemPrompt(
							request.interviewerStyle,
							request.problemInfo,
						);
						const formattedMessages = formatMessagesForAI(request.messages);
						const analysisPrompt = getCodeAnalysisPrompt(
							request.previousCode,
							request.currentCode,
							request.pauseDuration,
						);

						const aiResponse = await client.chat([
							{ role: "system", content: systemPrompt },
							...formattedMessages,
							{ role: "user", content: analysisPrompt },
						]);
						accumulateUsage(aiResponse.usage);
						content = aiResponse.content;

						const visiblePart = content.split("#NOTES#")[0].trim();
						if (visiblePart.toUpperCase() === "SKIP") {
							return "";
						}
						break;
					}

					case "generate_report": {
						const reportPrompt = getReportPrompt(
							request.problemInfo,
							request.messages,
							request.finalCode,
							request.duration,
						);

						const aiResponse = await client.chat(
							[
								{
									role: "system",
									content:
										"당신은 코딩 면접 평가자입니다. 반드시 유효한 JSON 형식으로만 응답하세요.",
								},
								{ role: "user", content: reportPrompt },
							],
							{ maxTokens: 1024 },
						);
						accumulateUsage(aiResponse.usage);
						content = aiResponse.content;
						break;
					}

					default:
						throw new Error("알 수 없는 요청 타입입니다.");
				}

				return content;
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "AI 요청 중 오류가 발생했습니다.";
				setError(errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[provider, apiKey, accumulateUsage],
	);

	const generateReport = useCallback(
		async (
			messages: ChatMessage[],
			finalCode: string,
			duration: number,
			problemInfo: ProblemInfo,
		): Promise<SessionReport> => {
			const userMessages = messages.filter((m) => m.role === "user");
			const hasMinimalInteraction =
				userMessages.length >= 2 || duration >= 120;

			if (!hasMinimalInteraction) {
				return {
					duration,
					messageCount: messages.length,
					scores: {
						understanding: 0,
						communication: 0,
						codeQuality: 0,
						timeManagement: 0,
					},
					feedback: [
						"세션 데이터가 충분하지 않아 평가를 생성할 수 없습니다.",
						"더 의미 있는 리포트를 위해 면접관과 대화하며 문제를 풀어보세요.",
					],
					strengths: [],
					improvements: [],
				};
			}

			const response = await sendToAI({
				type: "generate_report",
				messages,
				finalCode,
				duration,
				problemInfo,
			});

			try {
				const jsonMatch = response.match(/\{[\s\S]*\}/);
				if (!jsonMatch) {
					throw new Error("JSON을 찾을 수 없습니다.");
				}

				const report = JSON.parse(jsonMatch[0]) as SessionReport;
				const { totalPromptTokens, totalCompletionTokens, callCount } =
					usageRef.current;

				return {
					...report,
					duration,
					messageCount: messages.length,
					tokenUsage: {
						totalPromptTokens,
						totalCompletionTokens,
						estimatedCost: calculateCost(
							provider,
							totalPromptTokens,
							totalCompletionTokens,
						),
						provider,
						callCount,
					},
				};
			} catch {
				return {
					duration,
					messageCount: messages.length,
					scores: {
						understanding: 0,
						communication: 0,
						codeQuality: 0,
						timeManagement: 0,
					},
					feedback: ["리포트 생성 중 오류가 발생했습니다."],
					strengths: [],
					improvements: [],
				};
			}
		},
		[sendToAI, provider],
	);

	const testConnection = useCallback(async (): Promise<boolean> => {
		if (!apiKey) return false;

		try {
			const client = createAIClient(provider, apiKey);
			return await client.testConnection();
		} catch {
			return false;
		}
	}, [provider, apiKey]);

	return {
		sendToAI,
		generateReport,
		testConnection,
		resetUsage,
		isLoading,
		error,
	};
}
