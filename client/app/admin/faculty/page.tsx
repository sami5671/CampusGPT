'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, X, Search, Loader2, Mail, Phone, Clock, MapPin, Briefcase, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  getFacultiesAction, 
  createFacultyAction, 
  updateFacultyAction, 
  deleteFacultyAction, 
  FacultyItem, 
  FacultyInput 
} from '@/actions/faculty-actions'

const initialFormState: FacultyInput = {
  name: '',
  department: '',
  designation: '',
  officeRoom: '',
  email: '',
  contactNumber: '',
  officeHours: '',
}

export default function FacultyPage() {
  const [facultyList, setFacultyList] = useState<FacultyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FacultyItem | null>(null)
  const [formData, setFormData] = useState<FacultyInput>(initialFormState)
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch faculty members from MongoDB on component mount
  const fetchFacultyData = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getFacultiesAction()
    if (res.status) {
      setFacultyList(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to load faculty data from server')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchFacultyData()
  }, [])

  const handleAddClick = () => {
    setEditingItem(null)
    setFormData(initialFormState)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleEditClick = (item: FacultyItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      department: item.department,
      designation: item.designation,
      officeRoom: item.officeRoom,
      email: item.email,
      contactNumber: item.contactNumber,
      officeHours: item.officeHours,
    })
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    // Form Validation
    if (
      !formData.name.trim() ||
      !formData.department.trim() ||
      !formData.designation.trim() ||
      !formData.officeRoom.trim() ||
      !formData.email.trim() ||
      !formData.contactNumber.trim() ||
      !formData.officeHours.trim()
    ) {
      setErrorMsg('All Faculty Information fields are required!')
      return
    }

    setSubmitting(true)
    if (editingItem) {
      // Update existing faculty member
      const res = await updateFacultyAction(editingItem.id, formData)
      if (res.status && res.data) {
        setFacultyList(prev => prev.map(item => item.id === editingItem.id ? res.data! : item))
        setSuccessMsg(res.message || 'Faculty member updated successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to update faculty member')
      }
    } else {
      // Create new faculty member
      const res = await createFacultyAction(formData)
      if (res.status && res.data) {
        setFacultyList(prev => [res.data!, ...prev])
        setSuccessMsg(res.message || 'Faculty member added successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to add faculty member')
      }
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return

    setDeletingId(id)
    setErrorMsg(null)
    const res = await deleteFacultyAction(id)
    if (res.status) {
      setFacultyList(prev => prev.filter(item => item.id !== id))
      setSuccessMsg('Faculty member deleted successfully!')
    } else {
      setErrorMsg(res.error || 'Failed to delete faculty member')
    }
    setDeletingId(null)
  }

  // Filtered faculty list based on search query
  const filteredFaculty = facultyList.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.officeRoom.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Faculty Management</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Add, update, and manage official faculty member records in MongoDB.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Faculty Member
        </Button>
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

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, department, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/40 text-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-bold">{filteredFaculty.length}</span> of <span className="text-foreground font-bold">{facultyList.length}</span> members
        </div>
      </div>

      {/* Main Table / Grid Container */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching faculty records from MongoDB...</p>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Faculty Members Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery ? 'No matching results found for your search query.' : 'There are no faculty members added to the database yet.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddClick} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="w-4 h-4" /> Add First Faculty Member
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/40 border-b border-border/40 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-6 py-4">Faculty Member</th>
                  <th className="px-6 py-4">Designation & Department</th>
                  <th className="px-6 py-4">Office Room</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Office Hours</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {filteredFaculty.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    {/* Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/40 flex items-center justify-center text-primary font-bold text-base shadow-sm">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Designation & Department */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Briefcase className="w-3 h-3" />
                          {item.designation}
                        </span>
                        <div className="text-xs text-muted-foreground font-medium">
                          {item.department}
                        </div>
                      </div>
                    </td>

                    {/* Office Room */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-foreground text-sm font-medium">
                        <MapPin className="w-4 h-4 text-accent" />
                        {item.officeRoom}
                      </div>
                    </td>

                    {/* Contact Number */}
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-foreground font-medium">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                          {item.contactNumber}
                        </div>
                      </div>
                    </td>

                    {/* Office Hours */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/30 w-fit">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {item.officeHours}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          title="Edit Faculty Member"
                          className="p-2 rounded-lg bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete Faculty Member"
                          className="p-2 rounded-lg bg-muted/40 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all border border-border/20 disabled:opacity-50"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Faculty Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl border-border/40 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingItem ? 'Edit Faculty Member' : 'Add New Faculty Member'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Fill in all 7 Faculty Information fields below.
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
                {/* 1. Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Sarah Mitchell"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 2. Department */}
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

                {/* 3. Designation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Designation <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Associate Professor"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 4. Office Room */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Office Room <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.officeRoom}
                    onChange={(e) => setFormData({ ...formData, officeRoom: e.target.value })}
                    placeholder="e.g. Room CS-301"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 5. Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. sarah.mitchell@university.edu"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                {/* 6. Contact Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Contact Number <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    placeholder="e.g. +1 (555) 123-4567"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>
              </div>

              {/* 7. Office Hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  Office Hours <span className="text-red-400">*</span>
                </label>
                <Input
                  required
                  value={formData.officeHours}
                  onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                  placeholder="e.g. Mon & Wed 10:00 AM - 12:00 PM"
                  className="bg-muted/40 border-border/40 text-sm"
                />
              </div>

              {/* Modal Buttons */}
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
                    'Save Changes'
                  ) : (
                    'Add Faculty Member'
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
    </div>
  )
}
