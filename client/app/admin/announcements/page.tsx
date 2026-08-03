'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  Loader2, 
  Megaphone, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle,
  Tag,
  Flame,
  FileText,
  UploadCloud,
  ImageIcon,
  Eye
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  getAnnouncementsAction, 
  createAnnouncementAction, 
  updateAnnouncementAction, 
  deleteAnnouncementAction, 
  AnnouncementItem, 
  AnnouncementInput 
} from '@/actions/announcement-actions'

// Dynamically import JoditEditor to prevent Next.js SSR hydration issues
const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 bg-muted/30 rounded-xl border border-border/40 text-muted-foreground text-xs gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
      <span>Loading Word-like Rich Text Editor...</span>
    </div>
  ),
}) as any

const CATEGORIES = ['General', 'Academic', 'Administrative', 'Exam', 'Event', 'Emergency']

const initialFormState: AnnouncementInput = {
  title: '',
  content: '',
  priority: 'medium',
  category: 'General',
  imageUrl: '',
  imageBase64: '',
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null)
  const [deleteModalItem, setDeleteModalItem] = useState<AnnouncementItem | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnnouncementInput>(initialFormState)

  const [imagePreviewModalUrl, setImagePreviewModalUrl] = useState<string | null>(null)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Full Word-like toolbar configuration for Jodit Editor
  const joditConfig = useMemo(
    () => ({
      readonly: false,
      placeholder: 'Write your announcement content here with full text formatting, tables, images, links...',
      height: 380,
      toolbarButtonSize: 'middle' as const,
      theme: 'dark',
      toolbarSticky: false,
      buttons: [
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'eraser',
        '|',
        'font',
        'fontsize',
        'brush',
        'paragraph',
        '|',
        'ul',
        'ol',
        'outdent',
        'indent',
        '|',
        'align',
        '|',
        'image',
        'table',
        'link',
        '|',
        'hr',
        'symbol',
        '|',
        'undo',
        'redo',
        '|',
        'fullsize',
        'source',
      ],
      uploader: {
        insertImageAsBase64URI: true,
      },
      showXPathInStatusbar: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: 'insert_clear_html' as const,
    }),
    []
  )

  // Fetch announcements from MongoDB
  const fetchAnnouncements = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getAnnouncementsAction()
    if (res.status) {
      setAnnouncements(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to load announcements from server')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const handleAddClick = () => {
    setEditingItem(null)
    setFormData(initialFormState)
    setPreviewImage(null)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleEditClick = (item: AnnouncementItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      content: item.content,
      priority: item.priority as any,
      category: item.category || 'General',
      imageUrl: item.imageUrl || '',
      imageBase64: '',
    })
    setPreviewImage(item.imageUrl || null)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
        }
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file!')
      return
    }

    try {
      const compressedBase64 = await compressImage(file)
      setPreviewImage(compressedBase64)
      setFormData(prev => ({ ...prev, imageBase64: compressedBase64 }))
    } catch (err) {
      setErrorMsg('Failed to process image file.')
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setFormData(prev => ({ ...prev, imageUrl: '', imageBase64: '' }))
  }

  const handleOpenDeleteModal = (item: AnnouncementItem) => {
    setDeleteModalItem(item)
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return

    setDeletingId(deleteModalItem.id)
    setErrorMsg(null)
    // Deletes entry from MongoDB AND deletes photo from Cloudinary
    const res = await deleteAnnouncementAction(deleteModalItem.id, deleteModalItem.imageUrl)
    if (res.status) {
      setAnnouncements(prev => prev.filter(a => a.id !== deleteModalItem.id))
      setSuccessMsg(`Announcement "${deleteModalItem.title}" and Cloudinary image deleted successfully!`)
      setDeleteModalItem(null)
    } else {
      setErrorMsg(res.error || 'Failed to delete announcement')
    }
    setDeletingId(null)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    // Strip HTML tags to verify content is not empty
    const plainText = formData.content.replace(/<[^>]*>/g, '').trim()
    if (!formData.title.trim() || !plainText) {
      setErrorMsg('Both title and content/details are required!')
      return
    }

    setSubmitting(true)
    if (editingItem) {
      // Update (deletes old image from Cloudinary if new image is uploaded)
      const res = await updateAnnouncementAction(editingItem.id, formData, editingItem.imageUrl)
      if (res.status && res.data) {
        setAnnouncements(prev => prev.map(a => a.id === editingItem.id ? res.data! : a))
        setSuccessMsg(res.message || 'Announcement updated successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to update announcement')
      }
    } else {
      // Create (uploads photo to Cloudinary if provided)
      const res = await createAnnouncementAction(formData)
      if (res.status && res.data) {
        setAnnouncements(prev => [res.data!, ...prev])
        setSuccessMsg(res.message || 'Announcement published to Cloudinary and MongoDB successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to publish announcement')
      }
    }
    setSubmitting(false)
  }

  // Filter announcements
  const filteredAnnouncements = announcements.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))

    if (filterPriority === 'all') return matchesSearch
    return matchesSearch && item.priority.toLowerCase() === filterPriority.toLowerCase()
  })

  // Priority color styling helper
  const getPriorityBadge = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === 'high') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Flame className="w-3.5 h-3.5 fill-rose-400" />
          High Priority
        </span>
      )
    } else if (p === 'medium') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Medium
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Normal
        </span>
      )
    }
  }

  // Format date string nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch (e) {
      return dateStr
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Announcements</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Publish rich formatted announcements with Cloudinary image upload and MongoDB persistence.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Announcement
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

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search announcement title, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/40 text-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Priority Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterPriority('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterPriority === 'all'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card'
            }`}
          >
            All ({announcements.length})
          </button>
          <button
            onClick={() => setFilterPriority('high')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
              filterPriority === 'high'
                ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                : 'bg-card/60 text-rose-400 border-rose-500/30 hover:bg-rose-500/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> High
          </button>
          <button
            onClick={() => setFilterPriority('medium')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterPriority === 'medium'
                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                : 'bg-card/60 text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setFilterPriority('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              filterPriority === 'low'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                : 'bg-card/60 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
            }`}
          >
            Normal
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Fetching announcements from MongoDB...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Megaphone className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No Announcements Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {searchQuery ? 'No announcements match your search query.' : 'There are no active announcements in MongoDB.'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddClick} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2">
                <Plus className="w-4 h-4" /> Publish Announcement
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/40 border-b border-border/40 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                <tr>
                  <th className="px-6 py-4">Banner Photo</th>
                  <th className="px-6 py-4">Title & Category</th>
                  <th className="px-6 py-4">Rich Content Preview</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Date Published</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {filteredAnnouncements.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                    {/* Banner Photo */}
                    <td className="px-6 py-4">
                      {item.imageUrl ? (
                        <div 
                          onClick={() => setImagePreviewModalUrl(item.imageUrl || null)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/40 cursor-pointer group/img shadow-md hover:opacity-90 transition"
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-muted/40 border border-border/30 flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="w-5 h-5 opacity-40" />
                        </div>
                      )}
                    </td>

                    {/* Title & Category */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors text-base">
                          {item.title}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <Tag className="w-3 h-3 text-primary" />
                          {item.category || 'General'}
                        </div>
                      </div>
                    </td>

                    {/* Rich Content Preview (HTML rendering) */}
                    <td className="px-6 py-4 max-w-md">
                      <div 
                        className="text-xs text-muted-foreground line-clamp-2 leading-relaxed overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </td>

                    {/* Priority Badge */}
                    <td className="px-6 py-4">
                      {getPriorityBadge(item.priority)}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(item.createdAt)}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          title="Edit Announcement"
                          className="p-2 rounded-lg bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
                          title="Delete Announcement"
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
        )}
      </Card>

      {/* Add / Edit Announcement Modal with Cloudinary Upload & Jodit Editor */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl border-border/40 bg-card p-6 shadow-2xl space-y-5 max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingItem ? 'Edit Announcement' : 'Publish New Announcement'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Upload image to Cloudinary and format message with Jodit Editor.
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
              {/* Cloudinary Image Upload Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  Announcement Banner Photo (Cloudinary)
                </label>
                
                {previewImage ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border/40 group bg-muted/20">
                    <img
                      src={previewImage}
                      alt="Announcement Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                      <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition shadow-lg">
                        Change Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition shadow-lg"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-xl hover:border-primary/60 transition cursor-pointer group bg-muted/20 hover:bg-muted/30">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-2">
                      <UploadCloud className="w-6 h-6 animate-bounce" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Click to upload photo to Cloudinary</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Final Examination Schedule & Rules Announcement"
                  className="bg-muted/40 border-border/40 text-sm"
                />
              </div>

              {/* Category & Priority Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-md bg-muted/40 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="bg-card text-foreground">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-md bg-muted/40 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="low" className="bg-card text-foreground">Normal / Low</option>
                    <option value="medium" className="bg-card text-foreground">Medium</option>
                    <option value="high" className="bg-card text-foreground">High Priority 🔴</option>
                  </select>
                </div>
              </div>

              {/* Jodit Word-like WYSIWYG Editor for Content / Details */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Content / Details (Word Editor) <span className="text-red-400">*</span>
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Full formatting (Fonts, Headings, Colors, Tables, Lists, Images)
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden border border-border/40">
                  <JoditEditor
                    value={formData.content}
                    config={joditConfig}
                    onBlur={(newContent: string) => setFormData(prev => ({ ...prev, content: newContent }))}
                  />
                </div>
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
                      Syncing Cloudinary & MongoDB...
                    </span>
                  ) : editingItem ? (
                    'Save Announcement Changes'
                  ) : (
                    'Publish Announcement'
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

      {/* Full Preview Image Modal */}
      {imagePreviewModalUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="relative max-w-3xl max-h-[85vh] w-full bg-card rounded-2xl overflow-hidden border border-border/40 shadow-2xl p-2">
            <button
              onClick={() => setImagePreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imagePreviewModalUrl}
              alt="Full Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          </div>
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
              <h2 className="text-xl font-bold text-foreground">Delete Announcement?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground">{deleteModalItem.title}</strong>?
              </p>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-left text-xs text-destructive flex items-start gap-2.5 mt-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  This action will permanently delete this announcement entry from MongoDB AND remove its photo from Cloudinary.
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
                    Deleting from Cloudinary & MongoDB...
                  </span>
                ) : (
                  'Yes, Delete Announcement'
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
