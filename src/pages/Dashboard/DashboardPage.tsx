import { Link } from "react-router";
import type { Problem } from "@/src/types";
import {
	EmptyState,
	LoadingSpinner,
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
		return <DashboardPageSkeleton />;
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
						복습할 문제가 없습니다
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
					icon={<CheckBadgeIcon />}
					title="모든 복습 완료"
					description="오늘 복습할 문제가 없습니다"
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
											<OpenIcon />
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
									<div className="w-4">
										<CheckIcon />
									</div>
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

function DashboardPageSkeleton() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="flex items-center gap-2 text-neutral-400">
				<LoadingSpinner />
				<span className="text-sm">불러오는 중...</span>
			</div>
		</div>
	);
}

function CheckBadgeIcon() {
	return (
		<svg
			role="img"
			aria-label="Check"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className="h-10 w-10"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
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
			strokeWidth="1.5"
			stroke="currentColor"
			className="h-4 w-4"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
			/>
		</svg>
	);
}

function CheckIcon() {
	return (
		<svg
			role="img"
			aria-label="Check"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
		</svg>
	);
}
