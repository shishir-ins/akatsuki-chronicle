import { useCallback, useEffect, useState } from "react";
import {
  announcementStore,
  deadlinesStore,
  examResourcesStore,
  notesStore,
  tasksStore,
} from "@/lib/store";
import { requestNotificationPermission } from "@/lib/notifications";
import { APP_NAME, APP_TAGLINE } from "@/lib/academics";
import { useAuth } from "@/hooks/useAuth";
import { fetchProjectPlans } from "@/lib/privateData";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import DeadlineCard from "@/components/DeadlineCard";
import NotesLibrary from "@/components/NotesLibrary";
import ExamCentrePanel from "@/components/ExamCentrePanel";
import frankyImg from "@/assets/franky.png";
import logoImg from "@/assets/logo.png";
import timetableImg from "@/assets/timetable.jpg";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  FolderKanban,
  GraduationCap,
  ListChecks,
} from "lucide-react";

interface DashboardPageProps {
  onPageChange: (page: string) => void;
}

export default function DashboardPage({ onPageChange }: DashboardPageProps) {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState("");
  const [deadlines, setDeadlines] = useState(deadlinesStore.getAll());
  const [tasks, setTasks] = useState(tasksStore.getAll());
  const [notesCount, setNotesCount] = useState(notesStore.getAll().length);
  const [examCount, setExamCount] = useState(examResourcesStore.getAll().length);
  const [projectCount, setProjectCount] = useState(0);

  const refresh = useCallback(() => {
    setAnnouncement(announcementStore.get());
    setDeadlines(deadlinesStore.getAll());
    setTasks(tasksStore.getAll());
    setNotesCount(notesStore.getAll().length);
    setExamCount(examResourcesStore.getAll().length);
  }, []);

  useEffect(() => {
    requestNotificationPermission();
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  useEffect(() => {
    let active = true;

    if (!user) {
      setProjectCount(0);
      return;
    }

    fetchProjectPlans(user.id)
      .then((projects) => {
        if (active) {
          setProjectCount(projects.length);
        }
      })
      .catch(() => {
        if (active) {
          setProjectCount(0);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="container flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 p-1.5">
            <img src={logoImg} alt={APP_NAME} className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{APP_NAME}</h1>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {APP_TAGLINE}
            </p>
          </div>
        </div>
      </header>

      <div className="container mt-6 space-y-6 animate-fade-in-up">
        <section
          className="hero-panel relative overflow-hidden rounded-[2rem] p-7 md:p-9"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(243, 247, 241, 0.96), rgba(230, 238, 232, 0.92)), url(${frankyImg})`,
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Calm, organised, semester-ready
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              A lighter, peaceful academic space for notes, exams, and project planning.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Use the dashboard to jump into the exam centre, manage your private projects, and
              browse notes from 2-2 all the way to your ending semester.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => onPageChange("exam")} className="btn-primary inline-flex items-center gap-2 px-5">
                Open exam centre
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onPageChange("projects")}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                Go to projects
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <AnnouncementBanner text={announcement} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Deadlines", value: deadlines.length, icon: CalendarClock },
            { label: "Dashboard tasks", value: tasks.length, icon: ListChecks },
            { label: "Library files", value: notesCount, icon: GraduationCap },
            { label: "Exam resources", value: examCount, icon: BookOpenCheck },
          ].map((item) => (
            <div key={item.label} className="surface-raised p-5">
              <item.icon className="h-5 w-5 text-primary" />
              <p className="mt-4 text-3xl font-semibold text-foreground">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="surface p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Today&apos;s dashboard tasks</h2>
                <p className="text-sm text-muted-foreground">
                  Shared reminders from the admin for everyone.
                </p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No tasks yet. The dashboard is clear for now.
              </div>
            ) : (
              <div className="mt-6 space-y-3 stagger-children">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-[1.25rem] border border-border bg-secondary/80 px-4 py-3 text-sm text-foreground">
                    {task.text}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="surface p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Projects snapshot</h2>
                  <p className="text-sm text-muted-foreground">Private student planner entries</p>
                </div>
              </div>
              <button
                onClick={() => onPageChange("projects")}
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Open
              </button>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-border bg-card/70 p-5">
              <p className="text-4xl font-semibold text-foreground">{projectCount}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {user
                  ? `personal project plan${projectCount === 1 ? "" : "s"} saved in your private area`
                  : "sign in to unlock your private project planner"}
              </p>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-primary/12 bg-primary/8 p-4 text-sm leading-6 text-foreground/85">
              Add milestones, project details, and your own target dates without exposing them in
              the shared admin registry.
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Upcoming deadlines</h2>
              <p className="text-sm text-muted-foreground">Keep pace with submissions and internal reviews.</p>
            </div>
          </div>
          {deadlines.length === 0 ? (
            <div className="surface p-8 text-center text-sm text-muted-foreground">
              No deadlines have been added yet.
            </div>
          ) : (
            <div className="space-y-3 stagger-children">
              {deadlines.map((deadline) => (
                <DeadlineCard key={deadline.id} title={deadline.title} dueDate={deadline.dueDate} />
              ))}
            </div>
          )}
        </section>

        <section className="surface overflow-hidden p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Exam centre on dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Important questions and teacher PDFs are visible here directly.
              </p>
            </div>
          </div>
          <ExamCentrePanel compact onOpenFull={() => onPageChange("exam")} />
        </section>

        <section className="surface overflow-hidden p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Weekly timetable</h2>
              <p className="text-sm text-muted-foreground">
                Keep this handy while planning tasks and revision.
              </p>
            </div>
          </div>
          <img src={timetableImg} alt="Class timetable" className="w-full rounded-[1.5rem] object-contain" />
        </section>

        <section className="surface p-6">
          <NotesLibrary />
        </section>
      </div>
    </div>
  );
}
