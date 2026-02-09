import { useCallback, useEffect, useState } from "react";
import { createAIClient } from "../../../lib/ai";
import {
	getLiveCodingSettings,
	updateLiveCodingSettings,
} from "../../../lib/db/live-coding-settings";
import type { AIProvider } from "../../../types";

export function useLiveCodingForm() {
	const [aiProvider, setAiProvider] = useState<AIProvider>("openai");
	const [apiKey, setApiKey] = useState("");
	const [testingApi, setTestingApi] = useState(false);
	const [apiTestResult, setApiTestResult] = useState<string | null>(null);

	useEffect(() => {
		getLiveCodingSettings().then((s) => {
			setAiProvider(s.aiProvider);
			setApiKey(s.apiKey);
		});
	}, []);

	const save = useCallback(async () => {
		await updateLiveCodingSettings({ aiProvider, apiKey });
	}, [aiProvider, apiKey]);

	const handleTestApi = useCallback(async () => {
		if (!apiKey) {
			setApiTestResult("API 키를 입력해주세요.");
			return;
		}

		setTestingApi(true);
		setApiTestResult(null);

		try {
			const client = createAIClient(aiProvider, apiKey);
			const success = await client.testConnection();
			setApiTestResult(
				success ? "연결 성공!" : "연결 실패. API 키를 확인해주세요.",
			);
		} catch (error) {
			setApiTestResult(
				error instanceof Error ? error.message : "연결 테스트 실패",
			);
		} finally {
			setTestingApi(false);
		}
	}, [aiProvider, apiKey]);

	return {
		aiProvider,
		setAiProvider,
		apiKey,
		setApiKey,
		testingApi,
		apiTestResult,
		save,
		handleTestApi,
	};
}
