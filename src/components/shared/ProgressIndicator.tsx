import { cn } from "../../lib/utils";

interface ProgressIndicatorProps {
	currentStage: number;
	totalStages: number;
	className?: string;
}

export function ProgressIndicator({
	currentStage,
	totalStages,
	className,
}: ProgressIndicatorProps) {
	return (
		<div className={cn("flex items-center gap-1", className)}>
			{Array.from({ length: totalStages }).map((_, index) => (
				<div
					key={currentStage}
					className={cn(
						"h-1.5 w-1.5 rounded-full transition-all duration-200",
						index < currentStage
							? "bg-emerald-500 dark:bg-emerald-400"
							: index === currentStage
								? "bg-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-400 dark:ring-blue-400/20"
								: "bg-neutral-200 dark:bg-neutral-700",
					)}
				/>
			))}
		</div>
	);
}
