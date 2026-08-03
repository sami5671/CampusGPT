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
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2,
  Layers,
  DoorOpen
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  getOfficesAction, 
  createOfficeAction, 
  updateOfficeAction, 
  deleteOfficeAction, 
  OfficeItem, 
  OfficeInput 
} from '@/actions/office-actions'

const PRESET_OFFICES = [
  'Registration Office',
  'Accounts Office',
  'Library',
  'Medical Center',
  'Administration',
  'Laboratories',
  'Super Shop',
  'Cafeteria',
]

const initialFormState: OfficeInput = {
  officeName: 'Registration Office',
  building: '',
  floor: '',
  room: '',
  phoneNumber: '',
  email: '',
  officeHours: '',
  mapLink: '',
}

export default function OfficeDirectoryPage() {
  const [offices, setOffices] = useState<OfficeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<OfficeItem | null>(null)
  const [isCustomName, setIsCustomName] = useState(false)
  const [formData, setFormData] = useState<OfficeInput>(initialFormState)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Fetch offices from MongoDB on load
  const fetchOffices = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getOfficesAction()
    if (res.status) {
      setOffices(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to load office directory from server')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOffices()
  }, [])

  const handleAddClick = () => {
    setEditingItem(null)
    setIsCustomName(false)
    setFormData(initialFormState)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleEditClick = (item: OfficeItem) => {
    setEditingItem(item)
    const isPreset = PRESET_OFFICES.includes(item.officeName)
    setIsCustomName(!isPreset)
    setFormData({
      officeName: item.officeName,
      building: item.building,
      floor: item.floor,
      room: item.room,
      phoneNumber: item.phoneNumber,
      email: item.email,
      officeHours: item.officeHours,
      mapLink: item.mapLink || '',
    })
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (
      !formData.officeName.trim() ||
      !formData.building.trim() ||
      !formData.floor.trim() ||
      !formData.room.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.email.trim() ||
      !formData.officeHours.trim()
    ) {
      setErrorMsg('Please fill in all required office directory fields!')
      return
    }

    setSubmitting(true)
    if (editingItem) {
      // Update
      const res = await updateOfficeAction(editingItem.id, formData)
      if (res.status && res.data) {
        setOffices(prev => prev.map(o => o.id === editingItem.id ? res.data! : o))
        setSuccessMsg(res.message || 'Office directory entry updated successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to update office entry')
      }
    } else {
      // Create
      const res = await createOfficeAction(formData)
      if (res.status && res.data) {
        setOffices(prev => [res.data!, ...prev])
        setSuccessMsg(res.message || 'Office directory entry added successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to add office entry')
      }
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this office entry?')) return

    setDeletingId(id)
    setErrorMsg(null)
    const res = await deleteOfficeAction(id)
    if (res.status) {
      setOffices(prev => prev.filter(o => o.id !== id))
      setSuccessMsg('Office entry deleted successfully!')
    } else {
      setErrorMsg(res.error || 'Failed to delete office entry')
    }
    setDeletingId(null)
  }

  // Filtered offices based on search and category
  const filteredOffices = offices.filter(item => {
    const matchesSearch = 
      item.officeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterCategory === 'all') return matchesSearch
    return matchesSearch && item.officeName.toLowerCase() === filterCategory.toLowerCase()
  })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Office Directory</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage official campus office locations, rooms, contacts, and map locations in MongoDB.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Office Location
        </Button>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            filterCategory === 'all'
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-card/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card'
          }`}
        >
          All Offices ({offices.length})
        </button>
        {PRESET_OFFICES.map((preset) => {
          const count = offices.filter(o => o.officeName.toLowerCase() === preset.toLowerCase()).length
          return (
            <button
              key={preset}
              onClick={() => setFilterCategory(filterCategory === preset ? 'all' : preset)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                filterCategory === preset
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-card/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card'
              }`}
            >
              <span>{preset}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  filterCategory === preset ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
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

      {/* Search and Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search office name, building, room..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/40 text-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-bold">{filteredOffices.length}</span> of <span className="text-foreground font-bold">{offices.length}</span> offices
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching office directory from MongoDB...</p>
          </div>
        ) : filteredOffices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Building2 className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Office Records Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery ? 'No matching offices found for your search query.' : 'No office directory entries have been added to the database yet.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddClick} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="w-4 h-4" /> Add Registration, Accounts, or Library Office
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/40 border-b border-border/40 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-6 py-4">Office Name</th>
                  <th className="px-6 py-4">Location (Building & Room)</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Office Hours</th>
                  <th className="px-6 py-4">Google Map</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {filteredOffices.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    {/* Office Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {item.officeName}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {item.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          {item.building}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Floor {item.floor}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <DoorOpen className="w-3 h-3" /> Room {item.room}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Phone Number */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        {item.phoneNumber}
                      </div>
                    </td>

                    {/* Office Hours */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/30 w-fit">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        {item.officeHours}
                      </div>
                    </td>

                    {/* Map Link */}
                    <td className="px-6 py-4">
                      {item.mapLink ? (
                        <a
                          href={item.mapLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Map
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">No link</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          title="Edit Office Entry"
                          className="p-2 rounded-lg bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          title="Delete Office Entry"
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

      {/* Modal for Add / Edit Office */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl border-border/40 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingItem ? 'Edit Office Directory Entry' : 'Add New Office Location'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Enter office details and location information.
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

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Office Name Selector / Custom */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Office Name / Type <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomName(!isCustomName)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    {isCustomName ? 'Choose from preset list' : '+ Enter custom office name'}
                  </button>
                </div>

                {isCustomName ? (
                  <Input
                    required
                    value={formData.officeName}
                    onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                    placeholder="e.g. Student Affairs Office"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                ) : (
                  <select
                    value={formData.officeName}
                    onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-muted/40 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {PRESET_OFFICES.map(office => (
                      <option key={office} value={office} className="bg-card text-foreground">
                        {office}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Building, Floor, Room */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Building <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.building}
                    onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                    placeholder="e.g. Administration Building"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Floor <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g. 2nd Floor"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Room <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Room 204"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>
              </div>

              {/* Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="e.g. +1 (555) 019-2831"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. registrar@university.edu"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>
              </div>

              {/* Office Hours & Google Map Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Office Hours <span className="text-red-400">*</span>
                  </label>
                  <Input
                    required
                    value={formData.officeHours}
                    onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                    placeholder="e.g. Mon-Fri 9:00 AM - 5:00 PM"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Google Map Link
                  </label>
                  <Input
                    type="url"
                    value={formData.mapLink}
                    onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                    placeholder="e.g. https://maps.google.com/..."
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                </div>
              </div>

              {/* Buttons */}
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
                    'Add Office Directory Entry'
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
