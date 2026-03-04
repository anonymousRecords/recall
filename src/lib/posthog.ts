import posthog from "posthog-js/dist/module.slim.no-external";

let isInitialized = false;

export function initPostHog() {
	if (isInitialized) return;

	const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
	const host =
		import.meta.env.VITE_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

	if (!key) return;

	posthog.init(key, {
		api_host: host,
		persistence: "localStorage",
		autocapture: false,
		capture_pageview: false,
		disable_session_recording: true,
		disable_external_dependency_loading: true,
		loaded: (ph) => {
			ph.capture("$pageview");
		},
	});

	isInitialized = true;
}

export { posthog };
