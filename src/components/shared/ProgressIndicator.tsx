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
	const stageIds = Array.from({ length: totalStages }, (_, i) => `stage-${i}`);

	return (
		<div className={cn("flex items-center gap-1", className)}>
			{stageIds.map((_, index) => (
				<div
					key={stageIds[index]}
					className={cn(
						"h-1.5 rounded-full transition-all duration-500 ease-out",
						index < currentStage
							? "w-3 bg-neutral-900 dark:bg-neutral-100"
							: index === currentStage
								? "w-3 bg-neutral-900 dark:bg-neutral-100"
								: "w-1.5 bg-neutral-200 dark:bg-neutral-700",
					)}
					style={{
						transitionDelay: `${index * 40}ms`,
					}}
				/>
			))}
		</div>
	);
}
