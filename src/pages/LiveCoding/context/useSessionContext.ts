import { useContext } from "react";
import {
	type SessionActionsContext,
	SessionActionsCtx,
	type SessionStateContext,
	SessionStateCtx,
} from "./SessionProvider";

export function useSessionState(): SessionStateContext {
	const ctx = useContext(SessionStateCtx);
	if (!ctx) {
		throw new Error("useSessionState must be used within SessionProvider");
	}
	return ctx;
}

export function useSessionActions(): SessionActionsContext {
	const ctx = useContext(SessionActionsCtx);
	if (!ctx) {
		throw new Error("useSessionActions must be used within SessionProvider");
	}
	return ctx;
}
