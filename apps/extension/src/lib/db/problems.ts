import { parse } from "date-fns";
import type {
	CreateProblemInput,
	Problem,
	UpdateProblemInput,
} from "../../types";
import { DEFAULT_INTERVALS, getNextReviewDate } from "../scheduling";
import type { DateString } from "../utils";
import { db } from "./index";
import { getSettings } from "./settings";

export async function createProblem(
	input: CreateProblemInput,
	createdAt?: DateString,
): Promise<Problem> {
	const settings = await getSettings();
	const intervals = settings?.reviewIntervals ?? DEFAULT_INTERVALS;
	const baseDate = createdAt
		? parse(createdAt, "yyyy-MM-dd", new Date())
		: new Date();

	const problem: Problem = {
		id: crypto.randomUUID(),
		...input,
		currentStage: 0,
		nextReviewDate: getNextReviewDate(baseDate, 0, intervals),
		createdAt: createdAt
			? `${createdAt}T00:00:00.000Z`
			: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
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
