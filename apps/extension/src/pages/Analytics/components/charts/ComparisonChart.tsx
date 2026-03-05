import { useState } from "react";

interface GroupValue {
  label: string;
  value: number;
  color: string;
}

interface Group {
  name: string;
  values: GroupValue[];
}

interface ComparisonChartProps {
  groups: Group[];
}

const PADDING = { top: 24, right: 16, bottom: 40, left: 50 };
const CHART_HEIGHT = 220;
const CHART_WIDTH = 600;

export function ComparisonChart({ groups }: ComparisonChartProps) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    content: string;
  } | null>(null);

  if (groups.length === 0) return null;

  const innerW = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerH = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  const maxBarsPerGroup = Math.max(...groups.map((g) => g.values.length));
  const maxVal = Math.max(
    ...groups.flatMap((g) => g.values.map((v) => v.value)),
    100,
  );

  const groupWidth = innerW / groups.length;
  const barWidth = Math.min(24, (groupWidth * 0.7) / maxBarsPerGroup);
  const barGap = 3;

  const legendItems =
    groups[0]?.values.map((v) => ({
      label: v.label,
      color: v.color,
    })) ?? [];

  return (
    <svg
      role="img"
      aria-label="Comparison chart"
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="w-full h-auto"
    >
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
        const v = Math.round(maxVal * ratio);
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
              fontFamily="monospace"
            >
              {v}
            </text>
          </g>
        );
      })}

      {groups.map((group, gi) => {
        const groupX = PADDING.left + gi * groupWidth;
        const groupCenter = groupX + groupWidth / 2;
        const totalBarsWidth =
          group.values.length * barWidth + (group.values.length - 1) * barGap;
        const startX = groupCenter - totalBarsWidth / 2;

        return (
          <g key={group.name}>
            {group.values.map((v, vi) => {
              const barH = (v.value / maxVal) * innerH;
              const x = startX + vi * (barWidth + barGap);
              const y = PADDING.top + innerH - barH;

              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: static chart
                <rect
                  key={v.label}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={0}
                  fill={v.color}
                  opacity={0.8}
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setTooltip({
                      x: x + barWidth / 2,
                      y: y - 12,
                      content: `${v.label}: ${v.value}`,
                    })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
            <text
              x={groupCenter}
              y={CHART_HEIGHT - 8}
              textAnchor="middle"
              fill="#858585"
              fontSize={10}
              fontFamily="monospace"
            >
              {group.name}
            </text>
          </g>
        );
      })}

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

      <g fontFamily="monospace">
        {legendItems.map((item, i) => (
          <g
            key={item.label}
            transform={`translate(${PADDING.left + i * 80}, ${PADDING.top - 12})`}
          >
            <rect width={8} height={8} rx={0} fill={item.color} opacity={0.85} />
            <text x={12} y={8} fontSize={9} fill="#858585">
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
