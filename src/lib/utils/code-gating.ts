const STRUCTURAL_KEYWORDS = [
	"function",
	"for",
	"while",
	"if",
	"else",
	"class",
	"return",
	"switch",
	"try",
	"catch",
	"const",
	"let",
	"var",
];

export const DIFF_THRESHOLD = 50;

export function calculateDiffSize(prev: string, curr: string): number {
	return Math.abs(curr.length - prev.length);
}

function countKeywords(code: string): Map<string, number> {
	const counts = new Map<string, number>();
	for (const keyword of STRUCTURAL_KEYWORDS) {
		const re = new RegExp(`\\b${keyword}\\b`, "g");
		counts.set(keyword, (code.match(re) ?? []).length);
	}
	return counts;
}

export function hasStructuralChange(prev: string, curr: string): boolean {
	const prevCounts = countKeywords(prev);
	const currCounts = countKeywords(curr);
	return STRUCTURAL_KEYWORDS.some(
		(keyword) => prevCounts.get(keyword) !== currCounts.get(keyword),
	);
}

export function shouldTriggerAI(
	prev: string,
	curr: string,
	threshold = DIFF_THRESHOLD,
): boolean {
	return (
		calculateDiffSize(prev, curr) >= threshold &&
		hasStructuralChange(prev, curr)
	);
}
