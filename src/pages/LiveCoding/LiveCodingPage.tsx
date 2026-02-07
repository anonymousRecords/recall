import { SessionActiveView } from "./components/SessionActiveView";
import { SessionReportView } from "./components/SessionReportView";
import { SessionSetupView } from "./components/SessionSetupView";
import { useLiveSession } from "./hooks/useLiveSession";

export function LiveCodingPage() {
	const {
		status,
		session,
		messages,
		timeRemaining,
		problemInfo,
		isAILoading,
		speech,
		startSession,
		endSession,
		resetSession,
		sendMessage,
	} = useLiveSession();

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

	if (status === "completed" && session?.report) {
		return <SessionReportView session={session} onNewSession={resetSession} />;
	}

	return null;
}
