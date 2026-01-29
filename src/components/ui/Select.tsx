import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ className, label, error, id, options, ...props }, ref) => {
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
				<select
					ref={ref}
					id={id}
					className={cn(
						"h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm",
						"focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500",
						"dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100",
						"dark:focus:border-gray-400 dark:focus:ring-gray-400",
						error && "border-red-500 focus:border-red-500 focus:ring-red-500",
						className,
					)}
					{...props}
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				{error && <span className="text-xs text-red-500">{error}</span>}
			</div>
		);
	},
);

Select.displayName = "Select";
