import { useCallback, useEffect, useRef } from "react";
import {
	completeInterview,
	createInterview,
	updateInterview,
} from "../../../lib/db/interviews";
import { shouldTriggerAI } from "../../../lib/utils/code-gating";
import type {
	ChatMessage,
	InterviewConfig,
	InterviewerStyle,
} from "../../../types";
import type { useCodeMonitor } from "../hooks/useCodeMonitor";
import type { useInterviewer } from "../hooks/useInterviewer";
import type { useSpeech } from "../hooks/useSpeech";
import type { InterviewAction, InterviewState } from "./interviewReducer";

const CODE_CHANGE_DEBOUNCE_MS = 8000;
const AI_QUESTION_COOLDOWN_MS = 45000;

function parseAIResponse(response: string): {
	content: string;
	notes?: string;
} {
	const parts = response.split("#NOTES#");
	return {
		content: parts[0].trim(),
		notes: parts.length > 1 ? parts[1].trim() : undefined,
	};
}

interface CoordinatorDeps {
	state: InterviewState;
	dispatch: React.Dispatch<InterviewAction>;
	speech: ReturnType<typeof useSpeech>;
	codeMonitor: ReturnType<typeof useCodeMonitor>;
	interviewer: ReturnType<typeof useInterviewer>;
}

