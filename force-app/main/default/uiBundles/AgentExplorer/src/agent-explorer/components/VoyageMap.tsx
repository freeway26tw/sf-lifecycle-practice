import type { VoyagePart } from '../lib/odysseyConcepts';

export const VOYAGE_VIEWBOX = '0 0 700 460';

const CENTER = { x: 350, y: 225 };
const RING_RADIUS = 165;

// Nine waypoints evenly spaced around Ithaca, starting at the top and going clockwise.
const WAYPOINT_ORDER: VoyagePart[] = ['athena', 'mast', 'stars', 'winds', 'trials', 'underworld', 'lotus', 'scar', 'hermes'];

export const WAYPOINTS: Record<VoyagePart, { x: number; y: number }> = WAYPOINT_ORDER.reduce(
  (acc, part, i) => {
    const angle = (-90 + i * 40) * (Math.PI / 180);
    acc[part] = {
      x: Math.round(CENTER.x + RING_RADIUS * Math.cos(angle)),
      y: Math.round(CENTER.y + RING_RADIUS * Math.sin(angle))
    };
    return acc;
  },
  {} as Record<VoyagePart, { x: number; y: number }>
);

/** A gentle repeating wave line, drawn as alternating quadratic bumps. */
export function wavePath(startX: number, endX: number, y: number, amplitude: number, wavelength: number): string {
  let d = `M ${startX} ${y}`;
  let x = startX;
  let dir = 1;
  while (x < endX) {
    const midX = x + wavelength / 2;
    const nextX = Math.min(x + wavelength, endX);
    d += ` Q ${midX} ${y - amplitude * dir} ${nextX} ${y}`;
    dir *= -1;
    x = nextX;
  }
  return d;
}

/** A simplified Greek key (meander) border, built as a repeating square-wave. */
export function greekKeyPoints(startX: number, endX: number, y: number, unit: number, height: number): string {
  const pts: string[] = [`${startX},${y}`];
  let x = startX;
  let up = true;
  while (x < endX) {
    if (up) {
      pts.push(`${x},${y - height}`);
      x = Math.min(x + unit, endX);
      pts.push(`${x},${y - height}`);
    } else {
      pts.push(`${x},${y}`);
      x = Math.min(x + unit, endX);
      pts.push(`${x},${y}`);
    }
    up = !up;
  }
  return pts.join(' ');
}

const WAVES = [wavePath(20, 680, 430, 5, 26), wavePath(20, 680, 442, 4, 22), wavePath(20, 680, 452, 3.5, 30)];
const GREEK_KEY = greekKeyPoints(30, 670, 22, 18, 10);

function Ithaca() {
  return (
    <g stroke="var(--text-secondary)" strokeWidth={2}>
      <ellipse cx={CENTER.x} cy={CENTER.y + 10} rx={38} ry={15} />
      <polygon points={`${CENTER.x},${CENTER.y - 16} ${CENTER.x - 9},${CENTER.y - 5} ${CENTER.x + 9},${CENTER.y - 5}`} />
      <rect x={CENTER.x - 7} y={CENTER.y - 5} width={14} height={9} />
      <line x1={CENTER.x - 20} y1={CENTER.y - 2} x2={CENTER.x - 20} y2={CENTER.y - 14} strokeWidth={1.5} />
      <line x1={CENTER.x + 20} y1={CENTER.y - 2} x2={CENTER.x + 20} y2={CENTER.y - 14} strokeWidth={1.5} />
    </g>
  );
}

function Ship() {
  return (
    <g stroke="var(--text-muted)" strokeWidth={1.5} transform={`translate(${CENTER.x - 10}, ${408})`}>
      <polygon points="-16,6 16,6 10,14 -10,14" />
      <line x1={0} y1={6} x2={0} y2={-14} />
      <polygon points="0,-14 0,4 14,4" />
    </g>
  );
}

function CompassRose() {
  const cx = 645;
  const cy = 55;
  return (
    <g stroke="var(--gridline)" strokeWidth={1}>
      <circle cx={cx} cy={cy} r={22} />
      <line x1={cx} y1={cy - 28} x2={cx} y2={cy + 28} />
      <line x1={cx - 28} y1={cy} x2={cx + 28} y2={cy} />
      <line x1={cx - 16} y1={cy - 16} x2={cx + 16} y2={cy + 16} strokeDasharray="1 3" />
      <line x1={cx - 16} y1={cy + 16} x2={cx + 16} y2={cy - 16} strokeDasharray="1 3" />
      <text x={cx} y={cy - 32} textAnchor="middle" fontSize={8} fill="var(--text-muted)" stroke="none">
        N
      </text>
    </g>
  );
}

