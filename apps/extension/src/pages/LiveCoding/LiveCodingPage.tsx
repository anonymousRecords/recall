import { Suspense } from "react";
import {
	InterviewActiveView,
	InterviewReportView,
	InterviewSetupView,
} from "./components";
import { useInterviewActions, useInterviewState } from "./context";
import { InterviewProvider } from "./context/InterviewProvider";

export function LiveCodingPage() {
	return (
		<Suspense fallback={null}>
			<InterviewProvider>
				<LiveCodingContent />
			</InterviewProvider>
		</Suspense>
	);
}

function LiveCodingContent() {
	const { phase, interview, messages, timeRemaining, problemInfo, speech } =
		useInterviewState();
	const { startInterview, endInterview, resetInterview, sendAIMessage } =
		useInterviewActions();

	if (phase === "idle") {
		return (
			<InterviewSetupView problemInfo={problemInfo} onStart={startInterview} />
		);
	}

	if (phase === "listening" || phase === "processing" || phase === "speaking") {
		return (
			<InterviewActiveView
				messages={messages}
				timeRemaining={timeRemaining}
				isAILoading={phase === "processing"}
				speech={speech}
				onSendMessage={sendAIMessage}
				onEnd={endInterview}
			/>
		);
	}

	if (phase === "completed" && interview) {
		return (
			<InterviewReportView
				interview={interview}
				onNewInterview={resetInterview}
			/>
		);
	}
}
