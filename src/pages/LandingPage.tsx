import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Cloud,
  Film,
  Gauge,
  Layers3,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

const featureCards = [
  {
    icon: ClipboardList,
    title: 'Shot lists that stay current',
    text: 'Plan priorities, assign zones, and keep every must-have shot visible from prep through wrap.',
  },
  {
    icon: Users,
    title: 'Crew clarity in the field',
    text: 'Give shooters a focused view of their project, location, checklist, and sync status.',
  },
  {
    icon: Cloud,
    title: 'Offline-first capture',
    text: 'Record progress on set and let SLATE sync updates when the connection returns.',
  },
];

const stats = [
  { value: 'Live', label: 'crew progress' },
  { value: 'Zones', label: 'assignment view' },
  { value: 'PWA', label: 'mobile-ready' },
];

export function LandingPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="min-h-screen bg-[#f8fffd] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <section className="relative overflow-hidden border-b border-teal-100 bg-[linear-gradient(135deg,#f0fdfa_0%,#ffffff_46%,#fff7ed_100%)] dark:border-slate-800 dark:bg-[linear-gradient(135deg,#020617_0%,#0f172a_54%,#042f2e_100%)]">
        <div className="mx-auto flex min-h-[92vh] w-full max-w-7xl flex-col px-4 pb-12 pt-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between gap-3">
            <Link to="/" className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white shadow-sm">
                <Camera className="h-5 w-5" />
              </span>
              <span className="truncate text-lg font-bold tracking-normal text-slate-950 dark:text-white">SLATE</span>
            </Link>

            <nav className="flex items-center gap-2 sm:gap-3">
              <a
                href="#workflow"
                className="hidden rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:text-teal-200 sm:inline-flex"
              >
                Workflow
              </a>
              <ThemeToggle />
              <Button asChild variant="outline" className="border-teal-200 bg-white/80 text-teal-900 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-teal-200 dark:hover:bg-slate-800">
                <Link to="/auth">Sign in</Link>
              </Button>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:py-14">
            <div className="max-w-2xl">
              <Badge className="mb-5 border border-teal-200 bg-white/80 text-teal-900 shadow-sm hover:bg-white dark:border-teal-700/60 dark:bg-teal-300/15 dark:text-teal-100 dark:hover:bg-teal-300/20">
                Production management for HMC Studios
              </Badge>
              <h1 className="text-balance text-4xl font-bold leading-tight tracking-normal text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                Keep every shoot moving from call sheet to completed shot.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-700 dark:text-slate-300 sm:text-lg">
                SLATE brings project managers and shooters into one responsive workspace for assignments, checklists, zones, progress, and offline updates.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-orange-500 text-white hover:bg-orange-600">
                  <Link to="/auth">
                    Start with SLATE
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-teal-200 bg-white/80 text-teal-900 hover:bg-teal-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-teal-200 dark:hover:bg-slate-800">
                  <a href="#workflow">See workflow</a>
                </Button>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-md border border-teal-100 bg-white/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="text-sm font-bold text-teal-900 dark:text-teal-200 sm:text-base">{item.value}</div>
                    <div className="mt-1 text-xs leading-4 text-slate-600 dark:text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-lg border border-teal-100 bg-white p-3 shadow-2xl shadow-teal-900/10 dark:border-slate-700 dark:bg-slate-900 sm:p-4">
                <div className="rounded-md border border-slate-200 bg-slate-950 text-white">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-2">
                      <Film className="h-4 w-4 shrink-0 text-orange-300" />
                      <span className="truncate text-sm font-semibold">Wedding Highlight Film</span>
                    </div>
                    <Badge className="bg-teal-500 text-white hover:bg-teal-500">68%</Badge>
                  </div>

                  <div className="grid gap-3 p-3 sm:grid-cols-[0.82fr_1.18fr] sm:p-4">
                    <div className="space-y-3">
                      <div className="rounded-md bg-white/10 p-3">
                        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/70">
                          <MapPin className="h-3.5 w-3.5" />
                          Zone assignment
                        </div>
                        <div className="space-y-2">
                          {['Mandap', 'Couple entry', 'Family table'].map((zone) => (
                            <div key={zone} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-slate-900">
                              <span className="truncate text-xs font-medium">{zone}</span>
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-md bg-orange-400 p-3 text-slate-950">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <CalendarDays className="h-4 w-4" />
                          Today, 4:30 PM
                        </div>
                        <p className="mt-2 text-xs leading-5">Reception details and team coverage stay visible for the crew.</p>
                      </div>
                    </div>

                    <div className="rounded-md bg-white p-3 text-slate-950">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-semibold uppercase text-slate-500">Must-have shots</p>
                          <h2 className="text-base font-bold">Shooter checklist</h2>
                        </div>
                        <Gauge className="h-5 w-5 text-teal-700" />
                      </div>

                      <div className="space-y-2">
                        {[
                          ['Bride entry close-up', 'Done'],
                          ['Wide venue reveal', 'Synced'],
                          ['Family portraits', 'Next'],
                          ['Ring detail macro', 'Queued'],
                        ].map(([shot, status]) => (
                          <div key={shot} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
                            <span className="min-w-0 truncate text-xs font-medium">{shot}</span>
                            <span className="rounded-sm bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800">{status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="rounded-md border-teal-100 shadow-sm dark:border-slate-800">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-teal-50 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{feature.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 rounded-lg border border-teal-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_auto] md:items-center md:p-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-800 dark:text-teal-200">
              <ShieldCheck className="h-4 w-4" />
              Built for production days
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Responsive views, durable touch targets, and concise crew-facing screens keep the app usable from laptop planning to mobile field updates.
            </p>
          </div>
          <Button asChild className="bg-teal-700 hover:bg-teal-800">
            <Link to="/auth">
              Continue to login
              <Layers3 className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
