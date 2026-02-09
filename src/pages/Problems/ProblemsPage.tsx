import { useState } from "react";
import { Link } from "react-router";
import { EmptyState } from "../../components/shared";
import { Button } from "../../components/ui";
import { useProblems, useSettings } from "../../hooks";
import type { Problem, ProblemStatus, Settings } from "../../types";
import { ProblemRow } from "./components/ProblemRow";
import { ProblemsHeader } from "./components/ProblemsHeader";

export type FilterStatus = "all" | ProblemStatus;

export function ProblemsPage() {
	const { problems, loading, removeProblem } = useProblems();
	const { settings } = useSettings();

	const [search, setSearch] = useState("");
	const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

	const filteredProblems = useMemo(
		() => getFilteredProblems(problems, search, filterStatus),
		[problems, search, filterStatus],
	);

	if (loading) {
		return <ProblemPageSkeleton />;
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-neutral-950">
			<ProblemsHeader
				search={search}
				setSearch={setSearch}
				filterStatus={filterStatus}
				setFilterStatus={setFilterStatus}
			/>

			<div className="flex-1 overflow-auto">
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
		</div>
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
		<EmptyState
			icon={<DocumentIcon />}
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
		/>;
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

function ProblemPageSkeleton() {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="flex items-center gap-2 text-neutral-400">
				<LoadingSpinner />
				<span className="text-sm">불러오는 중...</span>
			</div>
		</div>
	);
}

function LoadingSpinner() {
	return (
		<svg
			role="img"
			aria-label="LoadingSpinner"
			className="h-4 w-4 animate-spin"
			fill="none"
			viewBox="0 0 24 24"
		>
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

function DocumentIcon() {
	return (
		<svg
			role="img"
			aria-label="Document"
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
				d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
			/>
		</svg>
	);
}
