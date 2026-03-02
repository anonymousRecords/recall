import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { Link } from "react-router";
import { PageLayout } from "../../components/layout";
import { DocumentIcon, EmptyState } from "../../components/shared";
import { Button } from "../../components/ui";
import { deleteProblem } from "../../lib/db/problems";
import { queryKeys } from "../../queries/keys";
import { problemsQueryOptions } from "../../queries/problems";
import { settingsQueryOptions } from "../../queries/settings";
import type { Problem, ProblemStatus, Settings } from "../../types";
import { ProblemRow } from "./components/ProblemRow";
import { ProblemsHeader } from "./components/ProblemsHeader";

export type FilterStatus = "all" | ProblemStatus;

export function ProblemsPage() {
	return (
		<Suspense fallback={null}>
			<ProblemsPageContent />
		</Suspense>
	);
}

function ProblemsPageContent() {
	const { data: problems } = useSuspenseQuery(problemsQueryOptions());
	const { data: settings } = useSuspenseQuery(settingsQueryOptions());
	const queryClient = useQueryClient();

	const { mutateAsync: removeProblem } = useMutation({
		mutationFn: (id: string) => deleteProblem(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
		},
	});

	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

	const filteredProblems = useMemo(
		() => getFilteredProblems(problems, search, filterStatus),
		[problems, search, filterStatus],
	);

	return (
		<PageLayout
			header={
				<ProblemsHeader
					search={search}
					setSearch={setSearch}
					filterStatus={filterStatus}
					setFilterStatus={setFilterStatus}
				/>
			}
		>
			<div className="flex flex-1 flex-col overflow-auto">
				<ProblemList
					filteredProblems={filteredProblems}
					settings={settings}
					handleDelete={async (id: string) => {
						if (window.confirm("정말 삭제하시겠습니까?")) {
							await removeProblem(id);
						}
					}}
					search={search}
				/>
			</div>
		</PageLayout>
	);
}

interface ProblemListProps {
	filteredProblems: Problem[];
	settings: Settings;
	handleDelete: (id: string) => void;
	search: string;
}

function ProblemList({
	filteredProblems,
	settings,
	handleDelete,
	search,
}: ProblemListProps) {
	if (filteredProblems.length === 0) {
		return (
			<EmptyState
				className="flex-1"
				icon={<DocumentIcon className="h-10 w-10" />}
				title="문제가 없습니다"
				description={
					search ? "검색 결과가 없습니다" : "새로운 문제를 등록해보세요"
				}
				action={
					!search && (
						<Link to="/problems/new">
							<Button variant="secondary" size="sm">
								새 문제 등록
							</Button>
						</Link>
					)
				}
			/>
		);
	}

	return (
		<div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
			{filteredProblems.map((problem) => (
				<ProblemRow
					key={problem.id}
					problem={problem}
					intervals={settings.reviewIntervals}
					onDelete={handleDelete}
				/>
			))}
		</div>
	);
}

const getFilteredProblems = (
	problems: Problem[],
	search: string,
	filterStatus: FilterStatus,
) => {
	const query = search.toLowerCase();
	return problems.filter((problem) => {
		const matchesSearch =
			problem.title.toLowerCase().includes(query) ||
			problem.site.toLowerCase().includes(query) ||
			problem.tags.some((tag) => tag.toLowerCase().includes(query));

		const matchesStatus =
			filterStatus === "all" || problem.status === filterStatus;
		return matchesSearch && matchesStatus;
	});
};
