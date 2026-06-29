import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listRules, createRule, updateRule, deleteRule } from '#/lib/rules/api'
import type { Rule, UpdateRulePayload } from '#/lib/rules/api'
import { requireAuth } from '#/lib/auth/guards'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { Input } from '#/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '#/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Power,
  PowerOff,
  AlertTriangle,
} from 'lucide-react'

export const Route = createFileRoute('/rules')({
  beforeLoad: requireAuth,
  component: RulesPage,
})

function RulesPage() {
  const queryClient = useQueryClient()

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: listRules,
  })

  const createMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRulePayload }) =>
      updateRule(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rules'] }),
  })

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [editRule, setEditRule] = useState<Rule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Rule | null>(null)

  // Create form
  const [newId, setNewId] = useState('')
  const [newName, setNewName] = useState('')
  const [newTactic, setNewTactic] = useState('')
  const [newTechnique, setNewTechnique] = useState('')
  const [newWeight, setNewWeight] = useState('1')
  const [newThreshold, setNewThreshold] = useState('1')
  const [newWindow, setNewWindow] = useState('300')
  const [newInterval, setNewInterval] = useState('120')
  const [newSourceTypes, setNewSourceTypes] = useState('')
  const [newPlaybook, setNewPlaybook] = useState('')
  const [newPlaybookMode, setNewPlaybookMode] = useState<'AUTO' | 'CONFIRM'>('CONFIRM')
  const [createError, setCreateError] = useState('')

  // Edit form
  const [editName, setEditName] = useState('')
  const [editWeight, setEditWeight] = useState('1')
  const [editActive, setEditActive] = useState(true)

  const resetCreate = useCallback(() => {
    setNewId('')
    setNewName('')
    setNewTactic('')
    setNewTechnique('')
    setNewWeight('1')
    setNewThreshold('1')
    setNewWindow('300')
    setNewInterval('120')
    setNewSourceTypes('')
    setNewPlaybook('')
    setNewPlaybookMode('CONFIRM')
    setCreateError('')
  }, [])

  const handleCreate = useCallback(async () => {
    setCreateError('')
    if (!newId || !newName) {
      setCreateError('Rule ID and Name are required')
      return
    }
    try {
      const definition: Record<string, unknown> = {
        threshold: Number(newThreshold),
        time_window_seconds: Number(newWindow),
        interval_seconds: Number(newInterval),
      }
      if (newSourceTypes.trim()) {
        definition.source_types = newSourceTypes.split(',').map((s) => s.trim())
      }
      if (newPlaybook.trim()) {
        definition.trigger_playbook = newPlaybook.trim()
        definition.playbook_mode = newPlaybookMode
      }
      await createMutation.mutateAsync({
        id: newId,
        name: newName,
        tactic: newTactic || undefined,
        technique: newTechnique || undefined,
        definition,
        confidence_weight: Number(newWeight),
      })
      setCreateOpen(false)
      resetCreate()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setCreateError(
        axiosErr.response?.data?.message || 'Failed to create rule',
      )
    }
  }, [
    newId, newName, newTactic, newTechnique, newWeight,
    newThreshold, newWindow, newInterval, newSourceTypes,
    newPlaybook, newPlaybookMode, createMutation, resetCreate,
  ])

  const openEdit = useCallback((rule: Rule) => {
    setEditRule(rule)
    setEditName(rule.name)
    setEditWeight(String(rule.confidence_weight))
    setEditActive(rule.is_active)
  }, [])

  const handleEdit = useCallback(async () => {
    if (!editRule) return
    try {
      await updateMutation.mutateAsync({
        id: editRule.id,
        payload: {
          name: editName,
          confidence_weight: Number(editWeight),
          is_active: editActive,
        },
      })
      setEditRule(null)
    } catch {
      // silent
    }
  }, [editRule, editName, editWeight, editActive, updateMutation])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // silent
    }
  }, [deleteTarget, deleteMutation])

  const handleToggleActive = useCallback(
    async (rule: Rule) => {
      try {
        await updateMutation.mutateAsync({
          id: rule.id,
          payload: { is_active: !rule.is_active },
        })
      } catch {
        // silent
      }
    },
    [updateMutation],
  )

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            Correlation Rules
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Define detection logic and automated responses
          </p>
        </div>
        <Button size="sm" onClick={() => { resetCreate(); setCreateOpen(true) }}>
          <Plus className="size-3.5" />
          Add Rule
        </Button>
      </div>

      {/* Rules grid */}
      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          Loading rules...
        </div>
      ) : rules.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No rules configured yet
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                    <Shield className="size-4 text-[var(--sea-ink)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-[var(--sea-ink)]">
                        {rule.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="whitespace-nowrap text-[10px] font-mono"
                      >
                        {rule.id}
                      </Badge>
                    </div>
                    {rule.tactic && (
                      <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                        {rule.tactic}{rule.technique ? ` · ${rule.technique}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rule)}
                    className={`rounded-md p-1.5 transition-colors ${
                      rule.is_active
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                    title={rule.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {rule.is_active ? (
                      <Power className="size-3.5" />
                    ) : (
                      <PowerOff className="size-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(rule)}
                    className="rounded-md p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
                    title="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(rule)}
                    className="rounded-md p-1.5 text-[var(--sea-ink-soft)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    title="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Rule details */}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="text-[var(--sea-ink-soft)]">Confidence</span>
                  <span className="ml-2 font-medium text-[var(--sea-ink)]">
                    {rule.confidence_weight}%
                  </span>
                </div>
                <div>
                  <span className="text-[var(--sea-ink-soft)]">Status</span>
                  <span
                    className={`ml-2 font-medium ${
                      rule.is_active
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {rule.definition.threshold !== undefined && (
                  <div>
                    <span className="text-[var(--sea-ink-soft)]">Threshold</span>
                    <span className="ml-2 font-medium text-[var(--sea-ink)]">
                      {rule.definition.threshold}
                    </span>
                  </div>
                )}
                {rule.definition.time_window_seconds && (
                  <div>
                    <span className="text-[var(--sea-ink-soft)]">Window</span>
                    <span className="ml-2 font-medium text-[var(--sea-ink)]">
                      {rule.definition.time_window_seconds}s
                    </span>
                  </div>
                )}
              </div>

              {/* Source types */}
              {rule.definition.source_types &&
                rule.definition.source_types.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {rule.definition.source_types.map((st) => (
                      <Badge key={st} variant="outline" className="text-[10px]">
                        {st}
                      </Badge>
                    ))}
                  </div>
                )}

              {/* Playbook badge */}
              {rule.definition.trigger_playbook && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--sea-ink-soft)]">
                  <AlertTriangle className="size-3" />
                  <span>
                    Triggers:{' '}
                    <span className="font-medium text-[var(--sea-ink)]">
                      {rule.definition.trigger_playbook}
                    </span>
                    {rule.definition.playbook_mode
                      ? ` (${rule.definition.playbook_mode})`
                      : ''}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Rule Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Correlation Rule</DialogTitle>
            <DialogDescription>
              Define detection logic for security events
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Rule ID *
              </label>
              <Input
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="e.g. R005"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-1">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Name *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. SSH Brute Force"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Tactic (MITRE)
              </label>
              <Input
                value={newTactic}
                onChange={(e) => setNewTactic(e.target.value)}
                placeholder="e.g. TA0001"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Technique (MITRE)
              </label>
              <Input
                value={newTechnique}
                onChange={(e) => setNewTechnique(e.target.value)}
                placeholder="e.g. T1110"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Threshold
              </label>
              <Input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(e.target.value)}
                min={1}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Time Window (seconds)
              </label>
              <Input
                type="number"
                value={newWindow}
                onChange={(e) => setNewWindow(e.target.value)}
                min={1}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Interval (seconds)
              </label>
              <Input
                type="number"
                value={newInterval}
                onChange={(e) => setNewInterval(e.target.value)}
                min={1}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Confidence Weight
              </label>
              <Input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                min={0}
                max={100}
              />
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Source Types (comma separated)
              </label>
              <Input
                value={newSourceTypes}
                onChange={(e) => setNewSourceTypes(e.target.value)}
                placeholder="windows_security, firewall, linux_auth"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Trigger Playbook
              </label>
              <Input
                value={newPlaybook}
                onChange={(e) => setNewPlaybook(e.target.value)}
                placeholder="block_ip, isolate_endpoint"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Playbook Mode
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewPlaybookMode('AUTO')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    newPlaybookMode === 'AUTO'
                      ? 'border-[var(--sea-ink)] bg-[var(--sea-ink)] text-white'
                      : 'border-[var(--line)] text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]'
                  }`}
                >
                  AUTO
                </button>
                <button
                  type="button"
                  onClick={() => setNewPlaybookMode('CONFIRM')}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                    newPlaybookMode === 'CONFIRM'
                      ? 'border-[var(--sea-ink)] bg-[var(--sea-ink)] text-white'
                      : 'border-[var(--line)] text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)]'
                  }`}
                >
                  CONFIRM
                </button>
              </div>
            </div>
            {createError && (
              <p className="col-span-2 text-xs text-red-600">{createError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rule Dialog */}
      <Dialog
        open={editRule !== null}
        onOpenChange={(open) => !open && setEditRule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Rule</DialogTitle>
            <DialogDescription>
              Update {editRule?.id}: {editRule?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Name
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Confidence Weight
              </label>
              <Input
                type="number"
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
                min={0}
                max={100}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="size-4 rounded border-[var(--line)]"
              />
              Rule active
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRule(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.id}:{' '}
              {deleteTarget?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
