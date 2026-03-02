import type { ReactNode } from "react";

interface PageLayoutProps {
	header: ReactNode;
	children: ReactNode;
}

export function PageLayout({ header, children }: PageLayoutProps) {
	return (
		<div className="flex h-full flex-col bg-[#1e1e1e]">
			<header className="shrink-0 border-b border-[#3e3e42] bg-[#252526]">
				{header}
			</header>
			{children}
		</div>
	);
}

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
	return (
		<div className="flex items-start justify-between px-4 py-3">
			<div>
				<p className="font-mono text-[11px] text-[#858585]">// {title}</p>
				{subtitle && (
					<p className="mt-0.5 font-mono text-[12px] text-[#dcdcaa]">
						$ {subtitle}
					</p>
				)}
			</div>
			{action}
		</div>
	);
}
