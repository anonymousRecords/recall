import {
	addDays,
	format,
	isFuture,
	isPast,
	isToday,
	startOfDay,
} from "date-fns";

export const DEFAULT_INTERVALS = [1, 3, 7, 14, 30];

export function getNextReviewDate(
	fromDate: Date,
	stage: number,
	intervals: number[] = DEFAULT_INTERVALS,
): string {
	const daysToAdd = intervals[stage] ?? intervals[intervals.length - 1];
	const nextDate = addDays(startOfDay(fromDate), daysToAdd);
	return nextDate.toISOString();
}

export function getReviewStageLabel(
	stage: number,
	intervals: number[],
): string {
	if (stage >= intervals.length) {
		return "완료";
	}
	const day = intervals[stage];
	return `${day}일 후`;
}

export function formatReviewDate(dateString: string): string {
	const date = new Date(dateString);

	if (isToday(date)) {
		return "오늘";
	}

	return format(date, "yyyy-MM-dd");
}

export function isOverdue(dateString: string): boolean {
	const date = new Date(dateString);
	return isPast(startOfDay(date)) && !isToday(date);
}

export function isDueToday(dateString: string): boolean {
	return isToday(new Date(dateString));
}

export function isDueFuture(dateString: string): boolean {
	return isFuture(startOfDay(new Date(dateString)));
}

export function getStageProgress(
	currentStage: number,
	totalStages: number,
): number {
	return Math.min((currentStage / totalStages) * 100, 100);
}

export function getRemainingStages(
	currentStage: number,
	intervals: number[],
): number {
	return Math.max(intervals.length - currentStage, 0);
}

export function calculateNextReviewFromStage(
	stage: number,
	intervals: number[] = DEFAULT_INTERVALS,
): Date {
	const daysToAdd = intervals[stage] ?? intervals[intervals.length - 1];
	return addDays(startOfDay(new Date()), daysToAdd);
}
