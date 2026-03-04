import posthog from "posthog-js";

export function initPostHog() {
	const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
	const host =
		import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

	if (!key) return;

	posthog.init(key, {
		api_host: host,
		persistence: "localStorage",
		autocapture: false,
	});
}

export { posthog };
