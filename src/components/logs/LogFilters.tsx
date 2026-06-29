import { useState, useCallback } from 'react'
import { RotateCcw, Search } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import type { LogSearchParams } from '#/types'

interface FilterState {
  source_type: string
  hostname: string
  source_ip: string
  user_principal: string
  event_taxonomy: string
  action: string
  severity_min: string
  severity_max: string
  date_from: string
  date_to: string
}

interface LogFiltersProps {
  onFilterChange: (params: LogSearchParams) => void
  initialValues?: Partial<LogSearchParams>
}

const EMPTY_FILTERS: FilterState = {
  source_type: '',
  hostname: '',
  source_ip: '',
  user_principal: '',
  event_taxonomy: '',
  action: '',
  severity_min: '',
  severity_max: '',
  date_from: '',
  date_to: '',
}

const SOURCE_TYPE_OPTIONS = [
  { label: 'Windows Security', value: 'windows_security' },
  { label: 'Firewall', value: 'firewall' },
  { label: 'Linux Auth', value: 'linux_auth' },
  { label: 'Web Server', value: 'web_server' },
  { label: 'Database', value: 'database' },
  { label: 'DNS', value: 'dns' },
]

const EVENT_TAXONOMY_OPTIONS = [
  { label: 'Authentication', value: 'authentication' },
  { label: 'System', value: 'system' },
  { label: 'Network Flow', value: 'network_flow' },
  { label: 'Process', value: 'process' },
  { label: 'File', value: 'file' },
  { label: 'Registry', value: 'registry' },
]

export function LogFilters({ onFilterChange, initialValues }: LogFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...EMPTY_FILTERS,
    ...(initialValues
      ? {
          source_type: initialValues.source_type ?? '',
          hostname: initialValues.hostname ?? '',
          source_ip: initialValues.source_ip ?? '',
          user_principal: initialValues.user_principal ?? '',
          event_taxonomy: initialValues.event_taxonomy ?? '',
          action: initialValues.action ?? '',
          severity_min: '',
          severity_max: '',
          date_from: initialValues.date_from ?? '',
          date_to: initialValues.date_to ?? '',
        }
      : {}),
  }))

  const updateField = useCallback(
    <TKey extends keyof FilterState>(key: TKey, value: FilterState[TKey]) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    [],
  )

  const buildParams = useCallback((): LogSearchParams => {
    const params: LogSearchParams = {}
    if (filters.source_type) params.source_type = filters.source_type
    if (filters.hostname) params.hostname = filters.hostname
    if (filters.source_ip) params.source_ip = filters.source_ip
    if (filters.user_principal) params.user_principal = filters.user_principal
    if (filters.event_taxonomy) params.event_taxonomy = filters.event_taxonomy
    if (filters.action) params.action = filters.action
    if (filters.date_from) params.date_from = filters.date_from
    if (filters.date_to) params.date_to = filters.date_to
    return params
  }, [filters])

  const handleApply = useCallback(() => {
    onFilterChange(buildParams())
  }, [buildParams, onFilterChange])

  const handleReset = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    onFilterChange({})
  }, [onFilterChange])

  return (
    <div className="island-shell rounded-xl p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--sea-ink)]">
        Filters
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {/* Source Type */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            Source Type
          </label>
          <Select
            value={filters.source_type}
            onValueChange={(value) => updateField('source_type', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SOURCE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Event Taxonomy */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            Event Taxonomy
          </label>
          <Select
            value={filters.event_taxonomy}
            onValueChange={(value) => updateField('event_taxonomy', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {EVENT_TAXONOMY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            Action
          </label>
          <Input
            placeholder="e.g. login, allow"
            value={filters.action}
            onChange={(e) => updateField('action', e.target.value)}
          />
        </div>

        {/* Hostname */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            Hostname
          </label>
          <Input
            placeholder="Hostname..."
            value={filters.hostname}
            onChange={(e) => updateField('hostname', e.target.value)}
          />
        </div>

        {/* IP Address */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            IP Address
          </label>
          <Input
            placeholder="192.168.1.1"
            value={filters.source_ip}
            onChange={(e) => updateField('source_ip', e.target.value)}
          />
        </div>

        {/* User */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            User
          </label>
          <Input
            placeholder="username"
            value={filters.user_principal}
            onChange={(e) => updateField('user_principal', e.target.value)}
          />
        </div>

        {/* Date From */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            Date From
          </label>
          <Input
            type="datetime-local"
            value={filters.date_from}
            onChange={(e) => updateField('date_from', e.target.value)}
          />
        </div>

        {/* Date To */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
            Date To
          </label>
          <Input
            type="datetime-local"
            value={filters.date_to}
            onChange={(e) => updateField('date_to', e.target.value)}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" onClick={handleApply}>
          <Search className="size-3.5" />
          Apply Filters
        </Button>
        <Button size="sm" variant="outline" onClick={handleReset}>
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
