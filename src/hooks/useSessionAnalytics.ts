import { useMemo } from "react";
import {
	calculateScoreAverages,
	calculateScoreTrend,
	calculateTokenStats,
	groupByProvider,
	groupByStyle,
} from "../lib/analytics/aggregate";
import { getCompletedSessions } from "../lib/db/sessions";
import { useAsyncData } from "./useAsyncData";

export function useSessionAnalytics() {
	const { data: sessions, loading } = useAsyncData(getCompletedSessions, []);

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

	return { stats, loading };
}
