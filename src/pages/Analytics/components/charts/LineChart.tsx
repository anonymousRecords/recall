import { useState } from "react";

interface Series {
  name: string;
  data: number[];
  color: string;
}

interface LineChartProps {
  series: Series[];
  labels: string[];
}

const PADDING = { top: 20, right: 20, bottom: 40, left: 40 };
const CHART_HEIGHT = 240;
const CHART_WIDTH = 600;

export function LineChart({ series, labels }: LineChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  if (labels.length === 0) return null;

  const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const allValues = series.flatMap((s) => s.data);
  const maxVal = Math.max(...allValues, 100);
  const minVal = Math.min(...allValues, 0);
  const range = maxVal - minVal || 1;

  const xStep = labels.length > 1 ? innerW / (labels.length - 1) : innerW;

  function toX(i: number) {
    return PADDING.left + (labels.length > 1 ? i * xStep : innerW / 2);
  }

  function toY(v: number) {
    return PADDING.top + innerH - ((v - minVal) / range) * innerH;
  }

  const gridLines = [0, 25, 50, 75, 100].filter(
    (v) => v >= minVal && v <= maxVal,
  );

  return (
    <svg
      role="img"
      aria-label="Line chart"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="w-full h-auto"
    >
      {gridLines.map((v) => (
        <g key={v}>
          <line
            x1={PADDING.left}
            y1={toY(v)}
            x2={CHART_WIDTH - PADDING.right}
            y2={toY(v)}
            stroke="#3e3e42"
            strokeOpacity={0.6}
            strokeDasharray="4 4"
          />
          <text
            x={PADDING.left - 6}
            y={toY(v)}
            textAnchor="end"
            dominantBaseline="middle"
            fill="#858585"
            fontSize={10}
            fontFamily="monospace"
          >
            {v}
          </text>
        </g>
      ))}

      {series.map((s) => {
        if (s.data.length === 0) return null;
        const points = s.data.map((v, i) => `${toX(i)},${toY(v)}`).join(" ");
        return (
          <g key={s.name}>
            <polyline
              points={points}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
            {s.data.map((v, i) => (
              // biome-ignore lint/a11y/noStaticElementInteractions: static chart
              <circle
                key={`${s.name}-${i}`}
                cx={toX(i)}
                cy={toY(v)}
                r={3.5}
                fill={s.color}
                className="cursor-pointer"
                onMouseEnter={() => {
                  setTooltip({
                    x: toX(i),
                    y: toY(v) - 12,
                    content: `${s.name}: ${v}`,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            ))}
          </g>
        );
      })}

      {labels.map((label, i) => (
        <text
          key={label}
          x={toX(i)}
          y={CHART_HEIGHT - 6}
          textAnchor="middle"
          fill="#858585"
          fontSize={9}
          fontFamily="monospace"
        >
          {label.length > 8 ? `${label.slice(0, 8)}..` : label}
        </text>
      ))}

      {tooltip && (
        <g>
          <rect
            x={tooltip.x - 48}
            y={tooltip.y - 14}
            width={96}
            height={18}
            rx={0}
            fill="#252526"
            stroke="#3e3e42"
            strokeWidth={1}
          />
          <text
            x={tooltip.x}
            y={tooltip.y - 2}
            textAnchor="middle"
            fill="#d4d4d4"
            fontSize={10}
            fontFamily="monospace"
            fontWeight={500}
          >
            {tooltip.content}
          </text>
        </g>
      )}

      <g fill="#858585" fontFamily="monospace">
        {series.map((s, i) => (
          <g
            key={s.name}
            transform={`translate(${PADDING.left + i * 100}, ${PADDING.top - 8})`}
          >
            <rect width={8} height={8} rx={0} fill={s.color} opacity={0.85} />
            <text x={12} y={8} fontSize={9} fill="#858585">
              {s.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
