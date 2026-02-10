import { type ReactNode, useCallback } from "react";
import { NavLink } from "react-router";
import { cn } from "../../lib/utils";
import {
	ChartIcon,
	HomeIcon,
	ListIcon,
	MicIcon,
	SettingsIcon,
} from "../shared";

interface LayoutProps {
	children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
			<main className="min-h-0 flex-1 overflow-auto">{children}</main>

			<nav className="flex h-16 items-center justify-around border-t border-neutral-200/60 bg-white/80 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/80">
				<NavItem to="/" icon={<HomeIcon className="h-6 w-6" />} label="홈" />
				<NavItem
					to="/problems"
					icon={<ListIcon className="h-6 w-6" />}
					label="문제"
					end
				/>
				<NavItem
					to="/live"
					icon={<MicIcon className="h-6 w-6" />}
					label="라이브"
				/>
				<AnalyticsNavItem />
				<NavItem
					to="/settings"
					icon={<SettingsIcon className="h-6 w-6" />}
					label="설정"
				/>
			</nav>
		</div>
	);
}

interface NavItemProps {
	to: string;
	icon: ReactNode;
	label: string;
	end?: boolean;
}

function NavItem({ to, icon, label, end }: NavItemProps) {
	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) =>
				cn(
					"group flex flex-col items-center gap-1 px-4 py-2 transition-all duration-150",
					isActive
						? "text-neutral-900 dark:text-white"
						: "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300",
				)
			}
		>
			<span className="transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
				{icon}
			</span>
			<span className="text-[10px] font-medium tracking-wide">{label}</span>
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
			className="group flex flex-col items-center gap-1 px-4 py-2 transition-all duration-150 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
		>
			<span className="transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
				<ChartIcon className="h-6 w-6" />
			</span>
			<span className="text-[10px] font-medium tracking-wide">분석</span>
		</button>
	);
}
