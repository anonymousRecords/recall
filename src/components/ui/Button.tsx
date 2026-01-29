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
					"inline-flex items-center justify-center rounded-md font-medium transition-colors",
					"focus:outline-none focus:ring-2 focus:ring-offset-2",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					{
						"bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100":
							variant === "primary",
						"bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700":
							variant === "secondary",
						"text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100":
							variant === "ghost",
						"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
							variant === "danger",
					},
					{
						"h-8 px-3 text-sm": size === "sm",
						"h-10 px-4 text-sm": size === "md",
						"h-12 px-6 text-base": size === "lg",
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
