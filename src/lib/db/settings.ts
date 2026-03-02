import type { Settings } from "../../types";
import { DEFAULT_INTERVALS } from "../scheduling";
import { db } from "./index";

export const DEFAULT_SETTINGS: Settings = {
	id: "user-settings",
	reviewIntervals: DEFAULT_INTERVALS,
};

export async function getSettings(): Promise<Settings> {
	const settings = await db.settings.get("user-settings");
	return settings ?? DEFAULT_SETTINGS;
}

export async function updateSettings(
	updates: Partial<Omit<Settings, "id">>,
): Promise<Settings> {
	const current = await getSettings();
	const newSettings: Settings = {
		...current,
		...updates,
		id: "user-settings",
	};

	await db.settings.put(newSettings);
	return newSettings;
}

export async function resetSettings(): Promise<Settings> {
	await db.settings.put(DEFAULT_SETTINGS);
	return DEFAULT_SETTINGS;
}
