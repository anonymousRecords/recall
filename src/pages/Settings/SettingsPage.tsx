import { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Select,
} from "../../components/ui";
import { useSettings } from "../../hooks";
import { DEFAULT_INTERVALS } from "../../lib/scheduling";

const THEME_OPTIONS = [
	{ value: "system", label: "시스템 설정" },
	{ value: "light", label: "라이트 모드" },
	{ value: "dark", label: "다크 모드" },
];

export function SettingsPage() {
	const { settings, saveSettings, loading } = useSettings();
	const [intervals, setIntervals] = useState<string>(
		settings.reviewIntervals.join(", "),
	);
	const [theme, setTheme] = useState(settings.theme);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	useEffect(() => {
		setIntervals(settings.reviewIntervals.join(", "));
		setTheme(settings.theme);
	}, [settings]);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const applyTheme = (selectedTheme: "light" | "dark" | "system") => {
		const root = document.documentElement;
		const isDark =
			selectedTheme === "dark" ||
			(selectedTheme === "system" &&
				window.matchMedia("(prefers-color-scheme: dark)").matches);

		root.classList.toggle("dark", isDark);
	};

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
			setMessage("설정이 저장되었습니다");
		} finally {
			setSaving(false);
		}
	};

	const handleReset = () => {
		setIntervals(DEFAULT_INTERVALS.join(", "));
		setTheme("system");
	};

	if (loading) {
		return <SettingsSkeleton />;
	}

	return (
		<div className="flex flex-col h-full">
			<SettingsHeader />

			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					<IntervalSettings intervals={intervals} setIntervals={setIntervals} />
					<ThemeSettings theme={theme} setTheme={setTheme} />
					{message && (
						<p
							className={`text-sm ${
								message.includes("저장")
									? "text-green-600 dark:text-green-400"
									: "text-red-600 dark:text-red-400"
							}`}
						>
							{message}
						</p>
					)}

					<SettingsActions
						handleReset={handleReset}
						handleSave={handleSave}
						saving={saving}
					/>
				</div>

				<div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
					<AppInfoFooter />
				</div>
			</div>
		</div>
	);
}

function SettingsHeader() {
	return (
		<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
			<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
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
			</CardHeader>
			<CardContent>
				<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
					에빙하우스 망각곡선 기반 복습 주기를 설정합니다.
					<br />
					쉼표로 구분하여 입력하세요.
				</p>
				<Input
					value={intervals}
					onChange={(e) => setIntervals(e.target.value)}
					placeholder="1, 3, 7, 14, 30"
				/>
				<p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
					기본값: 1, 3, 7, 14, 30 (일)
				</p>
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
		<p className="text-xs text-gray-400 dark:text-gray-500 text-center">
			오답노트 v1.0.0
			<br />
			에빙하우스 망각곡선 기반 복습 관리
		</p>
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
		<div className="flex gap-3">
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
			<div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
		</div>
	);
}
