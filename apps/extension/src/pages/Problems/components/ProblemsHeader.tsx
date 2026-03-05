import { Link } from "react-router";
import { PageHeader } from "../../../components/layout";
import { Button } from "../../../components/ui";
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
		<>
			<PageHeader
				title="problems"
				action={
					<Link to="/problems/new">
						<Button size="sm">[ + add ]</Button>
					</Link>
				}
			/>

			<div className="space-y-3 px-4 py-3">
				<SearchBar search={search} setSearch={setSearch} />
				<StatusFilterGroup
					filterStatus={filterStatus}
					setFilterStatus={setFilterStatus}
				/>
			</div>
		</>
	);
}

interface SearchBarProps {
	search: string;
	setSearch: (search: string) => void;
}

function SearchBar({ search, setSearch }: SearchBarProps) {
	return (
		<div className="flex items-center border border-[#3e3e42] bg-[#1e1e1e] transition-colors focus-within:border-[#569cd6]">
			<span className="pl-3 font-mono text-[12px] text-[#569cd6]">&gt;</span>
			<input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="search..."
				className="h-8 w-full bg-transparent px-2 font-mono text-[13px] text-[#d4d4d4] placeholder:text-[#858585] focus:outline-none"
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
				"rounded-none border px-3 py-1 font-mono text-[11px] transition-all duration-150",
				active
					? "border-[#569cd6] bg-[#094771] text-[#d4d4d4]"
					: "border-[#3e3e42] bg-transparent text-[#858585] hover:border-[#525252] hover:text-[#d4d4d4]",
			)}
		>
			{children}
		</button>
	);
}
