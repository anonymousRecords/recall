import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { updateLiveCodingSettings } from "../../../lib/db/live-coding-settings";
import { queryKeys } from "../../../queries/keys";
import { liveCodingSettingsQueryOptions } from "../../../queries/live-coding-settings";
import type { LiveCodingSettings } from "../../../types";

export function useLiveCodingSettings() {
	const { data: settings } = useSuspenseQuery(liveCodingSettingsQueryOptions());
	const queryClient = useQueryClient();

	const { mutateAsync: saveSettings } = useMutation({
		mutationFn: (updates: Partial<Omit<LiveCodingSettings, "id">>) =>
			updateLiveCodingSettings(updates),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.liveCodingSettings.all,
			});
		},
	});

	const hasApiKey = useMemo(
		() => settings.apiKey.length > 0,
		[settings.apiKey],
	);

	return { settings, hasApiKey, saveSettings };
}
