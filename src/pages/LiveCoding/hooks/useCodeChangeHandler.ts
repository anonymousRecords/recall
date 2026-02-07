import { useCallback, useEffect, useRef } from "react";
import type { ChatMessage, SessionConfig } from "../../../types";

const DEBOUNCE_MS = 3000;

interface UseCodeChangeHandlerParams {
	status: string;
	currentCode: string;
	sessionConfigRef: React.RefObject<SessionConfig | null>;
	messagesRef: React.RefObject<ChatMessage[]>;
	isSpeaking: boolean;
	isAILoading: boolean;
	sendToAI: (request: {
		type: "code_changed";
		previousCode: string;
		currentCode: string;
		pauseDuration: number;
		messages: ChatMessage[];
		problemInfo: SessionConfig["problemInfo"];
		interviewerStyle: SessionConfig["interviewerStyle"];
	}) => Promise<string>;
	onAIResponse: (message: ChatMessage) => void;
	speak: (text: string) => void;
}

export function useCodeChangeHandler({
	status,
	currentCode,
	sessionConfigRef,
	messagesRef,
	isSpeaking,
	isAILoading,
	sendToAI,
	onAIResponse,
	speak,
}: UseCodeChangeHandlerParams) {
	const previousCodeRef = useRef("");
	const lastCodeChangeTimeRef = useRef<number>(Date.now());
	const codeChangeTimeoutRef = useRef<number | null>(null);

	const handleCodeChange = useCallback(
		async (code: string) => {
			const config = sessionConfigRef.current;
			if (status !== "active" || !config) return;

			const now = Date.now();
			const pauseDuration = Math.floor(
				(now - lastCodeChangeTimeRef.current) / 1000,
			);
			lastCodeChangeTimeRef.current = now;

			if (codeChangeTimeoutRef.current) {
				clearTimeout(codeChangeTimeoutRef.current);
			}

			if (isSpeaking || isAILoading) return;

			codeChangeTimeoutRef.current = window.setTimeout(async () => {
				try {
					const response = await sendToAI({
						type: "code_changed",
						previousCode: previousCodeRef.current,
						currentCode: code,
						pauseDuration,
						messages: messagesRef.current,
						problemInfo: config.problemInfo,
						interviewerStyle: config.interviewerStyle,
					});

					previousCodeRef.current = code;

					if (response) {
						const aiMessage: ChatMessage = {
							id: crypto.randomUUID(),
							role: "interviewer",
							content: response,
							timestamp: Date.now(),
						};
						onAIResponse(aiMessage);
						speak(response);
					}
				} catch (error) {
					console.error("[Recall] 코드 분석 실패:", error);
				}
			}, DEBOUNCE_MS);
		},
		[
			status,
			sendToAI,
			speak,
			isSpeaking,
			isAILoading,
			sessionConfigRef,
			messagesRef,
			onAIResponse,
		],
	);

	useEffect(() => {
		if (status === "active" && currentCode !== previousCodeRef.current) {
			handleCodeChange(currentCode);
		}
	}, [status, currentCode, handleCodeChange]);

	const setPreviousCode = useCallback((code: string) => {
		previousCodeRef.current = code;
	}, []);

	const reset = useCallback(() => {
		previousCodeRef.current = "";
		lastCodeChangeTimeRef.current = Date.now();
		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
			codeChangeTimeoutRef.current = null;
		}
	}, []);

	const cleanup = useCallback(() => {
		if (codeChangeTimeoutRef.current) {
			clearTimeout(codeChangeTimeoutRef.current);
		}
	}, []);

	return { setPreviousCode, reset, cleanup };
}
