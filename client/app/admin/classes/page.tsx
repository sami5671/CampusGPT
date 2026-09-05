'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  Loader2, 
  BookOpen, 
  Clock, 
  MapPin, 
  User, 
  Building2, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  PlayCircle,
  StopCircle,
  Clock3,
  RefreshCw,
  Check,
  Globe
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  getClassesAction, 
  createClassAction, 
  updateClassAction, 
  deleteClassAction, 
  ClassItem, 
  ClassInput 
} from '@/actions/class-actions'
import { PaginationControls } from '@/components/ui/pagination-controls'

const WEEK_DAYS = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
]

const initialFormState: ClassInput = {
  department: 'Computer Science & Engineering',
  courseCode: '',
  courseTitle: '',
  instructorName: '',
  semester: 'Spring 2026',
  buildingName: 'Academic Building 1',
  roomNumber: 'Room 301',
  startTime: '10:00 PM',
  endTime: '12:30 AM',
  days: ['Saturday', 'Sunday', 'Tuesday'],
  status: 'upcoming',
}

// Convert time string (e.g. "10:00 PM" or "12:30 AM") into minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  try {
    const cleaned = timeStr.trim().toUpperCase()
    const isPM = cleaned.includes('PM')
    const isAM = cleaned.includes('AM')
    const timeOnly = cleaned.replace(/AM|PM/g, '').trim()
    const parts = timeOnly.split(':')
    let hours = parseInt(parts[0], 10) || 0
    const mins = parseInt(parts[1], 10) || 0

    if (isPM && hours < 12) hours += 12
    if (isAM && hours === 12) hours = 0

    return hours * 60 + mins
  } catch (e) {
    return 0
  }
}

// Helper to get current weekday and time strictly in Bangladesh Standard Time (BST, Asia/Dhaka)
function getBangladeshNow() {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      hour12: false,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
    })
    const parts = formatter.formatToParts(now)

    let weekday = ''
    let hour = 0
    let minute = 0

    for (const part of parts) {
      if (part.type === 'weekday') weekday = part.value
      if (part.type === 'hour') hour = parseInt(part.value, 10)
      if (part.type === 'minute') minute = parseInt(part.value, 10)
    }

    if (hour === 24) hour = 0

    return {
      weekday,
      currentMinutes: hour * 60 + minute,
    }
  } catch (e) {
    const now = new Date()
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return {
      weekday: daysOfWeek[now.getDay()],
      currentMinutes: now.getHours() * 60 + now.getMinutes(),
    }
  }
}

// Compute dynamic status based on Bangladesh Standard Time (BST) with overnight support
function computeLiveStatus(startTime: string, endTime: string, days?: string[]): 'running' | 'end' | 'upcoming' {
  const bst = getBangladeshNow()
  const startMins = parseTimeToMinutes(startTime)
  const endMins = parseTimeToMinutes(endTime)

  if (startMins === 0 && endMins === 0) return 'upcoming'

  let dayMatched = true
  if (days && days.length > 0) {
    const daysLower = days.map(d => d.toLowerCase())
    dayMatched = daysLower.includes(bst.weekday.toLowerCase())
  }

  const currentMins = bst.currentMinutes

  // Handle overnight class schedule (e.g., 10:00 PM [1320 mins] to 12:30 AM [30 mins])
  if (endMins < startMins) {
    const isRunning = (currentMins >= startMins && dayMatched) || (currentMins <= endMins)
    if (isRunning) {
      return 'running'
    } else if (dayMatched && currentMins < startMins) {
      return 'upcoming'
    } else {
      return 'end'
    }
  } else {
    // Standard daytime class schedule (e.g., 09:00 AM [540 mins] to 10:30 AM [630 mins])
    if (!dayMatched) {
      return 'upcoming'
    }

    if (currentMins >= startMins && currentMins <= endMins) {
      return 'running'
    } else if (currentMins > endMins) {
      return 'end'
    } else {
      return 'upcoming'
    }
  }
}

