import { Link } from "react-router";
import { SearchIcon } from "../../../components/shared";
import { Button, Input } from "../../../components/ui";
import { cn } from "../../../lib/utils";
import type { FilterStatus } from "../ProblemsPage";

interface ProblemsHeaderProps {
	search: string;
	setSearch: (search: string) => void;
	filterStatus: FilterStatus;
	setFilterStatus: (filterStatus: FilterStatus) => void;
}

export function ProblemsHeader({
	search,
	setSearch,
	filterStatus,
	setFilterStatus,
}: ProblemsHeaderProps) {
	return (
		<header className="border-b border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-950">
			<div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4 dark:border-neutral-800/50">
				<h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
					문제 목록
				</h1>
				<Link to="/problems/new">
					<Button size="sm">추가</Button>
				</Link>
			</div>

			<div className="space-y-3 px-4 py-3">
				<SearchBar search={search} setSearch={setSearch} />
				<StatusFilterGroup
					filterStatus={filterStatus}
					setFilterStatus={setFilterStatus}
				/>
			</div>
		</header>
	);
}

interface SearchBarProps {
	search: string;
	setSearch: (search: string) => void;
}

function SearchBar({ search, setSearch }: SearchBarProps) {
	return (
		<div className="relative">
			<SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
			<Input
				placeholder="검색..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="pl-9"
			/>
		</div>
	);
}

interface StatusFilterGroupProps {
	filterStatus: "all" | "active" | "completed" | "archived";
	setFilterStatus: (
		status: "all" | "active" | "completed" | "archived",
	) => void;
}

function StatusFilterGroup({
	filterStatus,
	setFilterStatus,
}: StatusFilterGroupProps) {
	return (
		<div className="flex gap-1.5">
			<FilterButton
				active={filterStatus === "all"}
				onClick={() => setFilterStatus("all")}
			>
				전체
			</FilterButton>
			<FilterButton
				active={filterStatus === "active"}
				onClick={() => setFilterStatus("active")}
			>
				진행중
			</FilterButton>
			<FilterButton
				active={filterStatus === "completed"}
				onClick={() => setFilterStatus("completed")}
			>
				완료
			</FilterButton>
			<FilterButton
				active={filterStatus === "archived"}
				onClick={() => setFilterStatus("archived")}
			>
				보관
			</FilterButton>
		</div>
	);
}

interface FilterButtonProps {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-150",
				active
					? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
					: "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-300",
			)}
		>
			{children}
		</button>
	);
}
