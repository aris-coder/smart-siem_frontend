import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditTrail,
} from '#/lib/admin/api'
import type { CreateUserPayload, UpdateUserPayload } from '#/lib/admin/api'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Badge } from '#/components/ui/badge'
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
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { User } from '#/types'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const queryClient = useQueryClient()

  // Queries
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: listUsers,
  })
  const { data: auditTrail = [] } = useQuery({
    queryKey: ['audit', 'trail'],
    queryFn: () => getAuditTrail(),
    staleTime: 10_000,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUser(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  // Create form
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<User['role']>('READER')
  const [createError, setCreateError] = useState('')

  // Edit form
  const [editRole, setEditRole] = useState<User['role']>('READER')
  const [editActive, setEditActive] = useState(true)

  const handleCreate = useCallback(async () => {
    setCreateError('')
    try {
      await createMutation.mutateAsync({
        username: newUsername,
        password: newPassword,
        role: newRole,
      })
      setCreateOpen(false)
      setNewUsername('')
      setNewPassword('')
      setNewRole('READER')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      setCreateError(
        axiosErr.response?.data?.message || 'Failed to create user',
      )
    }
  }, [newUsername, newPassword, newRole, createMutation])

  const handleEdit = useCallback(async () => {
    if (!editUser) return
    try {
      await updateMutation.mutateAsync({
        id: editUser.id,
        payload: { role: editRole, is_active: editActive },
      })
      setEditUser(null)
    } catch {
      // silent
    }
  }, [editUser, editRole, editActive, updateMutation])

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // silent
    }
  }, [deleteTarget, deleteMutation])

  const openEdit = useCallback((user: User) => {
    setEditUser(user)
    setEditRole(user.role)
    setEditActive(user.is_active !== false)
  }, [])

  const roleLabel: Record<User['role'], string> = {
    ADMIN: 'Admin',
    ANALYST: 'Analyst',
    READER: 'Reader',
  }

  const roleColor: Record<User['role'], string> = {
    ADMIN: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
    ANALYST: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
    READER: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            User Management
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Manage SOC users, roles, and access
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-3.5" />
          Add User
        </Button>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white dark:bg-zinc-900">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--line)]">
                {['Name', 'Username', 'Role', 'Status', 'Created', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-[var(--sea-ink-soft)]"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-[var(--link-bg-hover)]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-xs font-bold uppercase dark:bg-zinc-800">
                          {user.username.charAt(0)}
                        </div>
                        <span className="whitespace-nowrap text-sm font-medium text-[var(--sea-ink)]">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--sea-ink)]">
                      {user.username}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Badge className={roleColor[user.role]} variant="outline">
                        {roleLabel[user.role]}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          user.is_active !== false
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            user.is_active !== false
                              ? 'bg-green-600 dark:bg-green-400'
                              : 'bg-red-600 dark:bg-red-400'
                          }`}
                        />
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-[var(--sea-ink-soft)]">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => openEdit(user)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setDeleteTarget(user)}
                          className="hover:text-red-600"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC + Audit + Quick Invite grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* RBAC */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <h3 className="mb-1 text-sm font-semibold text-[var(--sea-ink)]">
            RBAC Policy
          </h3>
          <p className="mb-4 text-xs text-[var(--sea-ink-soft)]">
            Role-based access control levels
          </p>
          <div className="flex flex-col gap-3">
            {[
              [
                'Admin',
                'Full access to all features, user management, retention',
              ],
              ['Analyst', 'Incident investigation and status updates'],
              ['Reader', 'Read-only access to dashboards and reports'],
            ].map(([role, scope]) => (
              <div
                key={role}
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3"
              >
                <strong className="text-sm text-[var(--sea-ink)]">
                  {role}
                </strong>
                <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                  {scope}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Audit trail */}
        <div className="rounded-xl border border-[var(--line)] bg-white dark:bg-zinc-900 lg:col-span-2">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[var(--sea-ink)]">
              Recent Activity
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  {['Time', 'Actor', 'Action', 'Target'].map((h) => (
                    <th
                      key={h}
                      className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold text-[var(--sea-ink-soft)]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {auditTrail.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center text-xs text-muted-foreground"
                    >
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  auditTrail.map((entry, i) => (
                    <tr key={i} className="text-sm text-[var(--sea-ink)]">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">
                        {entry.time}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {entry.actor}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {entry.action}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        {entry.target}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>
              Add a new SOC user. They will receive credentials to log in.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Username
              </label>
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Role
              </label>
              <Select
                value={newRole}
                onValueChange={(v) => setNewRole(v as User['role'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READER">Reader</SelectItem>
                  <SelectItem value="ANALYST">Analyst</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {createError && (
              <p className="text-xs text-red-600">{createError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editUser !== null}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update role or status for {editUser?.username}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                Role
              </label>
              <Select
                value={editRole}
                onValueChange={(v) => setEditRole(v as User['role'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READER">Reader</SelectItem>
                  <SelectItem value="ANALYST">Analyst</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-center gap-2 text-sm text-[var(--sea-ink)]">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
                className="size-4 rounded border-[var(--line)]"
              />
              Account active
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
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
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.username}? This
              action cannot be undone.
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
