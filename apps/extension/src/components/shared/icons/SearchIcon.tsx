interface IconProps {
	className?: string;
}

export function SearchIcon({ className }: IconProps) {
	return (
		<svg
			role="img"
			aria-label="Search"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
			/>
		</svg>
	);
}
