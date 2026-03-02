import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { completeReview } from "../lib/db/reviews";
import { queryKeys } from "../queries/keys";
import { todayReviewsQueryOptions } from "../queries/problems";

export function useTodayReviews() {
	const { data: problems } = useSuspenseQuery(todayReviewsQueryOptions());
	const queryClient = useQueryClient();

	const { mutateAsync: markAsReviewed } = useMutation({
		mutationFn: (problemId: string) => completeReview(problemId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
		},
	});

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

	return {
		problems,
		markAsReviewed,
		overdueCount,
		todayCount,
		totalCount: problems.length,
	};
}
