import { useState } from 'react'
import { Settings, Moon, Sun, Monitor, Bell, Download, Upload, Trash2, User, Globe, Smartphone, ShieldAlert } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [accent, setAccent] = useState('blue')

  const handleExport = () => {
    alert("Exporting data as JSON... (Available in next release)")
  }

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
                
                <div className="space-y-4 pt-6 border-t border-border/30">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Accent Color</label>
                  <div className="flex flex-wrap gap-4">
                    {['blue', 'purple', 'green', 'orange', 'red'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setAccent(c)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${accent === c ? 'scale-110 border-foreground shadow-lg' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: `var(--color-${c}-500, ${c})` }}
                        aria-label={`${c} accent`}
                      />
                    ))}
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
                  <select className="w-full sm:max-w-md rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                  <p className="text-xs text-muted-foreground">All dates and deadlines are strictly calculated using this timezone.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6 pt-6 border-t border-border/30">
                  <div className="flex-1 space-y-3">
                    <label className="text-sm font-semibold text-foreground">Time Format</label>
                    <select className="w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                      <option value="12h">12-hour (1:00 PM)</option>
                      <option value="24h">24-hour (13:00)</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="text-sm font-semibold text-foreground">Week Starts On</label>
                    <select className="w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all">
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
                  <NotificationRow label="Daily Revision Reminders" desc="Get notified about pending spaced repetition tasks." />
                  <NotificationRow label="Weekly Review Prompts" desc="Sunday ritual planning and reflection reminders." />
                  <NotificationRow label="Backlog Warnings" desc="Alerts when chapters fall dangerously behind schedule." />
                  <NotificationRow label="Mobile Push Notifications" desc="Send critical alerts to your mobile device." icon={Smartphone} />
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button onClick={handleExport} variant="outline" className="flex-1 border-red-500/20 hover:bg-red-500/10 text-foreground">
                    <Download className="h-4 w-4 mr-2" /> Export JSON Backup
                  </Button>
                  <Button variant="outline" className="flex-1 border-red-500/20 hover:bg-red-500/10 text-foreground">
                    <Upload className="h-4 w-4 mr-2" /> Import Backup
                  </Button>
                </div>
                <div className="pt-6 border-t border-red-500/10">
                  <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold">
                    <Trash2 className="h-4 w-4 mr-2" /> Factory Reset OS12
                  </Button>
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

function NotificationRow({ label, desc, icon: Icon = Bell }: any) {
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
      <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shrink-0 transition-colors">
        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
      </div>
    </div>
  )
}
