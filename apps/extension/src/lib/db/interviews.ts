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

export async function updateInterview(
	id: string,
	updates: Partial<Omit<LiveInterview, "id">>,
): Promise<LiveInterview | undefined> {
	const current = await db.liveInterviews.get(id);

	if (!current) {
		return;
	}

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

export async function getCompletedInterviews(): Promise<LiveInterview[]> {
	const allInterviews = await db.liveInterviews
		.orderBy("startedAt")
		.reverse()
		.toArray();

	return allInterviews.filter(
		(interview) => interview.status === "completed" && interview.report,
	);
}
