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

export type InterviewState =
	| {
			phase: "idle";
			interview: null;
			interviewConfig: null;
			messages: [];
			timeRemaining: 0;
			previousCode: "";
			error: InterviewError | null;
	  }
	| {
			phase:
				| "listening" // 마이크 대기 중
				| "processing" // AI 호출 중
				| "speaking" // TTS 재생 중
				| "completed"; // 리포트 화면;
			interview: LiveInterview;
			interviewConfig: InterviewConfig;
			messages: ChatMessage[];
			timeRemaining: number;
			previousCode: string;
			error: InterviewError | null;
	  };

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
				timeRemaining: action.config.timeLimit * 60,
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
			if (state.phase === "idle") {
				return state;
			}
			return { ...state, phase: "completed" };

		case "REPORT_READY":
			if (state.phase === "idle") {
				return state;
			}
			return { ...state, interview: action.interview };

		case "ADD_MESSAGE":
			if (state.phase === "idle") {
				return state;
			}
			return { ...state, messages: [...state.messages, action.message] };

		case "START_FAILED":
			if (state.phase === "idle") {
				return state;
			}
			return {
				...initialInterviewState,
				error: { code: "START_FAILED", message: action.message },
			};

		case "AI_FAILED":
			if (state.phase === "idle") {
				return state;
			}
			return {
				...state,
				phase: "listening",
				error: { code: "AI_FAILED", message: action.message },
			};

		case "REPORT_FAILED":
			if (state.phase === "idle") {
				return state;
			}
			return {
				...state,
				error: { code: "REPORT_FAILED", message: action.message },
			};

		case "TICK_TIMER": {
			if (state.phase === "idle") {
				return state;
			}
			if (state.timeRemaining <= 0) {
				return state;
			}
			return { ...state, timeRemaining: state.timeRemaining - 1 };
		}

		case "SET_PREVIOUS_CODE":
			if (state.phase === "idle") {
				return state;
			}
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
	timeRemaining: 0,
	previousCode: "",
	error: null,
};

export interface InterviewError {
	code: "AI_FAILED" | "REPORT_FAILED" | "START_FAILED";
	message: string;
}
