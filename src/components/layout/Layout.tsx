import { type ReactNode, useCallback } from "react";
import { NavLink } from "react-router";
import { cn } from "../../lib/utils";

interface LayoutProps {
	children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-[#1e1e1e]">
			<header className="flex h-8 shrink-0 items-center border-b border-[#3e3e42] bg-[#252526] px-3">
				<span
					style={{ fontFamily: "'DotGothic16', monospace" }}
					className="text-[13px] text-[#d4d4d4]"
				>
					recall_
				</span>
			</header>
			<main className="min-h-0 flex-1 overflow-auto">{children}</main>
			<nav className="flex h-9 shrink-0 items-stretch border-t border-[#3e3e42] bg-[#252526]">
				<NavItem to="/" label="~/" end />
				<NavItem to="/problems" label="problems" end />
				<NavItem to="/live" label="live" />
				<AnalyticsNavItem />
				<NavItem to="/settings" label="config" />
			</nav>
		</div>
	);
}

interface NavItemProps {
	to: string;
	label: string;
	end?: boolean;
}

function NavItem({ to, label, end }: NavItemProps) {
	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) =>
				cn(
					"flex flex-1 items-center justify-center border-r border-[#3e3e42]",
					"font-mono text-[11px] transition-colors duration-150",
					isActive
						? "bg-[#1e1e1e] text-[#d4d4d4] border-t-2 border-t-[#569cd6]"
						: "bg-[#252526] text-[#858585] hover:text-[#d4d4d4]",
				)
			}
		>
			{label}
		</NavLink>
	);
}

function AnalyticsNavItem() {
	const openAnalytics = useCallback(() => {
		const analyticsUrl = browser.runtime.getURL("/analytics.html");
		browser.tabs.create({ url: analyticsUrl });
	}, []);

	return (
		<button
			type="button"
			onClick={openAnalytics}
			className="flex flex-1 items-center justify-center border-r border-[#3e3e42] bg-[#252526] font-mono text-[11px] text-[#858585] transition-colors duration-150 hover:text-[#d4d4d4]"
		>
			stats
		</button>
	);
}
