import type { LiveSession, SessionReport } from "../../types";
import { db } from "./index";

export async function createSession(
	session: Omit<LiveSession, "id">,
): Promise<LiveSession> {
	const id = crypto.randomUUID();
	const newSession: LiveSession = {
		...session,
		id,
	};

	await db.liveSessions.add(newSession);
	return newSession;
}

export async function getSession(id: string): Promise<LiveSession | undefined> {
	return db.liveSessions.get(id);
}

export async function updateSession(
	id: string,
	updates: Partial<Omit<LiveSession, "id">>,
): Promise<LiveSession | undefined> {
	const current = await db.liveSessions.get(id);
	if (!current) return undefined;

	const updated: LiveSession = {
		...current,
		...updates,
	};

	await db.liveSessions.put(updated);
	return updated;
}

export async function completeSession(
	id: string,
	report: SessionReport,
): Promise<LiveSession | undefined> {
	return updateSession(id, {
		status: "completed",
		endedAt: new Date().toISOString(),
		report,
	});
}

export async function getAllSessions(): Promise<LiveSession[]> {
	return db.liveSessions.orderBy("startedAt").reverse().toArray();
}

export async function getRecentSessions(limit = 10): Promise<LiveSession[]> {
	return db.liveSessions.orderBy("startedAt").reverse().limit(limit).toArray();
}

export async function deleteSession(id: string): Promise<void> {
	await db.liveSessions.delete(id);
}
