import Dexie from "dexie";
import type { Problem } from "@/types";

const db = new Dexie("OdapNoteDB") as Dexie & {
	problems: Dexie.Table<Problem, string>;
};

db.version(1).stores({
	problems: "id, nextReviewDate, site, status, createdAt",
});

async function getTodayReviewCount(): Promise<number> {
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	const todayStr = today.toISOString();

	const problems = await db.problems
		.where("nextReviewDate")
		.belowOrEqual(todayStr)
		.filter((p) => p.status === "active")
		.toArray();

	return problems.length;
}

async function updateBadge(): Promise<void> {
	const count = await getTodayReviewCount();

	if (count > 0) {
		await browser.action.setBadgeText({ text: count.toString() });
		await browser.action.setBadgeBackgroundColor({ color: "#ef4444" });
	} else {
		await browser.action.setBadgeText({ text: "" });
	}
}

export default defineBackground(() => {
	updateBadge();

	browser.alarms.create("updateBadge", {
		periodInMinutes: 60,
	});

	browser.alarms.onAlarm.addListener((alarm) => {
		if (alarm.name === "updateBadge") {
			updateBadge();
		}
	});

	browser.runtime.onMessage.addListener((message) => {
		if (message.type === "UPDATE_BADGE") {
			updateBadge();
		}
	});
});
