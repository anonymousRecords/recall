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
				<div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<DashboardHeader
				overdueCount={overdueCount}
				todayCount={todayCount}
				totalCount={totalCount}
			/>

			<div className="flex-1 overflow-auto p-4 flex items-center justify-center">
				{problems.length === 0 ? (
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
				) : (
					<div className="space-y-3">
						{problems.map((problem) => {
							const overdue = isOverdue(problem.nextReviewDate);
							return (
								<Card key={problem.id} className="relative">
									<CardHeader className="mb-2 pb-0">
										<div className="flex items-start justify-between gap-2">
											<div className="flex-1 min-w-0">
												<CardTitle className="text-base truncate">
													{problem.title}
												</CardTitle>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant={overdue ? "danger" : "info"}>
														{formatReviewDate(problem.nextReviewDate)}
													</Badge>
													<Badge>{problem.site}</Badge>
												</div>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<div className="flex items-center justify-between mt-2">
											<div className="flex items-center gap-2">
												<span className="text-xs text-gray-500 dark:text-gray-400">
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
													className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
		<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-4">
			<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
				오늘의 복습
			</h1>
			<div className="gap-3 text-sm">
				{overdueCount > 0 && (
					<span className="text-red-600 dark:text-red-400">
						밀린 복습 {overdueCount}개
					</span>
				)}
				{todayCount > 0 && (
					<span className="text-gray-600 dark:text-gray-400">
						오늘 복습 {todayCount}개
					</span>
				)}
				{totalCount === 0 && (
					<span className="text-gray-500 dark:text-gray-400">
						복습할 문제가 없습니다
					</span>
				)}
			</div>
		</header>
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
			stroke-width="1.5"
			stroke="currentColor"
			width={32}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
			/>
		</svg>
	);
}
