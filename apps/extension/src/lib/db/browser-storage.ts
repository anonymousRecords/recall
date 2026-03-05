export async function getStorageItem<T>(key: string, fallback: T): Promise<T> {
	try {
		const result = await browser.storage.local.get(key);
		return (result[key] as T) ?? fallback;
	} catch {
		console.error(`[Recall] storage.get 실패: ${key}`);
		return fallback;
	}
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
	try {
		await browser.storage.local.set({ [key]: value });
	} catch {
		console.error(`[Recall] storage.set 실패: ${key}`);
	}
}

export async function removeStorageItem(key: string): Promise<void> {
	try {
		await browser.storage.local.remove(key);
	} catch {
		console.error(`[Recall] storage.remove 실패: ${key}`);
	}
}
