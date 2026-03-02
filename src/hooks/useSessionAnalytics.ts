import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	calculateScoreAverages,
	calculateScoreTrend,
	calculateTokenStats,
	groupByProvider,
	groupByStyle,
} from "../lib/analytics/aggregate";
import { completedSessionsQueryOptions } from "../queries/sessions";

export function useSessionAnalytics() {
	const { data: sessions } = useSuspenseQuery(completedSessionsQueryOptions());

	const stats = useMemo(
		() => ({
			totalSessions: sessions.length,
			scoreAverages: calculateScoreAverages(sessions),
			tokenStats: calculateTokenStats(sessions),
			providerComparison: groupByProvider(sessions),
			styleComparison: groupByStyle(sessions),
			scoreTrend: calculateScoreTrend(sessions),
			recentSessions: sessions.slice(0, 10),
		}),
		[sessions],
	);

	return { stats };
}
