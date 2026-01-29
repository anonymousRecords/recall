import { v4 as uuidv4 } from "uuid";
import type { Problem, Review } from "@/types";
import { DEFAULT_INTERVALS, getNextReviewDate } from "../scheduling";
import { db } from "./index";
import { getSettings } from "./settings";

export async function createReview(
	problem: Problem,
	scheduledDate: string,
): Promise<Review> {
	const review: Review = {
		id: uuidv4(),
		problemId: problem.id,
		stage: problem.currentStage,
		completedAt: new Date().toISOString(),
		scheduledDate,
	};

	await db.reviews.add(review);
	return review;
}

export async function completeReview(
	problemId: string,
): Promise<Problem | null> {
	const problem = await db.problems.get(problemId);
	if (!problem) return null;

	const settings = await getSettings();
	const intervals = settings?.reviewIntervals ?? DEFAULT_INTERVALS;
	const scheduledDate = problem.nextReviewDate;

	await createReview(problem, scheduledDate);

	const nextStage = problem.currentStage + 1;
	const isCompleted = nextStage >= intervals.length;

	const updates: Partial<Problem> = {
		currentStage: nextStage,
		status: isCompleted ? "completed" : "active",
		nextReviewDate: isCompleted
			? problem.nextReviewDate
			: getNextReviewDate(new Date(), nextStage, intervals),
		updatedAt: new Date().toISOString(),
	};

	await db.problems.update(problemId, updates);
	return db.problems.get(problemId) as Promise<Problem>;
}

export async function getReviewsForProblem(
	problemId: string,
): Promise<Review[]> {
	return db.reviews.where("problemId").equals(problemId).toArray();
}

export async function getAllReviews(): Promise<Review[]> {
	return db.reviews.orderBy("completedAt").reverse().toArray();
}
