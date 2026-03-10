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
