interface IconProps {
	className?: string;
}

export function ClockIcon({ className }: IconProps) {
	return (
		<svg
			role="img"
			aria-label="Clock"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="2"
			stroke="currentColor"
			className={className}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
			/>
		</svg>
	);
}
