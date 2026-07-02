import { useState, useMemo } from 'react'
import { ShieldAlert, Shield, Users, Server, Globe } from 'lucide-react'

// --- Types ---
export interface ChartDataPoint {
  label: string
  value: number
  extra?: string
}

// --- 1. SEVERITY DONUT CHART ---
interface SeverityDonutChartProps {
  critical: number
  high: number
  warning: number
  info: number
}

export function SeverityDonutChart({
  critical,
  high,
  warning,
  info,
}: SeverityDonutChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const data = useMemo(
    () => [
      {
        label: 'Critique',
        value: critical || 0,
        color: '#ef4444',
        hoverColor: '#dc2626',
        shadow: 'rgba(239, 68, 68, 0.4)',
      },
      {
        label: 'Élevé',
        value: high || 0,
        color: '#f97316',
        hoverColor: '#ea580c',
        shadow: 'rgba(249, 115, 22, 0.4)',
      },
      {
        label: 'Avertissement',
        value: warning || 12,
        color: '#eab308',
        hoverColor: '#ca8a04',
        shadow: 'rgba(234, 179, 8, 0.4)',
      },
      {
        label: 'Information',
        value: info || 25,
        color: '#3b82f6',
        hoverColor: '#2563eb',
        shadow: 'rgba(59, 130, 246, 0.4)',
      },
    ],
    [critical, high, warning, info],
  )

  const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data])

  // Circular calculations
  const radius = 55
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  const segments = useMemo(() => {
    let accumulatedPercent = 0
    return data.map((d) => {
      const percent = total > 0 ? (d.value / total) * 100 : 0
      const strokeDashoffset = circumference - (percent / 100) * circumference
      const strokeDasharray = `${circumference} ${circumference}`
      const rotation = (accumulatedPercent / 100) * 360
      accumulatedPercent += percent
      return {
        ...d,
        percent,
        strokeDasharray,
        strokeDashoffset,
        rotation,
      }
    })
  }, [data, total, circumference])

  const activeSegment = hoveredIdx !== null ? segments[hoveredIdx] : null

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-(--sea-ink)">
            Alertes par Sévérité
          </h3>
          <p className="text-[10px] text-(--sea-ink-soft)">
            Distribution des alertes en cours
          </p>
        </div>
        <Shield className="size-4 text-(--sea-ink-soft)" />
      </div>

      <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-6 min-h-45">
        {/* SVG Circle */}
        <div className="relative size-36 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 140 140">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              className="stroke-zinc-100 dark:stroke-zinc-800"
              strokeWidth={strokeWidth}
            />
            {/* Segment circles */}
            {segments.map((seg, idx) => (
              <circle
                key={seg.label}
                cx="70"
                cy="70"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth + (hoveredIdx === idx ? 2 : 0)}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                style={{
                  transformOrigin: '70px 70px',
                  transform: `rotate(${seg.rotation}deg)`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  filter:
                    hoveredIdx === idx
                      ? `drop-shadow(0 0 4px ${seg.color})`
                      : 'none',
                }}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
            <span className="text-2xl font-bold text-(--sea-ink)">
              {activeSegment ? activeSegment.value : total}
            </span>
            <span className="text-[10px] text-(--sea-ink-soft) uppercase font-semibold tracking-wider">
              {activeSegment ? activeSegment.label : 'Total'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 w-full">
          {segments.map((seg, idx) => (
            <div
              key={seg.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                hoveredIdx === idx
                  ? 'border-(--sea-ink-soft) bg-zinc-50 dark:bg-zinc-800/50 scale-[1.02]'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs font-medium text-(--sea-ink)">
                  {seg.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-(--sea-ink)">
                  {seg.value}
                </span>
                <span className="text-[10px] text-(--sea-ink-soft) font-medium">
                  ({seg.percent.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- 2. EVENT EVOLUTION CHART ---
interface EventTimelinePoint {
  bucket_start: string
  bucket_end: string
  label: string
  count: number
}

interface EventEvolutionChartProps {
  data?: EventTimelinePoint[]
}

export function EventEvolutionChart({ data }: EventEvolutionChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const dataset = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((d) => ({ time: d.label, count: d.count }))
    }
    // Fallback empty
    return []
  }, [data])

  const maxVal = useMemo(
    () => Math.max(...dataset.map((d) => d.count), 1),
    [dataset],
  )
  const yTicks = useMemo(() => {
    const step = Math.ceil(maxVal / 4)
    return [0, step, step * 2, step * 3, step * 4]
  }, [maxVal])

  // Coordinate math
  const width = 500
  const height = 150
  const paddingX = 25
  const paddingY = 15

  const points = useMemo(() => {
    const usableW = width - paddingX * 2
    const usableH = height - paddingY * 2

    return dataset.map((d, i) => {
      const x = paddingX + (i / (dataset.length - 1)) * usableW
      const y = height - paddingY - (d.count / maxVal) * usableH
      return { x, y, ...d }
    })
  }, [dataset, maxVal])

  const linePath = useMemo(() => {
    if (points.length === 0) return ''
    return points.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`
    }, '')
  }, [points])

  const areaPath = useMemo(() => {
    if (points.length === 0) return ''
    const startX = points[0].x
    const endX = points[points.length - 1].x
    const floorY = height - paddingY
    return `${linePath} L ${endX} ${floorY} L ${startX} ${floorY} Z`
  }, [points, linePath])

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-(--sea-ink)">
            Évolution des Événements (24h)
          </h3>
          <p className="text-[10px] text-(--sea-ink-soft)">
            Volume de logs analysés par heure
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
          <span className="size-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Live Stream</span>
        </div>
      </div>

      <div className="relative flex-1 w-full mt-2 select-none">
        <svg
          className="w-full h-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((val) => {
            const y =
              height - paddingY - (val / maxVal) * (height - paddingY * 2)
            return (
              <g key={val} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  className="stroke-zinc-200 dark:stroke-zinc-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 5}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-zinc-400 font-mono text-[8px]"
                >
                  {val}
                </text>
              </g>
            )
          })}

          {/* Area under the line */}
          <path d={areaPath} fill="url(#area-gradient)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive vertical guide line & point hover */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <g>
              <line
                x1={points[hoveredIdx].x}
                y1={paddingY}
                x2={points[hoveredIdx].x}
                y2={height - paddingY}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              <circle
                cx={points[hoveredIdx].x}
                cy={points[hoveredIdx].y}
                r="4.5"
                fill="#3b82f6"
                className="stroke-white dark:stroke-zinc-900"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Invisible interactive columns for easy hovering */}
          {points.map((pt, idx) => {
            const stepW = (width - paddingX * 2) / dataset.length
            return (
              <rect
                key={idx}
                x={pt.x - stepW / 2}
                y={0}
                width={stepW}
                height={height}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            )
          })}
        </svg>

        {/* Custom HTML Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute z-10 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md text-left text-[10px] pointer-events-none"
            style={{
              left: `${Math.min(width - 120, Math.max(10, (points[hoveredIdx].x / width) * 100))}%`,
              bottom: '90%',
              transform: 'translateX(-50%)',
              transition: 'left 0.1s ease-out',
            }}
          >
            <div className="font-semibold text-(--sea-ink)">
              Hour: {points[hoveredIdx].time}
            </div>
            <div className="text-blue-500 font-mono font-bold mt-0.5">
              Events: {points[hoveredIdx].count}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-2.5 text-[9px] font-mono text-(--sea-ink-soft) px-5">
        <span>{dataset[0].time}</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>00:00</span>
        <span>{dataset[dataset.length - 1].time}</span>
      </div>
    </div>
  )
}

// --- 3. TOP SOURCES CHART ---
interface TopSourceItem {
  source_ip: string
  count: number
  percentage: number
}

interface TopSourcesChartProps {
  data?: TopSourceItem[]
}

export function TopSourcesChart({ data = [] }: TopSourcesChartProps) {
  // Fallback to empty if no data
  const items = data.length > 0 ? data.slice(0, 5) : []

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-(--sea-ink)">
            Top Sources IP
          </h3>
          <p className="text-[10px] text-(--sea-ink-soft)">
            Hôtes les plus actifs en volume d'événements
          </p>
        </div>
        <Globe className="size-4 text-(--sea-ink-soft)" />
      </div>

      <div className="flex flex-col gap-4 justify-center flex-1">
        {items.map((item) => (
          <div key={item.source_ip} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="font-medium text-(--sea-ink) hover:text-blue-500 transition-colors cursor-pointer">
                {item.source_ip}
              </span>
              <span className="font-bold text-(--sea-ink)">
                {item.count} evts
              </span>
            </div>

            {/* Custom Glowing Bar */}
            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden relative group">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                style={{ width: `${item.percentage}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-white/20 blur-[1px] transition-all duration-300 group-hover:w-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- 4. THREAT TYPES CHART ---
interface ThreatTypeItem {
  type: string
  key: string
  count: number
  percentage: number
}

interface ThreatTypesChartProps {
  data?: ThreatTypeItem[]
}

export function ThreatTypesChart({ data }: ThreatTypesChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const threats = useMemo(() => {
    if (data && data.length > 0) {
      const colors = [
        '#f87171',
        '#fb923c',
        '#fbbf24',
        '#818cf8',
        '#34d399',
        '#a78bfa',
        '#f472b6',
        '#22d3ee',
      ]
      return data.slice(0, 8).map((t, i) => ({
        type: t.type,
        value: t.percentage,
        count: t.count,
        color: colors[i % colors.length],
      }))
    }
    return []
  }, [data])

  if (threats.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-(--sea-ink)">
              Types de Menaces
            </h3>
            <p className="text-[10px] text-(--sea-ink-soft)">
              Distribution des typologies d'attaques
            </p>
          </div>
          <ShieldAlert className="size-4 text-(--sea-ink-soft)" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Aucune donnée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-(--sea-ink)">
            Types de Menaces
          </h3>
          <p className="text-[10px] text-(--sea-ink-soft)">
            Distribution des typologies d'attaques
          </p>
        </div>
        <ShieldAlert className="size-4 text-(--sea-ink-soft)" />
      </div>

      <div className="flex items-end justify-between gap-3 h-45 pt-4 px-2 select-none relative">
        {threats.map((t, idx) => (
          <div
            key={t.type}
            className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-lg h-32.5 flex items-end overflow-hidden relative">
              <div
                className="w-full rounded-t-lg transition-all duration-700 ease-out"
                style={{
                  height: `${t.value * 7.5}%`,
                  backgroundColor: t.color,
                  opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.6,
                  boxShadow:
                    hoveredIdx === idx ? `0 0 12px ${t.color}` : 'none',
                }}
              />
            </div>
            {/* Label */}
            <span className="text-[9px] text-(--sea-ink-soft) font-medium text-center truncate max-w-full">
              {t.type.split(' ')[0]}
            </span>
          </div>
        ))}

        {/* Dynamic Tooltip */}
        {hoveredIdx !== null && threats[hoveredIdx] && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md text-xs">
            <p className="font-semibold text-(--sea-ink)">
              {threats[hoveredIdx].type}
            </p>
            <p className="font-mono mt-0.5 text-zinc-500">
              <span style={{ color: threats[hoveredIdx].color }}>
                {threats[hoveredIdx].count} evts
              </span>{' '}
              ({threats[hoveredIdx].value}%)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- 5. LOGIN FAILURES CHART ---
interface LoginFailureItem {
  label: string
  count: number
  threat_level: string
  description: string
}

interface LoginFailuresChartProps {
  data?: LoginFailureItem[]
}

export function LoginFailuresChart({ data }: LoginFailuresChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const timeline = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((d) => ({
        time: d.label,
        count: d.count,
        threat: d.threat_level + (d.description ? ` (${d.description})` : ''),
      }))
    }
    return []
  }, [data])

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-(--sea-ink)">
              Échecs de Connexion
            </h3>
            <p className="text-[10px] text-(--sea-ink-soft)">
              Tendance des connexions rejetées
            </p>
          </div>
          <Users className="size-4 text-(--sea-ink-soft)" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Aucune donnée</p>
        </div>
      </div>
    )
  }

  const maxFailures = useMemo(
    () => Math.max(...timeline.map((t) => t.count)),
    [timeline],
  )

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-(--sea-ink)">
            Échecs de Connexion
          </h3>
          <p className="text-[10px] text-(--sea-ink-soft)">
            Tendance des connexions rejetées
          </p>
        </div>
        <Users className="size-4 text-(--sea-ink-soft)" />
      </div>

      <div className="flex items-end justify-between gap-2.5 h-32.5 select-none relative pt-4">
        {timeline.map((item, idx) => {
          const percent = (item.count / maxFailures) * 100
          return (
            <div
              key={item.time}
              className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t h-22.5 flex items-end relative overflow-hidden">
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    item.count > 100
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      : item.count > 40
                        ? 'bg-orange-500'
                        : 'bg-zinc-400 dark:bg-zinc-600'
                  }`}
                  style={{
                    height: `${percent}%`,
                    opacity:
                      hoveredIdx === null || hoveredIdx === idx ? 1 : 0.6,
                  }}
                />
              </div>
              {/* Label */}
              <span className="text-[8px] font-mono text-(--sea-ink-soft)">
                {item.time}
              </span>
            </div>
          )
        })}

        {/* Tooltip */}
        {hoveredIdx !== null && timeline[hoveredIdx] && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md text-xs w-45">
            <p className="font-semibold text-(--sea-ink)">
              Période : {timeline[hoveredIdx].time}
            </p>
            <p className="mt-1 font-bold text-red-500">
              {timeline[hoveredIdx].count} Échecs
            </p>
            <p className="mt-0.5 text-[10px] text-zinc-400">
              Statut : {timeline[hoveredIdx].threat}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- 6. SUSPICIOUS ACTIVITY HEATMAP ---
interface HeatmapCellData {
  day: string
  hour_block: string
  score: number
  level: string
  description: string
}

interface SuspiciousActivityHeatmapProps {
  data?: HeatmapCellData[]
}

export function SuspiciousActivityHeatmap({
  data,
}: SuspiciousActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{
    day: string
    hour: string
    score: number
    desc: string
  } | null>(null)

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const hourBlocks = [
    '00h-04h',
    '04h-08h',
    '08h-12h',
    '12h-16h',
    '16h-20h',
    '20h-00h',
  ]

  // Build grid from API data or default to empty
  const gridData = useMemo(() => {
    if (data && data.length > 0) {
      const dayMap: Record<string, number> = {
        MON: 0,
        TUE: 1,
        WED: 2,
        THU: 3,
        FRI: 4,
        SAT: 5,
        SUN: 6,
      }
      const hourMap: Record<string, number> = {
        '00h-04h': 0,
        '04h-08h': 1,
        '08h-12h': 2,
        '12h-16h': 3,
        '16h-20h': 4,
        '20h-00h': 5,
      }
      const grid = Array.from({ length: 7 }, () => Array(6).fill(0))
      for (const cell of data) {
        grid[dayMap[cell.day]][hourMap[cell.hour_block]] = Math.min(
          cell.score,
          3,
        )
      }
      return grid
    }
    return Array.from({ length: 7 }, () => Array(6).fill(0))
  }, [data])

  const cellDetails = (dayIdx: number, hourIdx: number) => {
    const val = gridData[dayIdx][hourIdx]
    const day = days[dayIdx]
    const hour = hourBlocks[hourIdx]

    let label = 'Activité Normale'
    if (val === 1) label = 'Anomalie Légère (Échecs authentification)'
    if (val === 2) label = 'Activité Suspecte (Scan de ports / IP externe)'
    if (val === 3)
      label =
        'Alerte Critique (Accès administrateur hors-horaires / Exfiltration)'

    return { day, hour, score: val, desc: label }
  }

  const getCellBg = (val: number) => {
    if (val === 3)
      return 'bg-red-500 dark:bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)] border border-red-400'
    if (val === 2)
      return 'bg-orange-500 dark:bg-orange-500 border border-orange-400'
    if (val === 1)
      return 'bg-yellow-500 dark:bg-yellow-500 border border-yellow-400'
    return 'bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800'
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-(--line) rounded-xl p-5 shadow-sm relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-(--sea-ink)">
            Activité Suspecte (Heatmap)
          </h3>
          <p className="text-[10px] text-(--sea-ink-soft)">
            Recherche d'anomalies de trafic par plage horaire
          </p>
        </div>
        <Server className="size-4 text-(--sea-ink-soft)" />
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2 mt-2 select-none">
        {/* Hour Header */}
        <div className="flex items-center pl-8 mb-1">
          {hourBlocks.map((block) => (
            <span
              key={block}
              className="flex-1 text-[8px] font-mono text-(--sea-ink-soft) text-center"
            >
              {block}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="space-y-1.5">
          {days.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-2">
              {/* Day label */}
              <span className="w-6 text-[9px] font-semibold text-(--sea-ink-soft)">
                {day}
              </span>

              {/* Grid row */}
              <div className="flex-1 flex gap-2">
                {hourBlocks.map((hour, hourIdx) => {
                  const val = gridData[dayIdx][hourIdx]
                  return (
                    <div
                      key={hour}
                      className={`flex-1 aspect-square sm:h-6 rounded cursor-pointer transition-all hover:scale-110 ${getCellBg(val)}`}
                      onMouseEnter={() =>
                        setHoveredCell(cellDetails(dayIdx, hourIdx))
                      }
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom description footer */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-(--line) text-[8px] text-(--sea-ink-soft) justify-center">
          <div className="flex items-center gap-1">
            <span className="size-2 rounded bg-zinc-200 dark:bg-zinc-800" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded bg-yellow-500" />
            <span>Mineur</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded bg-orange-500" />
            <span>Moyen</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="size-2 rounded bg-red-500" />
            <span>Critique</span>
          </div>
        </div>
      </div>

      {/* Pop-up Cell Details */}
      {hoveredCell && (
        <div className="absolute z-20 top-2 left-1/2 -translate-x-1/2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-md text-xs w-55">
          <div className="flex justify-between items-center font-bold text-(--sea-ink) mb-0.5">
            <span>
              {hoveredCell.day} - {hoveredCell.hour}
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                hoveredCell.score === 3
                  ? 'bg-red-950 text-red-200 border border-red-800'
                  : hoveredCell.score === 2
                    ? 'bg-orange-950 text-orange-200'
                    : hoveredCell.score === 1
                      ? 'bg-yellow-950 text-yellow-250'
                      : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
              }`}
            >
              {hoveredCell.score === 3
                ? 'Critique'
                : hoveredCell.score === 2
                  ? 'Moyen'
                  : hoveredCell.score === 1
                    ? 'Mineur'
                    : 'Normal'}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-snug">
            {hoveredCell.desc}
          </p>
        </div>
      )}
    </div>
  )
}
