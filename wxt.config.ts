import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	manifest: {
		name: "Recall",
		description:
			"An AI-powered system for algorithm recall and live coding interviews.",
		permissions: ["storage", "alarms", "activeTab", "tabs", "sidePanel"],
		host_permissions: [
			"https://school.programmers.co.kr/*",
			"https://app.posthog.com/*",
			"https://us.i.posthog.com/*",
		],
		side_panel: {
			default_path: "sidepanel.html",
		},
		action: {
			default_title: "Open Recall",
		},
		web_accessible_resources: [
			{
				resources: ["permission.html"],
				matches: ["<all_urls>"],
			},
		],
	},
});
