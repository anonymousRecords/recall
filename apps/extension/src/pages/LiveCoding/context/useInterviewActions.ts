import { useCallback, useEffect, useRef } from "react";
import { useDebounce, useInterval } from "react-simplikit";
import {
	completeInterview,
	createInterview,
	updateInterview,
} from "../../../lib/db/interviews";
import { posthog } from "../../../lib/posthog";
import { shouldTriggerAI } from "../../../lib/utils/code-gating";
import type { ChatMessage, InterviewerStyle } from "../../../types";
import type { useCodeMonitor } from "../hooks/useCodeMonitor";
import type { useInterviewer } from "../hooks/useInterviewer";
import type { useSpeech } from "../hooks/useSpeech";
import type { InterviewAction, InterviewState } from "./interviewReducer";

const CODE_CHANGE_DEBOUNCE_MS = 8000;
const AI_QUESTION_COOLDOWN_MS = 45000;

interface MachineOptions {
	state: InterviewState;
	dispatch: React.Dispatch<InterviewAction>;
	speech: ReturnType<typeof useSpeech>;
	codeMonitor: ReturnType<typeof useCodeMonitor>;
	interviewer: ReturnType<typeof useInterviewer>;
}

export function useInterviewActions({
	state,
	dispatch,
	speech,
	codeMonitor,
	interviewer,
}: MachineOptions) {
	const stateRef = useRef(state);

	stateRef.current = state;

	const startInterview = useCallback(
		async (config: {
			timeLimit: number;
			interviewerStyle: InterviewerStyle;
		}) => {
			if (!codeMonitor.problemInfo) {
				throw new Error("문제 정보를 찾을 수 없습니다.");
			}

			try {
				// 인터뷰 시작
				const newInterview = await createInterview({
					config: {
						problemInfo: codeMonitor.problemInfo,
						timeLimit: config.timeLimit,
						interviewerStyle: config.interviewerStyle,
						language: codeMonitor.editorLanguage,
					},
					status: "active",
					messages: [],
					codeSnapshots: [],
					startedAt: new Date().toISOString(),
				});

				dispatch({
					type: "START_INTERVIEW",
					interview: newInterview,
					config: {
						problemInfo: codeMonitor.problemInfo,
						timeLimit: config.timeLimit,
						interviewerStyle: config.interviewerStyle,
						language: codeMonitor.editorLanguage,
					},
					initialCode: codeMonitor.editorCode,
				});

				await codeMonitor.startMonitoring();

				// 인사말
				const { content, notes } = await interviewer.greet(
					codeMonitor.problemInfo,
					config.interviewerStyle,
				);

				dispatch({
					type: "AI_RESPONDED",
					message: {
						id: crypto.randomUUID(),
						role: "interviewer",
						content,
						notes,
						timestamp: Date.now(),
					},
				});

				speech.startSpeaking(content);

				posthog.capture("interview_started", {
					style: config.interviewerStyle,
					time_limit_min: config.timeLimit,
					language: codeMonitor.editorLanguage,
					problem_level: codeMonitor.problemInfo?.level ?? null,
				});
			} catch (error) {
				dispatch({
					type: "START_FAILED",
					message: error instanceof Error ? error.message : "인터뷰 시작 실패",
				});
				throw error;
			}
		},
		[codeMonitor, interviewer, speech, dispatch],
	);

	// CODE CHANGED
	const debouncedCodeChange = useDebounce(async (editorCode: string) => {
		const { phase, previousCode, messages, interviewConfig } = stateRef.current;
		if (phase !== "listening") {
			return;
		}

		const lastAIMessageTime =
			stateRef.current.messages.filter((m) => m.role === "interviewer").at(-1)
				?.timestamp ?? 0;

		if (Date.now() - lastAIMessageTime < AI_QUESTION_COOLDOWN_MS) {
			return;
		}

		if (!shouldTriggerAI(previousCode, editorCode)) {
			return;
		}

		dispatch({ type: "CODE_CHANGED" });

		try {
			const result = await interviewer.respondToCodeChange({
				previousCode,
				currentCode: editorCode,
				pauseDuration: Math.floor(CODE_CHANGE_DEBOUNCE_MS / 1000),
				messages,
				problemInfo: interviewConfig.problemInfo,
				interviewerStyle: interviewConfig.interviewerStyle,
			});

			dispatch({
				type: "SET_PREVIOUS_CODE",
				code: editorCode,
			});

			if (result === null) {
				dispatch({ type: "AI_SKIPPED" });
				return;
			}

			const { content, notes } = result;

			dispatch({
				type: "AI_RESPONDED",
				message: {
					id: crypto.randomUUID(),
					role: "interviewer",
					content,
					notes,
					timestamp: Date.now(),
				},
			});

			speech.startSpeaking(content);
		} catch (error) {
			console.error("AI 응답 실패:", error);
			dispatch({
				type: "AI_FAILED",
				message: "AI 응답에 실패했어요. 다시 말씀해주세요.",
			});
		}
	}, CODE_CHANGE_DEBOUNCE_MS);

	useEffect(() => {
		if (stateRef.current.phase !== "listening") return;
		if (codeMonitor.editorCode === stateRef.current.previousCode) return;

		debouncedCodeChange(codeMonitor.editorCode);
	}, [codeMonitor.editorCode, debouncedCodeChange]);

	const endInterview = useCallback(async () => {
		const { phase, interview, interviewConfig, messages } = stateRef.current;

		if (phase === "idle") {
			return;
		}

		speech.stopListening();
		speech.stopSpeaking();
		await codeMonitor.stopMonitoring();

		debouncedCodeChange.cancel();

		dispatch({ type: "END_INTERVIEW" });

		const duration = Math.floor(
			(Date.now() - new Date(interview.startedAt).getTime()) / 1000,
		);

		try {
			await updateInterview(interview.id, { messages });

			const report = await interviewer.generateReport(
				messages,
				codeMonitor.editorCode,
				duration,
				interviewConfig.problemInfo,
			);

			const completedInterview = await completeInterview(interview.id, report);

			if (completedInterview) {
				dispatch({ type: "REPORT_READY", interview: completedInterview });

				posthog.capture("interview_completed", {
					duration_sec: duration,
					message_count: messages.length,
					style: interviewConfig.interviewerStyle,
					provider: report.tokenUsage?.provider ?? null,
					score_understanding: report.scores.understanding,
					score_communication: report.scores.communication,
					score_code_quality: report.scores.codeQuality,
					score_time_management: report.scores.timeManagement,
					estimated_cost_usd: report.tokenUsage?.estimatedCost ?? null,
				});
			}
		} catch (error) {
			console.error("리포트 생성 실패:", error);

			dispatch({ type: "REPORT_FAILED", message: "리포트 생성에 실패했어요." });
		}
	}, [speech, codeMonitor, interviewer, dispatch, debouncedCodeChange]);

	const resetInterview = useCallback(() => {
		const { phase, interview, messages } = stateRef.current;

		if (phase === "idle") {
			return;
		}

		posthog.capture("interview_abandoned", {
			duration_sec:
				(Date.now() - new Date(interview.startedAt).getTime()) / 1000,
			message_count: messages.length,
		});

		dispatch({ type: "RESET_INTERVIEW" });
	}, [dispatch]);

	const sendAIMessage = useCallback(
		async (text: string) => {
			if (stateRef.current.phase !== "listening") {
				return;
			}

			speech.clearTranscript();

			posthog.capture("voice_message_sent");

			const userMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: "user",
				content: text,
				timestamp: Date.now(),
				codeContext: codeMonitor.editorCode,
			};

			dispatch({ type: "ADD_MESSAGE", message: userMessage });

			try {
				const { content, notes } = await interviewer.respondToUser({
					content: text,
					codeContext: codeMonitor.editorCode,
					messages: [...stateRef.current.messages, userMessage],

					problemInfo: stateRef.current.interviewConfig.problemInfo,
					interviewerStyle: stateRef.current.interviewConfig.interviewerStyle,
				});

				dispatch({
					type: "AI_RESPONDED",
					message: {
						id: crypto.randomUUID(),
						role: "interviewer",
						content,
						notes,
						timestamp: Date.now(),
					},
				});

				speech.startSpeaking(content);
			} catch (error) {
				console.error("AI 응답 실패:", error);
				dispatch({
					type: "AI_FAILED",
					message: "AI 응답에 실패했어요. 다시 말씀해주세요.",
				});
			}
		},
		[speech, dispatch, codeMonitor.editorCode, interviewer.respondToUser],
	);

	useInterval(() => dispatch({ type: "TICK_TIMER" }), {
		delay: 1000,
		enabled:
			(state.phase === "listening" ||
				state.phase === "processing" ||
				state.phase === "speaking") &&
			state.timeRemaining > 0,
	});

	// 타임 아웃 시 자동 종료
	useEffect(() => {
		if (state.timeRemaining !== 0 || state.phase === "idle") return;
		endInterview();
	}, [state.timeRemaining, state.phase, endInterview]);

	// 자동 저장
	const MAX_CODE_SNAPSHOTS = 100;
	useEffect(() => {
		const { phase, interview, messages } = stateRef.current;

		if (phase === "idle" || phase === "completed") {
			return;
		}

		const prevSnapshots = interview.codeSnapshots || [];
		const newSnapshot = {
			code: codeMonitor.editorCode,
			language: codeMonitor.editorLanguage,
			timestamp: Date.now(),
		};
		const codeSnapshots = [
			...prevSnapshots.slice(-(MAX_CODE_SNAPSHOTS - 1)),
			newSnapshot,
		];

		updateInterview(interview.id, { messages, codeSnapshots });
	}, [codeMonitor.editorCode, codeMonitor.editorLanguage]);

	return {
		startInterview,
		endInterview,
		resetInterview,
		sendAIMessage,
	};
}
