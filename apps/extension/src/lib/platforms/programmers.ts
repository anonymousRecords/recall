import type { ProblemInfo, ProgrammingLanguage } from "../../types";
import { getActiveTab } from "../browser";
import { sendMessage } from "../messaging";

const PROGRAMMERS_URL_PATTERN =
	/school\.programmers\.co\.kr\/learn\/courses\/\d+\/lessons\/\d+/;

export function isProgrammersPage(url: string): boolean {
	return PROGRAMMERS_URL_PATTERN.test(url);
}

export async function getProgrammersProblemInfo(): Promise<ProblemInfo | null> {
	try {
		const tab = await getActiveTab();

		if (!tab.url || !isProgrammersPage(tab.url)) {
			return null;
		}

		return await sendMessage("GET_PROBLEM_INFO", undefined, tab.id);
	} catch (error) {
		console.error("프로그래머스 문제 정보 가져오기 실패:", error);
		return null;
	}
}

export async function getProgrammersProblemCode(): Promise<{
	code: string;
	language: ProgrammingLanguage;
} | null> {
	try {
		const tab = await getActiveTab();

		return await sendMessage("GET_CURRENT_CODE", undefined, tab.id);
	} catch (error) {
		console.error("프로그래머스 코드 가져오기 실패:", error);
		return null;
	}
}

export async function startProgrammersMonitor(): Promise<number | undefined> {
	const tab = await getActiveTab();
	await sendMessage("START_CODE_MONITOR", undefined, tab.id);

	return tab.id;
}

export async function stopProgrammersMonitor(tabId: number): Promise<boolean> {
	try {
		return await sendMessage("STOP_CODE_MONITOR", undefined, tabId);
	} catch (error) {
		console.error("프로그래머스 코드 모니터링 중지 실패:", error);
		return false;
	}
}
