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
					"inline-flex items-center justify-center gap-2 font-medium",
					"rounded-lg transition-all duration-150 ease-out",
					"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
					"disabled:pointer-events-none disabled:opacity-40",
					"active:scale-[0.98]",
					{
						"bg-neutral-900 text-white shadow-sm hover:bg-neutral-800 focus-visible:ring-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus-visible:ring-white":
							variant === "primary",
						"bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus-visible:ring-neutral-400 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700":
							variant === "secondary",
						"text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-neutral-400 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100":
							variant === "ghost",
						"bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-600":
							variant === "danger",
					},
					{
						"h-8 px-3 text-[13px]": size === "sm",
						"h-9 px-4 text-sm": size === "md",
						"h-11 px-5 text-[15px]": size === "lg",
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
