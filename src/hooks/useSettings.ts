import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { updateSettings } from "../lib/db/settings";
import { queryKeys } from "../queries/keys";
import { settingsQueryOptions } from "../queries/settings";

export function useSettings() {
	const { data: settings } = useSuspenseQuery(settingsQueryOptions());
	const queryClient = useQueryClient();

	const { mutateAsync: saveSettings } = useMutation({
		mutationFn: updateSettings,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
		},
	});

	return { settings, saveSettings };
}
