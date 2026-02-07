import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../../components/ui";
import { cn } from "../../../lib/utils";
import type { LiveSession, SessionConfig, SessionReport } from "../../../types";

interface SessionReportProps {
	session: LiveSession;
	onNewSession: () => void;
}

export function SessionReportView({
	session,
	onNewSession,
}: SessionReportProps) {
	const { report, config } = session;

	if (report === undefined) {
		return <EmptyReportView />;
	}

	return (
		<div className="flex flex-col h-full">
			<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
				<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
					면접 리포트
				</h1>
			</header>

			<div className="flex-1 overflow-auto p-4 space-y-4">
				<BasicInfoReportCard config={config} report={report} />
				<ScoreReportCard report={report} />
				{report.feedback.length > 0 && <FeddbackCard report={report} />}
				{report.strengths.length > 0 && <StrengthCard report={report} />}
				{report.improvements.length > 0 && <ImprovementCard report={report} />}

				<div className="flex gap-3">
					<Button variant="secondary" className="flex-1" onClick={onNewSession}>
						새 세션 시작
					</Button>
				</div>
			</div>
		</div>
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

function EmptyReportView() {
	return (
		<div className="flex h-full items-center justify-center p-4">
			<p className="text-gray-500 dark:text-gray-400">
				리포트를 생성할 수 없습니다.
			</p>
		</div>
	);
}

interface BasicInfoReportCardProps {
	config: SessionConfig;
	report: SessionReport;
}

function BasicInfoReportCard({ config, report }: BasicInfoReportCardProps) {
	return (
		<Card>
			<CardContent className="py-4">
				<h2 className="font-medium text-gray-900 dark:text-white mb-2">
					{config.problemInfo.title}
				</h2>
				<div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
					<span>소요: {formatDuration(report.duration)}</span>
					<span>대화: {report.messageCount}회</span>
				</div>
			</CardContent>
		</Card>
	);
}

interface ScoreReportCardProps {
	report: SessionReport;
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
	report: SessionReport;
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
	report: SessionReport;
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
							<span className="text-green-500">+</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}

interface ImprovementCardProps {
	report: SessionReport;
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
							<span className="text-amber-500">→</span>
							<span>{item}</span>
						</li>
					))}
				</ul>
			</CardContent>
		</Card>
	);
}
