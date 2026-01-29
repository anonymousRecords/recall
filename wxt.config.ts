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
		permissions: ["storage", "alarms"],
	},
});
