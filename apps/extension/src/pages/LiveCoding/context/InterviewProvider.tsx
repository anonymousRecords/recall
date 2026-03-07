import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, type ReactNode, useReducer, useRef } from "react";
import { liveCodingSettingsQueryOptions } from "../../../queries/live-coding-settings";
import type { ChatMessage, LiveInterview, ProblemInfo } from "../../../types";
import { useCodeMonitor } from "../hooks/useCodeMonitor";
import { useInterviewer } from "../hooks/useInterviewer";
import { useSpeech } from "../hooks/useSpeech";
import {
	type InterviewError,
	type InterviewPhase,
	initialInterviewState,
	interviewReducer,
} from "./interviewReducer";
import { useInterviewMachine } from "./useInterviewMachine";

export interface InterviewStateContext {
	phase: InterviewPhase;
	interview: LiveInterview | null;
	messages: ChatMessage[];
	timeRemaining: number | null;
	problemInfo: ProblemInfo | null;
	error: InterviewError | null;
	speech: {
		isMicOn: boolean;
		isInterviewerSpeaking: boolean;
		finalTranscript: string;
		liveTranscript: string;
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
	sendMessage: (content: string) => void;
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
		onFinalTranscript: (text) => handleFinalTranscriptRef.current(text),
		onInterviewerSpeakingEnd: () => dispatch({ type: "SPEAKING_DONE" }),
	});

	const machine = useInterviewMachine({
		state,
		dispatch,
		speech,
		codeMonitor,
		interviewer,
	});

	handleFinalTranscriptRef.current = machine.handleFinalTranscript;

	return (
		<InterviewStateCtx.Provider
			value={{
				phase: state.phase,
				interview: state.interview,
				messages: state.messages,
				timeRemaining: state.timeRemaining,
				problemInfo: codeMonitor.problemInfo,
				error: state.error,
				speech: {
					isMicOn: speech.isMicOn,
					isInterviewerSpeaking: speech.isInterviewerSpeaking,
					finalTranscript: speech.finalTranscript,
					liveTranscript: speech.liveTranscript,
					toggleListening: speech.toggleListening,
				},
			}}
		>
			<InterviewActionsCtx.Provider
				value={{
					startInterview: machine.startInterview,
					endInterview: machine.endInterview,
					resetInterview: machine.resetInterview,
					sendMessage: machine.sendMessage,
				}}
			>
				{children}
			</InterviewActionsCtx.Provider>
		</InterviewStateCtx.Provider>
	);
}
