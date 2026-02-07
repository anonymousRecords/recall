export type ProblemStatus = "active" | "archived" | "completed";
export type Theme = "light" | "dark" | "system";

export interface Problem {
	id: string;
	title: string;
	link: string;
	site: string;
	difficulty?: string;
	tags: string[];
	memo: string;
	status: ProblemStatus;
	currentStage: number;
	nextReviewDate: string;
	createdAt: string;
	updatedAt: string;
}

export interface Review {
	id: string;
	problemId: string;
	stage: number;
	completedAt: string;
	scheduledDate: string;
}

export interface Settings {
	id: "user-settings";
	reviewIntervals: number[];
	theme: Theme;
}

export type CreateProblemInput = Omit<
	Problem,
	"id" | "currentStage" | "nextReviewDate" | "createdAt" | "updatedAt"
>;

export type UpdateProblemInput = Partial<
	Omit<Problem, "id" | "createdAt" | "updatedAt">
>;

export * from "./live-coding";
