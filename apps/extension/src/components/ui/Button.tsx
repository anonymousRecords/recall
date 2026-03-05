import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "danger";
	size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant = "primary", size = "md", children, ...props },
		ref,
	) => {
		return (
			<button
				ref={ref}
				className={cn(
					"inline-flex items-center justify-center gap-1.5 font-mono",
					"rounded-none transition-all duration-150 ease-out",
					"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-0",
					"disabled:pointer-events-none disabled:opacity-40",
					"active:scale-[0.98]",
					{
						"bg-[#0e639c] text-[#d4d4d4] border border-[#0e639c] hover:bg-[#1177bb] focus-visible:ring-[#569cd6]":
							variant === "primary",
						"bg-transparent text-[#d4d4d4] border border-[#3e3e42] hover:border-[#858585] focus-visible:ring-[#3e3e42]":
							variant === "secondary",
						"bg-transparent text-[#858585] border border-transparent hover:text-[#d4d4d4] focus-visible:ring-[#3e3e42]":
							variant === "ghost",
						"bg-transparent text-[#f44747] border border-[#f44747] hover:bg-[#f44747]/10 focus-visible:ring-[#f44747]":
							variant === "danger",
					},
					{
						"h-7 px-2.5 text-[12px]": size === "sm",
						"h-8 px-3 text-[13px]": size === "md",
						"h-10 px-4 text-sm": size === "lg",
					},
					className,
				)}
				{...props}
			>
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";
