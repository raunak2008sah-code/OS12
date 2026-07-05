import { useState } from 'react'
import { Settings, Moon, Sun, Monitor, Bell, Download, Upload, Trash2, User } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [accent, setAccent] = useState('blue')

  const handleExport = () => {
    alert("Exporting data as JSON... (Not fully implemented in backend yet)")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <h3 className="font-semibold text-lg">Appearance</h3>
          <p className="text-sm text-muted-foreground">Customize how OS12 looks and feels.</p>
        </div>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Theme Preference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <button onClick={() => setTheme('light')} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <Sun className="h-6 w-6" /> Light
              </button>
              <button onClick={() => setTheme('dark')} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <Moon className="h-6 w-6" /> Dark
              </button>
              <button onClick={() => setTheme('system')} className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <Monitor className="h-6 w-6" /> System
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium">Accent Color</label>
              <div className="flex gap-3">
                {['blue', 'purple', 'green', 'orange', 'red'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setAccent(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${accent === c ? 'scale-110 border-foreground' : 'border-transparent'}`}
                    style={{ backgroundColor: `var(--color-${c}-500, ${c})` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-1 space-y-2">
          <h3 className="font-semibold text-lg">Account</h3>
          <p className="text-sm text-muted-foreground">Manage your personal profile and data.</p>
        </div>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                {user?.email?.charAt(0).toUpperCase() || <User />}
              </div>
              <div>
                <p className="font-semibold text-lg">{user?.email}</p>
                <p className="text-sm text-muted-foreground">Authorized OS12 User</p>
              </div>
            </div>
            <button onClick={signOut} className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium text-sm">
              Sign Out
            </button>
          </CardContent>
        </Card>

        <div className="md:col-span-1 space-y-2">
          <h3 className="font-semibold text-lg">Notifications</h3>
          <p className="text-sm text-muted-foreground">Control your email and push alerts.</p>
        </div>
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            {['Daily Revision Reminders', 'Weekly Review Prompts', 'Backlog Warnings'].map(label => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="md:col-span-1 space-y-2">
          <h3 className="font-semibold text-lg text-red-500">Danger Zone</h3>
          <p className="text-sm text-muted-foreground">Data export and account deletion.</p>
        </div>
        <Card className="md:col-span-2 border-red-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium text-sm">
                <Download className="h-4 w-4" /> Export Data
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium text-sm">
                <Upload className="h-4 w-4" /> Import Backup
              </button>
            </div>
            <div className="pt-4 border-t border-red-500/10">
              <button className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-md font-medium text-sm transition-colors">
                <Trash2 className="h-4 w-4" /> Reset All Progress
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
