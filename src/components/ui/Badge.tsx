import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
	children: ReactNode;
	variant?: "default" | "success" | "warning" | "danger" | "info";
	className?: string;
}

export function Badge({
	children,
	variant = "default",
	className,
}: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-2xl px-3 py-1.5 text-xs font-medium ring-1 ring-inset",
				"transition-colors duration-150",
				{
					// Default
					"bg-neutral-50 text-neutral-600 ring-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-300 dark:ring-neutral-700":
						variant === "default",
					// Success
					"bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:ring-emerald-800":
						variant === "success",
					// Warning
					"bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-800":
						variant === "warning",
					// Danger
					"bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/30 dark:text-red-400 dark:ring-red-800":
						variant === "danger",
					// Info
					"bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-800":
						variant === "info",
				},
				className,
			)}
		>
			{children}
		</span>
	);
}
