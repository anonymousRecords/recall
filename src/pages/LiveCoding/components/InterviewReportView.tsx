import { PageHeader, PageLayout } from "../../../components/layout";
import type { InterviewReport, LiveInterview } from "../../../types";

interface InterviewReportProps {
	interview: LiveInterview;
	onNewInterview: () => void;
}

export function InterviewReportView({
	interview,
	onNewInterview,
}: InterviewReportProps) {
	const { report } = interview;

	if (report === undefined) {
		return <ReportSkeletonView />;
	}

	return (
		<PageLayout header={<PageHeader title="interview report" />}>
			<div className="flex-1 overflow-auto p-4 space-y-3">
				<BasicInfoReportCard report={report} />
				<ScoreReportCard report={report} />
				{report.feedback.length > 0 && <FeedbackCard report={report} />}
				{report.strengths.length > 0 && <StrengthCard report={report} />}
				{report.improvements.length > 0 && <ImprovementCard report={report} />}
				{report.supportingQuotes && report.supportingQuotes.length > 0 && (
					<SupportingQuotesCard quotes={report.supportingQuotes} />
				)}
				{report.sampleAnswer && (
					<SampleAnswerCard sampleAnswer={report.sampleAnswer} />
				)}

				<div className="flex flex-col gap-2 pt-1">
					<button
						type="button"
						className="w-full border border-[#3e3e42] py-2 font-mono text-[12px] text-[#858585] transition-colors hover:border-[#525252] hover:text-[#d4d4d4]"
						onClick={onNewInterview}
					>
						[ + new interview ]
					</button>
					<button
						type="button"
						className="w-full py-2 font-mono text-[12px] text-[#525252] transition-colors hover:text-[#858585]"
						onClick={() => {
							const url = browser.runtime.getURL("/analytics.html");
							browser.tabs.create({ url });
						}}
					>
						[ → stats ]
					</button>
				</div>
			</div>
		</PageLayout>
	);
}

function ReportSkeletonView() {
	return (
		<div className="flex h-full items-center justify-center">
			<p className="font-mono text-[12px] text-[#858585]">
				<span className="text-[#569cd6]">&gt;</span> generating report...
				<span className="cursor-blink">█</span>
			</p>
		</div>
	);
}

const formatDuration = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}m ${secs}s`;
};

interface BasicInfoReportCardProps {
	report: InterviewReport;
}

function BasicInfoReportCard({ report }: BasicInfoReportCardProps) {
	const tu = report.tokenUsage;
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] text-[#858585] mb-2">// session log</p>
			<div className="space-y-1 font-mono text-[12px] text-[#858585]">
				<p><span className="text-[#569cd6]">duration</span>  {formatDuration(report.duration)}</p>
				<p><span className="text-[#569cd6]">messages</span>  {report.messageCount}</p>
				{tu && (
					<>
						<p><span className="text-[#569cd6]">tokens</span>    {(tu.totalPromptTokens + tu.totalCompletionTokens).toLocaleString()} ({tu.callCount} calls)</p>
						<p><span className="text-[#569cd6]">cost</span>      ${tu.estimatedCost.toFixed(4)}</p>
					</>
				)}
			</div>
		</div>
	);
}

interface ScoreBarProps {
	label: string;
	score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
	const color =
		score >= 80 ? "#4ec9b0" : score >= 60 ? "#dcdcaa" : "#f44747";

	const filled = Math.round(score / 5);
	const empty = 20 - filled;
	const bar = "█".repeat(filled) + "░".repeat(empty);

	return (
		<div className="flex items-center gap-3 font-mono text-[12px]">
			<span className="w-16 shrink-0 text-[#858585]">{label}</span>
			<span style={{ color }}>{bar}</span>
			<span className="shrink-0 w-8 text-right tabular-nums" style={{ color }}>
				{score}
			</span>
		</div>
	);
}

interface ScoreReportCardProps {
	report: InterviewReport;
}

function ScoreReportCard({ report }: ScoreReportCardProps) {
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] text-[#858585] mb-3">// scores</p>
			<div className="space-y-2">
				<ScoreBar label="이해" score={report.scores.understanding} />
				<ScoreBar label="소통" score={report.scores.communication} />
				<ScoreBar label="코드" score={report.scores.codeQuality} />
				<ScoreBar label="시간" score={report.scores.timeManagement} />
			</div>
		</div>
	);
}

interface FeedbackCardProps {
	report: InterviewReport;
}

function FeedbackCard({ report }: FeedbackCardProps) {
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] text-[#858585] mb-2">// feedback</p>
			<ul className="space-y-1.5">
				{report.feedback.map((item) => (
					<li key={item} className="flex items-start gap-2">
						<span className="font-mono text-[12px] text-[#569cd6] shrink-0 mt-0.5">&gt;</span>
						<span className="text-[13px] text-[#d4d4d4]">{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

interface StrengthCardProps {
	report: InterviewReport;
}

function StrengthCard({ report }: StrengthCardProps) {
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] mb-2 text-[#4ec9b0]">// strengths</p>
			<ul className="space-y-1.5">
				{report.strengths.map((item) => (
					<li key={item} className="flex items-start gap-2">
						<span className="font-mono text-[12px] text-[#4ec9b0] shrink-0 mt-0.5">&gt;</span>
						<span className="text-[13px] text-[#d4d4d4]">{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

interface ImprovementCardProps {
	report: InterviewReport;
}

function ImprovementCard({ report }: ImprovementCardProps) {
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] mb-2 text-[#dcdcaa]">// improvements</p>
			<ul className="space-y-1.5">
				{report.improvements.map((item) => (
					<li key={item} className="flex items-start gap-2">
						<span className="font-mono text-[12px] text-[#dcdcaa] shrink-0 mt-0.5">&gt;</span>
						<span className="text-[13px] text-[#d4d4d4]">{item}</span>
					</li>
				))}
			</ul>
		</div>
	);
}

interface SupportingQuotesCardProps {
	quotes: { quote: string; analysis: string }[];
}

function SupportingQuotesCard({ quotes }: SupportingQuotesCardProps) {
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] mb-3 text-[#569cd6]">// evidence</p>
			<ul className="space-y-3">
				{quotes.map((item) => (
					<li key={item.quote} className="text-[13px]">
						<p className="font-mono text-[12px] text-[#858585] italic border-l-2 border-[#569cd6] pl-3 mb-1">
							"{item.quote}"
						</p>
						<p className="text-[#d4d4d4] pl-3">{item.analysis}</p>
					</li>
				))}
			</ul>
		</div>
	);
}

interface SampleAnswerCardProps {
	sampleAnswer: string;
}

function SampleAnswerCard({ sampleAnswer }: SampleAnswerCardProps) {
	return (
		<div className="border border-[#3e3e42] bg-[#252526] p-3">
			<p className="font-mono text-[11px] mb-2 text-[#ce9178]">// sample answer</p>
			<p className="text-[13px] text-[#d4d4d4] leading-relaxed">{sampleAnswer}</p>
		</div>
	);
}
