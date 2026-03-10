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
	const filled = Math.min(currentStage, totalStages);
	const empty = totalStages - filled;
	const bar = "█".repeat(filled) + "░".repeat(empty);

	return (
		<span className={cn("font-mono text-[12px] text-[#569cd6]", className)}>
			[{bar}] {currentStage}/{totalStages}
		</span>
	);
}
