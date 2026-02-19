import type { AIProvider } from "../../types";

const COST_PER_MILLION: Record<
	AIProvider,
	{ input: number; output: number }
> = {
	openai: { input: 0.15, output: 0.6 },
	claude: { input: 0.25, output: 1.25 },
};

export function calculateCost(
	provider: AIProvider,
	promptTokens: number,
	completionTokens: number,
): number {
	const rates = COST_PER_MILLION[provider];
	return (
		(promptTokens / 1_000_000) * rates.input +
		(completionTokens / 1_000_000) * rates.output
	);
}
