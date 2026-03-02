import { Suspense, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui";
import { useSessionAnalytics } from "../../hooks/useSessionAnalytics";
import { cn } from "../../lib/utils";
import { BarChart } from "./components/charts/BarChart";
import { ComparisonChart } from "./components/charts/ComparisonChart";
import { LineChart } from "./components/charts/LineChart";
import { SessionTable } from "./components/SessionTable";
import { StatCard } from "./components/StatCard";

type FilterPeriod = "recent10" | "recent30d" | "all";

const SCORE_COLORS = {
	understanding: "#3b82f6",
	communication: "#10b981",
	codeQuality: "#f59e0b",
	timeManagement: "#8b5cf6",
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
	const { stats } = useSessionAnalytics();
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
		.filter((t) => t.tokenUsage)
		.map((t) => ({
			label: t.label,
			value: t.tokenUsage!.cost,
			color: "#6366f1",
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
			{ label: "평균 점수", value: pc.avgScore, color: "#3b82f6" },
			{
				label: "비용(x1000)",
				value: Math.round(pc.totalCost * 1000),
				color: "#f59e0b",
			},
		],
	}));

	return (
		<div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
			<div className="mx-auto max-w-5xl px-6 py-8">
				<header className="flex items-center justify-between mb-8">
					<h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
						세션 분석 대시보드
					</h1>
					<div className="flex gap-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 p-1">
						{(
							[
								["recent10", "최근 10회"],
								["recent30d", "최근 30일"],
								["all", "전체"],
							] as const
						).map(([key, label]) => (
							<button
								key={key}
								type="button"
								onClick={() => setFilter(key)}
								className={cn(
									"px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
									filter === key
										? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
										: "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
								)}
							>
								{label}
							</button>
						))}
					</div>
				</header>

				{stats.totalSessions === 0 ? (
					<div className="text-center py-20">
						<p className="text-neutral-400 dark:text-neutral-500 text-lg">
							아직 완료된 세션이 없습니다.
						</p>
						<p className="text-neutral-400 dark:text-neutral-500 text-sm mt-1">
							면접 세션을 진행하면 분석 데이터가 여기에 표시됩니다.
						</p>
					</div>
				) : (
					<>
						<section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
							<StatCard label="총 세션" value={String(stats.totalSessions)} />
							<StatCard
								label="평균 점수"
								value={String(stats.scoreAverages.overall)}
								sub="4개 항목 평균"
							/>
							<StatCard
								label="총 비용"
								value={`$${stats.tokenStats.totalCost.toFixed(4)}`}
								sub={`세션당 $${stats.tokenStats.avgCostPerSession.toFixed(4)}`}
							/>
							<StatCard
								label="평균 토큰/세션"
								value={stats.tokenStats.avgTokensPerSession.toLocaleString()}
							/>
						</section>

						{filtered.length > 0 && (
							<Card className="mb-8">
								<CardHeader>
									<CardTitle>점수 추이</CardTitle>
								</CardHeader>
								<CardContent>
									<LineChart series={lineSeries} labels={lineLabels} />
								</CardContent>
							</Card>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
							{styleChartGroups.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>스타일별 평균 점수</CardTitle>
									</CardHeader>
									<CardContent>
										<ComparisonChart groups={styleChartGroups} />
									</CardContent>
								</Card>
							)}

							{providerChartGroups.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>프로바이더별 비교</CardTitle>
									</CardHeader>
									<CardContent>
										<ComparisonChart groups={providerChartGroups} />
									</CardContent>
								</Card>
							)}
						</div>

						{costBarData.length > 0 && (
							<Card className="mb-8">
								<CardHeader>
									<CardTitle>세션당 토큰 비용</CardTitle>
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
								<CardTitle>세션 히스토리</CardTitle>
							</CardHeader>
							<CardContent>
								<SessionTable sessions={stats.recentSessions} />
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
