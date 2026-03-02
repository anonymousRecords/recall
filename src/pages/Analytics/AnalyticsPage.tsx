import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import {
	calculateScoreAverages,
	calculateScoreTrend,
	calculateTokenStats,
	groupByProvider,
	groupByStyle,
} from "../../lib/analytics/aggregate";
import { cn } from "../../lib/utils";
import { completedInterviewsQueryOptions } from "../../queries/interviews";
import { BarChart } from "./components/charts/BarChart";
import { ComparisonChart } from "./components/charts/ComparisonChart";
import { LineChart } from "./components/charts/LineChart";
import { InterviewTable } from "./components/InterviewTable";
import { StatCard } from "./components/StatCard";

type FilterPeriod = "recent10" | "recent30d" | "all";

const SCORE_COLORS = {
	understanding: "#569cd6",
	communication: "#4ec9b0",
	codeQuality: "#dcdcaa",
	timeManagement: "#ce9178",
};

const STYLE_LABELS: Record<string, string> = {
	friendly: "친절",
	normal: "보통",
	pressure: "압박",
};

export function AnalyticsPage() {
	return (
		<Suspense fallback={null}>
			<AnalyticsPageContent />
		</Suspense>
	);
}

function AnalyticsPageContent() {
	const { data: interviews } = useSuspenseQuery(completedInterviewsQueryOptions());
	const stats = useMemo(
		() => ({
			totalInterviews: interviews.length,
			scoreAverages: calculateScoreAverages(interviews),
			tokenStats: calculateTokenStats(interviews),
			providerComparison: groupByProvider(interviews),
			styleComparison: groupByStyle(interviews),
			scoreTrend: calculateScoreTrend(interviews),
			recentInterviews: interviews.slice(0, 10),
		}),
		[interviews],
	);
	const [filter, setFilter] = useState<FilterPeriod>("all");

	const filtered = useMemo(() => {
		const trend = stats.scoreTrend;
		if (filter === "recent10") return trend.slice(-10);
		if (filter === "recent30d") {
			const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
			return trend.filter((t) => new Date(t.date).getTime() >= cutoff);
		}
		return trend;
	}, [stats.scoreTrend, filter]);

	const lineLabels = filtered.map((t) => t.label);
	const lineSeries = [
		{
			name: "문제 이해",
			data: filtered.map((t) => t.scores.understanding),
			color: SCORE_COLORS.understanding,
		},
		{
			name: "소통 능력",
			data: filtered.map((t) => t.scores.communication),
			color: SCORE_COLORS.communication,
		},
		{
			name: "코드 품질",
			data: filtered.map((t) => t.scores.codeQuality),
			color: SCORE_COLORS.codeQuality,
		},
		{
			name: "시간 관리",
			data: filtered.map((t) => t.scores.timeManagement),
			color: SCORE_COLORS.timeManagement,
		},
	];

	const costBarData = filtered
		.filter((t) => t.tokenUsage != null)
		.map((t) => ({
			label: t.label,
			value: t.tokenUsage?.cost ?? 0,
			color: "#569cd6",
		}));

	const styleChartGroups = stats.styleComparison.map((sc) => ({
		name: STYLE_LABELS[sc.style] ?? sc.style,
		values: [
			{
				label: "문제 이해",
				value: sc.scores.understanding,
				color: SCORE_COLORS.understanding,
			},
			{
				label: "소통 능력",
				value: sc.scores.communication,
				color: SCORE_COLORS.communication,
			},
			{
				label: "코드 품질",
				value: sc.scores.codeQuality,
				color: SCORE_COLORS.codeQuality,
			},
			{
				label: "시간 관리",
				value: sc.scores.timeManagement,
				color: SCORE_COLORS.timeManagement,
			},
		],
	}));

	const providerChartGroups = stats.providerComparison.map((pc) => ({
		name: pc.provider === "openai" ? "OpenAI" : "Claude",
		values: [
			{ label: "평균 점수", value: pc.avgScore, color: "#569cd6" },
			{
				label: "비용(x1000)",
				value: Math.round(pc.totalCost * 1000),
				color: "#dcdcaa",
			},
		],
	}));

	return (
		<div className="h-full overflow-y-auto bg-[#1e1e1e]">
			<div className="mx-auto max-w-5xl px-6 py-8">
				<header className="mb-8">
					<p className="font-mono text-[12px] text-[#858585] mb-0.5">
						{"// analytics"}
					</p>
					<div className="flex items-center justify-between">
						<p className="font-mono text-[13px] text-[#dcdcaa]">
							$ total: {stats.totalInterviews} interviews
						</p>
						<div className="flex gap-1">
							{(
								[
									["recent10", "recent10"],
									["recent30d", "recent30d"],
									["all", "all"],
								] as const
							).map(([key, label]) => (
								<button
									key={key}
									type="button"
									onClick={() => setFilter(key)}
									className={cn(
										"px-2.5 py-1 font-mono text-[11px] rounded-none border transition-colors",
										filter === key
											? "bg-[#094771] border-[#569cd6] text-[#569cd6]"
											: "bg-transparent border-[#3e3e42] text-[#858585] hover:text-[#d4d4d4] hover:border-[#525252]",
									)}
								>
									[{label}]
								</button>
							))}
						</div>
					</div>
				</header>

				{stats.totalInterviews === 0 ? (
					<div className="py-20 font-mono text-[13px] text-[#858585]">
						<p>$ ls interviews/</p>
						<p className="mt-1">(no items)</p>
						<p className="mt-3">&gt; no completed interviews found.</p>
						<p>&gt; complete a live coding session to see analytics.</p>
						<p className="mt-2 cursor-blink">█</p>
					</div>
				) : (
					<>
						<section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
							<StatCard label="총 면접" value={String(stats.totalInterviews)} />
							<StatCard
								label="평균 점수"
								value={String(stats.scoreAverages.overall)}
								sub="4개 항목 평균"
							/>
							<StatCard
								label="총 비용"
								value={`$${stats.tokenStats.totalCost.toFixed(4)}`}
								sub={`면접당 $${stats.tokenStats.avgCostPerSession.toFixed(4)}`}
							/>
							<StatCard
								label="평균 토큰/면접"
								value={stats.tokenStats.avgTokensPerSession.toLocaleString()}
							/>
						</section>

						{filtered.length > 0 && (
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>{"// 점수 추이"}</CardTitle>
								</CardHeader>
								<CardContent>
									<LineChart series={lineSeries} labels={lineLabels} />
								</CardContent>
							</Card>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
							{styleChartGroups.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>{"// 스타일별 평균 점수"}</CardTitle>
									</CardHeader>
									<CardContent>
										<ComparisonChart groups={styleChartGroups} />
									</CardContent>
								</Card>
							)}

							{providerChartGroups.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>{"// 프로바이더별 비교"}</CardTitle>
									</CardHeader>
									<CardContent>
										<ComparisonChart groups={providerChartGroups} />
									</CardContent>
								</Card>
							)}
						</div>

						{costBarData.length > 0 && (
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>{"// 면접당 토큰 비용"}</CardTitle>
								</CardHeader>
								<CardContent>
									<BarChart
										data={costBarData}
										formatValue={(v) => `$${v.toFixed(4)}`}
									/>
								</CardContent>
							</Card>
						)}

						<Card>
							<CardHeader>
								<CardTitle>{"// 면접 히스토리"}</CardTitle>
							</CardHeader>
							<CardContent>
								<InterviewTable interviews={stats.recentInterviews} />
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
