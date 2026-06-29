import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useLogSearch } from '#/lib/logs/hooks'
import { LogSearch, LogFilters, LogTable, LogDetails } from '#/components/logs'
import type { LogSearchParams, LogEntry } from '#/types'
import type { SortingState } from '@tanstack/react-table'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'

export const Route = createFileRoute('/logs')({
  component: LogsPage,
})

function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<LogSearchParams>({})
  const [page, setPage] = useState(0)
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const pageSize = 25

  const searchParams: LogSearchParams = {
    ...filters,
    from: page * pageSize,
    size: pageSize,
    ...(searchQuery.trim() ? { raw_message: searchQuery.trim() } : {}),
  }

  const { data, isLoading, isError, error } = useLogSearch(searchParams)

  const handleFilterChange = useCallback((newFilters: LogSearchParams) => {
    setFilters(newFilters)
    setPage(0)
    setSelectedLog(null)
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    setSelectedLog(null)
  }, [])

  const handleSelectLog = useCallback((log: LogEntry | null) => {
    setSelectedLog(log)
    setDetailsOpen(log !== null)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false)
    setSelectedLog(null)
  }, [])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(0)
    setSelectedLog(null)
  }, [])

  const handlePivotIp = useCallback((ip: string) => {
    setFilters({ source_ip: ip })
    setSearchQuery('')
    setPage(0)
    setSelectedLog(null)
    setDetailsOpen(false)
  }, [])

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col gap-4 overflow-auto p-4 lg:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            Log Explorer
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Search and investigate security events
          </p>
        </div>
        {data && (
          <span className="text-xs text-[var(--sea-ink-soft)]">
            {data.total.toLocaleString()} total results
          </span>
        )}
      </div>

      {/* Search bar */}
      <LogSearch value={searchQuery} onSearch={handleSearch} />

      {/* Filters */}
      <LogFilters
        key={JSON.stringify(filters)}
        onFilterChange={handleFilterChange}
        initialValues={filters}
      />

      {/* Table */}
      <LogTable
        logs={data?.hits ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        isError={isError}
        error={error}
        selectedLogId={selectedLog?.id}
        sorting={sorting}
        onSortingChange={setSorting}
        onPageChange={handlePageChange}
        onSelectLog={handleSelectLog}
        onPivotIp={handlePivotIp}
      />

      {/* Details sheet */}
      <Sheet open={detailsOpen} onOpenChange={handleCloseDetails}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto p-6"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Log Details</SheetTitle>
          </SheetHeader>
          <LogDetails
            log={selectedLog}
            onClose={handleCloseDetails}
            onPivotIp={handlePivotIp}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
