import { useCallback, useMemo } from "react";
import {
	DEFAULT_SETTINGS,
	getSettings,
	updateSettings,
} from "../lib/db/settings";
import type { Settings } from "../types";
import { useAsyncData } from "./useAsyncData";

export function useSettings() {
	const {
		data: settings,
		loading,
		error,
		refetch,
		setData,
	} = useAsyncData(getSettings, DEFAULT_SETTINGS);

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
