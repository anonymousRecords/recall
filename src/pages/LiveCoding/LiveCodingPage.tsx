import { SessionActive } from "./components/SessionActive";
import { SessionReport } from "./components/SessionReport";
import { SessionSetup } from "./components/SessionSetup";
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
		return <SessionSetup problemInfo={problemInfo} onStart={startSession} />;
	}

	if (status === "active") {
		return (
			<SessionActive
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
		return <SessionReport session={session} onNewSession={resetSession} />;
	}

	return null;
}
