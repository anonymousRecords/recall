import type {
	CreateProblemInput,
	Problem,
	ProblemStatus,
	UpdateProblemInput,
} from "../../types";
import { DEFAULT_INTERVALS, getNextReviewDate } from "../scheduling";
import { db } from "./index";
import { getSettings } from "./settings";

export async function createProblem(
	input: CreateProblemInput,
): Promise<Problem> {
	const settings = await getSettings();
	const intervals = settings?.reviewIntervals ?? DEFAULT_INTERVALS;
	const now = new Date().toISOString();

	const problem: Problem = {
		id: crypto.randomUUID(),
		...input,
		currentStage: 0,
		nextReviewDate: getNextReviewDate(new Date(), 0, intervals),
		createdAt: now,
		updatedAt: now,
	};

	await db.problems.add(problem);
	return problem;
}

export async function getProblem(id: string): Promise<Problem | undefined> {
	return db.problems.get(id);
}

export async function getAllProblems(): Promise<Problem[]> {
	return db.problems.orderBy("createdAt").reverse().toArray();
}

export async function getActiveProblems(): Promise<Problem[]> {
	return db.problems.where("status").equals("active").toArray();
}

export async function getTodayReviewProblems(): Promise<Problem[]> {
	const today = new Date();
	today.setHours(23, 59, 59, 999);
	const todayStr = today.toISOString();

	return db.problems
		.where("nextReviewDate")
		.belowOrEqual(todayStr)
		.filter((p) => p.status === "active")
		.toArray();
}

export async function updateProblem(
	id: string,
	input: UpdateProblemInput,
): Promise<Problem | undefined> {
	const current = await db.problems.get(id);
	if (!current) return undefined;

	const updated: Problem = {
		...current,
		...input,
		updatedAt: new Date().toISOString(),
	};

	await db.problems.put(updated);
	return updated;
}

export async function deleteProblem(id: string): Promise<void> {
	await db.problems.delete(id);
	await db.reviews.where("problemId").equals(id).delete();
}

export async function getProblemsByStatus(
	status: ProblemStatus,
): Promise<Problem[]> {
	return db.problems.where("status").equals(status).toArray();
}

export async function searchProblems(query: string): Promise<Problem[]> {
	const lowerQuery = query.toLowerCase();
	return db.problems
		.filter(
			(p) =>
				p.title.toLowerCase().includes(lowerQuery) ||
				p.site.toLowerCase().includes(lowerQuery) ||
				p.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
				p.memo.toLowerCase().includes(lowerQuery),
		)
		.toArray();
}
