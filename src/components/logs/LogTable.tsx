import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { Row, SortingState } from '@tanstack/react-table'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  CornerDownRight,
} from 'lucide-react'
import { Button } from '#/components/ui/button'
import type { LogEntry } from '#/types'
import { cn } from '#/lib/utils'
import { SeverityBadge } from '#/components/logs/SeverityBadge'

interface LogTableProps {
  logs: LogEntry[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  isError: boolean
  error?: Error | null
  selectedLogId?: string | null
  sorting: SortingState
  onSortingChange:
    | React.Dispatch<React.SetStateAction<SortingState>>
    | ((
        updaterOrValue: SortingState | ((old: SortingState) => SortingState),
      ) => void)
  onPageChange: (page: number) => void
  onSelectLog: (log: LogEntry | null) => void
  onPivotIp?: (ip: string) => void
}

function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return iso
  }
}

const columnHelper = createColumnHelper<LogEntry>()

export function LogTable({
  logs,
  total,
  page,
  pageSize,
  isLoading,
  isError,
  error,
  selectedLogId,
  sorting,
  onSortingChange,
  onPageChange,
  onSelectLog,
  onPivotIp,
}: LogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.source.collected_at, {
        id: 'collected_at',
        header: ({ column }) => (
          <SortHeader
            label="Timestamp"
            isSorted={column.getIsSorted()}
            onToggle={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
            {formatTimestamp(getValue())}
          </span>
        ),
        sortingFn: 'datetime',
      }),
      columnHelper.accessor((row) => row.source.event_id, {
        id: 'event_id',
        header: ({ column }) => (
          <SortHeader
            label="Event ID"
            isSorted={column.getIsSorted()}
            onToggle={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap font-mono text-xs">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.source.source_type, {
        id: 'source_type',
        header: ({ column }) => (
          <SortHeader
            label="Source"
            isSorted={column.getIsSorted()}
            onToggle={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <span
              className="max-w-28 truncate whitespace-nowrap text-xs"
              title={value}
            >
              {value}
            </span>
          )
        },
      }),
      columnHelper.accessor((row) => row.source.hostname, {
        id: 'hostname',
        header: ({ column }) => (
          <SortHeader
            label="Host"
            isSorted={column.getIsSorted()}
            onToggle={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ getValue }) => (
          <span
            className="max-w-24 truncate whitespace-nowrap text-xs"
            title={getValue()}
          >
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.source.source_ip, {
        id: 'source_ip',
        header: ({ column }) => (
          <SortHeader
            label="IP"
            isSorted={column.getIsSorted()}
            onToggle={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ getValue }) => {
          const ip = getValue()
          return (
            <div className="flex items-center gap-1.5 group/ip min-w-[100px]">
              <span className="font-mono text-xs">{ip}</span>
              {onPivotIp && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPivotIp(ip)
                  }}
                  className="opacity-0 group-hover/ip:opacity-100 transition-opacity p-0.5 rounded hover:bg-action-hover text-muted-foreground hover:text-foreground cursor-pointer"
                  title={`Pivoter sur l'IP ${ip}`}
                >
                  <CornerDownRight className="size-3" />
                </button>
              )}
            </div>
          )
        },
      }),
      columnHelper.accessor((row) => row.source.user_principal, {
        id: 'user_principal',
        header: 'User',
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <span
              className={cn(
                'max-w-24 truncate whitespace-nowrap text-xs',
                !value && 'text-muted-foreground italic',
              )}
              title={value || undefined}
            >
              {value || 'N/A'}
            </span>
          )
        },
      }),
      columnHelper.accessor((row) => row.source.event_taxonomy, {
        id: 'event_taxonomy',
        header: 'Event Type',
        cell: ({ getValue }) => (
          <span
            className="max-w-24 truncate whitespace-nowrap text-xs"
            title={getValue()}
          >
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.source.action, {
        id: 'action',
        header: 'Action',
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-xs capitalize">
            {getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.source.severity, {
        id: 'severity',
        header: ({ column }) => (
          <SortHeader
            label="Severity"
            isSorted={column.getIsSorted()}
            onToggle={() =>
              column.toggleSorting(column.getIsSorted() === 'asc')
            }
          />
        ),
        cell: ({ getValue }) => <SeverityBadge severity={getValue()} />,
        sortingFn: 'basic',
      }),
      columnHelper.accessor((row) => row.source.outcome, {
        id: 'outcome',
        header: 'Status',
        cell: ({ getValue }) => {
          const value = getValue()
          const colorMap: Record<string, string> = {
            success: 'text-status-resolved-text',
            failure: 'text-status-inactive-text',
            allow: 'text-status-resolved-text',
            deny: 'text-status-inactive-text',
            error: 'text-status-inactive-text',
          }
          return (
            <span
              className={cn(
                'text-xs font-medium capitalize',
                colorMap[value] ?? 'text-muted-foreground',
              )}
            >
              {value}
            </span>
          )
        },
      }),
    ],
    [onPivotIp],
  )

  const table = useReactTable({
    data: logs,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    manualFiltering: true,
    filterFns: {
      fuzzy: () => true,
    },
  })

  const handleRowClick = (row: Row<LogEntry>) => {
    const isSameRow = selectedLogId === row.original.id
    onSelectLog(isSameRow ? null : row.original)
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="island-shell rounded-xl overflow-hidden">
        <div className="divide-y divide-(--line)">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 px-4 py-3"
            >
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="island-shell flex flex-col items-center justify-center rounded-xl px-4 py-16">
        <AlertCircle className="mb-3 size-10 text-destructive" />
        <p className="mb-1 text-sm font-semibold text-foreground">
          Failed to load logs
        </p>
        <p className="text-xs text-muted-foreground">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
      </div>
    )
  }

  // Empty state
  if (logs.length === 0) {
    return (
      <div className="island-shell flex flex-col items-center justify-center rounded-xl px-4 py-16">
        <Inbox className="mb-3 size-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-semibold text-foreground">
          No logs found
        </p>
        <p className="text-xs text-muted-foreground">
          Try adjusting your filters or search query.
        </p>
      </div>
    )
  }

  return (
    <div className="island-shell rounded-xl overflow-hidden">
      <div className="max-h-[60vh] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-(--line)"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-(--sea-ink-soft)"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-(--line)">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => handleRowClick(row)}
                className={cn(
                  'cursor-pointer transition-colors hover:bg-accent/50',
                  selectedLogId === row.original.id &&
                    'bg-accent/60 dark:bg-accent/20',
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-(--line) px-4 py-3">
        <p className="text-xs text-muted-foreground">
          {total === 1 ? '1 result' : `${total.toLocaleString()} results`}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-xs"
            disabled={page <= 0}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="min-w-[5rem] text-center text-xs text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-xs"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SortHeader({
  label,
  isSorted,
  onToggle,
}: {
  label: string
  isSorted: false | 'asc' | 'desc'
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 text-xs font-semibold text-(--sea-ink-soft) hover:text-foreground"
    >
      {label}
      {isSorted === 'asc' && <ArrowUp className="size-3" />}
      {isSorted === 'desc' && <ArrowDown className="size-3" />}
      {!isSorted && <ArrowUpDown className="size-3 opacity-40" />}
    </button>
  )
}
