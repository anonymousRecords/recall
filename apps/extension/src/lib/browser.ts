export async function getActiveTab(): Promise<Browser.tabs.Tab> {
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

	if (!tab) {
		throw new Error("활성 탭을 찾을 수 없음");
	}

	if (!tab.id) {
		throw new Error("활성 탭의 ID를 찾을 수 없음");
	}

	return tab;
}
