import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/utils";
import { ChevronDownIcon } from "../shared";

type SelectOption = { value: string; label: string };

interface SelectProps {
	id?: string;
	className?: string;
	label?: string;
	error?: string;
	hint?: string;
	options: SelectOption[];
	value?: string;
	onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
	disabled?: boolean;
}

export const Select = ({
	className,
	label,
	error,
	hint,
	id: idProp,
	options,
	value,
	onChange,
	disabled,
}: SelectProps) => {
	const generatedId = useId();
	const id = idProp ?? generatedId;

	const [isOpen, setIsOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);

	const containerRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((o) => o.value === value);

	const close = useCallback(() => {
		setIsOpen(false);
		setFocusedIndex(-1);
	}, []);

	const selectOption = useCallback(
		(option: SelectOption) => {
			onChange?.({
				target: { value: option.value },
			} as ChangeEvent<HTMLSelectElement>);
			close();
		},
		[onChange, close],
	);

	useEffect(() => {
		if (!isOpen) return;
		const handleMouseDown = (e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) {
				close();
			}
		};
		document.addEventListener("mousedown", handleMouseDown);
		return () => document.removeEventListener("mousedown", handleMouseDown);
	}, [isOpen, close]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
		if (disabled) return;
		switch (e.key) {
			case "Enter":
			case " ":
				e.preventDefault();
				if (isOpen && focusedIndex >= 0) {
					selectOption(options[focusedIndex]);
				} else {
					setIsOpen((prev) => !prev);
				}
				break;
			case "ArrowDown":
				e.preventDefault();
				if (!isOpen) {
					setIsOpen(true);
					setFocusedIndex(0);
				} else {
					setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				setFocusedIndex((i) => Math.max(i - 1, 0));
				break;
			case "Escape":
				e.preventDefault();
				close();
				break;
		}
	};

	return (
		<div className="flex flex-col gap-1.5" ref={containerRef}>
			{label && (
				<label
					htmlFor={id}
					className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
				>
					{label}
				</label>
			)}

			<div className="relative">
				<button
					id={id}
					type="button"
					role="combobox"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
					disabled={disabled}
					onClick={() => setIsOpen((prev) => !prev)}
					onKeyDown={handleKeyDown}
					className={cn(
						"h-9 w-full rounded-sm border bg-white pl-3 pr-8 text-left text-sm",
						"border-neutral-200",
						"transition-all duration-150 ease-out",
						"hover:border-neutral-300",
						"focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100",
						"dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100",
						"dark:hover:border-neutral-600",
						"dark:focus:border-neutral-500 dark:focus:ring-neutral-800",
						"disabled:pointer-events-none disabled:opacity-40",
						error &&
							"border-red-500 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-900/30",
						isOpen &&
							"border-neutral-400 ring-2 ring-neutral-100 dark:border-neutral-500 dark:ring-neutral-800",
						className,
					)}
				>
					<span
						className={cn(
							!selectedOption && "text-neutral-400 dark:text-neutral-500",
						)}
					>
						{selectedOption?.label ?? "선택"}
					</span>
				</button>

				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
					<ChevronDownIcon
						className={cn(
							"h-4 w-4 text-neutral-400 transition-transform duration-150",
							isOpen && "rotate-180",
						)}
					/>
				</div>

				{isOpen && (
					<div
						role="listbox"
						className="absolute z-50 mt-1 w-full overflow-hidden rounded-sm border border-neutral-100 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900"
					>
						{options.map((option, index) => (
							<div
								key={option.value}
								role="option"
								aria-selected={option.value === value}
								tabIndex={-1}
								onMouseEnter={() => setFocusedIndex(index)}
								onMouseLeave={() => setFocusedIndex(-1)}
								onClick={() => selectOption(option)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										selectOption(option);
									}
								}}
								className={cn(
									"flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
									"text-neutral-700 dark:text-neutral-200",
									index === focusedIndex && "bg-neutral-50 dark:bg-neutral-800",
								)}
							>
								<span>{option.label}</span>
								{option.value === value && (
									<svg
										aria-label="checked"
										role="img"
										className="h-4 w-4 text-neutral-500 dark:text-neutral-400"
										viewBox="0 0 16 16"
										fill="none"
									>
										<path
											d="M3 8l3.5 3.5L13 4"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{hint && !error && (
				<span className="text-xs text-neutral-500 dark:text-neutral-400">
					{hint}
				</span>
			)}
			{error && (
				<span className="text-xs text-red-600 dark:text-red-400">{error}</span>
			)}
		</div>
	);
};

Select.displayName = "Select";
