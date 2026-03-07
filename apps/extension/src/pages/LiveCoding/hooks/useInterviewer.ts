import { useCallback } from "react";
import { calculateCost } from "../../../lib/ai/cost";
import type {
	AIProvider,
	ChatMessage,
	InterviewerStyle,
	InterviewReport,
	ProblemInfo,
} from "../../../types";
import { useAIClient } from "./useAIClient";

interface UseInterviewerOptions {
	provider: AIProvider;
	apiKey: string;
}

export function useInterviewer({ provider, apiKey }: UseInterviewerOptions) {
	const { sendToAI, resetTokenUsage, getTokenUsage } = useAIClient({ provider, apiKey });

	const greet = useCallback(
		async (
			problemInfo: ProblemInfo,
			interviewerStyle: InterviewerStyle,
		): Promise<AIMessage> => {
			resetTokenUsage();
			const raw = await sendToAI({
				type: "greeting",
				problemInfo,
				interviewerStyle,
			});

			return parseAIResponse(raw);
		},
		[sendToAI, resetTokenUsage],
	);

	const respondToUser = useCallback(
		async (params: {
			content: string;
			codeContext: string;
			messages: ChatMessage[];
			problemInfo: ProblemInfo;
			interviewerStyle: InterviewerStyle;
		}): Promise<AIMessage> => {
			const raw = await sendToAI({ type: "user_message", ...params });

			return parseAIResponse(raw);
		},
		[sendToAI],
	);

	const respondToCodeChange = useCallback(
		async (params: {
			previousCode: string;
			currentCode: string;
			pauseDuration: number;
			messages: ChatMessage[];
			problemInfo: ProblemInfo;
			interviewerStyle: InterviewerStyle;
		}): Promise<AIMessage | null> => {
			const raw = await sendToAI({ type: "code_changed", ...params });

			return parseAIResponse(raw);
		},
		[sendToAI],
	);

	const generateReport = useCallback(
		async (
			messages: ChatMessage[],
			finalCode: string,
			duration: number,
			problemInfo: ProblemInfo,
		): Promise<InterviewReport> => {
			// 리포트 생성 최소 기준 미달
			const userMessages = messages.filter((m) => m.role === "user");
			const hasMinimalInteraction = userMessages.length >= 2 || duration >= 120;

			if (!hasMinimalInteraction) {
				return makeEmptyReport(duration, messages.length, [
					"세션 데이터가 충분하지 않아 평가를 생성할 수 없어요.",
					"더 의미 있는 리포트를 위해 면접관과 대화하며 문제를 풀어보세요.",
				]);
			}

			// 리포트 생성
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

				const parsed: unknown = JSON.parse(jsonMatch[0]);

				if (!isInterviewReport(parsed)) {
					throw new Error("리포트 형식이 올바르지 않습니다.");
				}

				const { totalPromptTokens, totalCompletionTokens, callCount } =
					getTokenUsage();

				return {
					...parsed,
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
				return makeEmptyReport(duration, messages.length, [
					"리포트 생성 중 오류가 발생했어요.",
				]);
			}
		},
		[sendToAI, getTokenUsage, provider],
	);

	return {
		greet,
		respondToUser,
		respondToCodeChange,
		generateReport,
	};
}

interface AIMessage {
	content: string;
	notes?: string;
}

function parseAIResponse(response: string): AIMessage {
	const parts = response.split("#NOTES#");
	return {
		content: parts[0].trim(),
		notes: parts.length > 1 ? parts[1].trim() : undefined,
	};
}

function isInterviewReport(obj: unknown): obj is InterviewReport {
	if (typeof obj !== "object" || obj === null) {
		return false;
	}

	const r = obj as Record<string, unknown>;

	return (
		typeof r.scores === "object" &&
		r.scores !== null &&
		Array.isArray(r.feedback) &&
		Array.isArray(r.strengths) &&
		Array.isArray(r.improvements)
	);
}

function makeEmptyReport(
	duration: number,
	messageCount: number,
	feedback: string[],
): InterviewReport {
	return {
		duration,
		messageCount,
		scores: {
			understanding: 0,
			communication: 0,
			codeQuality: 0,
			timeManagement: 0,
		},
		feedback,
		strengths: [],
		improvements: [],
	};
}
