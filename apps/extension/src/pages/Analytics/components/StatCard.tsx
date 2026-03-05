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
				<p className="font-mono text-[11px] text-[#858585] mb-1">{label}</p>
				<p className="font-mono text-xl font-medium text-[#dcdcaa] tracking-tight">
					{value}
				</p>
				{sub && (
					<p className="font-mono text-[10px] text-[#858585] mt-0.5">{sub}</p>
				)}
			</CardContent>
		</Card>
	);
}
