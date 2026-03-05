import { Suspense } from "react";
import { InterviewActiveView } from "./components/InterviewActiveView";
import { InterviewReportView } from "./components/InterviewReportView";
import { InterviewSetupView } from "./components/InterviewSetupView";
import { InterviewProvider, useInterviewActions, useInterviewState } from "./context";

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
	const {
		status,
		interview,
		messages,
		timeRemaining,
		problemInfo,
		isAILoading,
		speech,
	} = useInterviewState();
	const { startInterview, endInterview, resetInterview, sendMessage } =
		useInterviewActions();

	if (status === "idle") {
		return (
			<InterviewSetupView problemInfo={problemInfo} onStart={startInterview} />
		);
	}

	if (status === "active") {
		return (
			<InterviewActiveView
				messages={messages}
				timeRemaining={timeRemaining}
				isAILoading={isAILoading}
				speech={speech}
				onSendMessage={sendMessage}
				onEnd={endInterview}
			/>
		);
	}

	if (status === "completed" && interview) {
		return <InterviewReportView interview={interview} onNewInterview={resetInterview} />;
	}

	return null;
}
