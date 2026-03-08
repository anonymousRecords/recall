import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, useReducer } from "react";
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
import { useInterviewActions } from "./useInterviewActions";

// STATE
export interface InterviewStateContext {
	phase: InterviewPhase;
	interview: LiveInterview | null;
	messages: ChatMessage[];
	timeRemaining: number;
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

// ACTION
export const InterviewStateContext =
	createContext<InterviewStateContext | null>(null);

export interface InterviewActionsContext {
	startInterview: (config: {
		timeLimit: number;
		interviewerStyle: "friendly" | "normal" | "pressure";
	}) => Promise<void>;
	endInterview: () => Promise<void>;
	resetInterview: () => void;
	sendAIMessage: (content: string) => void;
}

export const InterviewActionsContext =
	createContext<InterviewActionsContext | null>(null);

interface InterviewProviderProps {
	children: React.ReactNode;
}

export function InterviewProvider({ children }: InterviewProviderProps) {
	const [state, dispatch] = useReducer(interviewReducer, initialInterviewState);

	const { data: settings } = useSuspenseQuery(liveCodingSettingsQueryOptions());

	const interviewer = useInterviewer({
		provider: settings.aiProvider,
		apiKey: settings.apiKey,
	});

	const codeMonitor = useCodeMonitor();

	// NOTE: machine이 아직 선언되지 않았지만, onFinalTranscript는
	// 비동기 이벤트에서만 호출되므로 machine 초기화 이후 실행됨.
	// usePreservedCallback이 내부적으로 최신 참조를 보장함.
	const speech = useSpeech({
		onFinalTranscript: (text) => actions.sendAIMessage(text),
		onInterviewerSpeakingEnd: () => dispatch({ type: "SPEAKING_DONE" }),
	});

	const actions = useInterviewActions({
		state,
		dispatch,
		speech,
		codeMonitor,
		interviewer,
	});

	return (
		<InterviewStateContext.Provider
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
			<InterviewActionsContext.Provider
				value={{
					startInterview: actions.startInterview,
					endInterview: actions.endInterview,
					resetInterview: actions.resetInterview,
					sendAIMessage: actions.sendAIMessage,
				}}
			>
				{children}
			</InterviewActionsContext.Provider>
		</InterviewStateContext.Provider>
	);
}
