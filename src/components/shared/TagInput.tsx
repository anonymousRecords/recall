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
					className="text-sm font-medium text-gray-700 dark:text-gray-300"
				>
					{label}
				</label>
			)}
			<div
				className={cn(
					"flex flex-wrap items-center gap-2 min-h-[40px] w-full rounded-md border border-gray-300 bg-white px-3 py-2",
					"focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-500",
					"dark:border-gray-600 dark:bg-gray-800",
					"dark:focus-within:border-gray-400 dark:focus-within:ring-gray-400",
					className,
				)}
			>
				{value.map((tag) => (
					<span
						key={tag}
						className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
					className="flex-1 min-w-[100px] bg-transparent text-sm outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
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
			stroke-width="1.5"
			stroke="currentColor"
			width={16}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M6 18 18 6M6 6l12 12"
			/>
		</svg>
	);
}
