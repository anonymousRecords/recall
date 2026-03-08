import { useContext } from "react";
import {
	InterviewActionsContext,
	InterviewStateContext,
} from "./InterviewProvider";

export function useInterviewState(): InterviewStateContext {
	const context = useContext(InterviewStateContext);

	if (!context) {
		throw new Error("useInterviewState must be used within InterviewProvider");
	}

	return context;
}

export function useInterviewActions(): InterviewActionsContext {
	const context = useContext(InterviewActionsContext);

	if (!context) {
		throw new Error(
			"useInterviewActions must be used within InterviewProvider",
		);
	}

	return context;
}
