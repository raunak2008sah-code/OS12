import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '@/components/shared/Sidebar'
import TopBar from '@/components/shared/TopBar'
import BottomBar from '@/components/shared/BottomBar'

export default function Layout() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+, or Cmd+, to open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault()
        navigate('/settings')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background p-3 md:p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  )
}
