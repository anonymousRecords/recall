import { SessionActiveView } from "./components/SessionActiveView";
import { SessionReportView } from "./components/SessionReportView";
import { SessionSetupView } from "./components/SessionSetupView";
import { SessionProvider, useSessionActions, useSessionState } from "./context";

export function LiveCodingPage() {
	return (
		<SessionProvider>
			<LiveCodingContent />
		</SessionProvider>
	);
}

function LiveCodingContent() {
	const {
		status,
		session,
		messages,
		timeRemaining,
		problemInfo,
		isAILoading,
		speech,
	} = useSessionState();
	const { startSession, endSession, resetSession, sendMessage } =
		useSessionActions();

	if (status === "idle") {
		return (
			<SessionSetupView problemInfo={problemInfo} onStart={startSession} />
		);
	}

	if (status === "active") {
		return (
			<SessionActiveView
				messages={messages}
				timeRemaining={timeRemaining}
				isAILoading={isAILoading}
				speech={speech}
				onSendMessage={sendMessage}
				onEnd={endSession}
			/>
		);
	}

	if (status === "completed" && session) {
		return <SessionReportView session={session} onNewSession={resetSession} />;
	}

	return null;
}