export function useInterviewCoordinator({
	state,
	dispatch,
	speech,
	codeMonitor,
	interviewer,
}: CoordinatorDeps) {
	const stateRef = useRef(state);
	stateRef.current = state;

	const endInterviewRef = useRef<() => Promise<void>>(async () => {});
	const codeChangeTimeoutRef = useRef<number | null>(null);
	const lastCodeChangeTimeRef = useRef<number>(Date.now());
	const lastAIQuestionTimeRef = useRef<number>(0);

	// Interview Lifecycle

	const startInterview = useCallback(
		async (config: {
			timeLimit: number | null;
			interviewerStyle: InterviewerStyle;
		}) => {
			if (!codeMonitor.problemInfo) {
				throw new Error("문제 정보를 찾을 수 없습니다.");
			}

			interviewer.resetUsage();

			if (speech.hasPermission !== true) {
				const granted = await speech.requestPermission();
				if (!granted) {
					throw new Error("마이크 권한이 필요해요");
				}
			}

			const interviewConfig: InterviewConfig = {
				problemInfo: codeMonitor.problemInfo,
				timeLimit: config.timeLimit,
				interviewerStyle: config.interviewerStyle,
				language: codeMonitor.language,
			};

			const newInterview = await createInterview({
				config: interviewConfig,
				status: "active",
				messages: [],
				codeSnapshots: [],
				startedAt: new Date().toISOString(),
			});

			dispatch({
				type: "START_INTERVIEW",
				interview: newInterview,
				config: interviewConfig,
				initialCode: codeMonitor.currentCode,
			});

			if (config.timeLimit) {
				dispatch({ type: "START_TIMER", seconds: config.timeLimit * 60 });
			}

			await codeMonitor.startMonitoring();

			try {
				const rawGreeting = await interviewer.sendToAI({
					type: "greeting",
					problemInfo: codeMonitor.problemInfo,
					interviewerStyle: config.interviewerStyle,
				});
				const { content, notes } = parseAIResponse(rawGreeting);

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content,
					notes,
					timestamp: Date.now(),
				};

				dispatch({ type: "SET_MESSAGES", messages: [aiMessage] });
				speech.speak(content);
			} catch (error) {
				console.error("[Recall] AI 인사 실패:", error);
			}
		},
		[codeMonitor, interviewer, speech, dispatch],
	);

	const endInterview = useCallback(async () => {
		const { interview, interviewConfig, messages } = stateRef.current;
		if (!interview || !interviewConfig) return;

		speech.stopListening();
		speech.stopSpeaking();
		await codeMonitor.stopMonitoring();

		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
			codeChangeTimeoutRef.current = null;
		}

		dispatch({ type: "SET_STATUS", status: "completed" });

		const duration = Math.floor(
			(Date.now() - new Date(interview.startedAt).getTime()) / 1000,
		);

		try {
			const report = await interviewer.generateReport(
				messages,
				codeMonitor.currentCode,
				duration,
				interviewConfig.problemInfo,
			);

			const completedInterview = await completeInterview(interview.id, report);
			if (completedInterview) {
				dispatch({ type: "SET_INTERVIEW", interview: completedInterview });
			}
		} catch (error) {
			console.error("[Recall] 리포트 생성 실패:", error);
		}
	}, [speech, codeMonitor, interviewer, dispatch]);

	endInterviewRef.current = endInterview;

	const resetInterview = useCallback(() => {
		dispatch({ type: "RESET_INTERVIEW" });
	}, [dispatch]);

	// Chat

	const handleFinalTranscript = useCallback(
		async (text: string) => {
			const { status, interviewConfig, messages } = stateRef.current;
			if (status !== "active" || !interviewConfig) return;

			speech.clearTranscript();

			const userMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: "user",
				content: text,
				timestamp: Date.now(),
				codeContext: codeMonitor.currentCode,
			};
			dispatch({ type: "ADD_MESSAGE", message: userMessage });

			try {
				const rawResponse = await interviewer.sendToAI({
					type: "user_message",
					content: text,
					codeContext: codeMonitor.currentCode,
					messages: [...messages, userMessage],
					problemInfo: interviewConfig.problemInfo,
					interviewerStyle: interviewConfig.interviewerStyle,
				});
				const { content, notes } = parseAIResponse(rawResponse);

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content,
					notes,
					timestamp: Date.now(),
				};
				dispatch({ type: "ADD_MESSAGE", message: aiMessage });

				speech.speak(content);
			} catch (error) {
				console.error("[Recall] AI 응답 실패:", error);
			}
		},
		[speech, codeMonitor, interviewer, dispatch],
	);

	const sendMessage = useCallback(
		async (content: string) => {
			await handleFinalTranscript(content);
		},
		[handleFinalTranscript],
	);

	// Code Change Detection

	useEffect(() => {
		const { status, interviewConfig, previousCode } = stateRef.current;
		if (status !== "active" || !interviewConfig) return;
		if (codeMonitor.currentCode === previousCode) return;

		const now = Date.now();
		const pauseDuration = Math.floor(
			(now - lastCodeChangeTimeRef.current) / 1000,
		);
		lastCodeChangeTimeRef.current = now;

		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
		}

		if (speech.isSpeaking || interviewer.isLoading) return;

		codeChangeTimeoutRef.current = window.setTimeout(async () => {
			const currentState = stateRef.current;

			if (
				!shouldTriggerAI(currentState.previousCode, codeMonitor.currentCode)
			) {
				return;
			}

			const timeSinceLastQuestion = Date.now() - lastAIQuestionTimeRef.current;
			if (timeSinceLastQuestion < AI_QUESTION_COOLDOWN_MS) return;
			try {
				const response = await interviewer.sendToAI({
					type: "code_changed",
					previousCode: currentState.previousCode,
					currentCode: codeMonitor.currentCode,
					pauseDuration,
					messages: currentState.messages,
					problemInfo: interviewConfig.problemInfo,
					interviewerStyle: interviewConfig.interviewerStyle,
				});

				dispatch({
					type: "SET_PREVIOUS_CODE",
					code: codeMonitor.currentCode,
				});

				if (response) {
					lastAIQuestionTimeRef.current = Date.now();
					const { content, notes } = parseAIResponse(response);
					const aiMessage: ChatMessage = {
						id: crypto.randomUUID(),
						role: "interviewer",
						content,
						notes,
						timestamp: Date.now(),
					};
					dispatch({ type: "ADD_MESSAGE", message: aiMessage });
					speech.speak(content);
				}
			} catch (error) {
				console.error("[Recall] 코드 분석 실패:", error);
			}
		}, CODE_CHANGE_DEBOUNCE_MS);

		return () => {
			if (codeChangeTimeoutRef.current) {
				clearTimeout(codeChangeTimeoutRef.current);
			}
		};
	}, [
		codeMonitor.currentCode,
		speech.isSpeaking,
		interviewer.isLoading,
		interviewer,
		speech,
		dispatch,
	]);

	// Timer

	const isTimerActive =
		state.status === "active" &&
		state.timeRemaining !== null &&
		state.timeRemaining > 0;

	useEffect(() => {
		if (!isTimerActive) return;
		const interval = setInterval(() => dispatch({ type: "TICK_TIMER" }), 1000);
		return () => clearInterval(interval);
	}, [isTimerActive, dispatch]);

	useEffect(() => {
		if (state.timeRemaining === 0) {
			endInterviewRef.current();
		}
	}, [state.timeRemaining]);

	// Auto Save

	useEffect(() => {
		if (!state.interview || state.status !== "active") return;

		updateInterview(state.interview.id, {
			messages: state.messages,
			codeSnapshots: [
				...(state.interview.codeSnapshots || []),
				{
					code: codeMonitor.currentCode,
					language: codeMonitor.language,
					timestamp: Date.now(),
				},
			],
		});
	}, [
		state.messages,
		state.interview,
		state.status,
		codeMonitor.currentCode,
		codeMonitor.language,
	]);

	return {
		startInterview,
		endInterview,
		resetInterview,
		sendMessage,
		handleFinalTranscript,
	};
}
