import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Select,
} from "../../../components/ui";
import { liveCodingSettingsQueryOptions } from "../../../queries/live-coding-settings";
import type { InterviewerStyle, ProblemInfo } from "../../../types";

const TIME_OPTIONS = [
	{ value: "30", label: "30분" },
	{ value: "45", label: "45분" },
	{ value: "60", label: "60분" },
	{ value: "null", label: "무제한" },
];

const INTERVIEWER_STYLE_OPTIONS = [
	{ value: "friendly", label: "친절" },
	{ value: "normal", label: "보통" },
	{ value: "pressure", label: "압박" },
];

interface SessionSetupViewProps {
	problemInfo: ProblemInfo | null;
	onStart: (config: {
		timeLimit: number | null;
		interviewerStyle: InterviewerStyle;
	}) => Promise<void>;
}

export function SessionSetupView({
	problemInfo,
	onStart,
}: SessionSetupViewProps) {
	const { data: settings } = useSuspenseQuery(liveCodingSettingsQueryOptions());
	const hasApiKey = settings.apiKey.length > 0;

	const [timeLimit, setTimeLimit] = useState(
		settings.defaultTimeLimit.toString(),
	);
	const [interviewerStyle, setInterviewerStyle] = useState<InterviewerStyle>(
		settings.defaultStyle,
	);

	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	return (
		<div
			className="flex flex-col h-full bg-white
  dark:bg-neutral-950"
		>
			<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
				<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
					라이브 코딩
				</h1>
			</header>

			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					<InterviewGuideCard />

					{problemInfo ? (
						<ProblemInfoCard problemInfo={problemInfo} />
					) : (
						<StepInstructionCard />
					)}

					{!hasApiKey && <ApiKeyAlertCard />}

					{problemInfo && hasApiKey && (
						<InterviewSessionSettings
							timeLimit={timeLimit}
							setTimeLimit={setTimeLimit}
							interviewerStyle={interviewerStyle}
							setInterviewerStyle={setInterviewerStyle}
						/>
					)}

					{error && (
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					)}

					<Button
						className="w-full"
						disabled={!problemInfo || !hasApiKey || isStarting}
						onClick={async () => {
							setIsStarting(true);
							setError(null);

							try {
								await onStart({
									timeLimit: parseInt(timeLimit, 10),
									interviewerStyle: interviewerStyle,
								});
							} catch (err) {
								setError(
									err instanceof Error ? err.message : "세션 시작에 실패했어요",
								);
							} finally {
								setIsStarting(false);
							}
						}}
					>
						{isStarting ? "시작 중" : "세션 시작"}
					</Button>
				</div>
			</div>
		</div>
	);
}

function InterviewGuideCard() {
	return (
		<Card>
			<CardContent className="py-4">
				<p className="text-sm text-gray-600 dark:text-gray-400">
					프로그래머스에서 실제 면접처럼 연습하세요
					<br />
					AI 면접관이 질문하고 피드백을 제공해줘요
				</p>
			</CardContent>
		</Card>
	);
}

interface ProblemInfoProps {
	problemInfo: ProblemInfo;
}

function ProblemInfoCard({ problemInfo }: ProblemInfoProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">감지된 문제</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="font-medium text-gray-900 dark:text-white">
					{problemInfo.title}
				</p>
				<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
					난이도: Level {problemInfo.level}
				</p>
			</CardContent>
		</Card>
	);
}

function StepInstructionCard() {
	return (
		<Card>
			<CardContent className="py-4 flex flex-col gap-4">
				<p className="text-sm text-gray-900 dark:text-white">
					프로그래머스 문제 페이지에서 확장을 열어주세요
				</p>
				<Button
					variant="secondary"
					size="sm"
					onClick={() => window.open("https://programmers.co.kr", "_blank")}
				>
					프로그래머스 바로가기
				</Button>
			</CardContent>
		</Card>
	);
}

function ApiKeyAlertCard() {
	const navigate = useNavigate();
	return (
		<Card>
			<CardContent className="py-4 flex flex-col gap-4">
				<p className="text-sm text-red-600 dark:text-red-400 mb-2">
					API 키가 설정되지 않았어요 <br />
					설정에서 API 키를 입력해주세요
				</p>
				<Button
					variant="primary"
					size="sm"
					onClick={() => navigate("/settings")}
				>
					설정으로 이동
				</Button>
			</CardContent>
		</Card>
	);
}

interface InterviewSessionSettingsProps {
	timeLimit: string;
	setTimeLimit: (value: string) => void;
	interviewerStyle: InterviewerStyle;
	setInterviewerStyle: (value: InterviewerStyle) => void;
}

function InterviewSessionSettings({
	timeLimit,
	setTimeLimit,
	interviewerStyle: style,
	setInterviewerStyle,
}: InterviewSessionSettingsProps) {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">제한 시간</CardTitle>
				</CardHeader>
				<CardContent>
					<Select
						options={TIME_OPTIONS}
						value={timeLimit}
						onChange={(e) => setTimeLimit(e.target.value)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">면접관 스타일</CardTitle>
				</CardHeader>
				<CardContent>
					<Select
						options={INTERVIEWER_STYLE_OPTIONS}
						value={style}
						onChange={(e) =>
							setInterviewerStyle(e.target.value as InterviewerStyle)
						}
					/>
					<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
						{style === "friendly" && "친절하게 힌트를 많이 제공해요"}
						{style === "normal" && "적절한 질문과 피드백을 제공해요"}
						{style === "pressure" && "날카로운 질문과 시간 압박을 줘요"}
					</p>
				</CardContent>
			</Card>
		</>
	);
}
