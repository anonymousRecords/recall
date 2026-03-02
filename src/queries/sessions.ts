import { queryOptions } from "@tanstack/react-query";
import { getCompletedSessions } from "../lib/db/sessions";
import { queryKeys } from "./keys";

export const completedSessionsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.sessions.completed(),
		queryFn: getCompletedSessions,
	});
