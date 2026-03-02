import type { InterviewReport, LiveInterview } from "../../types";
import { db } from "./index";

export async function createInterview(
	interview: Omit<LiveInterview, "id">,
): Promise<LiveInterview> {
	const id = crypto.randomUUID();
	const newInterview: LiveInterview = { ...interview, id };
	await db.liveInterviews.add(newInterview);
	return newInterview;
}

export async function getInterview(
	id: string,
): Promise<LiveInterview | undefined> {
	return db.liveInterviews.get(id);
}

export async function updateInterview(
	id: string,
	updates: Partial<Omit<LiveInterview, "id">>,
): Promise<LiveInterview | undefined> {
	const current = await db.liveInterviews.get(id);
	if (!current) return undefined;

	const updated: LiveInterview = { ...current, ...updates };
	await db.liveInterviews.put(updated);
	return updated;
}

export async function completeInterview(
	id: string,
	report: InterviewReport,
): Promise<LiveInterview | undefined> {
	return updateInterview(id, {
		status: "completed",
		endedAt: new Date().toISOString(),
		report,
	});
}

export async function getAllInterviews(): Promise<LiveInterview[]> {
	return db.liveInterviews.orderBy("startedAt").reverse().toArray();
}

export async function getRecentInterviews(
	limit = 10,
): Promise<LiveInterview[]> {
	return db.liveInterviews
		.orderBy("startedAt")
		.reverse()
		.limit(limit)
		.toArray();
}

export async function deleteInterview(id: string): Promise<void> {
	await db.liveInterviews.delete(id);
}

export async function getCompletedInterviews(): Promise<LiveInterview[]> {
	const all = await db.liveInterviews
		.orderBy("startedAt")
		.reverse()
		.toArray();
	return all.filter((s) => s.status === "completed" && s.report);
}

export async function getInterviewReports(
	limit?: number,
): Promise<LiveInterview[]> {
	const completed = await getCompletedInterviews();
	return limit ? completed.slice(0, limit) : completed;
}
