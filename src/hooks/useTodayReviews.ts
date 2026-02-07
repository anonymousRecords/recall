import { useCallback, useMemo } from "react";
import { getTodayReviewProblems } from "../lib/db/problems";
import { completeReview } from "../lib/db/reviews";
import type { Problem } from "../types";
import { useAsyncData } from "./useAsyncData";

export function useTodayReviews() {
	const {
		data: problems,
		loading,
		error,
		refetch,
		setData,
	} = useAsyncData<Problem[]>(getTodayReviewProblems, []);

	const markAsReviewed = useCallback(
		async (problemId: string) => {
			const updated = await completeReview(problemId);
			if (updated) {
				setData((prev) => prev.filter((p) => p.id !== problemId));
			}
			return updated;
		},
		[setData],
	);

	const overdueCount = useMemo(() => {
		return problems.filter((p) => {
			const reviewDate = new Date(p.nextReviewDate);
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			reviewDate.setHours(0, 0, 0, 0);
			return reviewDate < today;
		}).length;
	}, [problems]);

	const todayCount = problems.length - overdueCount;

	return useMemo(
		() => ({
			problems,
			loading,
			error,
			markAsReviewed,
			refetch,
			overdueCount,
			todayCount,
			totalCount: problems.length,
		}),
		[
			problems,
			loading,
			error,
			markAsReviewed,
			refetch,
			overdueCount,
			todayCount,
		],
	);
}
