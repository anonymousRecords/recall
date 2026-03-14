import {
	addDays,
	isFuture,
	isPast,
	isToday,
	startOfDay,
} from "date-fns";
import { toDateString } from "../utils";

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

export function formatReviewDate(dateString: string): string {
	const date = new Date(dateString);

	if (isToday(date)) {
		return "오늘";
	}

	return toDateString(date);
}

export function isOverdue(dateString: string): boolean {
	const date = new Date(dateString);
	return isPast(startOfDay(date)) && !isToday(date);
}

export function isDueFuture(dateString: string): boolean {
	return isFuture(startOfDay(new Date(dateString)));
}
