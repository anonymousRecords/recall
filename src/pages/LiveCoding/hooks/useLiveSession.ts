import { useCallback, useEffect, useRef, useState } from "react";
import { completeSession, createSession } from "../../../lib/db/sessions";
import type {
	ChatMessage,
	InterviewerStyle,
	LiveSession,
	SessionConfig,
	SessionStatus,
} from "../../../types";
import { useCodeChangeHandler } from "./useCodeChangeHandler";
import { useCodeMonitor } from "./useCodeMonitor";
import { useInterviewer } from "./useInterviewer";
import { useLiveCodingSettings } from "./useLiveCodingSettings";
import { useSessionAutoSave } from "./useSessionAutoSave";
import { useSessionChat } from "./useSessionChat";
import { useSessionMessages } from "./useSessionMessages";
import { useSessionTimer } from "./useSessionTimer";
import { useSpeech } from "./useSpeech";

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

	const sessionConfigRef = useRef<SessionConfig | null>(null);
	const clearTranscriptRef = useRef<() => void>(() => {});
	const speakRef = useRef<(text: string) => void>(() => {});

	const {
		messages,
		messagesRef,
		setMessages,
		addMessage,
		reset: resetMessages,
	} = useSessionMessages();

	const endSessionRef = useRef<() => void>(() => {});

	const timer = useSessionTimer(status === "active", () =>
		endSessionRef.current(),
	);

	const { handleFinalTranscript, sendMessage } = useSessionChat({
		status,
		sessionConfigRef,
		currentCode,
		sendToAI,
		addMessage,
		messagesRef,
		speakRef,
		clearTranscriptRef,
	});

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

	const codeChange = useCodeChangeHandler({
		status,
		currentCode,
		sessionConfigRef,
		messagesRef,
		isSpeaking,
		isAILoading,
		sendToAI,
		onAIResponse: addMessage,
		speak: (text) => speakRef.current(text),
	});

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
			codeChange.setPreviousCode(currentCode);

			const newSession = await createSession({
				config: sessionConfig,
				status: "active",
				messages: [],
				codeSnapshots: [],
				startedAt: new Date().toISOString(),
			});

			setSession(newSession);
			setStatus("active");
			resetMessages();

			if (config.timeLimit) {
				timer.start(config.timeLimit);
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
				console.error("[Recall] AI 인사 실패:", error);
			}
		},
		[
			problemInfo,
			language,
			currentCode,
			startMonitoring,
			sendToAI,
			speak,
			codeChange,
			timer,
			resetMessages,
			setMessages,
		],
	);

	const endSession = useCallback(async () => {
		if (!session || !sessionConfigRef.current) return;

		stopListening();
		stopSpeaking();
		await stopMonitoring();
		codeChange.cleanup();

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
			console.error("[Recall] 리포트 생성 실패:", error);
		}
	}, [
		session,
		messages,
		currentCode,
		generateReport,
		stopListening,
		stopSpeaking,
		stopMonitoring,
		codeChange,
	]);

	useEffect(() => {
		endSessionRef.current = endSession;
	}, [endSession]);

	const resetSession = useCallback(() => {
		setStatus("idle");
		setSession(null);
		resetMessages();
		timer.reset();
		codeChange.reset();
		sessionConfigRef.current = null;
	}, [resetMessages, timer, codeChange]);

	useSessionAutoSave(session, status, messages, currentCode, language);

	return {
		status,
		session,
		messages,
		timeRemaining: timer.timeRemaining,
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
