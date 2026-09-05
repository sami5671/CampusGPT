'use client'

import { useEffect, useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Search, 
  Loader2, 
  FileText, 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  ExternalLink,
  Eye,
  FileCheck,
  RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  getTemplatesAction, 
  createTemplateAction, 
  updateTemplateAction, 
  deleteTemplateAction, 
  TemplateItem, 
  TemplateInput 
} from '@/actions/template-actions'
import { PaginationControls } from '@/components/ui/pagination-controls'

const PRESET_TEMPLATES = [
  'Leave Application',
  'Transcript Application',
  'Semester Freeze',
  'Course Withdrawal',
  'Recommendation Letter',
]

export default function ApplicationTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)

  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TemplateItem | null>(null)
  const [deleteModalItem, setDeleteModalItem] = useState<TemplateItem | null>(null)
  const [isCustomName, setIsCustomName] = useState(false)
  
  const [templateName, setTemplateName] = useState('Leave Application')
  const [description, setDescription] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const [viewImageModalUrl, setViewImageModalUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset page when search or filter category changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterCategory])

  // Fetch templates on component mount
  const fetchTemplates = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getTemplatesAction()
    if (res.status) {
      setTemplates(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to load application templates')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleAddClick = () => {
    setEditingItem(null)
    setIsCustomName(false)
    setTemplateName('Leave Application')
    setDescription('')
    setImagePreview(null)
    setImageBase64(null)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleEditClick = (item: TemplateItem) => {
    setEditingItem(item)
    const isPreset = PRESET_TEMPLATES.includes(item.templateName)
    setIsCustomName(!isPreset)
    setTemplateName(item.templateName)
    setDescription(item.description || '')
    setImagePreview(item.imageUrl)
    setImageBase64(null)
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsOpen(true)
  }

  const handleOpenDeleteModal = (item: TemplateItem) => {
    setDeleteModalItem(item)
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteModalItem) return

    setDeletingId(deleteModalItem.id)
    setErrorMsg(null)
    const res = await deleteTemplateAction(deleteModalItem.id, deleteModalItem.imageUrl)
    if (res.status) {
      setTemplates(prev => prev.filter(t => t.id !== deleteModalItem.id))
      setSuccessMsg(`"${deleteModalItem.templateName}" and its picture were deleted successfully!`)
      setDeleteModalItem(null)
    } else {
      setErrorMsg(res.error || 'Failed to delete template')
    }
    setDeletingId(null)
  }

function compressTemplateImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
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

  // File handle function for drag and drop / click select
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP, etc.)')
      return
    }

    try {
      const compressedBase64 = await compressTemplateImage(file)
      setImagePreview(compressedBase64)
      setImageBase64(compressedBase64)
      setErrorMsg(null)
    } catch (err) {
      setErrorMsg('Failed to process image file.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!templateName.trim()) {
      setErrorMsg('Template name is required!')
      return
    }

    if (!imagePreview && !imageBase64) {
      setErrorMsg('Please upload a template picture image!')
      return
    }

    setSubmitting(true)

    if (editingItem) {
      // Update template
      const payload: TemplateInput = {
        templateName,
        description,
        ...(imageBase64 ? { imageBase64 } : { imageUrl: imagePreview || '' }),
      }

      const res = await updateTemplateAction(editingItem.id, payload, editingItem.imageUrl)
      if (res.status && res.data) {
        setTemplates(prev => prev.map(t => t.id === editingItem.id ? res.data! : t))
        setSuccessMsg(res.message || 'Application template updated successfully!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to update application template')
      }
    } else {
      // Create template
      const payload: TemplateInput = {
        templateName,
        description,
        imageBase64: imageBase64 || undefined,
        imageUrl: imagePreview || undefined,
      }

      const res = await createTemplateAction(payload)
      if (res.status && res.data) {
        setTemplates(prev => [res.data!, ...prev])
        setSuccessMsg(res.message || 'Application template saved to MongoDB and Cloudinary!')
        setIsOpen(false)
      } else {
        setErrorMsg(res.error || 'Failed to create application template')
      }
    }
    setSubmitting(false)
  }

  // Filter templates
  const filteredTemplates = templates.filter(item => {
    const matchesSearch = 
      item.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (filterCategory === 'all') return matchesSearch
    return matchesSearch && item.templateName.toLowerCase() === filterCategory.toLowerCase()
  })

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage) || 1
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Application Templates</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage university application templates stored in MongoDB with pictures uploaded to Cloudinary.
          </p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white gap-2 font-semibold shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Application Template
        </Button>
      </div>

      {/* Preset Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            filterCategory === 'all'
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-card/60 text-muted-foreground border-border/40 hover:text-foreground hover:bg-card'
          }`}
        >
          All Templates ({templates.length})
        </button>
        {PRESET_TEMPLATES.map((preset) => {
          const count = templates.filter(t => t.templateName.toLowerCase() === preset.toLowerCase()).length
          return (
            <button
              key={preset}
              onClick={() => setFilterCategory(filterCategory === preset ? 'all' : preset)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
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

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/40 backdrop-blur-md p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted/30 border-border/40 text-sm focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Showing <span className="text-foreground font-bold">{filteredTemplates.length}</span> of <span className="text-foreground font-bold">{templates.length}</span> templates
        </div>
      </div>

      {/* Templates Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Fetching application templates from MongoDB...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="border-border/40 bg-card/50 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Application Templates Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-5">
            {searchQuery ? 'No templates match your search term.' : 'Click below to upload template pictures to Cloudinary and save them in MongoDB.'}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddClick} size="sm" className="bg-primary hover:bg-primary/90 text-white gap-2 font-medium">
              <Plus className="w-4 h-4" /> Add Template
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTemplates.map((item) => (
              <Card 
                key={item.id}
                className="group border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/10 flex flex-col"
              >
                {/* Template Image Preview Header */}
                <div className="relative h-52 bg-black/40 overflow-hidden flex items-center justify-center border-b border-border/40">
                  <img
                    src={item.imageUrl}
                    alt={item.templateName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=60'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 text-xs font-semibold text-white flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {item.templateName}
                  </div>

                  {/* View Image Action Overlay */}
                  <button
                    onClick={() => setViewImageModalUrl(item.imageUrl)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-primary text-white border border-white/20 transition-all shadow-lg flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {item.templateName}
                    </h3>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic mt-1">
                        Official university application template format.
                      </p>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <a
                      href={item.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Cloudinary Link
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        title="Edit Template"
                        className="p-2 rounded-lg bg-muted/40 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all border border-border/20"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(item)}
                        title="Delete Template"
                        className="p-2 rounded-lg bg-muted/40 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all border border-border/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="border-border/40 bg-card/50 overflow-hidden shadow-lg">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTemplates.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(size) => {
                setItemsPerPage(size)
                setCurrentPage(1)
              }}
              pageSizeOptions={[3, 6, 9, 12]}
            />
          </Card>
        </div>
      )}

      {/* Add / Edit Template Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl border-border/40 bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {editingItem ? 'Edit Application Template' : 'Add Application Template'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Upload image to Cloudinary and store record in MongoDB.
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
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Template Name Selector / Custom */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Template Name <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomName(!isCustomName)}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    {isCustomName ? 'Choose from preset list' : '+ Enter custom template name'}
                  </button>
                </div>

                {isCustomName ? (
                  <Input
                    required
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Migration Certificate Application"
                    className="bg-muted/40 border-border/40 text-sm"
                  />
                ) : (
                  <select
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-muted/40 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {PRESET_TEMPLATES.map(preset => (
                      <option key={preset} value={preset} className="bg-card text-foreground">
                        {preset}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Upload Picture Area with Animated Cloud Icon */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                  Upload Template Picture <span className="text-red-400">*</span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 flex flex-col items-center justify-center gap-3 group ${
                    isDragging
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : imagePreview
                      ? 'border-primary/40 bg-muted/20 hover:bg-muted/40'
                      : 'border-border/60 bg-muted/30 hover:border-primary/60 hover:bg-muted/50'
                  }`}
                >
                  {imagePreview ? (
                    <div className="relative w-full max-h-48 rounded-xl overflow-hidden group/img border border-border/40 bg-black/40">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-contain"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="text-xs text-white font-semibold flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg border border-white/20">
                          <RefreshCw className="w-3.5 h-3.5" /> Change Picture
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Animated Cloud Icon Container */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 border border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-primary transition-all duration-300">
                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-25" />
                        <UploadCloud className="w-8 h-8 text-primary group-hover:text-accent animate-bounce transition-colors duration-300" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          Click to upload or drag & drop template image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports PNG, JPG, WEBP, JPEG (Max 10MB). Image is auto-uploaded to Cloudinary.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Description / Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description / Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide instructions or guidelines for filling out this template..."
                  className="w-full p-3 rounded-lg bg-muted/40 border border-border/40 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-semibold shadow-md shadow-primary/20"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading to Cloudinary & Saving...
                    </span>
                  ) : editingItem ? (
                    'Save Changes'
                  ) : (
                    'Save Application Template'
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
              <h2 className="text-xl font-bold text-foreground">Delete Application Template?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete <strong className="text-foreground">{deleteModalItem.templateName}</strong>?
              </p>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-left text-xs text-destructive flex items-start gap-2.5 mt-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  This action cannot be undone. The template document will be removed from MongoDB and its picture will be deleted from Cloudinary.
                </span>
              </div>
            </div>

            {/* Template Image Thumbnail Preview */}
            {deleteModalItem.imageUrl && (
              <div className="relative h-28 rounded-xl overflow-hidden border border-border/40 bg-black/40">
                <img
                  src={deleteModalItem.imageUrl}
                  alt={deleteModalItem.templateName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

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
                  'Yes, Delete Template'
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

      {/* Image Full Modal */}
      {viewImageModalUrl && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
          onClick={() => setViewImageModalUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-card p-2 rounded-2xl overflow-hidden border border-border/40 shadow-2xl">
            <button
              onClick={() => setViewImageModalUrl(null)}
              className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewImageModalUrl}
              alt="Template Full"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
