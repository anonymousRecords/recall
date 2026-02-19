import { useState } from "react";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  formatValue?: (v: number) => string;
}

const PADDING = { top: 16, right: 16, bottom: 40, left: 50 };
const CHART_HEIGHT = 220;
const CHART_WIDTH = 600;
const DEFAULT_COLOR = "#525252";

export function BarChart({
  data,
  formatValue = (v) => String(v),
}: BarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  const barWidth = Math.min(40, (innerW / data.length) * 0.6);
  const gap = (innerW - barWidth * data.length) / (data.length + 1);

  return (
    <svg
      role="img"
      aria-label="Bar chart"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="w-full h-auto"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const v = maxVal * ratio;
        const y = PADDING.top + innerH - ratio * innerH;
        return (
          <g key={ratio}>
            <line
              x1={PADDING.left}
              y1={y}
              x2={CHART_WIDTH - PADDING.right}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-neutral-400 dark:fill-neutral-500"
              fontSize={10}
            >
              {formatValue(v)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const barH = (d.value / maxVal) * innerH;
        const x = PADDING.left + gap + i * (barWidth + gap);
        const y = PADDING.top + innerH - barH;
        const isHovered = hoveredIdx === i;
        const color = d.color || DEFAULT_COLOR;

        return (
          // biome-ignore lint/a11y/noStaticElementInteractions: static chart
          <g
            key={d.label}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className="cursor-pointer"
          >
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={3}
              fill={color}
              opacity={isHovered ? 1 : 0.8}
            />
            {isHovered && (
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-neutral-700 dark:fill-neutral-200"
                fontSize={10}
                fontWeight={600}
              >
                {formatValue(d.value)}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              className="fill-neutral-400 dark:fill-neutral-500"
              fontSize={9}
            >
              {d.label.length > 8 ? `${d.label.slice(0, 8)}..` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