// Each waypoint icon is drawn in local coordinates centered on (0,0), then
// translated into place — keeps the geometry sane to reason about.
const ICONS: Record<VoyagePart, React.ReactNode> = {
  athena: (
    <g strokeWidth={1.8}>
      <ellipse cx={0} cy={2} rx={10} ry={12} />
      <polygon points="-8,-7 -4,-16 -1,-8" />
      <polygon points="8,-7 4,-16 1,-8" />
      <circle cx={-4} cy={0} r={2.6} />
      <circle cx={4} cy={0} r={2.6} />
      <polygon points="0,4 -2,7 2,7" />
    </g>
  ),
  mast: (
    <g strokeWidth={1.8}>
      <line x1={0} y1={-16} x2={0} y2={16} />
      <line x1={-11} y1={-9} x2={11} y2={-9} />
      <polygon points="0,-9 11,-9 0,6" />
      <circle cx={-13} cy={-9} r={1.8} />
      <circle cx={13} cy={-9} r={1.8} />
    </g>
  ),
  stars: (
    <g strokeWidth={1.6}>
      {[
        [-9, -5],
        [8, -8],
        [1, 9]
      ].map(([sx, sy], i) => (
        <polygon key={i} points="0,-5 2,0 0,5 -2,0" transform={`translate(${sx},${sy})`} />
      ))}
    </g>
  ),
  winds: (
    <g strokeWidth={1.8}>
      <ellipse cx={0} cy={4} rx={11} ry={10} />
      <line x1={-4} y1={-6} x2={0} y2={-15} />
      <line x1={4} y1={-6} x2={0} y2={-15} />
      <path d="M 13,-2 Q 20,-4 24,-8" fill="none" strokeWidth={1.2} />
      <path d="M 13,5 Q 20,6 24,3" fill="none" strokeWidth={1.2} />
    </g>
  ),
  scar: (
    <g strokeWidth={1.8}>
      <line x1={0} y1={15} x2={0} y2={-10} />
      <line x1={0} y1={-6} x2={-10} y2={-13} />
      <line x1={0} y1={-10} x2={9} y2={-16} />
      <line x1={0} y1={1} x2={-9} y2={-3} />
      <line x1={0} y1={5} x2={8} y2={0} />
    </g>
  ),
  trials: (
    <g strokeWidth={1.8}>
      <ellipse cx={-8} cy={5} rx={7} ry={4} />
      <ellipse cx={5} cy={7} rx={9} ry={4.5} />
      <ellipse cx={12} cy={2} rx={5} ry={3} />
    </g>
  ),
  underworld: (
    <g strokeWidth={1.8}>
      <line x1={0} y1={15} x2={0} y2={0} />
      <polygon points="0,0 -6,-9 0,-17 6,-9" />
    </g>
  ),
  lotus: (
    <g strokeWidth={1.6}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <ellipse cx={0} cy={-8} rx={3.2} ry={8} />
        </g>
      ))}
      <circle cx={0} cy={0} r={2.5} />
    </g>
  ),
  hermes: (
    <g strokeWidth={1.8}>
      <ellipse cx={-2} cy={7} rx={11} ry={4.2} />
      <line x1={2} y1={3} x2={2} y2={-6} />
      <polygon points="2,-6 12,-15 6,-3" />
      <polygon points="2,-6 -4,-17 -6,-5" />
    </g>
  )
};

interface WaypointProps {
  part: VoyagePart;
  active: boolean;
  color: string;
  interactive: boolean;
  onClick?: (part: VoyagePart) => void;
  onHover?: (part: VoyagePart | null) => void;
}

function Waypoint({ part, active, color, interactive, onClick, onHover }: WaypointProps) {
  const { x, y } = WAYPOINTS[part];
  return (
    <g
      transform={`translate(${x},${y})`}
      stroke={active ? color : 'var(--text-secondary)'}
      fill="none"
      style={{
        cursor: interactive ? 'pointer' : undefined,
        transition: 'stroke 150ms, filter 150ms',
        filter: active ? `drop-shadow(0 0 5px color-mix(in srgb, ${color} 70%, transparent))` : undefined
      }}
      onClick={interactive ? () => onClick?.(part) : undefined}
      onMouseEnter={interactive ? () => onHover?.(part) : undefined}
      onMouseLeave={interactive ? () => onHover?.(null) : undefined}
    >
      <circle r={26} strokeWidth={active ? 2 : 1.2} strokeDasharray={active ? undefined : '3 3'} />
      {ICONS[part]}
      {interactive && <circle r={30} fill="transparent" stroke="none" />}
    </g>
  );
}

interface Props {
  activePart?: VoyagePart | null;
  colorForPart?: (part: VoyagePart) => string;
  onPartClick?: (part: VoyagePart) => void;
  onPartHover?: (part: VoyagePart | null) => void;
  interactive?: boolean;
  unitLabel?: string;
  className?: string;
}

export function VoyageMap({ activePart, colorForPart, onPartClick, onPartHover, interactive = true, unitLabel, className }: Props) {
  const routePoints = WAYPOINT_ORDER.map((p) => `${WAYPOINTS[p].x},${WAYPOINTS[p].y}`).join(' ');

  return (
    <svg viewBox={VOYAGE_VIEWBOX} className={className} fill="none">
      <polyline points={GREEK_KEY} stroke="var(--gridline)" strokeWidth={1.5} fill="none" />
      {WAVES.map((d, i) => (
        <path key={i} d={d} stroke="var(--gridline)" strokeWidth={1} fill="none" />
      ))}
      <CompassRose />
      <polygon points={routePoints} stroke="var(--gridline)" strokeWidth={1.2} strokeDasharray="1 6" fill="none" />
      <Ship />
      <Ithaca />
      {unitLabel && (
        <text
          x={CENTER.x}
          y={CENTER.y + 44}
          textAnchor="middle"
          fontSize={9}
          letterSpacing={1}
          fill="var(--text-muted)"
          stroke="none"
          fontFamily="ui-monospace, Menlo, Consolas, monospace"
        >
          伊薩卡 · {unitLabel}
        </text>
      )}
      {WAYPOINT_ORDER.map((part) => (
        <Waypoint
          key={part}
          part={part}
          active={activePart === part}
          color={colorForPart ? `var(${colorForPart(part)})` : 'var(--text-secondary)'}
          interactive={interactive}
          onClick={onPartClick}
          onHover={onPartHover}
        />
      ))}
    </svg>
  );
}
