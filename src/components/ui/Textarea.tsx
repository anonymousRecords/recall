import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string;
	error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, label, error, id, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={id}
						className="text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						{label}
					</label>
				)}
				<textarea
					ref={ref}
					id={id}
					className={cn(
						"min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
						"placeholder:text-gray-400 resize-none",
						"focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500",
						"dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500",
						"dark:focus:border-gray-400 dark:focus:ring-gray-400",
						error && "border-red-500 focus:border-red-500 focus:ring-red-500",
						className,
					)}
					{...props}
				/>
				{error && <span className="text-xs text-red-500">{error}</span>}
			</div>
		);
	},
);

Textarea.displayName = "Textarea";
