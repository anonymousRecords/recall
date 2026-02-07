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
import type { InterviewerStyle, ProblemInfo } from "../../../types";
import { useLiveCodingSettings } from "../hooks/useLiveCodingSettings";

interface SessionSetupProps {
	problemInfo: ProblemInfo | null;
	onStart: (config: {
		timeLimit: number | null;
		style: InterviewerStyle;
	}) => Promise<void>;
}

const TIME_OPTIONS = [
	{ value: "30", label: "30분" },
	{ value: "45", label: "45분" },
	{ value: "60", label: "60분" },
	{ value: "null", label: "무제한" },
];

const STYLE_OPTIONS = [
	{ value: "friendly", label: "친절" },
	{ value: "normal", label: "보통" },
	{ value: "pressure", label: "압박" },
];

export function SessionSetup({ problemInfo, onStart }: SessionSetupProps) {
	const navigate = useNavigate();
	const {
		settings,
		hasApiKey,
		loading: settingsLoading,
	} = useLiveCodingSettings();

	const [timeLimit, setTimeLimit] = useState(
		settings.defaultTimeLimit.toString(),
	);
	const [style, setStyle] = useState<InterviewerStyle>(settings.defaultStyle);
	const [starting, setStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleStart = async () => {
		if (!problemInfo) {
			setError("문제 정보를 찾을 수 없습니다.");
			return;
		}

		if (!hasApiKey) {
			setError("API 키를 먼저 설정해주세요.");
			return;
		}

		setStarting(true);
		setError(null);

		try {
			await onStart({
				timeLimit: timeLimit === "null" ? null : parseInt(timeLimit, 10),
				style,
			});
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "세션 시작에 실패했습니다.",
			);
			setStarting(false);
		}
	};

	if (settingsLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-gray-500 dark:text-gray-400">로딩 중...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
				<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
					라이브 코딩
				</h1>
			</header>

			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					{/* 안내 메시지 */}
					<Card>
						<CardContent className="py-4">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								프로그래머스 문제 페이지에서 실제 면접처럼 연습하세요. AI
								면접관이 질문하고 피드백을 제공합니다.
							</p>
						</CardContent>
					</Card>

					{/* 문제 정보 */}
					{problemInfo ? (
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
					) : (
						<Card>
							<CardContent className="py-4">
								<p className="text-sm text-amber-600 dark:text-amber-400">
									프로그래머스 문제 페이지에서 확장을 열어주세요.
								</p>
							</CardContent>
						</Card>
					)}

					{/* API 키 경고 */}
					{!hasApiKey && (
						<Card>
							<CardContent className="py-4">
								<p className="text-sm text-red-600 dark:text-red-400 mb-2">
									API 키가 설정되지 않았습니다.
								</p>
								<Button
									variant="secondary"
									size="sm"
									onClick={() => navigate("/settings")}
								>
									설정으로 이동
								</Button>
							</CardContent>
						</Card>
					)}

					{/* 세션 설정 */}
					{problemInfo && hasApiKey && (
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
										options={STYLE_OPTIONS}
										value={style}
										onChange={(e) =>
											setStyle(e.target.value as InterviewerStyle)
										}
									/>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
										{style === "friendly" && "친절하게 힌트를 많이 제공합니다."}
										{style === "normal" && "적절한 질문과 피드백을 제공합니다."}
										{style === "pressure" &&
											"날카로운 질문과 시간 압박을 줍니다."}
									</p>
								</CardContent>
							</Card>
						</>
					)}

					{/* 에러 메시지 */}
					{error && (
						<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
					)}

					{/* 시작 버튼 */}
					<Button
						className="w-full"
						disabled={!problemInfo || !hasApiKey || starting}
						onClick={handleStart}
					>
						{starting ? "시작 중..." : "세션 시작"}
					</Button>
				</div>
			</div>
		</div>
	);
}
