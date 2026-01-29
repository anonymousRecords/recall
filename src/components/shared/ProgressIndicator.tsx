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
						"h-2 w-2 rounded-full transition-colors",
						index < currentStage
							? "bg-green-500"
							: index === currentStage
								? "bg-blue-500"
								: "bg-gray-200 dark:bg-gray-700",
					)}
				/>
			))}
		</div>
	);
}
