import type { ProblemInfo } from "../../types";

const PROGRAMMERS_URL_PATTERN =
	/school\.programmers\.co\.kr\/learn\/courses\/\d+\/lessons\/\d+/;

export function isProgrammersPage(url: string): boolean {
	return PROGRAMMERS_URL_PATTERN.test(url);
}

export async function getProblemInfo(): Promise<ProblemInfo | null> {
	try {
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab?.id || !tab.url || !isProgrammersPage(tab.url)) {
			return null;
		}

		const response = await browser.tabs.sendMessage(tab.id, {
			type: "GET_PROBLEM_INFO",
		});

		return response?.payload ?? null;
	} catch (error) {
		console.error("[오답노트] 문제 정보 가져오기 실패:", error);
		return null;
	}
}

export async function getCurrentCode(): Promise<{
	code: string;
	language: string;
} | null> {
	try {
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab?.id) return null;

		const response = await browser.tabs.sendMessage(tab.id, {
			type: "GET_CURRENT_CODE",
		});

		return response ?? null;
	} catch (error) {
		console.error("[오답노트] 코드 가져오기 실패:", error);
		return null;
	}
}

export async function startCodeMonitor(): Promise<boolean> {
	try {
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab?.id) return false;

		await browser.tabs.sendMessage(tab.id, {
			type: "START_CODE_MONITOR",
		});

		return true;
	} catch (error) {
		console.error("[오답노트] 코드 모니터링 시작 실패:", error);
		return false;
	}
}

export async function stopCodeMonitor(): Promise<boolean> {
	try {
		const [tab] = await browser.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab?.id) return false;

		await browser.tabs.sendMessage(tab.id, {
			type: "STOP_CODE_MONITOR",
		});

		return true;
	} catch (error) {
		console.error("[오답노트] 코드 모니터링 중지 실패:", error);
		return false;
	}
}
