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
				"border border-[#3e3e42] bg-[#252526] p-4",
				"rounded-none transition-all duration-150 ease-out",
				hover && "hover:border-[#525252] hover:bg-[#2a2d2e]",
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
	return <div className={cn("mb-3", className)}>{children}</div>;
}

interface CardTitleProps {
	children: ReactNode;
	className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
	return (
		<h3
			className={cn(
				"font-mono text-[13px] font-medium text-[#d4d4d4]",
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
		<p className={cn("mt-0.5 font-mono text-[11px] text-[#858585]", className)}>
			{children}
		</p>
	);
}
