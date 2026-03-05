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
					className="font-mono text-[12px] text-[#858585]"
				>
					{label}
				</label>
			)}
			<div
				className={cn(
					"flex min-h-[32px] w-full flex-wrap items-center gap-1.5 rounded-none border bg-[#1e1e1e] px-2.5 py-1.5",
					"border-[#3e3e42]",
					"transition-all duration-150 ease-out",
					"hover:border-[#525252]",
					"focus-within:border-[#569cd6] focus-within:ring-1 focus-within:ring-[#569cd6]/30",
					className,
				)}
			>
				{value.map((tag) => (
					<span
						key={tag}
						className="group inline-flex items-center gap-1 border border-[#3e3e42] bg-transparent px-1.5 py-0.5 font-mono text-[11px] text-[#ce9178]"
					>
						{tag}
						<button
							type="button"
							onClick={() => removeTag(tag)}
							className="font-mono text-[11px] text-[#858585] transition-colors hover:text-[#f44747]"
						>
							×
						</button>
					</span>
				))}
				<input
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={value.length === 0 ? placeholder : ""}
					className="min-w-[80px] flex-1 bg-transparent font-mono text-[13px] text-[#d4d4d4] outline-none placeholder:text-[#858585]"
				/>
			</div>
		</div>
	);
}
