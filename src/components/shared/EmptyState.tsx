import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description?: string;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center py-16 text-center",
				className,
			)}
		>
			{icon && (
				<div className="mb-4 text-neutral-300 dark:text-neutral-600">
					{icon}
				</div>
			)}
			<h3 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
				{title}
			</h3>
			{description && (
				<p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
					{description}
				</p>
			)}
			{action && <div className="mt-5">{action}</div>}
		</div>
	);
}
