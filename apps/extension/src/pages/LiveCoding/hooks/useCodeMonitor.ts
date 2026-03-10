import { useCallback, useEffect, useState } from "react";
import { usePreservedCallback } from "react-simplikit";
import { getActiveTab } from "../../../lib/browser";
import { onMessage } from "../../../lib/messaging";
import {
	getProgrammersProblemCode,
	getProgrammersProblemInfo,
	isProgrammersPage,
	startProgrammersMonitor,
	stopProgrammersMonitor,
} from "../../../lib/platforms/programmers";
import type { ProblemInfo, ProgrammingLanguage } from "../../../types";

interface UseCodeMonitorOptions {
	onCodeChange?: (code: string, language: string) => void;
}

export function useCodeMonitor({ onCodeChange }: UseCodeMonitorOptions = {}) {
	const [problemInfo, setProblemInfo] = useState<ProblemInfo | null>(null);
	const [editorCode, setEditorCode] = useState("");
	const [editorLanguage, setEditorLanguage] =
		useState<ProgrammingLanguage>("unknown");

	const preservedOnCodeChange = usePreservedCallback(
		(code: string, language: string) => onCodeChange?.(code, language),
	);

	useEffect(() => {
		const checkCurrentTab = async () => {
			try {
				const tab = await getActiveTab();

				if (tab.url && isProgrammersPage(tab.url)) {
					setProblemInfo(await getProgrammersProblemInfo());

					const codeInfo = await getProgrammersProblemCode();
					if (codeInfo) {
						setEditorCode(codeInfo.code);
						setEditorLanguage(codeInfo.language);
					}
				} else {
					setProblemInfo(null);
					setEditorCode("");
					setEditorLanguage("unknown");
				}
			} catch (error) {
				console.error("탭 확인 실패:", error);
			}
		};

		checkCurrentTab();

		// content script가 로드될 때 (URL 이동으로 프로그래머스 진입)
		const unsubscribe = onMessage("PROGRAMMERS_PAGE_LOADED", () => {
			checkCurrentTab();
		});

		// 이미 로드된 프로그래머스 탭으로 전환할 때
		const handleTabActivated = () => {
			checkCurrentTab();
		};
		browser.tabs.onActivated.addListener(handleTabActivated);

		return () => {
			unsubscribe();
			browser.tabs.onActivated.removeListener(handleTabActivated);
		};
	}, []);

	useEffect(() => {
		return onMessage("CODE_CHANGED", ({ data }) => {
			setEditorCode(data.code);
			setEditorLanguage(data.language);
			preservedOnCodeChange(data.code, data.language);
		});
	}, [preservedOnCodeChange]);

	const startMonitoring = useCallback(async () => {
		return startProgrammersMonitor();
	}, []);

	const stopMonitoring = useCallback(async () => {
		return stopProgrammersMonitor();
	}, []);

	return {
		problemInfo,
		editorCode,
		editorLanguage,
		startMonitoring,
		stopMonitoring,
	};
}
