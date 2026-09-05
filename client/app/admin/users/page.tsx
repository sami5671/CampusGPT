'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ShieldCheck, 
  Search, 
  Loader2, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Mail,
  IdCard,
  Filter
} from 'lucide-react'
import { getAllUsersAction, updateUserRoleAction } from '@/actions/auth-actions'

interface UserItem {
  id: string
  fullName: string
  name: string
  email: string
  idNumber: string
  department: string
  role: string
  createdAt?: string
  updatedAt?: string
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setErrorMsg('')
    const res = await getAllUsersAction()
    setLoading(false)
    if (res.status && Array.isArray(res.data)) {
      setUsers(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to fetch user accounts from MongoDB')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    setErrorMsg('')
    setSuccessMsg('')

    const res = await updateUserRoleAction(userId, newRole)
    setUpdatingId(null)

    if (res.status) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSuccessMsg(res.message || `Role updated to '${newRole}' successfully!`)
      setTimeout(() => setSuccessMsg(''), 4000)
    } else {
      setErrorMsg(res.error || 'Failed to update user role')
    }
  }

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    const q = searchQuery.toLowerCase()
    const matchesQuery =
      !searchQuery ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.idNumber && u.idNumber.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    return matchesRole && matchesQuery
  })

  const formatTimestamp = (ts?: string) => {
    if (!ts) return 'N/A'
    try {
      return new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch (e) {
      return ts
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              User Management & Permissions
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            View real registered campus accounts from MongoDB and manage role permissions live.
          </p>
        </div>

        <Button
          onClick={fetchUsers}
          variant="outline"
          size="sm"
          className="border-border/40 text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Users
        </Button>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center gap-2.5 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 border-border/40 bg-card/50 backdrop-blur-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, email, ID number, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/80 border-border/40 text-foreground text-xs sm:text-sm h-10 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 bg-background/80 border border-border/40 rounded-xl text-xs sm:text-sm text-foreground outline-none cursor-pointer h-10 w-full sm:w-auto font-medium"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students ({users.filter((u) => u.role === 'student').length})</option>
            <option value="admin">Admins ({users.filter((u) => u.role === 'admin').length})</option>
          </select>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching real user records from MongoDB...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <UserIcon className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
            <p className="text-base font-semibold text-foreground">No Users Found</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? 'No registered users match your search criteria.'
                : 'There are no registered user accounts in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/30 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User Details</th>
                  <th className="px-6 py-4">ID Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Role Permission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-xs sm:text-sm">
                {filteredUsers.map((u) => {
                  const isUpdating = updatingId === u.id

                  return (
                    <tr key={u.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            u.role === 'admin'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          }`}>
                            {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              <span>{u.fullName || 'Unnamed User'}</span>
                              {u.role === 'admin' && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-muted-foreground/70" />
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {u.idNumber ? (
                          <span className="inline-flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md border border-border/30">
                            <IdCard className="w-3 h-3 text-primary" />
                            {u.idNumber}
                          </span>
                        ) : (
                          'N/A'
                        )}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground">
                        <span className="truncate max-w-[180px] block" title={u.department || 'N/A'}>
                          {u.department || 'General'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {formatTimestamp(u.createdAt)}
                      </td>

                      {/* Interactive Role Dropdown */}
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-36">
                          <select
                            value={u.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer transition-all ${
                              u.role === 'admin'
                                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25'
                                : 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                            }`}
                          >
                            <option value="student" className="bg-[#140d21] text-foreground">
                              🎓 Student
                            </option>
                            <option value="admin" className="bg-[#140d21] text-foreground">
                              🛡️ Admin
                            </option>
                          </select>

                          {isUpdating && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-primary" />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
