import { useCallback, useEffect, useRef, useState } from "react";
import {
	getCurrentCode,
	getProblemInfo,
	isProgrammersPage,
	startCodeMonitor,
	stopCodeMonitor,
} from "../../../lib/platforms/programmers";
import type { ProblemInfo } from "../../../types";

interface CodeChangeEvent {
	code: string;
	language: string;
}

interface UseCodeMonitorOptions {
	onCodeChange?: (code: string, language: string) => void;
}

export function useCodeMonitor(options: UseCodeMonitorOptions = {}) {
	const [problemInfo, setProblemInfo] = useState<ProblemInfo | null>(null);
	const [currentCode, setCurrentCode] = useState("");
	const [language, setLanguage] = useState("");
	const [isMonitoring, setIsMonitoring] = useState(false);
	const [isProgrammers, setIsProgrammers] = useState(false);
	const [loading, setLoading] = useState(true);

	const onCodeChangeRef = useRef(options.onCodeChange);

	useEffect(() => {
		onCodeChangeRef.current = options.onCodeChange;
	}, [options.onCodeChange]);

	// 현재 탭이 프로그래머스인지 확인하고 문제 정보 가져오기
	const checkCurrentTab = useCallback(async () => {
		setLoading(true);
		try {
			const [tab] = await browser.tabs.query({
				active: true,
				currentWindow: true,
			});

			if (tab?.url && isProgrammersPage(tab.url)) {
				setIsProgrammers(true);
				const info = await getProblemInfo();
				setProblemInfo(info);

				const codeInfo = await getCurrentCode();
				if (codeInfo) {
					setCurrentCode(codeInfo.code);
					setLanguage(codeInfo.language);
				}
			} else {
				setIsProgrammers(false);
				setProblemInfo(null);
			}
		} catch (error) {
			console.error("[오답노트] 탭 확인 실패:", error);
			setIsProgrammers(false);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		checkCurrentTab();
	}, [checkCurrentTab]);

	useEffect(() => {
		const handleMessage = (message: CodeChangeEvent & { type: string }) => {
			if (message.type === "CODE_CHANGED") {
				setCurrentCode(message.code);
				setLanguage(message.language);
				onCodeChangeRef.current?.(message.code, message.language);
			}
		};

		browser.runtime.onMessage.addListener(handleMessage);
		return () => {
			browser.runtime.onMessage.removeListener(handleMessage);
		};
	}, []);

	const startMonitoring = useCallback(async () => {
		const success = await startCodeMonitor();
		if (success) {
			setIsMonitoring(true);
		}
		return success;
	}, []);

	const stopMonitoring = useCallback(async () => {
		const success = await stopCodeMonitor();
		if (success) {
			setIsMonitoring(false);
		}
		return success;
	}, []);

	const refreshProblemInfo = useCallback(async () => {
		await checkCurrentTab();
	}, [checkCurrentTab]);

	return {
		problemInfo,
		currentCode,
		language,
		isMonitoring,
		isProgrammers,
		loading,
		startMonitoring,
		stopMonitoring,
		refreshProblemInfo,
	};
}
