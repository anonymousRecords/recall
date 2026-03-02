import { queryOptions } from "@tanstack/react-query";
import { getCompletedInterviews } from "../lib/db/interviews";
import { queryKeys } from "./keys";

export const completedInterviewsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.interviews.completed(),
		queryFn: getCompletedInterviews,
	});
