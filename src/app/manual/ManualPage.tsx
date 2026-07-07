import { useState } from 'react'
import { Target, Flame, Trophy, AlertTriangle, ShieldCheck, BookOpen, Sparkles, Heart, Brain, Swords, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const SECTIONS = [
  {
    id: 'belief',
    title: 'Core Belief',
    icon: Flame,
    color: 'text-orange-500',
    content: (
      <div className="space-y-4">
        <blockquote className="text-2xl font-black tracking-tight text-foreground leading-tight border-l-4 border-primary pl-6 py-2">
          "We have one year. Let's make it count."
        </blockquote>
        <p className="text-sm text-muted-foreground leading-relaxed">
          OS12 is not a productivity app. It is a mission control system built for a single purpose: to ensure that
          every hour of the next 365 days is invested with intent, precision, and honesty.
        </p>
      </div>
    )
  },
  {
    id: 'success',
    title: 'Success Definition',
    icon: Trophy,
    color: 'text-yellow-500',
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center space-y-2">
          <div className="text-3xl font-black text-primary">95%+</div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CBSE Boards</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center space-y-2">
          <div className="text-3xl font-black text-primary">99+</div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">JEE Percentile</p>
        </div>
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center space-y-2">
          <div className="text-3xl font-black text-primary">∞</div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Strong Foundation</p>
        </div>
      </div>
    )
  },
  {
    id: 'priorities',
    title: 'The Priority Stack',
    icon: Target,
    color: 'text-blue-500',
    content: (
      <div className="space-y-3">
        {[
          { rank: 1, title: 'Health & Sleep', desc: 'Without a functioning body and mind, nothing else works.', icon: Heart, color: 'text-red-500 bg-red-500/10' },
          { rank: 2, title: 'Consistency', desc: 'Showing up every day is more important than showing up perfectly once.', icon: Clock, color: 'text-blue-500 bg-blue-500/10' },
          { rank: 3, title: 'Deep Work', desc: 'Focused, uninterrupted effort yields the highest returns.', icon: Brain, color: 'text-purple-500 bg-purple-500/10' }
        ].map(p => (
          <div key={p.rank} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background hover:border-primary/30 transition-colors">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${p.color}`}>
              <p.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priority {p.rank}</span>
              </div>
              <h4 className="font-bold text-foreground">{p.title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'principles',
    title: 'Operating Principles',
    icon: ShieldCheck,
    color: 'text-green-500',
    content: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'No Zero Days', desc: 'Do something every single day. Even 15 minutes of revision keeps momentum alive.' },
          { title: 'Trust the System', desc: 'The plan is set. Don\'t waste energy second-guessing the roadmap. Execute today\'s tasks.' },
          { title: 'Radical Honesty', desc: 'Don\'t mark a chapter complete if you don\'t know the concepts. The only person you\'re fooling is yourself.' },
          { title: 'Review Over Intake', desc: 'Reviewing what you\'ve learned is exponentially more valuable than blindly consuming new material.' }
        ].map(p => (
          <div key={p.title} className="p-5 rounded-xl border border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5 transition-all space-y-2 group">
            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{p.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'backlog',
    title: 'Backlog Policy',
    icon: AlertTriangle,
    color: 'text-red-500',
    content: (
      <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
        {[
          { num: 1, bold: 'Do not panic.', text: 'Backlogs are a normal part of the journey. The danger is not getting a backlog, it\'s letting it paralyze you.' },
          { num: 2, bold: 'Current > Backlog.', text: 'Always prioritize the current week\'s targets over clearing old backlogs.' },
          { num: 3, bold: 'Use buffers.', text: 'Use scheduled buffer days and Sundays to strategically clear high-priority backlogged items.' },
          { num: 4, bold: 'Cut losses.', text: 'If a backlog item is low-priority and dragging you down, officially abandon it. Move on.' }
        ].map(item => (
          <div key={item.num} className="flex gap-4 items-start">
            <div className="h-7 w-7 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center text-xs font-black shrink-0">
              {item.num}
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              <strong>{item.bold}</strong> {item.text}
            </p>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 'workflow',
    title: 'The 10-Stage Workflow',
    icon: Swords,
    color: 'text-purple-500',
    content: (
      <div className="space-y-2">
        {[
          'Lecture Pending', 'NCERT Complete', 'WINR Complete', 'HC Verma / Module Complete',
          'PYQ Complete', 'Revision 1 Done', 'Notes Finalized', 'Mock Test 1 Complete',
          'Mock Test 2 Complete', 'Done'
        ].map((stage, idx) => (
          <div key={stage} className="flex items-center gap-4 p-3 rounded-xl border border-border/30 bg-background">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
              {idx + 1}
            </div>
            <span className="text-sm font-medium text-foreground">{stage}</span>
          </div>
        ))}
      </div>
    )
  }
]

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState('belief')

  return (
    <div className="mx-auto max-w-[1400px] space-y-4 pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Operating Manual</h1>
            <p className="text-sm text-muted-foreground mt-0.5">The canonical specification of OS12.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* Section Nav (Desktop) */}
        <div className="hidden md:block md:col-span-3 space-y-1 sticky top-24 h-fit">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id)
                  document.getElementById(`section-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                  activeSection === s.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${s.color}`} />
                {s.title}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="md:col-span-9 space-y-4">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <Card key={s.id} id={`section-${s.id}`} className="overflow-hidden border-border/50">
                <div className="p-5 border-b border-border/30 bg-muted/10">
                  <h2 className="text-lg font-bold flex items-center gap-2.5">
                    <Icon className={`h-5 w-5 ${s.color}`} />
                    {s.title}
                  </h2>
                </div>
                <CardContent className="p-4">
                  {s.content}
                </CardContent>
              </Card>
            )
          })}

          {/* Footer */}
          <div className="text-center py-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground font-medium">OS12 — Built for Raunak & Sahmo</p>
            <p className="text-xs text-muted-foreground/50 mt-1">Version 1.3 • Premium Edition</p>
          </div>
        </div>
      </div>
    </div>
  )
}
