import { useCallback, useEffect, useRef, useState } from "react";
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

	const onCodeChangeRef = useRef(onCodeChange);

	useEffect(() => {
		onCodeChangeRef.current = onCodeChange;
	}, [onCodeChange]);

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
	}, []);

	useEffect(() => {
		return onMessage("CODE_CHANGED", ({ data }) => {
			setEditorCode(data.code);
			setEditorLanguage(data.language);
			onCodeChangeRef.current?.(data.code, data.language);
		});
	}, []);

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
