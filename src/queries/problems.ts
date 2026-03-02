import { queryOptions } from "@tanstack/react-query";
import {
	getAllProblems,
	getProblem,
	getTodayReviewProblems,
} from "../lib/db/problems";
import { queryKeys } from "./keys";

export const problemsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.problems.lists(),
		queryFn: getAllProblems,
	});

export const todayReviewsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.problems.todayReviews(),
		queryFn: getTodayReviewProblems,
	});

export const problemDetailQueryOptions = (id: string) =>
	queryOptions({
		queryKey: queryKeys.problems.detail(id),
		queryFn: () => getProblem(id),
		enabled: !!id,
	});
