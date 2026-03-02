import { queryOptions } from "@tanstack/react-query";
import { getSettings } from "../lib/db/settings";
import { queryKeys } from "./keys";

export const settingsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.settings.all,
		queryFn: getSettings,
	});
