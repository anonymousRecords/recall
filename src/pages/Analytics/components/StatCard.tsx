import {
	Card,
	CardContent,
} from "../../../components/ui";

interface StatCardProps {
	label: string;
	value: string;
	sub?: string;
}

export function StatCard({ label, value, sub }: StatCardProps) {
	return (
		<Card>
			<CardContent>
				<p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
					{label}
				</p>
				<p className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
					{value}
				</p>
				{sub && (
					<p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
						{sub}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
