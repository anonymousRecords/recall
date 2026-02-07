import { useCallback, useMemo } from "react";
import { useAsyncData } from "../../../hooks/useAsyncData";
import {
	DEFAULT_LIVE_CODING_SETTINGS,
	getLiveCodingSettings,
	updateLiveCodingSettings,
} from "../../../lib/db/live-coding-settings";
import type { LiveCodingSettings } from "../../../types";

export function useLiveCodingSettings() {
	const fetcher = useCallback(() => getLiveCodingSettings(), []);
	const {
		data: settings,
		loading,
		error,
		refetch,
		setData,
	} = useAsyncData(fetcher, DEFAULT_LIVE_CODING_SETTINGS);

	const saveSettings = useCallback(
		async (updates: Partial<Omit<LiveCodingSettings, "id">>) => {
			const updated = await updateLiveCodingSettings(updates);
			setData(updated);
			return updated;
		},
		[setData],
	);

	const hasApiKey = useMemo(() => {
		return settings.apiKey.length > 0;
	}, [settings.apiKey]);

	return useMemo(
		() => ({
			settings,
			loading,
			error,
			hasApiKey,
			saveSettings,
			refetch,
		}),
		[settings, loading, error, hasApiKey, saveSettings, refetch],
	);
}
