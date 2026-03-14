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
		<div className="group border-b border-[#2d2d2d] px-4 py-3 transition-colors duration-150 hover:bg-[#2a2d2e]">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-1.5">
						<span className="font-mono text-[12px] text-[#569cd6] opacity-0 transition-opacity group-hover:opacity-100">
							▸
						</span>
						<Link
							to={`/problems/${problem.id}`}
							className="block truncate text-[13px] font-medium text-[#d4d4d4] transition-colors hover:text-[#569cd6]"
						>
							{problem.title}
						</Link>
					</div>

					<div className="mt-2 flex flex-wrap items-center gap-2 pl-4">
						<Badge>{problem.site}</Badge>
						{getStatusBadge({ problem, overdue, future })}
						{problem.difficulty && <Badge>{problem.difficulty}</Badge>}
					</div>

					{problem.tags.length > 0 && (
						<div className="mt-1.5 flex flex-wrap gap-2 pl-4">
							{problem.tags.map((tag) => (
								<span
									key={tag}
									className="font-mono text-[11px] text-[#858585]"
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
					<div className="flex items-center gap-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
						<a
							href={problem.link}
							target="_blank"
							rel="noopener noreferrer"
							className="font-mono text-[11px] text-[#858585] transition-colors hover:text-[#569cd6]"
						>
							[ ↗ ]
						</a>
						<button
							type="button"
							onClick={() => onDelete(problem.id)}
							className="font-mono text-[11px] text-[#858585] transition-colors hover:text-[#f44747]"
						>
							[ × ]
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

interface GetStatusBadgeProps {
	problem: Problem;
	overdue: boolean;
	future: boolean;
}

const getStatusBadge = ({ problem, overdue, future }: GetStatusBadgeProps) => {
	if (problem.status === "completed") {
		return <Badge variant="success">DONE</Badge>;
	}

	if (problem.status === "archived") {
		return <Badge>ARCHIVED</Badge>;
	}

	if (overdue) {
		return (
			<Badge variant="danger">
				OVERDUE · {formatReviewDate(problem.nextReviewDate)}
			</Badge>
		);
	}

	if (future) {
		return (
			<Badge variant="info">{formatReviewDate(problem.nextReviewDate)}</Badge>
		);
	}

	return <Badge variant="warning">TODAY</Badge>;
};
