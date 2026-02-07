import { type KeyboardEvent, useState } from "react";
import { cn } from "../../lib/utils";

interface TagInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	className?: string;
	label?: string;
}

export function TagInput({
	value,
	onChange,
	placeholder = "태그 입력 후 Enter",
	className,
	label,
}: TagInputProps) {
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && inputValue.trim()) {
			e.preventDefault();
			const newTag = inputValue.trim();
			if (!value.includes(newTag)) {
				onChange([...value, newTag]);
			}
			setInputValue("");
		} else if (e.key === "Backspace" && !inputValue && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	};

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove));
	};

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label
					htmlFor="label"
					className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
				>
					{label}
				</label>
			)}
			<div
				className={cn(
					"flex min-h-[36px] w-full flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2.5 py-1.5",
					"border-neutral-200",
					"transition-all duration-150 ease-out",
					"hover:border-neutral-300",
					"focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-100",
					"dark:border-neutral-700 dark:bg-neutral-900",
					"dark:hover:border-neutral-600",
					"dark:focus-within:border-neutral-500 dark:focus-within:ring-neutral-800",
					className,
				)}
			>
				{value.map((tag) => (
					<span
						key={tag}
						className="group inline-flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-0.5 text-sm text-neutral-700 transition-colors dark:bg-neutral-800 dark:text-neutral-300"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
						>
							<CloseIcon />
						</button>
					</span>
				))}
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={value.length === 0 ? placeholder : ""}
					className="min-w-[100px] flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
				/>
			</div>
		</div>
	);
}

function CloseIcon() {
	return (
		<svg
			role="img"
			aria-label="Close"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			className="h-3.5 w-3.5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M6 18 18 6M6 6l12 12"
			/>
		</svg>
	);
}
