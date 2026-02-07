import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../../../types";

export function useSessionMessages() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const messagesRef = useRef<ChatMessage[]>([]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	const addMessage = useCallback((message: ChatMessage) => {
		setMessages((prev) => [...prev, message]);
	}, []);

	const reset = useCallback(() => {
		setMessages([]);
	}, []);

	return { messages, messagesRef, setMessages, addMessage, reset };
}
