'use client';

import { ZODIAC_SIGNS } from '@/lib/astrology';
import type { ChartData } from '@/lib/birthChart';

interface Props {
  chart: ChartData;
}

const SIZE = 400;
const CENTER = SIZE / 2;
const OUTER_R = 180;
const INNER_R = 140;
const PLANET_R = 110;

export default function BirthChart({ chart }: Props) {
  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-md"
        style={{ maxHeight: '400px' }}
      >
        {/* Outer circle */}
        <circle cx={CENTER} cy={CENTER} r={OUTER_R} fill="none" stroke="var(--th-border)" strokeWidth="1" />
        <circle cx={CENTER} cy={CENTER} r={INNER_R} fill="none" stroke="var(--th-border)" strokeWidth="1" />
        <circle cx={CENTER} cy={CENTER} r={PLANET_R - 20} fill="none" stroke="var(--th-border)" strokeWidth="0.5" strokeDasharray="2,4" />

        {/* Sign divisions and labels */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 - 90) * (Math.PI / 180);
          const midAngle = ((i * 30 + 15) - 90) * (Math.PI / 180);
          const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);

          const x1 = CENTER + OUTER_R * Math.cos(startAngle);
          const y1 = CENTER + OUTER_R * Math.sin(startAngle);
          const x2 = CENTER + INNER_R * Math.cos(startAngle);
          const y2 = CENTER + INNER_R * Math.sin(startAngle);

          const labelR = (OUTER_R + INNER_R) / 2;
          const lx = CENTER + labelR * Math.cos(midAngle);
          const ly = CENTER + labelR * Math.sin(midAngle);

          const isHighlighted = sign.name === chart.sunSign;

          return (
            <g key={sign.name}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--th-border)" strokeWidth="0.5" />
              {isHighlighted && (
                <path
                  d={describeArc(CENTER, CENTER, (OUTER_R + INNER_R) / 2, i * 30 - 90, (i + 1) * 30 - 90, (OUTER_R - INNER_R) / 2)}
                  fill="var(--th-accent)"
                  opacity="0.15"
                />
              )}
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="14"
                fill={isHighlighted ? 'var(--th-accent)' : 'var(--th-muted)'}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Planets */}
        {chart.planets.map((planet) => {
          const angle = (planet.degree - 90) * (Math.PI / 180);
          const r = planet.name === 'Ascendant' ? INNER_R - 5 : PLANET_R;
          const px = CENTER + r * Math.cos(angle);
          const py = CENTER + r * Math.sin(angle);

          return (
            <g key={planet.name}>
              <circle cx={px} cy={py} r="12" fill="var(--th-bg)" stroke="var(--th-accent)" strokeWidth="1" />
              <text
                x={px}
                y={py}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={planet.symbol.length > 1 ? '8' : '12'}
                fontWeight="bold"
                fill="var(--th-accent)"
              >
                {planet.symbol}
              </text>
            </g>
          );
        })}

        {/* Center */}
        <circle cx={CENTER} cy={CENTER} r="30" fill="var(--th-bg)" stroke="var(--th-border)" strokeWidth="1" />
        <text
          x={CENTER}
          y={CENTER - 6}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          fill="var(--th-accent)"
        >
          {ZODIAC_SIGNS.find((s) => s.name === chart.sunSign)?.symbol}
        </text>
        <text
          x={CENTER}
          y={CENTER + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="6"
          fill="var(--th-muted)"
          fontFamily="var(--font-mono-editorial, monospace)"
          letterSpacing="0.05em"
          style={{ textTransform: 'uppercase' }}
        >
          {chart.sunSign}
        </text>
      </svg>
    </div>
  );
}

// Helper to create an arc path for highlighted sign segment
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  thickness: number
): string {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const outerR = r + thickness;
  const innerR = r - thickness;

  const x1 = cx + outerR * Math.cos(startRad);
  const y1 = cy + outerR * Math.sin(startRad);
  const x2 = cx + outerR * Math.cos(endRad);
  const y2 = cy + outerR * Math.sin(endRad);
  const x3 = cx + innerR * Math.cos(endRad);
  const y3 = cy + innerR * Math.sin(endRad);
  const x4 = cx + innerR * Math.cos(startRad);
  const y4 = cy + innerR * Math.sin(startRad);

  return `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;
}
