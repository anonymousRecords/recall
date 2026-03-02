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
const DEFAULT_COLOR = "#569cd6";

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
              stroke="#3e3e42"
              strokeOpacity={0.6}
              strokeDasharray="4 4"
            />
            <text
              x={PADDING.left - 6}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#858585"
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
              rx={0}
              fill={color}
              opacity={isHovered ? 1 : 0.75}
            />
            {isHovered && (
              <>
                <rect
                  x={x + barWidth / 2 - 36}
                  y={y - 22}
                  width={72}
                  height={16}
                  rx={0}
                  fill="#252526"
                  stroke="#3e3e42"
                  strokeWidth={1}
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 11}
                  textAnchor="middle"
                  fill="#d4d4d4"
                  fontSize={10}
                  fontFamily="monospace"
                >
                  {formatValue(d.value)}
                </text>
              </>
            )}
            <text
              x={x + barWidth / 2}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              fill="#858585"
              fontSize={9}
              fontFamily="monospace"
            >
              {d.label.length > 8 ? `${d.label.slice(0, 8)}..` : d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
