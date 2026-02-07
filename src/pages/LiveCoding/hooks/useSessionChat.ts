import { type RefObject, useCallback } from "react";
import type { AIRequest, ChatMessage, SessionConfig } from "../../../types";

interface UseSessionChatDeps {
	status: string;
	sessionConfigRef: RefObject<SessionConfig | null>;
	currentCode: string;
	sendToAI: (request: AIRequest) => Promise<string>;
	addMessage: (message: ChatMessage) => void;
	messagesRef: RefObject<ChatMessage[]>;
	speakRef: RefObject<(text: string) => void>;
	clearTranscriptRef: RefObject<() => void>;
}

export function useSessionChat({
	status,
	sessionConfigRef,
	currentCode,
	sendToAI,
	addMessage,
	messagesRef,
	speakRef,
	clearTranscriptRef,
}: UseSessionChatDeps) {
	const handleFinalTranscript = useCallback(
		async (text: string) => {
			const config = sessionConfigRef.current;
			if (status !== "active" || !config) return;

			clearTranscriptRef.current();

			const userMessage: ChatMessage = {
				id: crypto.randomUUID(),
				role: "user",
				content: text,
				timestamp: Date.now(),
				codeContext: currentCode,
			};
			addMessage(userMessage);

			try {
				const response = await sendToAI({
					type: "user_message",
					content: text,
					codeContext: currentCode,
					messages: [...messagesRef.current, userMessage],
					problemInfo: config.problemInfo,
					style: config.style,
				});

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content: response,
					timestamp: Date.now(),
				};
				addMessage(aiMessage);

				speakRef.current(response);
			} catch (error) {
				console.error("[Recall] AI 응답 실패:", error);
			}
		},
		[
			status,
			currentCode,
			sendToAI,
			addMessage,
			messagesRef,
			speakRef,
			clearTranscriptRef,
			sessionConfigRef,
		],
	);

	const sendMessage = useCallback(
		async (content: string) => {
			await handleFinalTranscript(content);
		},
		[handleFinalTranscript],
	);

	return { handleFinalTranscript, sendMessage };
}
