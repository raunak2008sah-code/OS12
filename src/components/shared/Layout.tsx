import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/shared/Sidebar'
import TopBar from '@/components/shared/TopBar'
import BottomBar from '@/components/shared/BottomBar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  )
}
