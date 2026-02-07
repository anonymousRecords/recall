import { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Select,
} from "../../components/ui";
import { useSettings } from "../../hooks";
import { createAIClient } from "../../lib/ai";
import {
	getLiveCodingSettings,
	updateLiveCodingSettings,
} from "../../lib/db/live-coding-settings";
import { DEFAULT_INTERVALS } from "../../lib/scheduling";
import type { AIProvider, LiveCodingSettings } from "../../types";

const THEME_OPTIONS = [
	{ value: "system", label: "시스템 설정" },
	{ value: "light", label: "라이트 모드" },
	{ value: "dark", label: "다크 모드" },
];

const AI_PROVIDER_OPTIONS = [
	{ value: "openai", label: "OpenAI (GPT-4o-mini)" },
	{ value: "claude", label: "Claude (Haiku)" },
];

function applyTheme(selectedTheme: "light" | "dark" | "system") {
	const root = document.documentElement;
	const isDark =
		selectedTheme === "dark" ||
		(selectedTheme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	root.classList.toggle("dark", isDark);
}

export function SettingsPage() {
	const { settings, saveSettings, loading } = useSettings();
	const [intervals, setIntervals] = useState<string>(
		settings.reviewIntervals.join(", "),
	);
	const [theme, setTheme] = useState(settings.theme);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	// 라이브 코딩 설정
	const [liveCodingSettings, setLiveCodingSettings] =
		useState<LiveCodingSettings | null>(null);
	const [aiProvider, setAiProvider] = useState<AIProvider>("openai");
	const [apiKey, setApiKey] = useState("");
	const [testingApi, setTestingApi] = useState(false);
	const [apiTestResult, setApiTestResult] = useState<string | null>(null);

	useEffect(() => {
		setIntervals(settings.reviewIntervals.join(", "));
		setTheme(settings.theme);
	}, [settings]);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	// 라이브 코딩 설정 로드
	useEffect(() => {
		getLiveCodingSettings().then((s) => {
			setLiveCodingSettings(s);
			setAiProvider(s.aiProvider);
			setApiKey(s.apiKey);
		});
	}, []);

	const parseIntervals = (input: string): number[] | null => {
		const parts = input.split(",").map((s) => s.trim());
		const nums: number[] = [];

		for (const part of parts) {
			const num = Number.parseInt(part, 10);
			if (Number.isNaN(num) || num <= 0) {
				return null;
			}
			nums.push(num);
		}

		if (nums.length === 0) {
			return null;
		}

		return nums;
	};

	const handleSave = async () => {
		const parsedIntervals = parseIntervals(intervals);

		if (!parsedIntervals) {
			setMessage("복습 주기는 양수로 입력해주세요 (예: 1, 3, 7, 14, 30)");
			return;
		}

		setSaving(true);
		setMessage(null);

		try {
			await saveSettings({
				reviewIntervals: parsedIntervals,
				theme,
			});

			// 라이브 코딩 설정 저장
			await updateLiveCodingSettings({
				aiProvider,
				apiKey,
			});

			setMessage("설정이 저장되었습니다");
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		setIntervals(DEFAULT_INTERVALS.join(", "));
		setTheme("system");
	};

	const handleTestApi = async () => {
		if (!apiKey) {
			setApiTestResult("API 키를 입력해주세요.");
			return;
		}

		setTestingApi(true);
		setApiTestResult(null);

		try {
			const client = createAIClient(aiProvider, apiKey);
			const success = await client.testConnection();

			if (success) {
				setApiTestResult("연결 성공!");
			} else {
				setApiTestResult("연결 실패. API 키를 확인해주세요.");
			}
		} catch (error) {
			setApiTestResult(
				error instanceof Error ? error.message : "연결 테스트 실패",
			);
		} finally {
			setTestingApi(false);
		}
	};

	if (loading) {
		return <SettingsSkeleton />;
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-neutral-950">
			<SettingsHeader />

			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					<IntervalSettings intervals={intervals} setIntervals={setIntervals} />
					<ThemeSettings theme={theme} setTheme={setTheme} />

					{/* 라이브 코딩 설정 */}
					<Card>
						<CardHeader>
							<CardTitle>라이브 코딩</CardTitle>
							<CardDescription>AI 면접관 설정</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Select
								label="AI 제공자"
								options={AI_PROVIDER_OPTIONS}
								value={aiProvider}
								onChange={(e) => setAiProvider(e.target.value as AIProvider)}
							/>

							<Input
								label="API 키"
								type="password"
								value={apiKey}
								onChange={(e) => setApiKey(e.target.value)}
								placeholder={aiProvider === "openai" ? "sk-..." : "sk-ant-..."}
								hint={
									aiProvider === "openai"
										? "OpenAI API 키 (platform.openai.com)"
										: "Anthropic API 키 (console.anthropic.com)"
								}
							/>

							<div className="flex items-center gap-3">
								<Button
									variant="secondary"
									size="sm"
									onClick={handleTestApi}
									disabled={testingApi || !apiKey}
								>
									{testingApi ? "테스트 중..." : "연결 테스트"}
								</Button>
								{apiTestResult && (
									<span
										className={`text-sm font-medium ${
											apiTestResult.includes("성공")
												? "text-emerald-600 dark:text-emerald-400"
												: "text-red-600 dark:text-red-400"
										}`}
									>
										{apiTestResult}
									</span>
								)}
							</div>
						</CardContent>
					</Card>

					{message && (
						<div
							className={`rounded-lg px-4 py-3 text-sm font-medium ${
								message.includes("저장")
									? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
									: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
							}`}
						>
							{message}
						</div>
					)}

					<SettingsActions
						handleReset={handleReset}
						handleSave={handleSave}
						saving={saving}
					/>
				</div>

				<div className="mt-8 border-t border-neutral-100 pt-6 dark:border-neutral-800">
					<AppInfoFooter />
				</div>
			</div>
		</div>
	);
}

function SettingsHeader() {
	return (
		<header className="border-b border-neutral-200/60 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950">
			<h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
				설정
			</h1>
		</header>
	);
}

interface IntervalSettingsProps {
	intervals: string;
	setIntervals: (intervals: string) => void;
}

function IntervalSettings({ intervals, setIntervals }: IntervalSettingsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>복습 주기</CardTitle>
				<CardDescription>
					에빙하우스 망각곡선 기반 복습 주기를 설정합니다
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Input
					value={intervals}
					onChange={(e) => setIntervals(e.target.value)}
					placeholder="1, 3, 7, 14, 30"
					hint="쉼표로 구분하여 입력 (기본값: 1, 3, 7, 14, 30일)"
				/>
			</CardContent>
		</Card>
	);
}

interface ThemeSettingsProps {
	theme: "light" | "dark" | "system";
	setTheme: (theme: "light" | "dark" | "system") => void;
}

function ThemeSettings({ theme, setTheme }: ThemeSettingsProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>테마</CardTitle>
				<CardDescription>앱의 색상 모드를 선택합니다</CardDescription>
			</CardHeader>
			<CardContent>
				<Select
					options={THEME_OPTIONS}
					value={theme}
					onChange={(e) =>
						setTheme(e.target.value as "light" | "dark" | "system")
					}
				/>
			</CardContent>
		</Card>
	);
}

function AppInfoFooter() {
	return (
		<div className="text-center">
			<p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
				오답노트 v1.0.0
			</p>
			<p className="mt-0.5 text-xs text-neutral-300 dark:text-neutral-600">
				에빙하우스 망각곡선 기반 복습 관리
			</p>
		</div>
	);
}

interface SettingsActionsProps {
	handleReset: () => void;
	handleSave: () => void;
	saving: boolean;
}

function SettingsActions({
	handleReset,
	handleSave,
	saving,
}: SettingsActionsProps) {
	return (
		<div className="flex gap-3 pt-2">
			<Button
				type="button"
				variant="secondary"
				className="flex-1"
				onClick={handleReset}
			>
				초기화
			</Button>
			<Button
				type="button"
				className="flex-1"
				onClick={handleSave}
				disabled={saving}
			>
				{saving ? "저장 중..." : "저장"}
			</Button>
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="flex items-center gap-2 text-neutral-400">
				<LoadingSpinner />
				<span className="text-sm">불러오는 중...</span>
			</div>
		</div>
	);
}

function LoadingSpinner() {
	return (
		<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}
