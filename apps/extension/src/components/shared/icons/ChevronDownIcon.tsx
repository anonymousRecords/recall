interface IconProps {
	className?: string;
}

export function ChevronDownIcon({ className }: IconProps) {
	return (
		<svg
			role="img"
			aria-label="ChevronDown"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m19.5 8.25-7.5 7.5-7.5-7.5"
			/>
		</svg>
	);
}
