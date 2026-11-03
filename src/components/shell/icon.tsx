'use client'

import * as React from 'react'
import {
  LayoutDashboard, GitBranch, Sparkles, MessageSquareCode, Wand2, Bug,
  GitPullRequest, Database, BarChart3, Bot, Trophy, FlaskConical,
  ClipboardCheck, TrendingUp, BookOpen, type LucideIcon
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  GitBranch,
  Sparkles,
  MessageSquareCode,
  Wand2,
  Bug,
  GitPullRequest,
  Database,
  BarChart3,
  Bot,
  Trophy,
  FlaskConical,
  ClipboardCheck,
  TrendingUp,
  BookOpen,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] || LayoutDashboard
  return <Cmp className={className} />
}
