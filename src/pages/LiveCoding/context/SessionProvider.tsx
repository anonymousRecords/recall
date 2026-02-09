import { createContext, type ReactNode, useReducer, useRef } from "react";
import type {
	ChatMessage,
	LiveSession,
	ProblemInfo,
	SessionStatus,
} from "../../../types";
import { useCodeMonitor } from "../hooks/useCodeMonitor";
import { useInterviewer } from "../hooks/useInterviewer";
import { useLiveCodingSettings } from "../hooks/useLiveCodingSettings";
import { useSpeech } from "../hooks/useSpeech";
import { initialSessionState, sessionReducer } from "./sessionReducer";
import { useSessionCoordinator } from "./useSessionCoordinator";

export interface SessionStateContext {
	status: SessionStatus;
	session: LiveSession | null;
	messages: ChatMessage[];
	timeRemaining: number | null;
	problemInfo: ProblemInfo | null;
	isAILoading: boolean;
	speech: {
		isListening: boolean;
		isSpeaking: boolean;
		finalTranscript: string;
		interimTranscript: string;
		volume: number;
		hasPermission: boolean | null;
		toggleListening: () => Promise<void>;
		requestPermission: () => Promise<boolean>;
	};
}

export interface SessionActionsContext {
	startSession: (config: {
		timeLimit: number | null;
		interviewerStyle: "friendly" | "normal" | "pressure";
	}) => Promise<void>;
	endSession: () => Promise<void>;
	resetSession: () => void;
	sendMessage: (content: string) => Promise<void>;
}

export const SessionStateCtx = createContext<SessionStateContext | null>(null);
export const SessionActionsCtx = createContext<SessionActionsContext | null>(
	null,
);

export function SessionProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
	const { settings } = useLiveCodingSettings();
	const codeMonitor = useCodeMonitor();
	const interviewer = useInterviewer({
		provider: settings.aiProvider,
		apiKey: settings.apiKey,
	});

	const handleFinalTranscriptRef = useRef<(text: string) => void>(() => {});

	const speech = useSpeech({
		mode: settings.voiceInputMode,
		voiceEnabled: settings.voiceEnabled,
		voiceRate: settings.voiceRate,
		onFinalTranscript: (text) => handleFinalTranscriptRef.current(text),
	});

	const coordinator = useSessionCoordinator({
		state,
		dispatch,
		speech,
		codeMonitor,
		interviewer,
	});

	handleFinalTranscriptRef.current = coordinator.handleFinalTranscript;

	return (
		<SessionStateCtx.Provider
			value={{
				status: state.status,
				session: state.session,
				messages: state.messages,
				timeRemaining: state.timeRemaining,
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
			}}
		>
			<SessionActionsCtx.Provider value={coordinator}>
				{children}
			</SessionActionsCtx.Provider>
		</SessionStateCtx.Provider>
	);
}
