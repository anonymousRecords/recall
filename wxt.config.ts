import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
	modules: ["@wxt-dev/module-react"],
	vite: () => ({
		plugins: [tailwindcss()],
	}),
	manifest: {
		name: "오답노트",
		description: "에빙하우스 망각곡선 기반 복습 관리",
		permissions: ["storage", "alarms", "activeTab", "tabs", "sidePanel"],
		host_permissions: ["https://school.programmers.co.kr/*"],
		side_panel: {
			default_path: "sidepanel.html",
		},
		action: {
			default_title: "오답노트 열기",
		},
		web_accessible_resources: [
			{
				resources: ["permission.html"],
				matches: ["<all_urls>"],
			},
		],
	},
});
