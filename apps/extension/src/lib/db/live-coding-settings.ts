import type { LiveCodingSettings } from "../../types";
import { getStorageItem, setStorageItem } from "./browser-storage";
import { db } from "./index";

const API_KEY_STORAGE_KEY = "recall_api_key";

const DEFAULT_LIVE_CODING_SETTINGS: LiveCodingSettings = {
	id: "live-coding-settings",
	aiProvider: "openai",
	apiKey: "",
	defaultTimeLimit: 30,
	defaultStyle: "normal",
	autoRegisterProblem: true,
	voiceEnabled: true,
};

function getApiKey(): Promise<string> {
	return getStorageItem(API_KEY_STORAGE_KEY, "");
}

function setApiKey(apiKey: string): Promise<void> {
	return setStorageItem(API_KEY_STORAGE_KEY, apiKey);
}

export async function getLiveCodingSettings(): Promise<LiveCodingSettings> {
	const [settings, apiKey] = await Promise.all([
		db.liveCodingSettings.get("live-coding-settings"),
		getApiKey(),
	]);

	return {
		...(settings ?? DEFAULT_LIVE_CODING_SETTINGS),
		apiKey,
	};
}

export async function updateLiveCodingSettings(
	updates: Partial<Omit<LiveCodingSettings, "id">>,
): Promise<LiveCodingSettings> {
	if (updates.apiKey !== undefined) {
		await setApiKey(updates.apiKey);
	}

	const { apiKey: _, ...dbUpdates } = updates;
	const current = await db.liveCodingSettings.get("live-coding-settings");
	const newDbSettings = {
		...(current ?? DEFAULT_LIVE_CODING_SETTINGS),
		...dbUpdates,
		apiKey: "",
		id: "live-coding-settings" as const,
	};

	await db.liveCodingSettings.put(newDbSettings);

	return {
		...newDbSettings,
		apiKey: updates.apiKey ?? (await getApiKey()),
	};
}

export async function resetLiveCodingSettings(): Promise<LiveCodingSettings> {
	await Promise.all([
		db.liveCodingSettings.put(DEFAULT_LIVE_CODING_SETTINGS),
		setApiKey(""),
	]);
	return DEFAULT_LIVE_CODING_SETTINGS;
}

export { DEFAULT_LIVE_CODING_SETTINGS };
