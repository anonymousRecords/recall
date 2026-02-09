import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
	hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, hint, id, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={id}
						className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
					>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={id}
					className={cn(
						"min-h-[100px] w-full rounded-sm border bg-white px-3 py-2.5 text-sm leading-relaxed",
						"border-neutral-200 placeholder:text-neutral-400 resize-none",
						"transition-all duration-150 ease-out",
						"hover:border-neutral-300",
						"focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100",
						"dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
						"dark:placeholder:text-neutral-500 dark:hover:border-neutral-600",
						"dark:focus:border-neutral-500 dark:focus:ring-neutral-800",
						error &&
							"border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30",
						className,
					)}
					{...props}
				/>
				{hint && !error && (
					<span className="text-xs text-neutral-500 dark:text-neutral-400">
						{hint}
					</span>
				)}
				{error && (
					<span className="text-xs text-red-600 dark:text-red-400">
						{error}
					</span>
				)}
			</div>
		);
	},
);

Textarea.displayName = "Textarea";
