import { Link } from "react-router";
import type { Problem } from "@/src/types";
import {
	CheckBadgeIcon,
	CheckIcon,
	EmptyState,
	OpenIcon,
	ProgressIndicator,
} from "../../components/shared";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../../components/ui";
import { useSettings, useTodayReviews } from "../../hooks";
import { formatReviewDate, isOverdue } from "../../lib/scheduling";

export function DashboardPage() {
	const {
		problems,
		loading,
		markAsReviewed,
		overdueCount,
		todayCount,
		totalCount,
	} = useTodayReviews();
	const { settings } = useSettings();

	if (loading) {
		return null;
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-neutral-950">
			<DashboardHeader
				overdueCount={overdueCount}
				todayCount={todayCount}
				totalCount={totalCount}
			/>

			<div className="flex-1 overflow-auto">
				<ReviewProblemList
					problems={problems}
					intervals={settings.reviewIntervals}
					handleReviewComplete={async (problemId: string) => {
						await markAsReviewed(problemId);
					}}
				/>
			</div>
		</div>
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
	return (
		<header className="border-b border-neutral-200/60 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950">
			<h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
				오늘의 복습
			</h1>
			<div className="mt-1.5 flex items-center gap-3 text-sm">
				{overdueCount > 0 && (
					<span className="font-medium text-red-600 dark:text-red-400">
						밀린 복습 {overdueCount}개
					</span>
				)}
				{todayCount > 0 && (
					<span className="text-neutral-500 dark:text-neutral-400">
						오늘 복습 {todayCount}개
					</span>
				)}
				{totalCount === 0 && (
					<span className="text-neutral-400 dark:text-neutral-500">
						복습할 문제가 없어요
					</span>
				)}
			</div>
		</header>
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
					icon={<CheckBadgeIcon className="h-10 w-10" />}
					title="모든 복습 완료"
					description="오늘 복습할 문제가 없어요"
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
		<div className="space-y-3 p-4">
			{problems.map((problem) => {
				const overdue = isOverdue(problem.nextReviewDate);

				return (
					<Card key={problem.id} className="group">
						<CardHeader className="mb-3 pb-0">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0 flex-1">
									<div className="flex items-center justify-between">
										<CardTitle className="truncate">{problem.title}</CardTitle>

										<a
											href={problem.link}
											target="_blank"
											rel="noopener noreferrer"
											className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
											title="문제 열기"
										>
											<OpenIcon className="h-4 w-4" />
										</a>
									</div>
									<div className="mt-2 flex flex-wrap items-center gap-1.5">
										<Badge variant={overdue ? "danger" : "info"}>
											{formatReviewDate(problem.nextReviewDate)}
										</Badge>
										<Badge>{problem.site}</Badge>
									</div>
								</div>
							</div>
						</CardHeader>

						<CardContent>
							<div className="flex items-center justify-between pt-3">
								<div className="flex items-center gap-2.5">
									<span className="text-xs tabular-nums text-neutral-400">
										{problem.currentStage + 1}/{intervals.length}
									</span>
									<ProgressIndicator
										currentStage={problem.currentStage}
										totalStages={intervals.length}
									/>
								</div>

								<Button
									size="sm"
									onClick={() => handleReviewComplete(problem.id)}
								>
									<CheckIcon className="h-4 w-4" />
									복습 완료
								</Button>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
