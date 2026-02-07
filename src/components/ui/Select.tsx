import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	hint?: string;
	options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	({ className, label, error, hint, id, options, ...props }, ref) => {
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
				<div className="relative">
					<select
						ref={ref}
						id={id}
						className={cn(
							"h-9 w-full appearance-none rounded-lg border bg-white pl-3 pr-8 text-sm",
							"border-neutral-200",
							"transition-all duration-150 ease-out",
							"hover:border-neutral-300",
							"focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100",
							"dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
							"dark:hover:border-neutral-600",
							"dark:focus:border-neutral-500 dark:focus:ring-neutral-800",
							error &&
								"border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30",
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
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<ChevronDownIcon />
					</div>
				</div>
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

function ChevronDownIcon() {
	return (
		<svg
			className="h-4 w-4 text-neutral-400"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m19.5 8.25-7.5 7.5-7.5-7.5"
			/>
		</svg>
	);
}

Select.displayName = "Select";
