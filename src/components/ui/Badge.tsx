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
				"inline-flex items-center font-mono text-[11px] font-medium",
				"rounded-none transition-colors duration-150",
				{
					"text-[#ce9178]": variant === "default",
					"text-[#4ec9b0]": variant === "success",
					"text-[#dcdcaa]": variant === "warning",
					"text-[#f44747]": variant === "danger",
					"text-[#569cd6]": variant === "info",
				},
				className,
			)}
		>
			[{children}]
		</span>
	);
}
