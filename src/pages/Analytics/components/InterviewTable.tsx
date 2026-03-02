import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { LiveInterview } from "../../../types";

interface InterviewTableProps {
	interviews: LiveInterview[];
}

const STYLE_LABELS: Record<string, string> = {
	friendly: "친절",
	normal: "보통",
	pressure: "압박",
};

export function InterviewTable({ interviews }: InterviewTableProps) {
	if (interviews.length === 0) {
		return (
			<p className="text-sm text-neutral-400 dark:text-neutral-500 text-center py-8">
				완료된 면접이 없습니다.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm">
				<thead>
					<tr className="border-b border-neutral-200 dark:border-neutral-800 text-left text-neutral-500 dark:text-neutral-400">
						<th className="pb-2 pr-4 font-medium">날짜</th>
						<th className="pb-2 pr-4 font-medium">문제</th>
						<th className="pb-2 pr-4 font-medium">스타일</th>
						<th className="pb-2 pr-4 font-medium text-right">종합점수</th>
						<th className="pb-2 pr-4 font-medium text-right">토큰</th>
						<th className="pb-2 font-medium text-right">비용</th>
					</tr>
				</thead>
				<tbody>
					{interviews.map((s) => {
						const report = s.report!;
						const scores = report.scores;
						const avg = Math.round(
							(scores.understanding +
								scores.communication +
								scores.codeQuality +
								scores.timeManagement) /
								4,
						);
						const tu = report.tokenUsage;
						const totalTokens = tu
							? tu.totalPromptTokens + tu.totalCompletionTokens
							: null;
						const cost = tu?.estimatedCost;

						return (
							<tr
								key={s.id}
								className="border-b border-neutral-100 dark:border-neutral-800/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
							>
								<td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
									{format(new Date(s.startedAt), "M/d HH:mm", {
										locale: ko,
									})}
								</td>
								<td className="py-2.5 pr-4 text-neutral-800 dark:text-neutral-200 max-w-[200px] truncate">
									{s.config.problemInfo.title}
								</td>
								<td className="py-2.5 pr-4 text-neutral-500 dark:text-neutral-400">
									{STYLE_LABELS[s.config.interviewerStyle] ??
										s.config.interviewerStyle}
								</td>
								<td className="py-2.5 pr-4 text-right font-medium">
									<span className={getScoreColor(avg)}>{avg}</span>
								</td>
								<td className="py-2.5 pr-4 text-right text-neutral-500 dark:text-neutral-400">
									{totalTokens != null
										? totalTokens.toLocaleString()
										: "-"}
								</td>
								<td className="py-2.5 text-right text-neutral-500 dark:text-neutral-400">
									{cost != null ? `$${cost.toFixed(4)}` : "-"}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

function getScoreColor(score: number): string {
	if (score >= 80) return "text-green-600 dark:text-green-400";
	if (score >= 60) return "text-amber-600 dark:text-amber-400";
	return "text-red-600 dark:text-red-400";
}
