import type {
	ChatMessage,
	LiveSession,
	SessionConfig,
	SessionStatus,
} from "../../../types";

export interface SessionState {
	status: SessionStatus;
	session: LiveSession | null;
	sessionConfig: SessionConfig | null;
	messages: ChatMessage[];
	timeRemaining: number | null;
	previousCode: string;
}

export type SessionAction =
	| {
			type: "START_SESSION";
			session: LiveSession;
			config: SessionConfig;
			initialCode: string;
	  }
	| { type: "SET_STATUS"; status: SessionStatus }
	| { type: "SET_SESSION"; session: LiveSession | null }
	| { type: "ADD_MESSAGE"; message: ChatMessage }
	| { type: "SET_MESSAGES"; messages: ChatMessage[] }
	| { type: "START_TIMER"; seconds: number }
	| { type: "TICK_TIMER" }
	| { type: "SET_PREVIOUS_CODE"; code: string }
	| { type: "RESET_SESSION" };

export const initialSessionState: SessionState = {
	status: "idle",
	session: null,
	sessionConfig: null,
	messages: [],
	timeRemaining: null,
	previousCode: "",
};

export function sessionReducer(
	state: SessionState,
	action: SessionAction,
): SessionState {
	switch (action.type) {
		case "START_SESSION":
			return {
				...state,
				status: "active",
				session: action.session,
				sessionConfig: action.config,
				messages: [],
				previousCode: action.initialCode,
			};

		case "SET_STATUS":
			return { ...state, status: action.status };

		case "SET_SESSION":
			return { ...state, session: action.session };

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

		case "RESET_SESSION":
			return { ...initialSessionState };

		default:
			return state;
	}
}
