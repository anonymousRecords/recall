import { Link } from "react-router";
import { EmptyState, ProgressIndicator } from "../../components/shared";
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
	const intervals = settings.reviewIntervals;

	const handleReviewComplete = async (problemId: string) => {
		await markAsReviewed(problemId);
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="flex items-center gap-2 text-neutral-400">
					<LoadingSpinner />
					<span className="text-sm">불러오는 중...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-neutral-950">
			<DashboardHeader
				overdueCount={overdueCount}
				todayCount={todayCount}
				totalCount={totalCount}
			/>

			<div className="flex-1 overflow-auto">
				{problems.length === 0 ? (
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
				) : (
					<div className="space-y-3 p-4">
						{problems.map((problem) => {
							const overdue = isOverdue(problem.nextReviewDate);
							return (
								<Card key={problem.id} hover className="group">
									<CardHeader className="mb-3 pb-0">
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0 flex-1">
												<CardTitle className="truncate">
													{problem.title}
												</CardTitle>
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
										<div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
											<div className="flex items-center gap-2.5">
												<span className="text-xs tabular-nums text-neutral-400">
													{problem.currentStage + 1}/{intervals.length}
												</span>
												<ProgressIndicator
													currentStage={problem.currentStage}
													totalStages={intervals.length}
												/>
											</div>
											<div className="flex items-center gap-2">
												<a
													href={problem.link}
													target="_blank"
													rel="noopener noreferrer"
													className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
												>
													문제 보기
												</a>
												<Button
													size="sm"
													onClick={() => handleReviewComplete(problem.id)}
												>
													완료
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
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

function LoadingSpinner() {
	return (
		<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
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
