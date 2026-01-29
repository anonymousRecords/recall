import { Link } from "react-router";
import { Button, Input } from "../../../components/ui";
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
		<header className="border-b border-gray-200 dark:border-gray-800">
			<div className="border-b flex items-center justify-between border-gray-200 dark:border-gray-800 px-4 py-3">
				<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
					문제 목록
				</h1>
				<Link to="/problems/new">
					<Button size="sm">추가</Button>
				</Link>
			</div>
			<div className="px-4 py-3">
				<Input
					placeholder="검색..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="mb-2"
				/>
				<div className="flex gap-2">
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
			</div>
		</header>
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
			className={`px-3 py-1 text-xs rounded-full transition-colors ${
				active
					? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
					: "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
			}`}
		>
			{children}
		</button>
	);
}
