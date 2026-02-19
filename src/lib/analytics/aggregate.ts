import type { AIProvider, InterviewerStyle, LiveSession } from "../../types";

export interface ScoreAverages {
	understanding: number;
	communication: number;
	codeQuality: number;
	timeManagement: number;
	overall: number;
}

export interface TokenStats {
	totalPromptTokens: number;
	totalCompletionTokens: number;
	totalCost: number;
	avgTokensPerSession: number;
	avgCostPerSession: number;
}

export interface ProviderComparison {
	provider: AIProvider;
	sessionCount: number;
	avgScore: number;
	totalCost: number;
}

export interface StyleComparison {
	style: InterviewerStyle;
	sessionCount: number;
	scores: ScoreAverages;
}

export interface TrendData {
	sessionId: string;
	date: string;
	label: string;
	scores: {
		understanding: number;
		communication: number;
		codeQuality: number;
		timeManagement: number;
	};
	tokenUsage?: {
		totalTokens: number;
		cost: number;
	};
}

function avgScores(sessions: LiveSession[]): ScoreAverages {
	if (sessions.length === 0) {
		return {
			understanding: 0,
			communication: 0,
			codeQuality: 0,
			timeManagement: 0,
			overall: 0,
		};
	}

	let u = 0;
	let c = 0;
	let q = 0;
	let t = 0;
	for (const s of sessions) {
		const sc = s.report!.scores;
		u += sc.understanding;
		c += sc.communication;
		q += sc.codeQuality;
		t += sc.timeManagement;
	}

	const n = sessions.length;
	const understanding = Math.round(u / n);
	const communication = Math.round(c / n);
	const codeQuality = Math.round(q / n);
	const timeManagement = Math.round(t / n);
	const overall = Math.round((u + c + q + t) / (n * 4));

	return { understanding, communication, codeQuality, timeManagement, overall };
}

export function calculateScoreAverages(sessions: LiveSession[]): ScoreAverages {
	return avgScores(sessions);
}

export function calculateTokenStats(sessions: LiveSession[]): TokenStats {
	let totalPromptTokens = 0;
	let totalCompletionTokens = 0;
	let totalCost = 0;

	for (const s of sessions) {
		const tu = s.report?.tokenUsage;
		if (tu) {
			totalPromptTokens += tu.totalPromptTokens;
			totalCompletionTokens += tu.totalCompletionTokens;
			totalCost += tu.estimatedCost;
		}
	}

	const n = sessions.length || 1;
	return {
		totalPromptTokens,
		totalCompletionTokens,
		totalCost,
		avgTokensPerSession: Math.round(
			(totalPromptTokens + totalCompletionTokens) / n,
		),
		avgCostPerSession: totalCost / n,
	};
}

export function groupByProvider(
	sessions: LiveSession[],
): ProviderComparison[] {
	const map = new Map<
		AIProvider,
		{ sessions: LiveSession[]; totalCost: number }
	>();

	for (const s of sessions) {
		const provider = s.report?.tokenUsage?.provider;
		if (!provider) continue;

		let entry = map.get(provider);
		if (!entry) {
			entry = { sessions: [], totalCost: 0 };
			map.set(provider, entry);
		}
		entry.sessions.push(s);
		entry.totalCost += s.report?.tokenUsage?.estimatedCost ?? 0;
	}

	return Array.from(map.entries()).map(([provider, { sessions, totalCost }]) => {
		const avg = avgScores(sessions);
		return {
			provider,
			sessionCount: sessions.length,
			avgScore: avg.overall,
			totalCost,
		};
	});
}

export function groupByStyle(sessions: LiveSession[]): StyleComparison[] {
	const map = new Map<InterviewerStyle, LiveSession[]>();

	for (const s of sessions) {
		const style = s.config.interviewerStyle;
		let arr = map.get(style);
		if (!arr) {
			arr = [];
			map.set(style, arr);
		}
		arr.push(s);
	}

	return Array.from(map.entries()).map(([style, sessions]) => ({
		style,
		sessionCount: sessions.length,
		scores: avgScores(sessions),
	}));
}

export function calculateScoreTrend(sessions: LiveSession[]): TrendData[] {
	return [...sessions].reverse().map((s) => ({
		sessionId: s.id,
		date: s.startedAt,
		label: s.config.problemInfo.title,
		scores: s.report!.scores,
		tokenUsage: s.report?.tokenUsage
			? {
					totalTokens:
						s.report.tokenUsage.totalPromptTokens +
						s.report.tokenUsage.totalCompletionTokens,
					cost: s.report.tokenUsage.estimatedCost,
				}
			: undefined,
	}));
}
