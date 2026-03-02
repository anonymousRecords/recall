import { queryOptions } from "@tanstack/react-query";
import { getLiveCodingSettings } from "../lib/db/live-coding-settings";
import { queryKeys } from "./keys";

export const liveCodingSettingsQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.liveCodingSettings.all,
		queryFn: getLiveCodingSettings,
	});
