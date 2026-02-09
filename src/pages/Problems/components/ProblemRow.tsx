import { Link } from "react-router";
import {
	OpenIcon,
	ProgressIndicator,
	TrashIcon,
} from "../../../components/shared";
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
		<div className="group px-4 py-3 transition-colors duration-150 hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<Link
						to={`/problems/${problem.id}`}
						className="block truncate text-sm font-medium text-neutral-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
					>
						{problem.title}
					</Link>

					<div className="mt-4 flex flex-wrap items-center gap-1.5">
						<Badge>{problem.site}</Badge>
						{getStatusBadge({ problem, overdue, future })}
						{problem.difficulty && (
							<Badge variant="default">{problem.difficulty}</Badge>
						)}
					</div>

					{problem.tags.length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1.5">
							{problem.tags.map((tag) => (
								<span
									key={tag}
									className="text-xs text-neutral-400 dark:text-neutral-500"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>

				<div className="flex flex-col items-end gap-2">
					<ProgressIndicator
						currentStage={problem.currentStage}
						totalStages={intervals.length}
					/>
					<div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
						<a
							href={problem.link}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
							title="문제 열기"
						>
							<OpenIcon className="h-4 w-4" />
						</a>
						<button
							type="button"
							onClick={() => onDelete(problem.id)}
							className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
							title="삭제"
						>
							<TrashIcon className="h-4 w-4" />
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
