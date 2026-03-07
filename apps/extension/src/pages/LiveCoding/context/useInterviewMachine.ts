import { useCallback, useEffect, useRef } from "react";
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

export function useInterviewMachine({
	state,
	dispatch,
	speech,
	codeMonitor,
	interviewer,
}: MachineOptions) {
	const stateRef = useRef(state);
	stateRef.current = state;

	const endInterviewRef = useRef<() => Promise<void>>(async () => {});
	const lastAIQuestionTimeRef = useRef<number>(0);
	const codeChangeTimeoutRef = useRef<number | null>(null);
	const lastCodeChangeTimeRef = useRef<number>(Date.now());
	const pendingAITriggerRef = useRef<AITrigger | null>(null);

	const startInterview = useCallback(
		async (config: {
			timeLimit: number | null;
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
	useEffect(() => {
		if (state.phase !== "listening") {
			return;
		}

		if (state.interviewConfig === null) {
			return;
		}

		if (codeMonitor.editorCode === stateRef.current.previousCode) {
			return;
		}

		lastCodeChangeTimeRef.current = Date.now();

		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
		}

		codeChangeTimeoutRef.current = window.setTimeout(() => {
			const timeSinceLastQuestion = Date.now() - lastAIQuestionTimeRef.current;

			if (timeSinceLastQuestion < AI_QUESTION_COOLDOWN_MS) {
				return;
			}

			if (
				!shouldTriggerAI(stateRef.current.previousCode, codeMonitor.editorCode)
			) {
				return;
			}

			pendingAITriggerRef.current = { type: "code_change" };

			dispatch({ type: "CODE_CHANGED" });
		}, CODE_CHANGE_DEBOUNCE_MS);

		return () => {
			if (codeChangeTimeoutRef.current) {
				clearTimeout(codeChangeTimeoutRef.current);
			}
		};
	}, [codeMonitor.editorCode, state, dispatch]);

	// PROCESSING
	useEffect(() => {
		if (state.phase !== "processing") {
			return;
		}

		if (state.interviewConfig === null) {
			return;
		}

		const interviewConfig = state.interviewConfig;

		const aiTrigger = pendingAITriggerRef.current;
		pendingAITriggerRef.current = null; // 다음 트리거를 위해 초기화

		if (!aiTrigger) {
			return;
		}

		const callAI = async () => {
			try {
				let interviewerResponse: { content: string; notes?: string };

				switch (aiTrigger.type) {
					case "user_speech": {
						const userMessage: ChatMessage = {
							id: crypto.randomUUID(),
							role: "user",
							content: aiTrigger.transcript,
							timestamp: Date.now(),
							codeContext: codeMonitor.editorCode,
						};

						dispatch({ type: "ADD_MESSAGE", message: userMessage });

						interviewerResponse = await interviewer.respondToUser({
							content: aiTrigger.transcript,
							codeContext: codeMonitor.editorCode,
							messages: [...stateRef.current.messages, userMessage],
							problemInfo: interviewConfig.problemInfo,
							interviewerStyle: interviewConfig.interviewerStyle,
						});
						break;
					}

					case "code_change": {
						const result = await interviewer.respondToCodeChange({
							previousCode: stateRef.current.previousCode,
							currentCode: codeMonitor.editorCode,
							pauseDuration: Math.floor(
								(Date.now() - lastCodeChangeTimeRef.current) / 1000,
							),
							messages: stateRef.current.messages,
							problemInfo: interviewConfig.problemInfo,
							interviewerStyle: interviewConfig.interviewerStyle,
						});

						dispatch({
							type: "SET_PREVIOUS_CODE",
							code: codeMonitor.editorCode,
						});

						// AI가 "SKIP" 반환한 경우
						if (result === null) {
							dispatch({ type: "SPEAKING_DONE" });
							return;
						}

						lastAIQuestionTimeRef.current = Date.now();
						interviewerResponse = result;
						break;
					}
				}

				const { content, notes } = interviewerResponse;

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content,
					notes,
					timestamp: Date.now(),
				};

				dispatch({ type: "AI_RESPONDED", message: aiMessage });

				speech.startSpeaking(content);
			} catch (error) {
				console.error("AI 응답 실패:", error);
				dispatch({
					type: "AI_FAILED",
					message: "AI 응답에 실패했어요. 다시 말씀해주세요.",
				});
			}
		};

		callAI();
	}, [state.phase, codeMonitor, dispatch, interviewer, speech, state]);

	const endInterview = useCallback(async () => {
		const { interview, interviewConfig, messages } = stateRef.current;

		if (!interview || !interviewConfig) {
			return;
		}

		speech.stopListening();
		speech.stopSpeaking();
		await codeMonitor.stopMonitoring();

		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
			codeChangeTimeoutRef.current = null;
		}

		dispatch({ type: "END_INTERVIEW" });

		const duration = Math.floor(
			(Date.now() - new Date(interview.startedAt).getTime()) / 1000,
		);

		try {
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
	}, [speech, codeMonitor, interviewer, dispatch]);

	endInterviewRef.current = endInterview;

	const resetInterview = useCallback(() => {
		const { phase, interview, messages } = stateRef.current;

		if (phase !== "idle" && interview) {
			const duration = Math.floor(
				(Date.now() - new Date(interview.startedAt).getTime()) / 1000,
			);

			posthog.capture("interview_abandoned", {
				duration_sec: duration,
				message_count: messages.length,
			});
		}
		dispatch({ type: "RESET_INTERVIEW" });
	}, [dispatch]);

	const handleFinalTranscript = useCallback(
		(text: string) => {
			if (stateRef.current.phase !== "listening") {
				return;
			}

			speech.clearTranscript();

			posthog.capture("voice_message_sent");

			pendingAITriggerRef.current = { type: "user_speech", transcript: text };

			dispatch({ type: "TRANSCRIPT_RECEIVED", text });
		},
		[speech, dispatch],
	);

	const sendMessage = useCallback(
		(content: string) => {
			handleFinalTranscript(content);
		},
		[handleFinalTranscript],
	);

	// 타이머
	const isTimerActive =
		(state.phase === "listening" ||
			state.phase === "processing" ||
			state.phase === "speaking") &&
		state.timeRemaining !== null &&
		state.timeRemaining > 0;

	useEffect(() => {
		if (!isTimerActive) {
			return;
		}

		const interval = setInterval(() => dispatch({ type: "TICK_TIMER" }), 1000);

		return () => clearInterval(interval);
	}, [isTimerActive, dispatch]);

	// 타임 아웃 시 자동 종료
	useEffect(() => {
		if (state.timeRemaining === 0) {
			endInterviewRef.current();
		}
	}, [state.timeRemaining]);

	// 자동 저장
	useEffect(() => {
		if (
			!state.interview ||
			state.phase === "idle" ||
			state.phase === "completed"
		) {
			return;
		}

		updateInterview(state.interview.id, {
			messages: state.messages,
			codeSnapshots: [
				...(state.interview.codeSnapshots || []),
				{
					code: codeMonitor.editorCode,
					language: codeMonitor.editorLanguage,
					timestamp: Date.now(),
				},
			],
		});
	}, [
		state.messages,
		state.interview,
		state.phase,
		codeMonitor.editorCode,
		codeMonitor.editorLanguage,
	]);

	return {
		startInterview,
		endInterview,
		resetInterview,
		sendMessage,
		handleFinalTranscript,
	};
}

type AITrigger =
	| { type: "user_speech"; transcript: string }
	| { type: "code_change" };
