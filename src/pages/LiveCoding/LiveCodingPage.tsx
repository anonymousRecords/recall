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
		isListening,
		isSpeaking,
		finalTranscript,
		interimTranscript,
		volume,
		hasPermission,
		requestPermission,
		startSession,
		endSession,
		resetSession,
		sendMessage,
		toggleListening,
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
				isListening={isListening}
				isSpeaking={isSpeaking}
				finalTranscript={finalTranscript}
				interimTranscript={interimTranscript}
				volume={volume}
				hasPermission={hasPermission}
				onSendMessage={sendMessage}
				onEnd={endSession}
				onToggleListening={toggleListening}
				onRequestPermission={requestPermission}
			/>
		);
	}

	if (status === "completed" && session?.report) {
		return <SessionReport session={session} onNewSession={resetSession} />;
	}

	return null;
}
