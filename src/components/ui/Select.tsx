import {
	type ChangeEvent,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { cn } from "../../lib/utils";

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
					className="font-mono text-[12px] text-[#858585]"
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
						"h-8 w-full rounded-none border bg-[#1e1e1e] pl-3 pr-8 text-left font-mono text-[13px]",
						"border-[#3e3e42] text-[#d4d4d4]",
						"transition-all duration-150 ease-out",
						"hover:border-[#525252]",
						"focus:border-[#569cd6] focus:outline-none focus:ring-1 focus:ring-[#569cd6]/30",
						"disabled:pointer-events-none disabled:opacity-40",
						error && "border-[#f44747]",
						isOpen && "border-[#569cd6] ring-1 ring-[#569cd6]/30",
						className,
					)}
				>
					<span
						className={cn(!selectedOption && "text-[#858585]")}
					>
						{selectedOption?.label ?? "선택"}
					</span>
				</button>

				<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
					<span
						className={cn(
							"font-mono text-[12px] text-[#858585] transition-transform duration-150 inline-block",
							isOpen && "rotate-180",
						)}
					>
						▾
					</span>
				</div>

				{isOpen && (
					<div
						role="listbox"
						className="absolute z-50 mt-0 w-full overflow-hidden rounded-none border border-[#569cd6] bg-[#252526]"
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
									"flex cursor-pointer items-center justify-between px-3 py-1.5 font-mono text-[12px]",
									"text-[#d4d4d4]",
									index === focusedIndex ? "bg-[#094771]" : "hover:bg-[#2a2d2e]",
									option.value === value && "text-[#569cd6]",
								)}
							>
								<span>{option.label}</span>
								{option.value === value && (
									<span className="font-mono text-[12px] text-[#569cd6]">✓</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{hint && !error && (
				<span className="font-mono text-[11px] text-[#858585]">
					{hint}
				</span>
			)}
			{error && (
				<span className="font-mono text-[11px] text-[#f44747]">{error}</span>
			)}
		</div>
	);
};

Select.displayName = "Select";
