import { useContext } from "react";
import {
	type InterviewActionsContext,
	InterviewActionsCtx,
	type InterviewStateContext,
	InterviewStateCtx,
} from "./InterviewProvider";

export function useInterviewState(): InterviewStateContext {
	const ctx = useContext(InterviewStateCtx);
	if (!ctx) {
		throw new Error("useInterviewState must be used within InterviewProvider");
	}
	return ctx;
}

export function useInterviewActions(): InterviewActionsContext {
	const ctx = useContext(InterviewActionsCtx);
	if (!ctx) {
		throw new Error(
			"useInterviewActions must be used within InterviewProvider",
		);
	}
	return ctx;
}
