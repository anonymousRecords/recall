import { useEffect, useState } from "react";
import { useSettings } from "../../../hooks";
import { DEFAULT_INTERVALS } from "../../../lib/scheduling";
import type { Theme } from "../../../types";

function applyTheme(selectedTheme: Theme) {
	const root = document.documentElement;
	const isDark =
		selectedTheme === "dark" ||
		(selectedTheme === "system" &&
			window.matchMedia("(prefers-color-scheme: dark)").matches);

	root.classList.toggle("dark", isDark);
}

function parseIntervals(input: string): number[] | null {
	const parts = input.split(",").map((s) => s.trim());
	const nums: number[] = [];

	for (const part of parts) {
		const num = Number.parseInt(part, 10);
		if (Number.isNaN(num) || num <= 0) return null;
		nums.push(num);
	}

	return nums.length === 0 ? null : nums;
}

export function useSettingsForm() {
	const { settings, saveSettings } = useSettings();
	const [intervals, setIntervals] = useState(
		settings.reviewIntervals.join(", "),
	);
	const [theme, setTheme] = useState(settings.theme);

	useEffect(() => {
		setIntervals(settings.reviewIntervals.join(", "));
		setTheme(settings.theme);
	}, [settings]);

	useEffect(() => {
		applyTheme(theme);
	}, [theme]);

	const validate = (): string | null => {
		const parsed = parseIntervals(intervals);
		if (!parsed) {
			return "복습 주기는 양수로 입력해주세요 (예: 1, 3, 7, 14, 30)";
		}
		return null;
	};

	const save = async () => {
		const parsed = parseIntervals(intervals);
		if (!parsed) return;
		await saveSettings({ reviewIntervals: parsed, theme });
	};

	const reset = () => {
		setIntervals(DEFAULT_INTERVALS.join(", "));
		setTheme("system");
	};

	return {
		intervals,
		setIntervals,
		theme,
		setTheme,
		validate,
		save,
		reset,
	};
}
