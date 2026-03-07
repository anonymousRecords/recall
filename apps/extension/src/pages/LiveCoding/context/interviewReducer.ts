import type {
	ChatMessage,
	InterviewConfig,
	LiveInterview,
} from "../../../types";

export type InterviewPhase =
	| "idle" // 설정 화면
	| "listening" // 마이크 대기 중
	| "processing" // AI 호출 중
	| "speaking" // TTS 재생 중
	| "completed"; // 리포트 화면

export interface InterviewState {
	phase: InterviewPhase;
	interview: LiveInterview | null;
	interviewConfig: InterviewConfig | null;
	messages: ChatMessage[];
	timeRemaining: number | null;
	previousCode: string;
	error: InterviewError | null;
}

export type InterviewAction =
	| {
			type: "START_INTERVIEW";
			interview: LiveInterview;
			config: InterviewConfig;
			initialCode: string;
	  }
	| { type: "TRANSCRIPT_RECEIVED"; text: string }
	| { type: "CODE_CHANGED" }
	| { type: "AI_RESPONDED"; message: ChatMessage }
	| { type: "SPEAKING_DONE" }
	| { type: "END_INTERVIEW" }
	| { type: "REPORT_READY"; interview: LiveInterview }
	| { type: "START_FAILED"; message: string }
	| { type: "AI_FAILED"; message: string }
	| { type: "REPORT_FAILED"; message: string }
	| { type: "RESET_INTERVIEW" }
	| { type: "ADD_MESSAGE"; message: ChatMessage }
	| { type: "TICK_TIMER" }
	| { type: "SET_PREVIOUS_CODE"; code: string };

export function interviewReducer(
	state: InterviewState,
	action: InterviewAction,
): InterviewState {
	switch (action.type) {
		case "START_INTERVIEW":
			if (state.phase !== "idle") {
				return state;
			}

			return {
				...state,
				phase: "listening",
				interview: action.interview,
				interviewConfig: action.config,
				messages: [],
				previousCode: action.initialCode,
				timeRemaining: action.config.timeLimit
					? action.config.timeLimit * 60
					: null,
				error: null,
			};

		case "TRANSCRIPT_RECEIVED":
			if (state.phase !== "listening") {
				return state;
			}

			return { ...state, phase: "processing", error: null };

		case "CODE_CHANGED":
			if (state.phase !== "listening") {
				return state;
			}

			return { ...state, phase: "processing" };

		case "AI_RESPONDED":
			if (state.phase !== "processing" && state.phase !== "listening") {
				return state;
			}

			return {
				...state,
				phase: "speaking",
				messages: [...state.messages, action.message],
			};

		case "SPEAKING_DONE":
			if (state.phase !== "speaking") {
				return state;
			}

			return { ...state, phase: "listening" };

		case "END_INTERVIEW":
			return { ...state, phase: "completed" };

		case "REPORT_READY":
			return { ...state, interview: action.interview };

		case "ADD_MESSAGE":
			return { ...state, messages: [...state.messages, action.message] };

		case "START_FAILED":
			return {
				...state,
				phase: "idle",
				error: { code: "START_FAILED", message: action.message },
			};

		case "AI_FAILED":
			return {
				...state,
				phase: "listening",
				error: { code: "AI_FAILED", message: action.message },
			};

		case "REPORT_FAILED":
			return {
				...state,
				error: { code: "REPORT_FAILED", message: action.message },
			};

		case "TICK_TIMER": {
			if (state.timeRemaining === null || state.timeRemaining <= 0) {
				return state;
			}
			return { ...state, timeRemaining: state.timeRemaining - 1 };
		}

		case "SET_PREVIOUS_CODE":
			return { ...state, previousCode: action.code };

		case "RESET_INTERVIEW":
			return { ...initialInterviewState };

		default:
			return state;
	}
}

export const initialInterviewState: InterviewState = {
	phase: "idle",
	interview: null,
	interviewConfig: null,
	messages: [],
	timeRemaining: null,
	previousCode: "",
	error: null,
};

export interface InterviewError {
	code: "AI_FAILED" | "REPORT_FAILED" | "START_FAILED";
	message: string;
}
