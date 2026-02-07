import type { ProblemInfo } from "../src/types";

export default defineContentScript({
	matches: ["https://school.programmers.co.kr/learn/courses/*/lessons/*"],
	main() {
		let isMonitoring = false;
		let lastCode = "";
		let monitorInterval: number | null = null;

		// 문제 정보 추출
		function extractProblemInfo(): ProblemInfo | null {
			try {
				// 문제 제목
				const titleEl = document.querySelector(".challenge-title");
				const title = titleEl?.textContent?.trim();

				if (!title) return null;

				// 난이도 (Level 1~5)
				const levelEl = document.querySelector(".nav-item.active");
				const levelText = levelEl?.textContent || "";
				const levelMatch = levelText.match(/Lv\.\s*(\d+)/);
				const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;

				// 문제 설명
				const descriptionEl = document.querySelector(
					".guide-section-description",
				);
				const description = descriptionEl?.textContent?.trim() || "";

				// 제한사항
				const constraintEls = document.querySelectorAll(
					".guide-section-description ul li",
				);
				const constraints = Array.from(constraintEls).map(
					(el) => el.textContent?.trim() || "",
				);

				// 입출력 예시
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
				console.error("[오답노트] 문제 정보 추출 실패:", error);
				return null;
			}
		}

		// 에디터에서 코드 추출
		function getEditorCode(): string | null {
			try {
				// CodeMirror 6 (최신 프로그래머스)
				const cmEditor = document.querySelector(
					".cm-editor",
				) as HTMLElement | null;
				if (cmEditor) {
					const cmView = (cmEditor as any)?.cmView?.view;
					if (cmView?.state?.doc) {
						return cmView.state.doc.toString();
					}
				}

				// CodeMirror 5 (레거시)
				const cm5Elements = document.querySelectorAll(".CodeMirror");
				for (const el of cm5Elements) {
					const cm = (el as any).CodeMirror;
					if (cm) {
						return cm.getValue();
					}
				}

				// Monaco Editor (일부 문제)
				const monacoWindow = window as any;
				if (monacoWindow.monaco?.editor) {
					const editors = monacoWindow.monaco.editor.getEditors();
					if (editors.length > 0) {
						return editors[0].getValue();
					}
				}

				// 텍스트 영역 폴백
				const textarea = document.querySelector(
					".editor textarea, #code",
				) as HTMLTextAreaElement | null;
				if (textarea) {
					return textarea.value;
				}

				return null;
			} catch (error) {
				console.error("[오답노트] 코드 추출 실패:", error);
				return null;
			}
		}

		// 언어 감지
		function detectLanguage(): string {
			const langSelector = document.querySelector(
				".dropdown-toggle, .nav-item.active, [data-testid='language-selector']",
			);
			const text = langSelector?.textContent?.toLowerCase() || "";

			if (text.includes("python")) return "python";
			if (text.includes("java") && !text.includes("javascript")) return "java";
			if (text.includes("javascript")) return "javascript";
			if (text.includes("c++") || text.includes("cpp")) return "cpp";
			if (text.includes("c#")) return "csharp";
			if (text.includes("kotlin")) return "kotlin";
			if (text.includes("swift")) return "swift";
			if (text.includes("go")) return "go";
			if (text.includes("rust")) return "rust";

			return "unknown";
		}

		// 코드 변화 감지 및 전송
		function checkCodeChange() {
			const currentCode = getEditorCode();
			if (currentCode !== null && currentCode !== lastCode) {
				lastCode = currentCode;
				browser.runtime.sendMessage({
					type: "CODE_CHANGED",
					payload: {
						code: currentCode,
						language: detectLanguage(),
					},
				});
			}
		}

		// 모니터링 시작
		function startMonitoring() {
			if (isMonitoring) return;

			isMonitoring = true;
			lastCode = getEditorCode() || "";

			// 500ms마다 코드 변화 체크
			monitorInterval = window.setInterval(checkCodeChange, 500);

			console.log("[오답노트] 코드 모니터링 시작");
		}

		// 모니터링 중지
		function stopMonitoring() {
			if (!isMonitoring) return;

			isMonitoring = false;
			if (monitorInterval) {
				clearInterval(monitorInterval);
				monitorInterval = null;
			}

			console.log("[오답노트] 코드 모니터링 중지");
		}

		// 실행/제출 버튼 이벤트 감지
		function setupButtonListeners() {
			const observer = new MutationObserver(() => {
				// 실행 버튼
				const runBtn = document.querySelector(
					'[data-testid="run-code-button"], .run-btn, button:has(.fa-play)',
				);
				if (runBtn && !runBtn.hasAttribute("data-odap-listener")) {
					runBtn.setAttribute("data-odap-listener", "true");
					runBtn.addEventListener("click", () => {
						browser.runtime.sendMessage({ type: "CODE_RUN" });
					});
				}

				// 제출 버튼
				const submitBtn = document.querySelector(
					'[data-testid="submit-code-button"], .submit-btn, button:has(.fa-check)',
				);
				if (submitBtn && !submitBtn.hasAttribute("data-odap-listener")) {
					submitBtn.setAttribute("data-odap-listener", "true");
					submitBtn.addEventListener("click", () => {
						browser.runtime.sendMessage({ type: "CODE_SUBMIT" });
					});
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}

		// 메시지 리스너
		browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
			switch (message.type) {
				case "GET_PROBLEM_INFO": {
					const problemInfo = extractProblemInfo();
					sendResponse({ type: "PROBLEM_INFO", payload: problemInfo });
					break;
				}
				case "START_CODE_MONITOR":
					startMonitoring();
					sendResponse({ success: true });
					break;
				case "STOP_CODE_MONITOR":
					stopMonitoring();
					sendResponse({ success: true });
					break;
				case "GET_CURRENT_CODE": {
					const code = getEditorCode();
					sendResponse({ code, language: detectLanguage() });
					break;
				}
			}
			return true;
		});

		// 초기화
		setupButtonListeners();
		console.log("[오답노트] 프로그래머스 Content Script 로드됨");
	},
});
