'use client'

import * as React from 'react'
import { Menu, Search, Moon, Sun, X, Github, ChevronRight, TrendingUp } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/lib/store'
import { NAV_GROUPS, CURRICULUM } from '@/lib/curriculum'
import { Icon } from './icon'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const COLOR_CLASS: Record<string, string> = {
  blue: 'text-ai-blue',
  purple: 'text-ai-purple',
  cyan: 'text-ai-cyan',
  green: 'text-ai-green',
  orange: 'text-ai-orange',
  red: 'text-ai-red',
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentView, setView, sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  // Auto-open sidebar on desktop (≥ 1024px), default closed on mobile.
  React.useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    handler(mq)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setSidebarOpen])

  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const totalLessons = 120 // approx across all days
  const completedLessons = useAppStore((s) => Object.values(s.progress.completedLessons).filter(Boolean).length)
  const overallPct = Math.round((completedLessons / totalLessons) * 100)

  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return NAV_GROUPS
    const q = searchQuery.toLowerCase()
    return NAV_GROUPS.map((g) => ({
      ...g,
      items: g.items.filter((it) => it.label.toLowerCase().includes(q)),
    })).filter((g) => g.items.length > 0)
  }, [searchQuery])

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen w-72 shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-200',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden'
        )}
      >
        {/* Brand */}
        <div className="px-4 py-4 border-b border-sidebar-border flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ai-purple to-ai-blue flex items-center justify-center shrink-0">
            <Github className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">Copilot for Data Analytics</p>
            <p className="text-[11px] text-sidebar-foreground/60 leading-tight">Interactive Learning Lab</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden ml-auto p-1.5 rounded hover:bg-sidebar-accent"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sidebar-foreground/40" />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lessons..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-sidebar-accent border border-sidebar-border focus:outline-none focus:ring-1 focus:ring-sidebar-primary placeholder:text-sidebar-foreground/40"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3">
          {filteredGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/40">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = currentView === (item as any).view
                  const colorClass = (item as any).color ? COLOR_CLASS[(item as any).color] : ''
                  return (
                    <button
                      key={(item as any).view}
                      onClick={() => {
                        setView((item as any).view)
                        if (window.innerWidth < 1024) setSidebarOpen(false)
                      }}
                      aria-current={active ? 'page' : undefined}
                      aria-label={(item as any).label}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors text-left',
                        active
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <Icon name={(item as any).icon} className="w-4 h-4 shrink-0" />
                      <span className="flex-1 truncate text-xs">{(item as any).label}</span>
                      {active && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Progress mini */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-sidebar-foreground/60">Course progress</span>
            <span className="text-[11px] font-semibold text-sidebar-foreground">{overallPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-sidebar-accent overflow-hidden">
            <div className="h-full bg-gradient-to-r from-ai-purple to-ai-blue transition-all" style={{ width: `${overallPct}%` }} />
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar */}
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center gap-3 px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-muted lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => setView('dashboard')} className="hover:text-foreground">Home</button>
            <span>/</span>
            <span className="text-foreground font-medium capitalize">
              {currentView.startsWith('day') ? `Day ${currentView.slice(3)}` : currentView}
            </span>
          </div>

          <div className="flex-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('progress')}
            className="hidden sm:flex"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            {completedLessons}/{totalLessons}
          </Button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-muted"
            aria-label="Toggle theme"
          >
            {mounted && theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
