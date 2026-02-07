import { useEffect, useRef, useState } from "react";
import type { LiveSession, SessionConfig, SessionStatus } from "../../../types";
import { useCodeChangeHandler } from "./useCodeChangeHandler";
import { useCodeMonitor } from "./useCodeMonitor";
import { useInterviewer } from "./useInterviewer";
import { useLiveCodingSettings } from "./useLiveCodingSettings";
import { useSessionAutoSave } from "./useSessionAutoSave";
import { useSessionChat } from "./useSessionChat";
import { useSessionLifecycle } from "./useSessionLifecycle";
import { useSessionMessages } from "./useSessionMessages";
import { useSessionTimer } from "./useSessionTimer";
import { useSpeech } from "./useSpeech";

export function useLiveSession() {
	const { settings } = useLiveCodingSettings();
	const codeMonitor = useCodeMonitor();
	const interviewer = useInterviewer({
		provider: settings.aiProvider,
		apiKey: settings.apiKey,
	});

	const [status, setStatus] = useState<SessionStatus>("idle");
	const [session, setSession] = useState<LiveSession | null>(null);
	const sessionConfigRef = useRef<SessionConfig | null>(null);

	const sessionMessages = useSessionMessages();

	const endSessionRef = useRef<() => void>(() => {});
	const timer = useSessionTimer(status === "active", () =>
		endSessionRef.current(),
	);

	const speakRef = useRef<(text: string) => void>(() => {});
	const clearTranscriptRef = useRef<() => void>(() => {});

	const chat = useSessionChat({
		status,
		sessionConfigRef,
		currentCode: codeMonitor.currentCode,
		sendToAI: interviewer.sendToAI,
		addMessage: sessionMessages.addMessage,
		messagesRef: sessionMessages.messagesRef,
		speakRef,
		clearTranscriptRef,
	});

	const speech = useSpeech({
		mode: settings.voiceInputMode,
		voiceEnabled: settings.voiceEnabled,
		voiceRate: settings.voiceRate,
		onFinalTranscript: chat.handleFinalTranscript,
	});

	useEffect(() => {
		clearTranscriptRef.current = speech.clearTranscript;
	}, [speech.clearTranscript]);
	useEffect(() => {
		speakRef.current = speech.speak;
	}, [speech.speak]);

	const codeChange = useCodeChangeHandler({
		status,
		currentCode: codeMonitor.currentCode,
		sessionConfigRef,
		messagesRef: sessionMessages.messagesRef,
		isSpeaking: speech.isSpeaking,
		isAILoading: interviewer.isLoading,
		sendToAI: interviewer.sendToAI,
		onAIResponse: sessionMessages.addMessage,
		speak: (text) => speakRef.current(text),
	});

	const { startSession, endSession, resetSession } = useSessionLifecycle({
		session,
		setSession,
		setStatus,
		sessionConfigRef,
		sessionMessages,
		codeMonitor,
		interviewer,
		speech,
		timer,
		codeChange,
	});

	useEffect(() => {
		endSessionRef.current = endSession;
	}, [endSession]);

	useSessionAutoSave(
		session,
		status,
		sessionMessages.messages,
		codeMonitor.currentCode,
		codeMonitor.language,
	);

	return {
		status,
		session,
		messages: sessionMessages.messages,
		timeRemaining: timer.timeRemaining,
		problemInfo: codeMonitor.problemInfo,
		isAILoading: interviewer.isLoading,
		speech: {
			isListening: speech.isListening,
			isSpeaking: speech.isSpeaking,
			finalTranscript: speech.finalTranscript,
			interimTranscript: speech.interimTranscript,
			volume: speech.volume,
			hasPermission: speech.hasPermission,
			toggleListening: speech.toggleListening,
			requestPermission: speech.requestPermission,
		},
		startSession,
		endSession,
		resetSession,
		sendMessage: chat.sendMessage,
	};
}
