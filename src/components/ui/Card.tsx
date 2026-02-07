import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
	children: ReactNode;
	className?: string;
	hover?: boolean;
}

export function Card({ children, className, hover = false }: CardProps) {
	return (
		<div
			className={cn(
				"rounded-xl border border-neutral-200/80 bg-white p-4",
				"dark:border-neutral-800 dark:bg-neutral-900/50",
				"transition-all duration-150 ease-out",
				hover &&
					"hover:border-neutral-300 hover:shadow-sm dark:hover:border-neutral-700",
				className,
			)}
		>
			{children}
		</div>
	);
}

interface CardHeaderProps {
	children: ReactNode;
	className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
	return <div className={cn("mb-4", className)}>{children}</div>;
}

interface CardTitleProps {
	children: ReactNode;
	className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
	return (
		<h3
			className={cn(
				"text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-50",
				className,
			)}
		>
			{children}
		</h3>
	);
}

interface CardContentProps {
	children: ReactNode;
	className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
	return <div className={cn(className)}>{children}</div>;
}

interface CardDescriptionProps {
	children: ReactNode;
	className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
	return (
		<p
			className={cn(
				"mt-1 text-sm text-neutral-500 dark:text-neutral-400",
				className,
			)}
		>
			{children}
		</p>
	);
}
