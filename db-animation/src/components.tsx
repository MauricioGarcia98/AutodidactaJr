import React from 'react';
import {Easing, interpolate} from 'remotion';

export const C = {
  bg: '#0b1020', panel: '#141b34', text: '#e6edf7', mute: '#8b9ac0', line: '#6f7fae',
  blue: '#38bdf8', orange: '#f59e0b', green: '#34d399', pink: '#f472b6', purple: '#a78bfa',
};
export const FONT = 'Inter, "Segoe UI", Helvetica, Arial, sans-serif';

export const prog = (f: number, start: number, dur: number) =>
  interpolate(f, [start, start + dur], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic),
  });

export const ROW = 38;
export const HEAD = 52;
export const rowY = (y: number, i: number) => y + HEAD + i * ROW + ROW / 2;

type Row = {text: string; tag?: string};
export const Table: React.FC<{
  x: number; y: number; w: number; title: string; color: string; rows: Row[]; p: number;
  hl?: Record<number, number>; glow?: number;
}> = ({x, y, w, title, color, rows, p, hl = {}, glow = 0}) => {
  const h = HEAD + rows.length * ROW;
  return (
    <g opacity={p} transform={`translate(${x},${y + (1 - p) * 24})`} fontFamily={FONT}>
      {glow > 0 && <rect x={-8} y={-8} width={w + 16} height={h + 16} rx={18} fill="none" stroke={color} strokeWidth={4} opacity={glow} />}
      <rect width={w} height={h} rx={12} fill={C.panel} stroke={color} strokeWidth={2.5} />
      <path d={`M0,${HEAD} V12 Q0,0 12,0 H${w - 12} Q${w},0 ${w},12 V${HEAD} Z`} fill={color} />
      <text x={w / 2} y={HEAD / 2 + 9} textAnchor="middle" fontSize={25} fontWeight={800} fill={C.bg}>{title}</text>
      {rows.map((r, i) => (
        <g key={i} transform={`translate(0,${HEAD + i * ROW})`}>
          {hl[i] ? <rect x={3} y={1} width={w - 6} height={ROW - 2} fill={color} opacity={0.28 * hl[i]} /> : null}
          <text x={18} y={ROW / 2 + 7} fontSize={21} fill={C.text}>{r.text}</text>
          {r.tag && (
            <g transform={`translate(${w - 54},${ROW / 2 - 12})`}>
              <rect width={40} height={24} rx={6} fill="none" stroke={color} />
              <text x={20} y={17} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>{r.tag}</text>
            </g>
          )}
        </g>
      ))}
    </g>
  );
};

type P = [number, number];
const Marker: React.FC<{at: P; dir: P; kind: 'one' | 'many'; color: string; o: number}> = ({at, dir, kind, color, o}) => {
  const [x, y] = at; const [dx, dy] = dir; const nx = -dy; const ny = dx;
  if (kind === 'one') {
    return <g opacity={o} stroke={color} strokeWidth={4} strokeLinecap="round">
      {[16, 28].map((d) => <line key={d} x1={x - dx * d + nx * 12} y1={y - dy * d + ny * 12} x2={x - dx * d - nx * 12} y2={y - dy * d - ny * 12} />)}
    </g>;
  }
  const ax = x - dx * 26; const ay = y - dy * 26;
  return <g opacity={o} stroke={color} strokeWidth={4} strokeLinecap="round">
    <line x1={ax} y1={ay} x2={x + nx * 14} y2={y + ny * 14} />
    <line x1={ax} y1={ay} x2={x} y2={y} />
    <line x1={ax} y1={ay} x2={x - nx * 14} y2={y - ny * 14} />
  </g>;
};

export const Link: React.FC<{
  a: P; b: P; p: number; color?: string; curve?: boolean; aKind?: 'one' | 'many'; bKind?: 'one' | 'many'; width?: number;
}> = ({a, b, p, color = C.line, curve = false, aKind, bKind, width = 3.5}) => {
  const dxl = (b[0] - a[0]) / 2;
  const d = curve ? `M${a[0]},${a[1]} C${a[0] + dxl},${a[1]} ${b[0] - dxl},${b[1]} ${b[0]},${b[1]}` : `M${a[0]},${a[1]} L${b[0]},${b[1]}`;
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const u: P = curve ? [Math.sign(b[0] - a[0]) || 1, 0] : [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const mo = Math.max(0, (p - 0.85) / 0.15);
  return (
    <g>
      <path d={d} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {aKind && <Marker at={a} dir={[-u[0], -u[1]]} kind={aKind} color={color} o={mo} />}
      {bKind && <Marker at={b} dir={u} kind={bKind} color={color} o={mo} />}
    </g>
  );
};

export const Title: React.FC<{text: string; sub?: string; p: number}> = ({text, sub, p}) => (
  <g fontFamily={FONT} opacity={p} transform={`translate(0,${(1 - p) * -16})`}>
    <text x={960} y={92} textAnchor="middle" fontSize={56} fontWeight={800} fill={C.text}>{text}</text>
    {sub && <text x={960} y={140} textAnchor="middle" fontSize={26} fill={C.mute}>{sub}</text>}
  </g>
);

export const Caption: React.FC<{lines: string[]; p: number; y?: number; color?: string}> = ({lines, p, y = 940, color = C.text}) => (
  <g fontFamily={FONT} opacity={p} transform={`translate(0,${(1 - p) * 14})`}>
    {lines.map((l, i) => (
      <text key={i} x={960} y={y + i * 40} textAnchor="middle" fontSize={i === 0 ? 32 : 26} fontWeight={i === 0 ? 700 : 400} fill={i === 0 ? color : C.mute}>{l}</text>
    ))}
  </g>
);

export const Badge: React.FC<{text: string; x: number; y: number; color: string; p: number; size?: number}> = ({text, x, y, color, p, size = 64}) => (
  <g fontFamily={FONT} opacity={p} transform={`translate(${x},${y}) scale(${0.8 + 0.2 * p})`}>
    <text textAnchor="middle" fontSize={size} fontWeight={900} fill={color}>{text}</text>
  </g>
);

export const Scene: React.FC<{f: number; dur: number; children: React.ReactNode}> = ({f, dur, children}) => {
  const o = Math.min(prog(f, 0, 14), 1 - prog(f, dur - 14, 14));
  return <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute', opacity: o}}>{children}</svg>;
};
