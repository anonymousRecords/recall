import { useCallback, useMemo } from "react";
import { getSettings, updateSettings } from "../lib/db/settings";
import { DEFAULT_INTERVALS } from "../lib/scheduling";
import type { Settings } from "../types";
import { useAsyncData } from "./useAsyncData";

const DEFAULT_SETTINGS: Settings = {
	id: "user-settings",
	reviewIntervals: DEFAULT_INTERVALS,
	theme: "system",
};

export function useSettings() {
	const fetcher = useCallback(() => getSettings(), []);
	const { data: settings, loading, error, refetch, setData } = useAsyncData(
		fetcher,
		DEFAULT_SETTINGS,
	);

	const saveSettings = useCallback(
		async (updates: Partial<Omit<Settings, "id">>) => {
			const updated = await updateSettings(updates);
			setData(updated);
			return updated;
		},
		[setData],
	);

	return useMemo(
		() => ({
			settings,
			loading,
			error,
			saveSettings,
			refetch,
		}),
		[settings, loading, error, saveSettings, refetch],
	);
}
