import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Suspense, useMemo } from "react";
import { Link } from "react-router";
import type { Problem } from "@/src/types";
import { PageLayout, PageHeader } from "../../components/layout";
import {
	EmptyState,
	ProgressIndicator,
} from "../../components/shared";
import {
	Badge,
	Button,
} from "../../components/ui";
import { completeReview } from "../../lib/db/reviews";
import { formatReviewDate, isOverdue } from "../../lib/scheduling";
import { queryKeys } from "../../queries/keys";
import { todayReviewsQueryOptions } from "../../queries/problems";
import { settingsQueryOptions } from "../../queries/settings";

export function DashboardPage() {
	return (
		<Suspense fallback={null}>
			<DashboardPageContent />
		</Suspense>
	);
}

function DashboardPageContent() {
	const { data: problems } = useSuspenseQuery(todayReviewsQueryOptions());
	const { data: settings } = useSuspenseQuery(settingsQueryOptions());
	const queryClient = useQueryClient();

	const { mutateAsync: markAsReviewed } = useMutation({
		mutationFn: (problemId: string) => completeReview(problemId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
		},
	});

	const overdueCount = useMemo(
		() =>
			problems.filter((p) => {
				const reviewDate = new Date(p.nextReviewDate);
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				reviewDate.setHours(0, 0, 0, 0);
				return reviewDate < today;
			}).length,
		[problems],
	);
	const todayCount = problems.length - overdueCount;
	const totalCount = problems.length;

	return (
		<PageLayout
			header={
				<DashboardHeader
					overdueCount={overdueCount}
					todayCount={todayCount}
					totalCount={totalCount}
				/>
			}
		>
			<div className="flex-1 overflow-auto">
				<ReviewProblemList
					problems={problems}
					intervals={settings.reviewIntervals}
					handleReviewComplete={async (problemId: string) => {
						await markAsReviewed(problemId);
					}}
				/>
			</div>
		</PageLayout>
	);
}

interface DashboardHeaderProps {
	overdueCount: number;
	todayCount: number;
	totalCount: number;
}

function DashboardHeader({
	overdueCount,
	todayCount,
	totalCount,
}: DashboardHeaderProps) {
	const parts: string[] = [];
	if (overdueCount > 0) parts.push(`overdue: ${overdueCount}`);
	if (todayCount > 0) parts.push(`scheduled: ${todayCount}`);

	return (
		<PageHeader
			title="today's review"
			subtitle={totalCount === 0 ? "no pending reviews" : parts.join("  ·  ")}
		/>
	);
}

interface ReviewProblemListProps {
	problems: Problem[];
	intervals: number[];
	handleReviewComplete: (problemId: string) => void;
}

function ReviewProblemList({
	problems,
	intervals,
	handleReviewComplete,
}: ReviewProblemListProps) {
	if (problems.length === 0) {
		return (
			<div className="flex h-full items-center justify-center px-4">
				<EmptyState
					command="ls reviews/"
					title="all reviews complete."
					description="no pending reviews found."
					action={
						<Link to="/problems/new">
							<Button variant="secondary" size="sm">
								새 문제 등록
							</Button>
						</Link>
					}
				/>
			</div>
		);
	}

	return (
		<div className="divide-y divide-[#2d2d2d]">
			{problems.map((problem) => {
				const overdue = isOverdue(problem.nextReviewDate);
				return (
					<div
						key={problem.id}
						className="group border-b border-[#2d2d2d] px-4 py-3 transition-colors hover:bg-[#2a2d2e]"
					>
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-1.5">
									<span className="font-mono text-[12px] text-[#569cd6] opacity-0 transition-opacity group-hover:opacity-100">
										▸
									</span>
									<a
										href={problem.link}
										target="_blank"
										rel="noopener noreferrer"
										className="block truncate text-[13px] font-medium text-[#d4d4d4] transition-colors hover:text-[#569cd6]"
									>
										{problem.title}
									</a>
								</div>
								<div className="mt-2 flex flex-wrap items-center gap-2 pl-4">
									<Badge>{problem.site}</Badge>
									<Badge variant={overdue ? "danger" : "info"}>
										{overdue ? `OVERDUE · ${formatReviewDate(problem.nextReviewDate)}` : formatReviewDate(problem.nextReviewDate)}
									</Badge>
								</div>
								<div className="mt-2 pl-4">
									<ProgressIndicator
										currentStage={problem.currentStage}
										totalStages={intervals.length}
									/>
								</div>
							</div>
							<button
								type="button"
								onClick={() => handleReviewComplete(problem.id)}
								className="mt-1 shrink-0 font-mono text-[12px] text-[#858585] transition-colors hover:text-[#4ec9b0]"
							>
								[ ✓ done ]
							</button>
						</div>
					</div>
				);
			})}
		</div>
	);
}
