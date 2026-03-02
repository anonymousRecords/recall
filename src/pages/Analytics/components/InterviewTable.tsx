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
			<p className="font-mono text-[12px] text-[#858585] text-center py-8">
				&gt; no completed interviews found.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full font-mono text-[12px]">
				<thead>
					<tr className="border-b border-[#3e3e42] text-left text-[#858585]">
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
								className="border-b border-[#2d2d2d] hover:bg-[#2a2d2e] transition-colors"
							>
								<td className="py-2.5 pr-4 text-[#858585] whitespace-nowrap">
									{format(new Date(s.startedAt), "M/d HH:mm", {
										locale: ko,
									})}
								</td>
								<td className="py-2.5 pr-4 text-[#d4d4d4] max-w-[200px] truncate">
									{s.config.problemInfo.title}
								</td>
								<td className="py-2.5 pr-4 text-[#ce9178]">
									{STYLE_LABELS[s.config.interviewerStyle] ??
										s.config.interviewerStyle}
								</td>
								<td className="py-2.5 pr-4 text-right font-medium">
									<span style={{ color: getScoreColor(avg) }}>{avg}</span>
								</td>
								<td className="py-2.5 pr-4 text-right text-[#858585]">
									{totalTokens != null
										? totalTokens.toLocaleString()
										: "-"}
								</td>
								<td className="py-2.5 text-right text-[#858585]">
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
	if (score >= 80) return "#4ec9b0";
	if (score >= 60) return "#dcdcaa";
	return "#f44747";
}
