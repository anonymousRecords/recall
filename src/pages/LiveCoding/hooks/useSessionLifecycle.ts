import { type RefObject, useCallback } from "react";
import { completeSession, createSession } from "../../../lib/db/sessions";
import type {
	AIRequest,
	ChatMessage,
	InterviewerStyle,
	LiveSession,
	ProblemInfo,
	SessionConfig,
	SessionReport,
	SessionStatus,
} from "../../../types";

interface SessionLifecycleDeps {
	session: LiveSession | null;
	setSession: (session: LiveSession | null) => void;
	setStatus: (status: SessionStatus) => void;
	sessionConfigRef: RefObject<SessionConfig | null>;
	sessionMessages: {
		messages: ChatMessage[];
		setMessages: (messages: ChatMessage[]) => void;
		reset: () => void;
	};
	codeMonitor: {
		problemInfo: ProblemInfo | null;
		currentCode: string;
		language: string;
		startMonitoring: () => Promise<boolean>;
		stopMonitoring: () => Promise<boolean>;
	};
	interviewer: {
		sendToAI: (request: AIRequest) => Promise<string>;
		generateReport: (
			messages: ChatMessage[],
			finalCode: string,
			duration: number,
			problemInfo: ProblemInfo,
		) => Promise<SessionReport>;
	};
	speech: {
		speak: (text: string) => void;
		stopListening: () => void;
		stopSpeaking: () => void;
	};
	timer: {
		start: (seconds: number) => void;
		reset: () => void;
	};
	codeChange: {
		setPreviousCode: (code: string) => void;
		cleanup: () => void;
		reset: () => void;
	};
}

export function useSessionLifecycle({
	session,
	setSession,
	setStatus,
	sessionConfigRef,
	sessionMessages,
	codeMonitor,
	interviewer,
	speech,
	timer,
	codeChange,
}: SessionLifecycleDeps) {
	const startSession = useCallback(
		async (config: {
			timeLimit: number | null;
			interviewerStyle: InterviewerStyle;
		}) => {
			if (!codeMonitor.problemInfo) {
				throw new Error("문제 정보를 찾을 수 없습니다.");
			}

			const sessionConfig: SessionConfig = {
				problemInfo: codeMonitor.problemInfo,
				timeLimit: config.timeLimit,
				interviewerStyle: config.interviewerStyle,
				language: codeMonitor.language,
			};

			sessionConfigRef.current = sessionConfig;
			codeChange.setPreviousCode(codeMonitor.currentCode);

			const newSession = await createSession({
				config: sessionConfig,
				status: "active",
				messages: [],
				codeSnapshots: [],
				startedAt: new Date().toISOString(),
			});

			setSession(newSession);
			setStatus("active");
			sessionMessages.reset();

			if (config.timeLimit) {
				timer.start(config.timeLimit);
			}

			await codeMonitor.startMonitoring();

			try {
				const greeting = await interviewer.sendToAI({
					type: "greeting",
					problemInfo: codeMonitor.problemInfo,
					interviewerStyle: config.interviewerStyle,
				});

				const aiMessage: ChatMessage = {
					id: crypto.randomUUID(),
					role: "interviewer",
					content: greeting,
					timestamp: Date.now(),
				};

				sessionMessages.setMessages([aiMessage]);
				speech.speak(greeting);
			} catch (error) {
				console.error("[Recall] AI 인사 실패:", error);
			}
		},
		[
			codeMonitor,
			interviewer,
			speech,
			sessionMessages,
			timer,
			codeChange,
			sessionConfigRef,
			setSession,
			setStatus,
		],
	);

	const endSession = useCallback(async () => {
		if (!session || !sessionConfigRef.current) return;

		speech.stopListening();
		speech.stopSpeaking();
		await codeMonitor.stopMonitoring();
		codeChange.cleanup();

		setStatus("completed");

		const duration = Math.floor(
			(Date.now() - new Date(session.startedAt).getTime()) / 1000,
		);

		try {
			const report = await interviewer.generateReport(
				sessionMessages.messages,
				codeMonitor.currentCode,
				duration,
				sessionConfigRef.current.problemInfo,
			);

			const completedSession = await completeSession(session.id, report);
			if (completedSession) {
				setSession(completedSession);
			}
		} catch (error) {
			console.error("[Recall] 리포트 생성 실패:", error);
		}
	}, [
		session,
		sessionMessages,
		codeMonitor,
		interviewer,
		speech,
		codeChange,
		sessionConfigRef,
		setSession,
		setStatus,
	]);

	const resetSession = useCallback(() => {
		setStatus("idle");
		setSession(null);
		sessionMessages.reset();
		timer.reset();
		codeChange.reset();
		sessionConfigRef.current = null;
	}, [
		sessionMessages,
		timer,
		codeChange,
		sessionConfigRef,
		setSession,
		setStatus,
	]);

	return { startSession, endSession, resetSession };
}
