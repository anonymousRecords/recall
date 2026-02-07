import { useCallback, useEffect, useRef, useState } from "react";
import {
	completeSession,
	createSession,
	updateSession,
} from "../../../lib/db/sessions";
import type {
	ChatMessage,
	InterviewerStyle,
	LiveSession,
	SessionConfig,
	SessionStatus,
} from "../../../types";
import { useCodeMonitor } from "./useCodeMonitor";
import { useInterviewer } from "./useInterviewer";
import { useLiveCodingSettings } from "./useLiveCodingSettings";
import { useSpeech } from "./useSpeech";

const DEBOUNCE_MS = 3000;

export function useLiveSession() {
	const { settings } = useLiveCodingSettings();
	const {
		problemInfo,
		currentCode,
		language,
		isProgrammers,
		loading: codeMonitorLoading,
		startMonitoring,
		stopMonitoring,
	} = useCodeMonitor();

	const {
		sendToAI,
		generateReport,
		isLoading: isAILoading,
	} = useInterviewer({
		provider: settings.aiProvider,
		apiKey: settings.apiKey,
	});

	const [status, setStatus] = useState<SessionStatus>("idle");
	const [session, setSession] = useState<LiveSession | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

	const previousCodeRef = useRef("");
	const lastCodeChangeTimeRef = useRef<number>(Date.now());
	const codeChangeTimeoutRef = useRef<number | null>(null);
	const sessionConfigRef = useRef<SessionConfig | null>(null);
	const clearTranscriptRef = useRef<() => void>(() => {});
	const speakRef = useRef<(text: string) => void>(() => {});
	const messagesRef = useRef<ChatMessage[]>([]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	const handleFinalTranscript = useCallback(
		async (text: string) => {
			const config = sessionConfigRef.current;
			if (status !== "active" || !config) return;

			clearTranscriptRef.current();

			const userMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: "user",
				content: text,
				timestamp: Date.now(),
				codeContext: currentCode,
			};
			setMessages((prev) => [...prev, userMessage]);

			try {
				const response = await sendToAI({
					type: "user_message",
					content: text,
					codeContext: currentCode,
					messages: [...messagesRef.current, userMessage],
					problemInfo: config.problemInfo,
					style: config.style,
				});

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content: response,
					timestamp: Date.now(),
				};
				setMessages((prev) => [...prev, aiMessage]);

				speakRef.current(response);
			} catch (error) {
				console.error("[오답노트] AI 응답 실패:", error);
			}
		},
		[status, currentCode, sendToAI],
	);

	const {
		isListening,
		isSpeaking,
		finalTranscript,
		interimTranscript,
		volume,
		hasPermission,
		speak,
		stopListening,
		toggleListening,
		stopSpeaking,
		clearTranscript,
		requestPermission,
	} = useSpeech({
		mode: settings.voiceInputMode,
		voiceEnabled: settings.voiceEnabled,
		voiceRate: settings.voiceRate,
		onFinalTranscript: handleFinalTranscript,
	});

	useEffect(() => {
		clearTranscriptRef.current = clearTranscript;
	}, [clearTranscript]);

	useEffect(() => {
		speakRef.current = speak;
	}, [speak]);

	const handleCodeChange = useCallback(
		async (code: string) => {
			const config = sessionConfigRef.current;
			if (status !== "active" || !config) return;

			const now = Date.now();
			const pauseDuration = Math.floor(
				(now - lastCodeChangeTimeRef.current) / 1000,
			);
			lastCodeChangeTimeRef.current = now;

			if (codeChangeTimeoutRef.current) {
				clearTimeout(codeChangeTimeoutRef.current);
			}

			if (isSpeaking || isAILoading) return;

			codeChangeTimeoutRef.current = window.setTimeout(async () => {
				try {
					const response = await sendToAI({
						type: "code_changed",
						previousCode: previousCodeRef.current,
						currentCode: code,
						pauseDuration,
						messages: messagesRef.current,
						problemInfo: config.problemInfo,
						style: config.style,
					});

					previousCodeRef.current = code;

					if (response) {
						const aiMessage: ChatMessage = {
							id: crypto.randomUUID(),
							role: "interviewer",
							content: response,
							timestamp: Date.now(),
						};
						setMessages((prev) => [...prev, aiMessage]);
						speak(response);
					}
				} catch (error) {
					console.error("[오답노트] 코드 분석 실패:", error);
				}
			}, DEBOUNCE_MS);
		},
		[status, sendToAI, speak, isSpeaking, isAILoading],
	);

	const startSession = useCallback(
		async (config: { timeLimit: number | null; style: InterviewerStyle }) => {
			if (!problemInfo) {
				throw new Error("문제 정보를 찾을 수 없습니다.");
			}

			const sessionConfig: SessionConfig = {
				problemInfo,
				timeLimit: config.timeLimit,
				style: config.style,
				language,
			};

			sessionConfigRef.current = sessionConfig;
			previousCodeRef.current = currentCode;
			lastCodeChangeTimeRef.current = Date.now();

			const newSession = await createSession({
				config: sessionConfig,
				status: "active",
				messages: [],
				codeSnapshots: [],
				startedAt: new Date().toISOString(),
			});

			setSession(newSession);
			setStatus("active");
			setMessages([]);

			if (config.timeLimit) {
				setTimeRemaining(config.timeLimit * 60);
			}

			await startMonitoring();

			try {
				const greeting = await sendToAI({
					type: "greeting",
					problemInfo,
					style: config.style,
				});

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content: greeting,
					timestamp: Date.now(),
				};

				setMessages([aiMessage]);
				speak(greeting);
			} catch (error) {
				console.error("[오답노트] AI 인사 실패:", error);
			}
		},
		[problemInfo, language, currentCode, startMonitoring, sendToAI, speak],
	);

	const endSession = useCallback(async () => {
		if (!session || !sessionConfigRef.current) return;

		stopListening();
		stopSpeaking();
		await stopMonitoring();

		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
		}

		setStatus("completed");

		const duration = Math.floor(
			(Date.now() - new Date(session.startedAt).getTime()) / 1000,
		);

		try {
			const report = await generateReport(
				messages,
				currentCode,
				duration,
				sessionConfigRef.current.problemInfo,
			);

			const completedSession = await completeSession(session.id, report);
			if (completedSession) {
				setSession(completedSession);
			}
		} catch (error) {
			console.error("[오답노트] 리포트 생성 실패:", error);
		}
	}, [
		session,
		messages,
		currentCode,
		generateReport,
		stopListening,
		stopSpeaking,
		stopMonitoring,
	]);

	const sendMessage = useCallback(
		async (content: string) => {
			await handleFinalTranscript(content);
		},
		[handleFinalTranscript],
	);

	const resetSession = useCallback(() => {
		setStatus("idle");
		setSession(null);
		setMessages([]);
		setTimeRemaining(null);
		sessionConfigRef.current = null;
		previousCodeRef.current = "";
		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
			codeChangeTimeoutRef.current = null;
		}
	}, []);

	const endSessionRef = useRef(endSession);
	useEffect(() => {
		endSessionRef.current = endSession;
	}, [endSession]);

	const isTimerActive = status === "active" && timeRemaining !== null;

	useEffect(() => {
		if (!isTimerActive) return;

		const interval = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev === null || prev <= 0) {
					endSessionRef.current();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isTimerActive]);

	useEffect(() => {
		if (status === "active" && currentCode !== previousCodeRef.current) {
			handleCodeChange(currentCode);
		}
	}, [status, currentCode, handleCodeChange]);

	useEffect(() => {
		if (session && status === "active") {
			updateSession(session.id, {
				messages,
				codeSnapshots: [
					...(session.codeSnapshots || []),
					{
						code: currentCode,
						language,
						timestamp: Date.now(),
					},
				],
			});
		}
	}, [messages, session, status, currentCode, language]);

	return {
		status,
		session,
		messages,
		timeRemaining,
		currentCode,
		problemInfo,
		isProgrammers,
		loading: codeMonitorLoading,
		isAILoading,
		isListening,
		isSpeaking,
		finalTranscript,
		interimTranscript,
		volume,
		hasPermission,
		requestPermission,
		startSession,
		endSession,
		resetSession,
		sendMessage,
		toggleListening,
	};
}
