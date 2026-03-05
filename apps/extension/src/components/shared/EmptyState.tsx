import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
	command?: string;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	command = "ls",
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col justify-center px-6 py-16 font-mono",
				className,
			)}
		>
			<p className="text-[13px] text-[#858585]">
				<span className="text-[#569cd6]">$</span> {command}
			</p>
			<p className="mt-3 text-[13px] text-[#858585]">(no items)</p>
			<p className="mt-4 text-[13px] text-[#858585]">
				<span className="text-[#569cd6]">&gt;</span> {title}
			</p>
			{description && (
				<p className="mt-1 text-[13px] text-[#858585]">
					<span className="text-[#569cd6]">&gt;</span> {description}
				</p>
			)}
			{action && <div className="mt-5">{action}</div>}
			<span className="mt-4 inline-block h-4 w-2 bg-[#d4d4d4] cursor-blink" />
		</div>
	);
}
