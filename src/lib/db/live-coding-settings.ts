import type { LiveCodingSettings } from "../../types";
import { db } from "./index";

const API_KEY_STORAGE_KEY = "odapnote_api_key";

const DEFAULT_LIVE_CODING_SETTINGS: LiveCodingSettings = {
	id: "live-coding-settings",
	aiProvider: "openai",
	apiKey: "",
	defaultTimeLimit: 30,
	defaultStyle: "normal",
	autoRegisterProblem: true,
	voiceInputMode: "auto",
	voiceEnabled: true,
	voiceRate: 1.0,
};

async function getApiKey(): Promise<string> {
	try {
		const result = await browser.storage.local.get(API_KEY_STORAGE_KEY);
		return (result[API_KEY_STORAGE_KEY] as string) ?? "";
	} catch {
		return "";
	}
}

async function setApiKey(apiKey: string): Promise<void> {
	try {
		await browser.storage.local.set({ [API_KEY_STORAGE_KEY]: apiKey });
	} catch {
		console.error("[오답노트] API Key 저장 실패");
	}
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
