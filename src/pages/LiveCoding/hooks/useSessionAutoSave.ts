import { useEffect } from "react";
import { updateSession } from "../../../lib/db/sessions";
import type { ChatMessage, LiveSession, SessionStatus } from "../../../types";

export function useSessionAutoSave(
	session: LiveSession | null,
	status: SessionStatus,
	messages: ChatMessage[],
	currentCode: string,
	language: string,
) {
	useEffect(() => {
		if (session && status === "active") {
			updateSession(session.id, {
				messages,
				codeSnapshots: [
					...(session.codeSnapshots || []),
					{
						code: currentCode,
						language,
						timestamp: Date.now(),
					},
				],
			});
		}
	}, [messages, session, status, currentCode, language]);
}
