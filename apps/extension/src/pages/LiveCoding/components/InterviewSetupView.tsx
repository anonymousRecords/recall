import { useSuspenseQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";
import { PageHeader, PageLayout } from "../../../components/layout";
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
import { useMicPermission } from "../hooks/useMicPermission";

interface InterviewSetupViewProps {
	problemInfo: ProblemInfo | null;
	onStart: (config: {
		timeLimit: number;
		interviewerStyle: InterviewerStyle;
	}) => Promise<void>;
}

export function InterviewSetupView({
	problemInfo,
	onStart,
}: InterviewSetupViewProps) {
	return (
		<PageLayout header={<PageHeader title="live coding" />}>
			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					<InterviewChecklist problemInfo={problemInfo} />

					{problemInfo && (
						<InterviewConfig problemInfo={problemInfo} onStart={onStart} />
					)}
				</div>
			</div>
		</PageLayout>
	);
}

interface InterviewChecklistProps {
	problemInfo: ProblemInfo | null;
}

function InterviewChecklist({ problemInfo }: InterviewChecklistProps) {
	const { micPermission, openPermissionPage } = useMicPermission();
	const { data: settings } = useSuspenseQuery(liveCodingSettingsQueryOptions());
	const hasApiKey = settings.apiKey.trim().length > 0;

	return (
		<Card>
			<CardHeader>
				<CardTitle>면접 시작 전 확인</CardTitle>
			</CardHeader>

			<CardContent className="flex flex-col gap-4">
				<ChecklistItem
					ok={hasApiKey}
					okLabel="API 키 등록됨"
					errorLabel="API 키 필요"
					description="AI 면접관을 사용하려면 API 키를 등록해주세요"
					action={
						<Link to="/settings">
							<Button size="sm" variant="secondary" className="w-full">
								설정에서 API 키 등록하기
							</Button>
						</Link>
					}
				/>
				<ChecklistItem
					ok={micPermission === "granted"}
					okLabel="마이크 권한 허용됨"
					errorLabel="마이크 권한 필요"
					description={micPermission !== "loading" ? micPermissionMessages[micPermission] : undefined}
					action={micPermission !== "loading" ? <Button size="sm" onClick={openPermissionPage}>마이크 권한 허용하기</Button> : undefined}
				/>
				<ChecklistItem
					ok={!!problemInfo}
					okLabel="문제 감지됨"
					errorLabel="프로그래머스 문제 미감지"
					description="프로그래머스 문제 페이지에서 확장을 열어주세요"
					action={
						<Button
							size="sm"
							variant="secondary"
							onClick={() => window.open("https://programmers.co.kr", "_blank")}
						>
							프로그래머스 바로가기
						</Button>
					}
				/>
			</CardContent>
		</Card>
	);
}

function ChecklistItem({ ok, okLabel, errorLabel, description, action }: {
	ok: boolean;
	okLabel: string;
	errorLabel: string;
	description?: string;
	action?: ReactNode;
}) {
	if (ok) {
		return <p className="font-mono text-[12px] text-[#4ec9b0]">✓ {okLabel}</p>;
	}
	return (
		<div className="flex flex-col gap-2">
			<p className="font-mono text-[12px] text-[#f44747]">✗ {errorLabel}</p>
			{description && <p className="font-mono text-[11px] text-[#858585]">{description}</p>}
			{action}
		</div>
	);
}

const micPermissionMessages: Record<string, string> = {
	denied: "마이크 권한이 거부되어 있어요. 아래 버튼을 눌러 다시 허용해주세요.",
	prompt: "AI 면접관과 대화하려면 마이크 접근을 허용해주세요.",
};

interface InterviewConfigProps {
	problemInfo: ProblemInfo;
	onStart: (config: {
		timeLimit: number;
		interviewerStyle: InterviewerStyle;
	}) => Promise<void>;
}

function InterviewConfig({ problemInfo, onStart }: InterviewConfigProps) {
	const { data: settings } = useSuspenseQuery(liveCodingSettingsQueryOptions());

	const [timeLimit, setTimeLimit] = useState(
		settings.defaultTimeLimit.toString(),
	);
	const [interviewerStyle, setInterviewerStyle] = useState<InterviewerStyle>(
		settings.defaultStyle,
	);
	const [isStarting, setIsStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle>감지된 문제</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-[13px] text-[#d4d4d4]">{problemInfo.title}</p>
					<p className="font-mono text-[11px] text-[#858585] mt-1">
						난이도: Level {problemInfo.level}
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>제한 시간</CardTitle>
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
					<CardTitle>면접관 스타일</CardTitle>
				</CardHeader>
				<CardContent>
					<Select
						options={INTERVIEWER_STYLE_OPTIONS}
						value={interviewerStyle}
						onChange={(e) =>
							setInterviewerStyle(e.target.value as InterviewerStyle)
						}
					/>
					<p className="font-mono text-[11px] text-[#858585] mt-2">
						{interviewerStyle === "friendly" && "친절하게 힌트를 많이 제공해요"}
						{interviewerStyle === "normal" && "적절한 질문과 피드백을 제공해요"}
						{interviewerStyle === "pressure" &&
							"날카로운 질문과 시간 압박을 줘요"}
					</p>
				</CardContent>
			</Card>
			<Button
				className="w-full"
				disabled={isStarting || !settings.apiKey}
				onClick={async () => {
					setIsStarting(true);
					setError(null);
					try {
						await onStart({
							timeLimit: parseInt(timeLimit, 10),
							interviewerStyle,
						});
					} catch (err) {
						setError(
							err instanceof Error ? err.message : "면접 시작에 실패했어요",
						);
					} finally {
						setIsStarting(false);
					}
				}}
			>
				{isStarting ? "시작 중" : "면접 시작"}
			</Button>
			{error && <p className="font-mono text-[12px] text-[#f44747]">{error}</p>}
		</>
	);
}

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
