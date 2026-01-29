import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]): string {
	return clsx(inputs);
}

export function extractSiteFromUrl(url: string): string {
	try {
		const { hostname } = new URL(url);

		const siteMap: Record<string, string> = {
			"programmers.co.kr": "프로그래머스",
			"www.greatfrontend.com": "GreatFrontend",
			"greatfrontend.com": "GreatFrontend",
			"leetcode.com": "LeetCode",
			"www.leetcode.com": "LeetCode",
			"www.acmicpc.net": "백준",
			"acmicpc.net": "백준",
			"school.programmers.co.kr": "프로그래머스",
			"swexpertacademy.com": "SWEA",
			"www.swexpertacademy.com": "SWEA",
			"codeforces.com": "Codeforces",
			"www.codeforces.com": "Codeforces",
			"atcoder.jp": "AtCoder",
			"www.atcoder.jp": "AtCoder",
		};

		return siteMap[hostname] ?? hostname;
	} catch {
		return "기타";
	}
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	delay: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn(...args), delay);
	};
}

export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("ko-KR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function getDaysUntil(dateString: string): number {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const targetDate = new Date(dateString);
	targetDate.setHours(0, 0, 0, 0);
	const diffTime = targetDate.getTime() - today.getTime();
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
