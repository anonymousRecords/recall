import { useCallback, useEffect, useState } from "react";
import { getSettings, updateSettings } from "../lib/db/settings";
import { DEFAULT_INTERVALS } from "../lib/scheduling";
import type { Settings } from "../types";

const DEFAULT_SETTINGS: Settings = {
	id: "user-settings",
	reviewIntervals: DEFAULT_INTERVALS,
	theme: "system",
};

export function useSettings() {
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchSettings = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getSettings();
			setSettings(data);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to fetch settings"),
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchSettings();
	}, [fetchSettings]);

	const saveSettings = useCallback(
		async (updates: Partial<Omit<Settings, "id">>) => {
			const updated = await updateSettings(updates);
			setSettings(updated);
			return updated;
		},
		[],
	);

	return {
		settings,
		loading,
		error,
		saveSettings,
		refetch: fetchSettings,
	};
}
