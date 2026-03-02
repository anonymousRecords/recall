import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, hint, id, ...props }, ref) => {
		return (
			<div className="flex flex-col gap-1.5">
				{label && (
					<label
						htmlFor={id}
						className="font-mono text-[12px] text-[#858585]"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={id}
					className={cn(
						"h-8 w-full rounded-none border bg-[#1e1e1e] px-3 font-mono text-[13px] text-[#d4d4d4]",
						"border-[#3e3e42] placeholder:text-[#858585]",
						"transition-all duration-150 ease-out",
						"hover:border-[#525252]",
						"focus:border-[#569cd6] focus:outline-none focus:ring-1 focus:ring-[#569cd6]/30",
						error && "border-[#f44747] focus:border-[#f44747] focus:ring-[#f44747]/30",
						className,
					)}
					{...props}
				/>
				{hint && !error && (
					<span className="font-mono text-[11px] text-[#858585]">
						{hint}
					</span>
				)}
				{error && (
					<span className="font-mono text-[11px] text-[#f44747]">
						{error}
					</span>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";
