import { Target, Flame, Trophy, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function ManualPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 py-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operating Manual</h1>
        <p className="text-muted-foreground mt-2">
          The canonical specification, core beliefs, and absolute truth of OS12.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Belief */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Core Belief
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium leading-relaxed">
              "We have one year. Let's make it count."
            </p>
          </CardContent>
        </Card>

        {/* Success Definition */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Success Definition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>95%+ in CBSE Board Exams</li>
              <li>99+ Percentile in JEE Main</li>
              <li>A solid foundation for advanced technical topics</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Priority Stack */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          The Priority Stack
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-primary tracking-wider">Priority 1</CardTitle>
              <CardDescription className="text-lg font-semibold text-foreground">Health & Sleep</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Without a functioning body and mind, nothing else works.</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-primary tracking-wider">Priority 2</CardTitle>
              <CardDescription className="text-lg font-semibold text-foreground">Consistency</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Showing up every day is more important than showing up perfectly once.</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-sm uppercase text-primary tracking-wider">Priority 3</CardTitle>
              <CardDescription className="text-lg font-semibold text-foreground">Deep Work</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Focused, uninterrupted effort yields the highest returns.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Operating Principles */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Operating Principles
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">No Zero Days</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do something, anything, every single day. Even 15 minutes of revision keeps the momentum alive.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trust the System</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              The plan is set. Do not waste energy second-guessing the roadmap. Execute the day's tasks.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Radical Honesty</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Do not mark a chapter complete if you do not know the concepts. The only person you are fooling is yourself.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Review Over Intake</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Reviewing what you've learned is exponentially more valuable than blindly consuming new material.
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* Backlog Policy */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-6 w-6" />
          Backlog Policy
        </h2>
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">How to handle getting behind</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p><strong>1. Do not panic.</strong> Backlogs are a normal part of the journey. The danger is not getting a backlog, it's letting it paralyze you.</p>
            <p><strong>2. Current &gt; Backlog.</strong> Always prioritize the current week's targets over clearing old backlogs. If you prioritize the backlog, the current week becomes a new backlog.</p>
            <p><strong>3. Use buffers.</strong> Use scheduled buffer days and Sundays to strategically clear the highest-priority backlogged items.</p>
            <p><strong>4. Cut losses.</strong> If a backlog item is low-priority and dragging you down, officially abandon it. Move on.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
