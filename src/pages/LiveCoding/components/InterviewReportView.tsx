import { PageHeader, PageLayout } from "../../../components/layout";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui";
import { cn } from "../../../lib/utils";
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
		<PageLayout header={<PageHeader title="면접 리포트" />}>
			<div className="flex-1 overflow-auto p-4 space-y-4">
				<BasicInfoReportCard report={report} />
				<ScoreReportCard report={report} />
				{report.feedback.length > 0 && <FeddbackCard report={report} />}
				{report.strengths.length > 0 && <StrengthCard report={report} />}
				{report.improvements.length > 0 && <ImprovementCard report={report} />}
				{report.supportingQuotes && report.supportingQuotes.length > 0 && (
					<SupportingQuotesCard quotes={report.supportingQuotes} />
				)}
				{report.sampleAnswer && (
					<SampleAnswerCard sampleAnswer={report.sampleAnswer} />
				)}

				<div className="flex flex-col gap-3">
					<Button
						variant="secondary"
						className="w-full"
						onClick={onNewInterview}
					>
						새로운 면접 시작
					</Button>
					<Button
						variant="ghost"
						className="w-full"
						onClick={() => {
							const url = browser.runtime.getURL("/analytics.html");
							browser.tabs.create({ url });
						}}
					>
						전체 면접 분석 보기
					</Button>
				</div>
			</div>
		</PageLayout>
	);
}

interface ScoreBarProps {
	label: string;
	score: number;
}

function ScoreBar({ label, score }: ScoreBarProps) {
	const getBarColor = (score: number): string => {
		if (score >= 80) return "bg-green-500";
		if (score >= 60) return "bg-amber-500";
		return "bg-red-500";
	};

	const getScoreColor = (score: number): string => {
		if (score >= 80) return "text-green-600 dark:text-green-400";
		if (score >= 60) return "text-amber-600 dark:text-amber-400";
		return "text-red-600 dark:text-red-400";
	};

	return (
		<div>
			<div className="flex justify-between mb-1">
				<span className="text-sm text-gray-700 dark:text-gray-300">
					{label}
				</span>
				<span className={cn("text-sm font-medium", getScoreColor(score))}>
					{score}점
				</span>
			</div>
			<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
				<div
					className={cn("h-2 rounded-full transition-all", getBarColor(score))}
					style={{ width: `${score}%` }}
				/>
			</div>
		</div>
	);
}

const formatDuration = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}분 ${secs}초`;
};

function ReportSkeletonView() {
	return (
		<div
			className={
				"w-full h-full animate-pulse rounded bg-gray-200 dark:bg-gray-700"
			}
		/>
	);
}

interface BasicInfoReportCardProps {
	report: InterviewReport;
}

function BasicInfoReportCard({ report }: BasicInfoReportCardProps) {
	const tu = report.tokenUsage;
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">로그 데이터</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
					<span>소요 시간: {formatDuration(report.duration)}</span>
					<span>대화 횟수: {report.messageCount}회</span>
					{tu && (
						<>
							<span>
								토큰 사용:{" "}
								{(
									tu.totalPromptTokens + tu.totalCompletionTokens
								).toLocaleString()}{" "}
								({tu.callCount}회 호출)
							</span>
							<span>예상 비용: ${tu.estimatedCost.toFixed(4)}</span>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface ScoreReportCardProps {
	report: InterviewReport;
}

function ScoreReportCard({ report }: ScoreReportCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">종합 평가</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<ScoreBar label="문제 이해" score={report.scores.understanding} />
				<ScoreBar label="소통 능력" score={report.scores.communication} />
				<ScoreBar label="코드 품질" score={report.scores.codeQuality} />
				<ScoreBar label="시간 관리" score={report.scores.timeManagement} />
			</CardContent>
		</Card>
	);
}

interface FeddbackCardProps {
	report: InterviewReport;
}

function FeddbackCard({ report }: FeddbackCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">피드백</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="space-y-2">
					{report.feedback.map((item) => (
						<li
							key={item}
							className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
						>
							<span className="text-gray-400">•</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

interface StrengthCardProps {
	report: InterviewReport;
}

function StrengthCard({ report }: StrengthCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base text-green-600 dark:text-green-400">
					잘한 점
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="space-y-2">
					{report.strengths.map((item) => (
						<li
							key={item}
							className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
						>
							<span className="text-gray-400">•</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

interface ImprovementCardProps {
	report: InterviewReport;
}
function ImprovementCard({ report }: ImprovementCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base text-amber-600 dark:text-amber-400">
					개선점
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="space-y-2">
					{report.improvements.map((item) => (
						<li
							key={item}
							className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2"
						>
							<span className="text-gray-400">•</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

interface SupportingQuotesCardProps {
	quotes: { quote: string; analysis: string }[];
}

function SupportingQuotesCard({ quotes }: SupportingQuotesCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base text-blue-600 dark:text-blue-400">
					근거 인용
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ul className="space-y-3">
					{quotes.map((item) => (
						<li key={item.quote} className="text-sm">
							<p className="text-gray-500 dark:text-gray-400 italic border-l-2 border-blue-300 dark:border-blue-600 pl-3 mb-1">
								"{item.quote}"
							</p>
							<p className="text-gray-700 dark:text-gray-300 pl-3">
								{item.analysis}
							</p>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

interface SampleAnswerCardProps {
	sampleAnswer: string;
}

function SampleAnswerCard({ sampleAnswer }: SampleAnswerCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base text-purple-600 dark:text-purple-400">
					모범 답안
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-gray-700 dark:text-gray-300">
					{sampleAnswer}
				</p>
			</CardContent>
		</Card>
	);
}
