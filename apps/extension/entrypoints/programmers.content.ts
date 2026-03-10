import { onMessage, sendMessage } from "../src/lib/messaging";
import type { ProblemInfo, ProgrammingLanguage } from "../src/types";

export default defineContentScript({
	matches: ["https://school.programmers.co.kr/learn/courses/*/lessons/*"],
	main() {
		let isMonitoring = false;
		let lastCode = "";
		let monitorInterval: number | null = null;

		console.log("프로그래머스 Content Script 로드됨");

		sendMessage("PROGRAMMERS_PAGE_LOADED", undefined).catch(() => {
			// 사이드 패널이 열려있지 않으면 무시
		});

		onMessage("GET_PROBLEM_INFO", () => extractProblemInfo());
		onMessage("GET_CURRENT_CODE", () => {
			const code = getEditorCode();
			return code ? { code, language: detectLanguage() } : null;
		});
		onMessage("START_CODE_MONITOR", () => {
			startMonitoring();
			return true;
		});
		onMessage("STOP_CODE_MONITOR", () => {
			stopMonitoring();
			return true;
		});

		function extractProblemInfo(): ProblemInfo | null {
			try {
				// TITLE
				const title = document
					.querySelector(".challenge-title")
					?.textContent?.trim();

				if (!title) {
					return null;
				}

				// LEVEL
				const levelEl = document.querySelector(".nav-item.active");
				const levelText = levelEl?.textContent || "";
				const levelMatch = levelText.match(/Lv\.\s*(\d+)/);
				const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;

				// DESCRIPTION
				const description =
					document
						.querySelector(".guide-section-description")
						?.textContent?.trim() || "";

				// CONSTRAINTS
				const constraints = Array.from(
					document.querySelectorAll(".guide-section-description ul li"),
				).map((el) => el.textContent?.trim() || "");

				// EXAMPLES
				const exampleTable = document.querySelector(
					".guide-section-description table",
				);
				const examples: { input: string; output: string }[] = [];

				if (exampleTable) {
					const rows = exampleTable.querySelectorAll("tbody tr");
					rows.forEach((row) => {
						const cells = row.querySelectorAll("td");
						if (cells.length >= 2) {
							examples.push({
								input: cells[0].textContent?.trim() || "",
								output: cells[cells.length - 1].textContent?.trim() || "",
							});
						}
					});
				}

				return {
					title,
					level,
					description,
					constraints,
					examples,
					url: window.location.href,
				};
			} catch (error) {
				console.error("프로그래머스 문제 정보 추출 실패:", error);
				return null;
			}
		}

		function getEditorCode(): string | null {
			try {
				// CodeMirror 6 (최신 프로그래머스)
				const cmEditor = document.querySelector(
					".cm-editor",
				) as CodeMirror6EditorElement | null;
				if (cmEditor) {
					const doc = cmEditor.cmView?.view?.state?.doc;
					if (doc) {
						return doc.toString();
					}
				}

				// CodeMirror 5 (레거시)
				const cm5Elements = document.querySelectorAll(".CodeMirror");
				for (const el of cm5Elements) {
					const cm = (el as CodeMirror5Element).CodeMirror;
					if (cm) {
						return cm.getValue();
					}
				}

				// Monaco Editor (일부 문제)
				const monacoWindow = window as WindowWithMonaco;
				if (monacoWindow.monaco?.editor) {
					const editors = monacoWindow.monaco.editor.getEditors();
					if (editors.length > 0) {
						return editors[0].getValue();
					}
				}

				const textarea = document.querySelector(
					".editor textarea, #code",
				) as HTMLTextAreaElement | null;
				if (textarea) {
					return textarea.value;
				}

				return null;
			} catch (error) {
				console.error("프로그래머스 코드 추출 실패:", error);
				return null;
			}
		}

		function detectLanguage(): ProgrammingLanguage {
			const languageSelectorText =
				document
					.querySelector(
						".dropdown-toggle, .nav-item.active, [data-testid='language-selector']",
					)
					?.textContent?.toLowerCase() || "";

			if (languageSelectorText.includes("python")) return "python";
			if (
				languageSelectorText.includes("java") &&
				!languageSelectorText.includes("javascript")
			)
				return "java";
			if (languageSelectorText.includes("javascript")) return "javascript";
			if (
				languageSelectorText.includes("c++") ||
				languageSelectorText.includes("cpp")
			)
				return "cpp";
			if (languageSelectorText.includes("c#")) return "csharp";
			if (languageSelectorText.includes("kotlin")) return "kotlin";
			if (languageSelectorText.includes("swift")) return "swift";
			if (languageSelectorText.includes("go")) return "go";
			if (languageSelectorText.includes("rust")) return "rust";

			return "unknown";
		}

		function checkCodeChange() {
			const currentCode = getEditorCode();

			if (currentCode !== null && currentCode !== lastCode) {
				lastCode = currentCode;

				sendMessage("CODE_CHANGED", {
					code: currentCode,
					language: detectLanguage(),
				});
			}
		}

		function startMonitoring() {
			if (isMonitoring) {
				return;
			}

			isMonitoring = true;
			lastCode = getEditorCode() || "";

			monitorInterval = window.setInterval(checkCodeChange, 500); // 500ms마다 코드 변화 체크

			console.log("프로그래머스 코드 모니터링 시작");
		}

		function stopMonitoring() {
			if (!isMonitoring) {
				return;
			}

			isMonitoring = false;

			if (monitorInterval) {
				clearInterval(monitorInterval);
				monitorInterval = null;
			}

			console.log("프로그래머스 코드 모니터링 중지");
		}

	},
});

interface CodeMirror6EditorElement extends HTMLElement {
	cmView?: {
		view?: {
			state?: {
				doc?: {
					toString(): string;
				};
			};
		};
	};
}

interface CodeMirror5Element extends Element {
	CodeMirror?: {
		getValue(): string;
	};
}

interface MonacoEditorInstance {
	getValue(): string;
}

interface WindowWithMonaco extends Window {
	monaco?: {
		editor: {
			getEditors(): MonacoEditorInstance[];
		};
	};
}