export default function ClassesPage() {
  const [classesList, setClassesList] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClassItem | null>(null)
  const [deleteModalItem, setDeleteModalItem] = useState<ClassItem | null>(null)
  const [formData, setFormData] = useState<ClassInput>(initialFormState)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Reset page when search query or filter status changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  // Fetch classes from backend MongoDB
  const fetchClasses = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getClassesAction()
    if (res.status) {
      setClassesList(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to load classes from server')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClasses()

    // Timer to re-evaluate dynamic BST status every 15 seconds
    const timer = setInterval(() => {
      setClassesList(prev => [...prev])
    }, 15000)

    return () => clearInterval(timer)
  }, [])

  const handleAddClick = () => {
    setEditingItem(null)
    setFormData(initialFormState)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleEditClick = (item: ClassItem) => {
    setEditingItem(item)
    setFormData({
      department: item.department,
      courseCode: item.courseCode,
      courseTitle: item.courseTitle,
      instructorName: item.instructorName,
      semester: item.semester,
      buildingName: item.buildingName,
      roomNumber: item.roomNumber,
      startTime: item.startTime,
      endTime: item.endTime,
      days: item.days || [],
      status: item.status,
    })
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleToggleDay = (day: string) => {
    const currentDays = formData.days || []
    if (currentDays.includes(day)) {
      setFormData({ ...formData, days: currentDays.filter(d => d !== day) })
    } else {
      setFormData({ ...formData, days: [...currentDays, day] })
    }
  }

  const handleOpenDeleteModal = (item: ClassItem) => {
    setDeleteModalItem(item)
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return

    setDeletingId(deleteModalItem.id)
    setErrorMsg(null)
    const res = await deleteClassAction(deleteModalItem.id)
    if (res.status) {
      setClassesList(prev => prev.filter(c => c.id !== deleteModalItem.id))
      setSuccessMsg(`Class "${deleteModalItem.courseCode} - ${deleteModalItem.courseTitle}" deleted successfully!`)
      setDeleteModalItem(null)
    } else {
      setErrorMsg(res.error || 'Failed to delete class entry')
    }
    setDeletingId(null)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (
      !formData.department.trim() ||
      !formData.courseCode.trim() ||
      !formData.courseTitle.trim() ||
      !formData.instructorName.trim() ||
      !formData.semester.trim() ||
      !formData.buildingName.trim() ||
      !formData.roomNumber.trim() ||
      !formData.startTime.trim() ||
      !formData.endTime.trim()
    ) {
      setErrorMsg('Please fill in all required class information fields!')
      return
    }

    if (!formData.days || formData.days.length === 0) {
      setErrorMsg('Please select at least one class day (Saturday to Friday)!')
      return
    }

    // Auto calculate status based on BST (Bangladesh Standard Time)
    const autoStatus = computeLiveStatus(formData.startTime, formData.endTime, formData.days)
    const payload = {
      ...formData,
      status: autoStatus,
    }

    setSubmitting(true)
    if (editingItem) {
      // Update
      const res = await updateClassAction(editingItem.id, payload)
      if (res.status && res.data) {
        setClassesList(prev => prev.map(c => c.id === editingItem.id ? res.data! : c))
        setSuccessMsg(res.message || 'Class information updated successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to update class entry')
      }
    } else {
      // Create
      const res = await createClassAction(payload)
      if (res.status && res.data) {
        setClassesList(prev => [res.data!, ...prev])
        setSuccessMsg(res.message || 'Class added successfully to MongoDB!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to add class entry')
      }
    }
    setSubmitting(false)
  }

  // Filter classes by search and status
  const filteredClasses = classesList.filter(item => {
    const liveStatus = computeLiveStatus(item.startTime, item.endTime, item.days)
    const matchesSearch = 
      item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.buildingName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.days && item.days.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())))

    if (filterStatus === 'all') return matchesSearch
    return matchesSearch && liveStatus === filterStatus
  })

  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage) || 1
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helper badge renderer for class status
  const renderStatusBadge = (startTime: string, endTime: string, days?: string[]) => {
    const liveStatus = computeLiveStatus(startTime, endTime, days)

    if (liveStatus === 'running') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
          <PlayCircle className="w-3.5 h-3.5" />
          Running Now
        </span>
      )
    } else if (liveStatus === 'end') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <StopCircle className="w-3.5 h-3.5" />
          Class Ended
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <Clock3 className="w-3.5 h-3.5" />
          Upcoming
        </span>
      )
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Classes Management</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-1.5">
            <span>Manage course schedules, instructor assignments, days (Saturday–Friday), and live class statuses based on</span>
            <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              <Globe className="w-3 h-3" /> BST (UTC+6)
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={fetchClasses}
            variant="outline"
            size="sm"
            className="border-border/40 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Status
          </Button>
          <Button
            onClick={handleAddClick}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add New Class
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="ml-auto hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search code, title, instructor, day..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/40 text-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Live Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterStatus === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card'
            }`}
          >
            All Classes ({classesList.length})
          </button>
          <button
            onClick={() => setFilterStatus('running')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              filterStatus === 'running'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-card/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
            }`}
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Running
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              filterStatus === 'upcoming'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-card/60 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            <Clock3 className="w-3.5 h-3.5" />
            Upcoming
          </button>
          <button
            onClick={() => setFilterStatus('end')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              filterStatus === 'end'
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-card/60 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
            }`}
          >
            <StopCircle className="w-3.5 h-3.5" />
            Ended
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching classes schedule from MongoDB...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Classes Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery ? 'No classes match your search query.' : 'There are no active or scheduled classes in the database.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddClick} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="w-4 h-4" /> Add First Class
              </Button>
            )}
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/40 border-b border-border/40 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Course Info</th>
                    <th className="px-6 py-4">Instructor & Department</th>
                    <th className="px-6 py-4">Building & Room</th>
                    <th className="px-6 py-4">Days & Time (BST)</th>
                    <th className="px-6 py-4">Live Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {paginatedClasses.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Course Info */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-foreground px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs">
                              {item.courseCode}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {item.semester}
                            </span>
                          </div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                            {item.courseTitle}
                          </div>
                        </div>
                      </td>

                      {/* Instructor & Dept */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <User className="w-3.5 h-3.5 text-primary" />
                            {item.instructorName}
                          </div>
                          <div className="text-xs text-muted-foreground font-medium">
                            {item.department}
                          </div>
                        </div>
                      </td>

                      {/* Building & Room */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-foreground text-xs font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-accent" />
                            {item.buildingName}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {item.roomNumber}
                          </div>
                        </div>
                      </td>

                      {/* Days & Time */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            {item.days && item.days.length > 0 ? (
                              item.days.map((day) => (
                                <span
                                  key={day}
                                  className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-primary/15 text-primary border border-primary/25"
                                >
                                  {day.substring(0, 3)}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No days set</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/30 w-fit">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>{item.startTime} - {item.endTime}</span>
                          </div>
                        </div>
                      </td>

                      {/* Dynamic Status */}
                      <td className="px-6 py-4">
                        {renderStatusBadge(item.startTime, item.endTime, item.days)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(item)}
                            title="Edit Class"
                            className="p-2 rounded-lg bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/20"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(item)}
                            title="Delete Class"
                            className="p-2 rounded-lg bg-muted/40 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all border border-border/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClasses.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(size) => {
                setItemsPerPage(size)
                setCurrentPage(1)
              }}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Class Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl border-border/40 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingItem ? 'Edit Class Schedule' : 'Add New Class'}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <span>Select days (Saturday–Friday) and start/end times in</span>
                    <span className="font-semibold text-primary">Bangladesh Standard Time (BST, UTC+6)</span>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Department */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Computer Science & Engineering"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 2. Course Code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Course Code <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.courseCode}
                    onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                    placeholder="e.g. CSE-301"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 3. Course Title */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Course Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 4. Instructor Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Instructor Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    placeholder="e.g. Dr. Sarah Mitchell"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 5. Semester */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Semester <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    placeholder="e.g. Spring 2026 / 5th Semester"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 6. Building Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Building Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.buildingName}
                    onChange={(e) => setFormData({ ...formData, buildingName: e.target.value })}
                    placeholder="e.g. Academic Building 2"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 7. Room Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Room Number <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. Room 301 / Lab 5"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 8. Class Start Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Class Start Time (BST) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g. 10:00 PM"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 9. Class End Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Class End Time (BST) <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g. 12:30 AM"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>
              </div>

              {/* 10. Class Days Multiple Selection (Saturday to Friday) */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Class Days (Saturday – Friday) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {(formData.days || []).length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map((day) => {
                    const isSelected = (formData.days || []).includes(day)
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-primary to-accent text-white border-primary shadow-md shadow-primary/20 scale-[1.02]'
                            : 'bg-muted/30 text-muted-foreground border-border/40 hover:text-foreground hover:bg-muted/60'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{day}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Live Preview Badge */}
              <div className="p-3 bg-muted/30 border border-border/40 rounded-xl flex items-center justify-between mt-3">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Computed Status (BST):
                </span>
                <div>{renderStatusBadge(formData.startTime, formData.endTime, formData.days)}</div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold shadow-md shadow-primary/20"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to MongoDB...
                    </span>
                  ) : editingItem ? (
                    'Save Class Changes'
                  ) : (
                    'Add Class Entry'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="border-border/40"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteModalItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md border-destructive/40 bg-card p-6 shadow-2xl space-y-5 text-center">
            {/* Destructive Icon Badge */}
            <div className="w-14 h-14 rounded-full bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center mx-auto shadow-lg shadow-destructive/10">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Delete Class Schedule?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground">{deleteModalItem.courseCode} - {deleteModalItem.courseTitle}</strong>?
              </p>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-left text-xs text-destructive flex items-start gap-2.5 mt-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  This action cannot be undone. This class entry will be permanently removed from MongoDB.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingId === deleteModalItem.id}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-semibold shadow-md shadow-destructive/20"
              >
                {deletingId === deleteModalItem.id ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Yes, Delete Class'
                )}
              </Button>
              <Button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                disabled={deletingId === deleteModalItem.id}
                variant="outline"
                className="flex-1 border-border/40"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
