'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Student {
  id: number
  name: string
  email: string
  studentId: string
  major: string
  year: string
  gpa: number
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'Alex Johnson', email: 'alex.johnson@student.edu', studentId: 'SID001', major: 'Computer Science', year: 'Junior', gpa: 3.85 },
    { id: 2, name: 'Jordan Smith', email: 'jordan.smith@student.edu', studentId: 'SID002', major: 'Engineering', year: 'Senior', gpa: 3.72 },
    { id: 3, name: 'Taylor Brown', email: 'taylor.brown@student.edu', studentId: 'SID003', major: 'Business', year: 'Sophomore', gpa: 3.45 },
  ])

  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', studentId: '', major: '', year: '', gpa: '' })

  const handleAddClick = () => {
    setEditingId(null)
    setFormData({ name: '', email: '', studentId: '', major: '', year: '', gpa: '' })
    setIsOpen(true)
  }

  const handleEdit = (s: Student) => {
    setEditingId(s.id)
    setFormData({
      name: s.name,
      email: s.email,
      studentId: s.studentId,
      major: s.major,
      year: s.year,
      gpa: s.gpa.toString(),
    })
    setIsOpen(true)
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.studentId.trim()) return

    const gpa = parseFloat(formData.gpa) || 0

    if (editingId !== null) {
      setStudents(students.map(s =>
        s.id === editingId
          ? { ...s, name: formData.name, email: formData.email, studentId: formData.studentId, major: formData.major, year: formData.year, gpa }
          : s
      ))
    } else {
      const newStudent: Student = {
        id: Math.max(...students.map(s => s.id), 0) + 1,
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        major: formData.major,
        year: formData.year,
        gpa,
      }
      setStudents([newStudent, ...students])
    }
    setIsOpen(false)
  }

  const handleDelete = (id: number) => {
    setStudents(students.filter(s => s.id !== id))
  }

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.8) return 'text-green-400'
    if (gpa >= 3.5) return 'text-cyan-400'
    if (gpa >= 3.0) return 'text-yellow-400'
    return 'text-orange-400'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Students Management</h1>
          <p className="text-muted-foreground mt-1">Manage student information and enrollment</p>
        </div>
        <Button
          onClick={handleAddClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Button>
      </div>

      {/* Table */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border/40">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Student ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Major</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Year</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">GPA</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b border-border/40 hover:bg-muted/20 transition">
                  <td className="px-6 py-4 text-foreground font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{s.studentId}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{s.email}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{s.major}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm">{s.year}</td>
                  <td className={`px-6 py-4 text-sm font-semibold ${getGPAColor(s.gpa)}`}>{s.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-2 hover:bg-primary/20 rounded-lg transition text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-border/40 bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? 'Edit Student' : 'Add Student'}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Full name"
                  className="mt-1 bg-muted/50 border-border/40"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Student ID</label>
                <Input
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  placeholder="e.g., SID001"
                  className="mt-1 bg-muted/50 border-border/40"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  className="mt-1 bg-muted/50 border-border/40"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Major</label>
                <Input
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  placeholder="Major"
                  className="mt-1 bg-muted/50 border-border/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full mt-1 px-3 py-2 bg-muted/50 border border-border/40 rounded-lg text-foreground focus:outline-none focus:border-primary/60"
                  >
                    <option value="">Select year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">GPA</label>
                  <Input
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="3.85"
                    type="number"
                    step="0.01"
                    className="mt-1 bg-muted/50 border-border/40"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
                >
                  Save
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1 border-border/40"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
