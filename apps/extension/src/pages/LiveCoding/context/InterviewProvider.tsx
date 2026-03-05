import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useReducer, useRef } from "react";
import type {
	ChatMessage,
	InterviewStatus,
	LiveInterview,
	ProblemInfo,
} from "../../../types";
import { useCodeMonitor } from "../hooks/useCodeMonitor";
import { useInterviewer } from "../hooks/useInterviewer";
import { useSpeech } from "../hooks/useSpeech";
import { liveCodingSettingsQueryOptions } from "../../../queries/live-coding-settings";
import { initialInterviewState, interviewReducer } from "./interviewReducer";
import { useInterviewCoordinator } from "./useInterviewCoordinator";

export interface InterviewStateContext {
	status: InterviewStatus;
	interview: LiveInterview | null;
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
		toggleListening: () => Promise<void>;
	};
}

export interface InterviewActionsContext {
	startInterview: (config: {
		timeLimit: number | null;
		interviewerStyle: "friendly" | "normal" | "pressure";
	}) => Promise<void>;
	endInterview: () => Promise<void>;
	resetInterview: () => void;
	sendMessage: (content: string) => Promise<void>;
}

export const InterviewStateCtx = createContext<InterviewStateContext | null>(
	null,
);
export const InterviewActionsCtx =
	createContext<InterviewActionsContext | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(interviewReducer, initialInterviewState);
	const { data: settings } = useSuspenseQuery(liveCodingSettingsQueryOptions());
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

	const coordinator = useInterviewCoordinator({
		state,
		dispatch,
		speech,
		codeMonitor,
		interviewer,
	});

	handleFinalTranscriptRef.current = coordinator.handleFinalTranscript;

	return (
		<InterviewStateCtx.Provider
			value={{
				status: state.status,
				interview: state.interview,
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
					toggleListening: speech.toggleListening,
				},
			}}
		>
			<InterviewActionsCtx.Provider value={coordinator}>
				{children}
			</InterviewActionsCtx.Provider>
		</InterviewStateCtx.Provider>
	);
}
