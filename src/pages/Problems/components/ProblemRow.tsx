import { Link } from "react-router";
import { ProgressIndicator } from "../../../components/shared";
import { Badge } from "../../../components/ui";
import {
	formatReviewDate,
	isDueFuture,
	isOverdue,
} from "../../../lib/scheduling";
import type { Problem } from "../../../types";

interface ProblemRowProps {
	problem: Problem;
	intervals: number[];
	onDelete: (id: string) => void;
}

export function ProblemRow({ problem, intervals, onDelete }: ProblemRowProps) {
	const overdue = isOverdue(problem.nextReviewDate);
	const future = isDueFuture(problem.nextReviewDate);

	return (
		<div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<Link
						to={`/problems/${problem.id}`}
						className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 block truncate"
					>
						{problem.title}
					</Link>
					<div className="flex items-center gap-2 mt-1">
						<Badge>{problem.site}</Badge>
						{getStatusBadge({ problem, overdue, future })}
						{problem.difficulty && (
							<Badge variant="default">{problem.difficulty}</Badge>
						)}
					</div>
					{problem.tags.length > 0 && (
						<div className="flex flex-wrap gap-1 mt-1.5">
							{problem.tags.map((tag) => (
								<span
									key={tag}
									className="text-xs text-gray-500 dark:text-gray-400"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>
				<div className="flex flex-col items-end gap-1">
					<ProgressIndicator
						currentStage={problem.currentStage}
						totalStages={intervals.length}
					/>
					<div className="flex items-center gap-1">
						<a
							href={problem.link}
							target="_blank"
							rel="noopener noreferrer"
							className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
							title="문제 열기"
						>
							<OpenIcon />
						</a>
						<button
							type="button"
							onClick={() => onDelete(problem.id)}
							className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
							title="삭제"
						>
							<TrashIcon />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

const getStatusBadge = ({
	problem,
	overdue,
	future,
}: {
	problem: Problem;
	overdue: boolean;
	future: boolean;
}) => {
	if (problem.status === "completed") {
		return <Badge variant="success">완료</Badge>;
	}
	if (problem.status === "archived") {
		return <Badge>보관</Badge>;
	}
	if (overdue) {
		return (
			<Badge variant="danger">{formatReviewDate(problem.nextReviewDate)}</Badge>
		);
	}
	if (future) {
		return (
			<Badge variant="info">{formatReviewDate(problem.nextReviewDate)}</Badge>
		);
	}
	return <Badge variant="warning">오늘</Badge>;
};

function TrashIcon() {
	return (
		<svg
			role="img"
			aria-label="Trash"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			width={16}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
			/>
		</svg>
	);
}

function OpenIcon() {
	return (
		<svg
			role="img"
			aria-label="Open"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			width={16}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
			/>
		</svg>
	);
}
