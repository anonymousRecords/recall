const DIFF_THRESHOLD = 50;

interface ShouldTriggerAIOptions {
	prev: string;
	curr: string;
	threshold?: number;
}

export function shouldTriggerAI({
	prev,
	curr,
	threshold = DIFF_THRESHOLD,
}: ShouldTriggerAIOptions): boolean {
	return (
		calculateDiffSize(prev, curr) >= threshold &&
		hasStructuralChange(prev, curr)
	);
}

function calculateDiffSize(prev: string, curr: string): number {
	return Math.abs(curr.length - prev.length);
}

function hasStructuralChange(prev: string, curr: string): boolean {
	const prevKeywordCountMap = buildKeywordCountMap(prev);
	const currKeywordCountMap = buildKeywordCountMap(curr);

	return STRUCTURAL_KEYWORDS.some(
		(keyword) =>
			prevKeywordCountMap.get(keyword) !== currKeywordCountMap.get(keyword),
	);
}

function buildKeywordCountMap(code: string): Map<string, number> {
	const keywordCountMap = new Map<string, number>();

	for (const keyword of STRUCTURAL_KEYWORDS) {
		const keywordPattern = new RegExp(`\\b${keyword}\\b`, "g");
		keywordCountMap.set(keyword, (code.match(keywordPattern) ?? []).length);
	}

	return keywordCountMap;
}

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
] as const;
