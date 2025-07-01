import { useEffect, useState } from "react"
import API from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table" 
import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown, Filter, Download, UserPlus, Eye, Mail, Lock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "../../hooks/use-debounce"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"


type User = {
  pk: number
  first_name?: string
  last_name?: string
  email: string
  role: string
  is_active: boolean
  last_login?: string
  date_joined?: string
  profile_picture?: string
}

type SortConfig = {
  key: keyof User
  direction: 'asc' | 'desc'
}

export default function ManageMembers() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrev, setHasPrev] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date_joined', direction: 'desc' })
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [totalUsers, setTotalUsers] = useState(0)
  const [activeTab, setActiveTab] = useState('all')

  const debouncedSearch = useDebounce(search, 500)

  const fetchUsers = async (page = 1, search = '', role = 'all', status = 'all') => {
    setIsLoading(true)
    try {
      let url = `/users/?page=${page}`
      if (search) url += `&search=${search}`
      if (role !== 'all') url += `&role=${role}`
      if (status !== 'all') url += `&is_active=${status === 'active'}`

      const res = await API.get(url)
      const data = res.data
      setUsers(data.results || [])
      setHasNext(!!data.next)
      setHasPrev(!!data.previous)
      setTotalUsers(data.count || 0)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(page, debouncedSearch, roleFilter, statusFilter)
  }, [page, debouncedSearch, roleFilter, statusFilter, activeTab])

  const handleToggleStatus = async (id: number, is_active: boolean) => {
    try {
      const url = `/users/${id}/${is_active ? "deactivate" : "activate"}/`
      await API.patch(url)
      setUsers(users.map(u => u.pk === id ? { ...u, is_active: !is_active } : u))
      toast.success(`User ${is_active ? 'deactivated' : 'activated'} successfully`)
    } catch (error) {
      toast.error(`Failed to ${is_active ? 'deactivate' : 'activate'} user`)
    }
  }

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.warning('No users selected')
      return
    }

    try {
      const promises = selectedUsers.map(id => {
        if (action === 'delete') {
          return API.delete(`/users/${id}/`)
        } else {
          return API.patch(`/users/${id}/${action === 'activate' ? 'activate' : 'deactivate'}/`)
        }
      })

      await Promise.all(promises)
      fetchUsers(page, debouncedSearch, roleFilter, statusFilter)
      setSelectedUsers([])
      toast.success(`Bulk ${action} completed successfully`)
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`)
    }
  }

  const headerKeyMap: Record<string, keyof User> = {
    Name: 'first_name',
    Email: 'email',
    'Last Active': 'last_login',
    Joined: 'date_joined'
  }

  const requestSort = (label: string) => {
    const key = headerKeyMap[label] || 'date_joined'
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedUsers = [...users].sort((a, b) => {
    const key = sortConfig.key
    if (!a[key] || !b[key]) return 0
    if (a[key]! < b[key]!) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (a[key]! > b[key]!) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const filteredUsers = sortedUsers.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name?.toLowerCase()?.includes(search.toLowerCase()) ?? false) ||
    (u.last_name?.toLowerCase()?.includes(search.toLowerCase()) ?? false)
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map(user => user.pk))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, id])
    } else {
      setSelectedUsers(selectedUsers.filter(userId => userId !== id))
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName ? firstName.charAt(0) : ''
    const last = lastName ? lastName.charAt(0) : ''
    return `${first}${last}`.toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all members, admins, and their permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({totalUsers})</TabsTrigger>
          <TabsTrigger value="active">Active ({users.filter(u => u.is_active).length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({users.filter(u => !u.is_active).length})</TabsTrigger>
          <TabsTrigger value="admins">Admins ({users.filter(u => u.role === 'admin').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
            <p className="text-xs text-muted-foreground">Administrators</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Mail className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{users.filter(u => new Date(u.date_joined || '') > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search users by name, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Role: {roleFilter === 'all' ? 'All' : roleFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Status: {statusFilter === 'all' ? 'All' : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded">
          <span className="text-sm text-muted-foreground">
            {selectedUsers.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table headers={['', 'Name', 'Email', 'Role', 'Status', 'Last Active', 'Joined', 'Actions']}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort('Name')}
                  className="p-0"
                >
                  Name
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort('Email')}
                  className="p-0"
                >
                  Email
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort('Last Active')}
                  className="p-0"
                >
                  Last Active
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => requestSort('Joined')}
                  className="p-0"
                >
                  Joined
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.pk}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.pk)}
                      onCheckedChange={(checked) => handleSelectUser(user.pk, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profile_picture} />
                        <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.first_name || 'N/A'} {user.last_name || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {user.pk}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'secondary' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.last_login ? formatDate(user.last_login) : 'Never'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(user.date_joined)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.pk, user.is_active)}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Send Email</DropdownMenuItem>
                        <DropdownMenuItem>View Activity</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{users.length}</strong> of <strong>{totalUsers}</strong> users
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={!hasPrev || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNext || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}