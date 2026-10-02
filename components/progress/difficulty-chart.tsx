import type { DifficultyPoint } from "@/lib/progress/growth";

const W = 320;
const H = 120;
const PAD = { top: 8, right: 8, bottom: 20, left: 24 };
const MIN = 1;
const MAX = 5;

const dateFormat = new Intl.DateTimeFormat("ko-KR", { month: "numeric", day: "numeric", timeZone: "Asia/Seoul" });

/**
 * 추천 난이도 변화 꺾은선 그래프. 차트 라이브러리 없이 SVG로 그린다. (점 수십 개 수준이라 충분)
 * 색은 currentColor·테마 변수만 써서 다크 모드에서도 그대로 보인다.
 */
export function DifficultyChart({ points }: { points: DifficultyPoint[] }) {
  if (points.length < 2) {
    return <p className="text-sm text-muted-foreground">문제를 풀면 난이도 변화가 여기에 그려져요.</p>;
  }

  const t0 = new Date(points[0].at).getTime();
  const t1 = new Date(points[points.length - 1].at).getTime();
  const span = Math.max(t1 - t0, 1);
  const x = (at: string) => PAD.left + ((new Date(at).getTime() - t0) / span) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + ((MAX - v) / (MAX - MIN)) * (H - PAD.top - PAD.bottom);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.at).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const first = points[0].value;
  const last = points[points.length - 1].value;

  return (
    <figure className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full text-primary"
        role="img"
        aria-label={`최근 30일 추천 난이도: ${first.toFixed(1)}에서 ${last.toFixed(1)}로 변화`}
      >
        {[1, 2, 3, 4, 5].map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={0.5} />
            <text x={PAD.left - 6} y={y(v) + 3} textAnchor="end" className="fill-muted-foreground text-[8px]">
              {v}
            </text>
          </g>
        ))}
        <path d={path} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(p.at)} cy={y(p.value)} r={1.8} fill="currentColor" />
        ))}
        <text x={PAD.left} y={H - 4} className="fill-muted-foreground text-[8px]">
          {dateFormat.format(new Date(points[0].at))}
        </text>
        <text x={W - PAD.right} y={H - 4} textAnchor="end" className="fill-muted-foreground text-[8px]">
          오늘
        </text>
      </svg>
    </figure>
  );
}
