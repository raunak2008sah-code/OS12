import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Monitor, Bell, Download, Trash2, User, Globe, Smartphone, ShieldAlert } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()

  // Persisted settings using localStorage
  const [timeFormat, setTimeFormat] = useState(() => localStorage.getItem('os12-time-format') || '12h')
  const [weekStart, setWeekStart] = useState(() => localStorage.getItem('os12-week-start') || '1')
  const [notifRevision, setNotifRevision] = useState(() => localStorage.getItem('os12-notif-revision') !== 'false')
  const [notifWeekly, setNotifWeekly] = useState(() => localStorage.getItem('os12-notif-weekly') !== 'false')
  const [notifBacklog, setNotifBacklog] = useState(() => localStorage.getItem('os12-notif-backlog') !== 'false')
  const [notifMobile, setNotifMobile] = useState(() => localStorage.getItem('os12-notif-mobile') === 'true')

  // Persist settings on change
  useEffect(() => { localStorage.setItem('os12-time-format', timeFormat) }, [timeFormat])
  useEffect(() => { localStorage.setItem('os12-week-start', weekStart) }, [weekStart])
  useEffect(() => { localStorage.setItem('os12-notif-revision', String(notifRevision)) }, [notifRevision])
  useEffect(() => { localStorage.setItem('os12-notif-weekly', String(notifWeekly)) }, [notifWeekly])
  useEffect(() => { localStorage.setItem('os12-notif-backlog', String(notifBacklog)) }, [notifBacklog])
  useEffect(() => { localStorage.setItem('os12-notif-mobile', String(notifMobile)) }, [notifMobile])

  const handleExport = async () => {
    // Real JSON export of all user data
    if (!user?.id) return
    try {
      const [subjects, chapters, progress, notes, mistakes, formulas, revisions, backlog] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('chapters').select('*'),
        supabase.from('chapter_progress').select('*').eq('user_id', user.id),
        supabase.from('notes').select('*').eq('user_id', user.id),
        supabase.from('mistakes').select('*').eq('user_id', user.id),
        supabase.from('formula_sheets').select('*').eq('user_id', user.id),
        supabase.from('revisions').select('*').eq('user_id', user.id),
        supabase.from('backlog').select('*').eq('user_id', user.id),
      ])
      
      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        subjects: subjects.data,
        chapters: chapters.data,
        progress: progress.data,
        notes: notes.data,
        mistakes: mistakes.data,
        formula_sheets: formulas.data,
        revisions: revisions.data,
        backlog: backlog.data,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `os12-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your account, preferences, and OS12 behavior.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12">
        {/* Navigation Sidebar (Desktop) */}
        <div className="hidden md:block md:col-span-3 space-y-1 sticky top-24 h-fit">
          <SettingsNavButton icon={User} label="Profile" active />
          <SettingsNavButton icon={Sun} label="Appearance" />
          <SettingsNavButton icon={Globe} label="Timezone & Region" />
          <SettingsNavButton icon={Bell} label="Notifications" />
          <SettingsNavButton icon={ShieldAlert} label="Danger Zone" className="text-red-500 hover:text-red-500 hover:bg-red-500/10 mt-4" />
        </div>

        {/* Settings Content */}
        <div className="md:col-span-9 space-y-10">
          
          {/* Profile Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Profile</h2>
              <p className="text-sm text-muted-foreground">Manage your personal profile and data.</p>
            </div>
            <Card>
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-black text-primary shadow-inner border border-primary/20">
                      {user?.email?.charAt(0).toUpperCase() || <User className="h-8 w-8" />}
                    </div>
                    <div>
                      <p className="font-bold text-xl">{user?.email}</p>
                      <p className="text-sm text-muted-foreground mt-1">Authorized OS12 User • Premium</p>
                    </div>
                  </div>
                  <Button onClick={signOut} variant="outline" className="shrink-0 border-border/50 hover:bg-muted">
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Appearance Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how OS12 looks and feels.</p>
            </div>
            <Card>
              <CardContent className="p-6 sm:p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Theme Preference</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <ThemeButton 
                      icon={Sun} label="Light" active={theme === 'light'} 
                      onClick={() => setTheme('light')} 
                    />
                    <ThemeButton 
                      icon={Moon} label="Dark" active={theme === 'dark'} 
                      onClick={() => setTheme('dark')} 
                    />
                    <ThemeButton 
                      icon={Monitor} label="System" active={theme === 'system'} 
                      onClick={() => setTheme('system')} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Regional & Time Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Regional & Time</h2>
              <p className="text-sm text-muted-foreground">Configure timezone and calendar preferences.</p>
            </div>
            <Card>
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-foreground">Timezone</label>
                  <select disabled className="w-full sm:max-w-md rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-not-allowed opacity-70">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST) — Locked</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Timezone is locked to Asia/Kolkata (IST) per the Operating Manual.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-border/30">
                  <div className="flex-1 space-y-3">
                    <label className="text-sm font-semibold text-foreground">Time Format</label>
                    <select 
                      value={timeFormat}
                      onChange={e => setTimeFormat(e.target.value)}
                      className="w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="12h">12-hour (1:00 PM)</option>
                      <option value="24h">24-hour (13:00)</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="text-sm font-semibold text-foreground">Week Starts On</label>
                    <select 
                      value={weekStart}
                      onChange={e => setWeekStart(e.target.value)}
                      className="w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                      <option value="1">Monday</option>
                      <option value="0">Sunday</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Notifications Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Control your alerts and reminders.</p>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  <NotificationToggle label="Daily Revision Reminders" desc="Get notified about pending spaced repetition tasks." checked={notifRevision} onChange={setNotifRevision} />
                  <NotificationToggle label="Weekly Review Prompts" desc="Sunday ritual planning and reflection reminders." checked={notifWeekly} onChange={setNotifWeekly} />
                  <NotificationToggle label="Backlog Warnings" desc="Alerts when chapters fall dangerously behind schedule." checked={notifBacklog} onChange={setNotifBacklog} />
                  <NotificationToggle label="Mobile Push Notifications" desc="Send critical alerts to your mobile device." icon={Smartphone} checked={notifMobile} onChange={setNotifMobile} />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Danger Zone */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-red-500">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">Destructive actions and data exports.</p>
            </div>
            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <Button onClick={handleExport} variant="outline" className="w-full border-red-500/20 hover:bg-red-500/10 text-foreground">
                  <Download className="h-4 w-4 mr-2" /> Export JSON Backup
                </Button>
                <div className="pt-6 border-t border-red-500/10">
                  {!showResetConfirm ? (
                    <Button onClick={() => setShowResetConfirm(true)} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold">
                      <Trash2 className="h-4 w-4 mr-2" /> Factory Reset OS12
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-red-500 text-center">Are you absolutely sure? This will delete ALL your progress.</p>
                      <div className="flex gap-3">
                        <Button onClick={() => setShowResetConfirm(false)} variant="outline" className="flex-1">
                          Cancel
                        </Button>
                        <Button 
                          onClick={async () => {
                            if (!user?.id) return
                            // Delete all user-specific data
                            await Promise.all([
                              supabase.from('chapter_progress').delete().eq('user_id', user.id),
                              supabase.from('resource_progress').delete().eq('user_id', user.id),
                              supabase.from('notes').delete().eq('user_id', user.id),
                              supabase.from('mistakes').delete().eq('user_id', user.id),
                              supabase.from('formula_sheets').delete().eq('user_id', user.id),
                              supabase.from('revisions').delete().eq('user_id', user.id),
                              supabase.from('backlog').delete().eq('user_id', user.id),
                              supabase.from('comments').delete().eq('user_id', user.id),
                            ])
                            localStorage.clear()
                            window.location.href = '/'
                          }} 
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Confirm Reset
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-center text-red-500/70 mt-3 font-medium">This will permanently delete all progress, notes, and mistakes. This action cannot be undone.</p>
                </div>
              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </div>
  )
}

function SettingsNavButton({ icon: Icon, label, active, className = '' }: any) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    } ${className}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )
}

function ThemeButton({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
        active 
          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
          : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30 text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className={`h-7 w-7 ${active ? 'fill-primary/20' : ''}`} /> 
      <span className="font-semibold text-sm">{label}</span>
    </button>
  )
}

function NotificationToggle({ label, desc, icon: Icon = Bell, checked, onChange }: any) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative cursor-pointer shrink-0 transition-colors ${checked ? 'bg-primary' : 'bg-muted'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${checked ? 'right-1' : 'left-1'}`} />
      </button>
    </div>
  )
}
