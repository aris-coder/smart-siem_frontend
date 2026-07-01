import { faker } from '@faker-js/faker'
import type {
  DashboardStats,
  HourlyEvent,
  ThreatItem,
  LoginFailurePeriod,
} from '#/lib/incidents/api'

// ─── 24h timeline ──────────────────────────────────────────────────────────

function generateHourlyEvents(): HourlyEvent[] {
  const now = new Date()
  const hours: HourlyEvent[] = []
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 3_600_000)
    const hour = `${String(d.getUTCHours()).padStart(2, '0')}:00`
    // Simulate a realistic pattern: low at night, peak mid-day, SSH attack spike at 01h
    const base = d.getUTCHours() >= 8 && d.getUTCHours() <= 18 ? 300 : 100
    const spike = d.getUTCHours() === 1 || d.getUTCHours() === 2 ? 500 : 0
    hours.push({ hour, count: base + spike + faker.number.int({ min: 20, max: 200 }) })
  }
  return hours
}

// ─── Threat distribution ───────────────────────────────────────────────────

function generateThreatDistribution(): ThreatItem[] {
  const threats = [
    { type: 'SSH Bruteforce', base: 38 },
    { type: 'DDoS Traffic', base: 24 },
    { type: 'Port Scan', base: 18 },
    { type: 'Malware Dropper', base: 12 },
    { type: 'Data Exfil', base: 8 },
  ]
  return threats.map((t) => {
    const count = faker.number.int({
      min: Math.max(1, t.base * 10 - 100),
      max: t.base * 10 + 100,
    })
    return { type: t.type, count, percentage: t.base + faker.number.int({ min: -3, max: 3 }) }
  })
}

// ─── Login failures timeline ────────────────────────────────────────────────

function generateLoginFailures(): LoginFailurePeriod[] {
  return [
    { period: '02h-04h', count: faker.number.int({ min: 5, max: 15 }), threat_level: 'Faible' },
    { period: '04h-06h', count: faker.number.int({ min: 5, max: 12 }), threat_level: 'Faible' },
    { period: '06h-08h', count: faker.number.int({ min: 10, max: 20 }), threat_level: 'Faible' },
    { period: '08h-10h', count: faker.number.int({ min: 30, max: 60 }), threat_level: 'Moyen' },
    { period: '10h-12h', count: faker.number.int({ min: 60, max: 100 }), threat_level: 'Moyen (Bruteforce suspicion)' },
    { period: '12h-14h', count: faker.number.int({ min: 120, max: 180 }), threat_level: 'Élevé (Attaque force brute IP externe)' },
    { period: '14h-16h', count: faker.number.int({ min: 40, max: 80 }), threat_level: 'Moyen' },
    { period: '16h-18h', count: faker.number.int({ min: 15, max: 40 }), threat_level: 'Faible' },
  ]
}

// ─── Activity heatmap (7 days × 6 hour-blocks) ──────────────────────────────

function generateHeatmap(): number[][] {
  const days = 7
  const blocks = 6
  const grid: number[][] = []
  for (let d = 0; d < days; d++) {
    const row: number[] = []
    for (let b = 0; b < blocks; b++) {
      // Weighted random: 0 = normal, 1 = light, 2 = medium, 3 = critical
      const weights = [0.5, 0.25, 0.15, 0.1]
      const rand = Math.random()
      let val = 0
      let acc = 0
      for (let v = 0; v < weights.length; v++) {
        acc += weights[v]!
        if (rand < acc) { val = v; break }
      }
      row.push(val)
    }
    grid.push(row)
  }
  return grid
}

// ─── Top sources ────────────────────────────────────────────────────────────

function generateTopSources() {
  const ips = ['192.168.4.120', '10.20.101.45', '172.16.88.2', '185.190.140.23', '192.168.1.1']
  return ips.map((ip, i) => ({
    ip,
    event_count: faker.number.int({ min: 200 - i * 40, max: 1500 - i * 200 }),
  }))
}

// ─── Pipeline status ────────────────────────────────────────────────────────

function generatePipelineStatus() {
  return [
    { name: 'Ingestion', status: 'Operational', ok: true },
    { name: 'Normalization', status: 'Operational', ok: true },
    { name: 'Correlation', status: 'Operational', ok: true },
    { name: 'Triage', status: 'Analyst Queue', ok: false },
    { name: 'Reporting', status: 'Operational', ok: true },
  ]
}

// ─── Full dashboard stats ──────────────────────────────────────────────────

export function getFakeDashboardStats(): DashboardStats {
  const hourlyEvents = generateHourlyEvents()
  const totalEvents = hourlyEvents.reduce((s, e) => s + e.count, 0)
  const threatDist = generateThreatDistribution()
  const totalThreats = threatDist.reduce((s, t) => s + t.count, 0)

  return {
    critical_alerts: faker.number.int({ min: 1, max: 5 }),
    high_alerts: faker.number.int({ min: 3, max: 10 }),
    warning_alerts: faker.number.int({ min: 8, max: 20 }),
    info_alerts: faker.number.int({ min: 15, max: 40 }),
    open_incidents: faker.number.int({ min: 2, max: 8 }),
    logs_per_hour: Math.round(totalEvents / 24),
    top_attackers: ['192.168.4.120', '10.20.101.45', '172.16.88.2'],
    system_status: 'Operational',
    hourly_events: hourlyEvents,
    threat_distribution: threatDist.map((t) => ({
      ...t,
      percentage: totalThreats > 0 ? Math.round((t.count / totalThreats) * 100) : 0,
    })),
    login_failures_timeline: generateLoginFailures(),
    activity_heatmap: generateHeatmap(),
    top_sources: generateTopSources(),
    pipeline_status: generatePipelineStatus(),
  }
}
