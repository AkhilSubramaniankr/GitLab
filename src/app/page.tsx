'use client'

import * as React from 'react'
import { AppShell } from '@/components/shell/app-shell'
import { useAppStore } from '@/lib/store'
import { Dashboard } from '@/components/views/dashboard'
import { Day1View } from '@/components/days/day1'
import { Day2View } from '@/components/days/day2'
import { Day3View } from '@/components/days/day3'
import { Day4View } from '@/components/days/day4'
import { Day5View } from '@/components/days/day5'
import { Day6View } from '@/components/days/day6'
import { Day7View } from '@/components/days/day7'
import { Day8View } from '@/components/days/day8'
import { Day9View } from '@/components/days/day9'
import { Day10View } from '@/components/days/day10'
import { LabsView } from '@/components/views/labs'
import { PracticeView } from '@/components/views/practice'
import { ProgressView } from '@/components/views/progress'
import { GlossaryView } from '@/components/views/glossary'

export default function Home() {
  const view = useAppStore((s) => s.currentView)

  const render = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />
      case 'day1': return <Day1View />
      case 'day2': return <Day2View />
      case 'day3': return <Day3View />
      case 'day4': return <Day4View />
      case 'day5': return <Day5View />
      case 'day6': return <Day6View />
      case 'day7': return <Day7View />
      case 'day8': return <Day8View />
      case 'day9': return <Day9View />
      case 'day10': return <Day10View />
      case 'labs': return <LabsView />
      case 'practice': return <PracticeView />
      case 'progress': return <ProgressView />
      case 'glossary': return <GlossaryView />
      default: return <Dashboard />
    }
  }

  return <AppShell>{render()}</AppShell>
}
