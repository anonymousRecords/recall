import type { ReactNode } from "react";

interface PageLayoutProps {
	header: ReactNode;
	children: ReactNode;
}

export function PageLayout({ header, children }: PageLayoutProps) {
	return (
		<div className="flex h-full flex-col bg-white dark:bg-neutral-950">
			<header className="shrink-0 border-b border-neutral-200/60 dark:border-neutral-800">
				{header}
			</header>
			{children}
		</div>
	);
}

interface PageHeaderProps {
	title: string;
	action?: ReactNode;
}

export function PageHeader({ title, action }: PageHeaderProps) {
	return (
		<div className="flex items-center justify-between px-4 py-3">
			<h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
				{title}
			</h1>
			{action}
		</div>
	);
}
