'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Users, 
  BookOpen, 
  Building2, 
  FileText, 
  PlayCircle, 
  Flame, 
  Loader2, 
  Plus, 
  ArrowRight, 
  RefreshCw, 
  Clock,
  Sparkles
} from 'lucide-react'
import { getDashboardStatsAction, DashboardStatsData } from '@/actions/dashboard-actions'

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setErrorMsg(null)
    const res = await getDashboardStatsAction()
    if (res.status && res.data) {
      setStatsData(res.data)
    } else {
      setErrorMsg(res.error || 'Failed to fetch live statistics from MongoDB')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const statCards = [
    { 
      title: 'Faculty Members', 
      value: statsData?.totalFaculty ?? 0, 
      subText: 'Registered Instructors',
      icon: Users, 
      color: 'from-blue-500 to-cyan-500',
      href: '/admin/faculty' 
    },
    { 
      title: 'Office Directory', 
      value: statsData?.totalOffices ?? 0, 
      subText: 'Campus Departments',
      icon: Building2, 
      color: 'from-emerald-500 to-teal-500',
      href: '/admin/offices' 
    },
    { 
      title: 'Classes Schedule', 
      value: statsData?.totalClasses ?? 0, 
      subText: `${statsData?.runningClasses ?? 0} Running Now 🟢`,
      icon: BookOpen, 
      color: 'from-purple-500 to-pink-500',
      href: '/admin/classes' 
    },
    { 
      title: 'Application Templates', 
      value: statsData?.totalTemplates ?? 0, 
      subText: 'Cloudinary Presets',
      icon: FileText, 
      color: 'from-amber-500 to-rose-500',
      href: '/admin/templates' 
    },
  ]

  // Format date or timestamp for recent activity
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
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
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Live dynamic analytics and administrative management powered by MongoDB.
          </p>
        </div>
        <Button
          onClick={fetchStats}
          variant="outline"
          size="sm"
          className="border-border/40 text-muted-foreground hover:text-foreground gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
          {errorMsg}
        </div>
      )}

      {/* Dynamic Stats Grid */}
      {loading && !statsData ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Fetching dynamic statistics from MongoDB...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => (
            <Link key={idx} href={stat.href}>
              <Card className="p-5 cursor-pointer hover:border-primary/60 hover:shadow-lg transition-all border-border/40 bg-card/50 backdrop-blur-sm group space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">{stat.subText}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real MongoDB Recent Activity (2 Cols) */}
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">Recent MongoDB Activity</h2>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Live Feed</span>
          </div>

          {!statsData?.recentActivities || statsData.recentActivities.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              No recent activity found in MongoDB.
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {statsData.recentActivities.map((activity) => (
                <div key={activity.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-muted/10 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm text-foreground font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(activity.time)}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                    activity.type === 'announcement' ? 'bg-primary/15 text-primary border-primary/30' :
                    activity.type === 'class' ? 'bg-purple-500/15 text-purple-400 border-purple-500/30' :
                    activity.type === 'faculty' ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' :
                    activity.type === 'template' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    'bg-muted text-muted-foreground border-border/40'
                  }`}>
                    {activity.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Admin Quick Actions Sidebar (1 Col) */}
        <Card className="p-6 border-border/40 bg-card/50 backdrop-blur-sm space-y-4">
          <h2 className="text-lg font-bold text-foreground">Quick Management</h2>
          <div className="space-y-2.5">
            <Link href="/admin/classes">
              <Button className="w-full justify-start bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 gap-2.5 text-xs font-semibold">
                <Plus className="w-4 h-4" /> Add Class Schedule
              </Button>
            </Link>
            <Link href="/admin/faculty">
              <Button className="w-full justify-start bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 gap-2.5 text-xs font-semibold">
                <Plus className="w-4 h-4" /> Add Faculty Member
              </Button>
            </Link>
            <Link href="/admin/templates">
              <Button className="w-full justify-start bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 gap-2.5 text-xs font-semibold">
                <Plus className="w-4 h-4" /> Upload Application Template
              </Button>
            </Link>
            <Link href="/admin/offices">
              <Button className="w-full justify-start bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-2.5 text-xs font-semibold">
                <Plus className="w-4 h-4" /> Manage Office Directory
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
