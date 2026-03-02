import type {
	ChatMessage,
	InterviewConfig,
	InterviewStatus,
	LiveInterview,
} from "../../../types";

export interface InterviewState {
	status: InterviewStatus;
	interview: LiveInterview | null;
	interviewConfig: InterviewConfig | null;
	messages: ChatMessage[];
	timeRemaining: number | null;
	previousCode: string;
}

export type InterviewAction =
	| {
			type: "START_INTERVIEW";
			interview: LiveInterview;
			config: InterviewConfig;
			initialCode: string;
	  }
	| { type: "SET_STATUS"; status: InterviewStatus }
	| { type: "SET_INTERVIEW"; interview: LiveInterview | null }
	| { type: "ADD_MESSAGE"; message: ChatMessage }
	| { type: "SET_MESSAGES"; messages: ChatMessage[] }
	| { type: "START_TIMER"; seconds: number }
	| { type: "TICK_TIMER" }
	| { type: "SET_PREVIOUS_CODE"; code: string }
	| { type: "RESET_INTERVIEW" };

export const initialInterviewState: InterviewState = {
	status: "idle",
	interview: null,
	interviewConfig: null,
	messages: [],
	timeRemaining: null,
	previousCode: "",
};

export function interviewReducer(
	state: InterviewState,
	action: InterviewAction,
): InterviewState {
	switch (action.type) {
		case "START_INTERVIEW":
			return {
				...state,
				status: "active",
				interview: action.interview,
				interviewConfig: action.config,
				messages: [],
				previousCode: action.initialCode,
			};

		case "SET_STATUS":
			return { ...state, status: action.status };

		case "SET_INTERVIEW":
			return { ...state, interview: action.interview };

		case "ADD_MESSAGE":
			return { ...state, messages: [...state.messages, action.message] };

		case "SET_MESSAGES":
			return { ...state, messages: action.messages };

		case "START_TIMER":
			return { ...state, timeRemaining: action.seconds };

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
