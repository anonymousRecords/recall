import { useCallback, useEffect, useState } from "react";
import { getTodayReviewProblems } from "../lib/db/problems";
import { completeReview } from "../lib/db/reviews";
import type { Problem } from "../types";

export function useTodayReviews() {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchTodayReviews = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getTodayReviewProblems();
			setProblems(data);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to fetch reviews"),
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchTodayReviews();
	}, [fetchTodayReviews]);

	const markAsReviewed = useCallback(async (problemId: string) => {
		const updated = await completeReview(problemId);
		if (updated) {
			if (updated.status === "completed") {
				setProblems((prev) => prev.filter((p) => p.id !== problemId));
			} else {
				setProblems((prev) => prev.filter((p) => p.id !== problemId));
			}
		}
		return updated;
	}, []);

	const overdueCount = problems.filter((p) => {
		const reviewDate = new Date(p.nextReviewDate);
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		reviewDate.setHours(0, 0, 0, 0);
		return reviewDate < today;
	}).length;

	const todayCount = problems.length - overdueCount;

	return {
		problems,
		loading,
		error,
		markAsReviewed,
		refetch: fetchTodayReviews,
		overdueCount,
		todayCount,
		totalCount: problems.length,
	};
}
