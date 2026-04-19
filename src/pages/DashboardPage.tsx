import { useCallback, useEffect, useState, useRef } from "react";
import {
  announcementStore,
  deadlinesStore,
  examResourcesStore,
  notesStore,
  tasksStore,
} from "@/lib/store";
import { requestNotificationPermission, sendNotification } from "@/lib/notifications";
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
import bannerImg from "@/assets/banner.jpg";
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
  const prevAnnouncementRef = useRef(announcementStore.get());
  const [deadlines, setDeadlines] = useState(deadlinesStore.getAll());
  const [tasks, setTasks] = useState(tasksStore.getAll());
  const [notesCount, setNotesCount] = useState(notesStore.getAll().length);
  const [examCount, setExamCount] = useState(examResourcesStore.getAll().length);
  const [projectCount, setProjectCount] = useState(0);

  const refresh = useCallback(() => {
    const currentAnn = announcementStore.get();
    // Fire local notification if announcement changed after first load
    if (currentAnn && currentAnn !== prevAnnouncementRef.current && prevAnnouncementRef.current !== null) {
      sendNotification("𝐁𝐑𝐄𝐀𝐊𝐈𝐍𝐆 𝐍𝐄𝐖𝐒", currentAnn);
    }
    prevAnnouncementRef.current = currentAnn;
    setAnnouncement(currentAnn);

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
    <div className="newspaper-theme min-h-screen pb-24 pt-16 bg-background text-foreground transition-colors duration-500">
      <div className="container mt-6 space-y-8 animate-fade-in-up border-x-4 border-foreground/10 px-4 sm:px-8 py-8 shadow-2xl bg-[#f4ebd8]">
        
        {/* NEWSPAPER HEADER COMPONENT */}
        <section className="flex flex-col items-center border-b-8 border-double border-foreground/80 pb-6 mb-8 mt-2">
          <div className="w-full flex justify-between items-end border-b-2 border-foreground/30 pb-2 mb-4">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-foreground/70">Vol. 1</span>
            <span className="text-[10px] sm:text-xs font-serif italic text-foreground/80">"Dhairye sahase manchu laxmi"</span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-foreground/70">No. 001</span>
          </div>
          
          <img 
            src={bannerImg} 
            alt="Big News Morgans" 
            className="w-full max-w-3xl object-cover grayscale contrast-125 sepia-[0.3] mb-6 border-4 border-foreground shadow-[0_0_15px_rgba(0,0,0,0.15)]" 
          />
          
          <h1 
            className="text-5xl sm:text-7xl md:text-[5.5rem] font-black tracking-tighter uppercase text-center mb-6" 
            style={{ fontFamily: '"Times New Roman", Times, serif', textShadow: '3px 3px 0px rgba(0,0,0,0.2)' }}
          >
            BLOODY HELL
          </h1>
          
          <div className="w-full">
            <AnnouncementBanner text={announcement} />
          </div>
        </section>

        {/* WEEKLY TIMETABLE - MOVED UP */}
        <section className="overflow-hidden p-6 border-2 border-foreground/30 bg-background/50 shadow-lg">
          <div className="mb-5 flex items-center justify-between gap-3 border-b-2 border-foreground/15 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif uppercase tracking-wider text-foreground">Weekly Timetable</h2>
              <p className="text-xs font-semibold text-foreground/60 uppercase">
                Keep this handy while planning tasks and revision.
              </p>
            </div>
          </div>
          <img src={timetableImg} alt="Class timetable" className="w-full border-4 border-foreground/10 object-contain shadow-md grayscale-[0.2] sepia-[0.3]" />
        </section>

        <section
          className="hero-panel relative overflow-hidden rounded-[2rem] p-7 md:p-9 border-4 border-foreground/20 sepia-[0.4]"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(243, 247, 241, 0.8), rgba(230, 238, 232, 0.7)), url(${frankyImg})`,
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/80">
              Next Stop: Exam Centre
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Access your critical exam resources and previous mid papers.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-foreground/80 md:text-base font-serif">
              The Exam Centre contains important questions, PDFs, and revision notes to help you prepare. Jump in to get ready for your upcoming exams.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => onPageChange("exam")} className="px-5 py-3 bg-foreground text-background font-bold tracking-widest text-sm uppercase rounded-[0.5rem] hover:bg-foreground/80 transition-colors border-2 border-foreground">
                Take me to Exam Centre
                <ArrowRight className="inline-block ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 pt-4 border-t-2 border-foreground/20 border-dashed">
          {[
            { label: "Deadlines", value: deadlines.length, icon: CalendarClock },
            { label: "Dashboard tasks", value: tasks.length, icon: ListChecks },
            { label: "Library files", value: notesCount, icon: GraduationCap },
            { label: "Exam resources", value: examCount, icon: BookOpenCheck },
          ].map((item) => (
            <div key={item.label} className="p-5 border-2 border-foreground/15 bg-background shadow-md shadow-foreground/5 hover:border-foreground/30 transition-colors">
              <item.icon className="h-6 w-6 text-foreground/60" />
              <p className="mt-4 text-4xl font-serif font-black text-foreground">{item.value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-foreground/60">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="p-6 border-2 border-foreground/30 bg-background/50 shadow-lg">
            <div className="flex items-center gap-3 border-b-2 border-foreground/15 pb-4">
              <div className="flex h-10 w-10 items-center justify-center border border-foreground/30 bg-foreground/5 text-foreground">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-serif uppercase tracking-wider text-foreground">Today's Dispatch</h2>
                <p className="text-xs font-semibold text-foreground/60 uppercase">
                  Shared reminders from the admin
                </p>
              </div>
            </div>

            {tasks.length === 0 ? (
              <div className="mt-6 border-2 border-dashed border-foreground/20 p-8 text-center text-sm font-serif italic text-foreground/60">
                No tasks yet. The dashboard is clear for now.
              </div>
            ) : (
              <div className="mt-6 space-y-3 stagger-children">
                {tasks.map((task) => (
                  <div key={task.id} className="border-l-4 border-foreground bg-foreground/5 px-4 py-3 text-sm font-serif text-foreground">
                    {task.text}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="p-6 border-2 border-foreground/30 bg-background/50 shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b-2 border-foreground/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-foreground/30 bg-foreground/5 text-foreground">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif uppercase tracking-wider text-foreground">Projects Snapshot</h2>
                  <p className="text-xs font-semibold text-foreground/60 uppercase">Private student entries</p>
                </div>
              </div>
              <button
                onClick={() => onPageChange("projects")}
                className="text-xs font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 text-foreground transition-colors hover:text-foreground/70"
              >
                Open
              </button>
            </div>

            <div className="mt-6 border-2 border-foreground/20 p-5 bg-background shadow-inner">
              <p className="text-5xl font-black font-serif text-foreground">{projectCount}</p>
              <p className="mt-2 text-sm font-medium text-foreground/70">
                {user
                  ? `personal project plan${projectCount === 1 ? "" : "s"} saved in your private area`
                  : "sign in to unlock your private project planner"}
              </p>
            </div>

            <div className="mt-4 border border-foreground/30 bg-foreground/10 p-4 text-sm font-serif italic leading-6 text-foreground/90">
              Add milestones, project details, and your own target dates without exposing them in
              the shared admin registry.
            </div>
          </section>
        </div>

        <section className="pt-4 border-t-4 border-foreground/80 border-double">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-foreground">Upcoming Deadlines</h2>
              <p className="text-sm font-medium text-foreground/70">Keep pace with submissions and internal reviews.</p>
            </div>
          </div>
          {deadlines.length === 0 ? (
            <div className="p-8 text-center text-sm font-serif italic text-foreground/60 border-2 border-dashed border-foreground/20">
              No deadlines have been added yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 stagger-children">
              {deadlines.map((deadline) => (
                <div key={deadline.id} className="border-2 border-foreground/30 p-4 bg-background shadow-md">
                  <DeadlineCard title={deadline.title} dueDate={deadline.dueDate} />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="overflow-hidden p-6 border-2 border-foreground/30 bg-background/50 shadow-lg">
          <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-foreground/15 pb-4">
            <div>
              <h2 className="text-xl font-bold font-serif uppercase tracking-wider text-foreground">Exam Centre Spotlight</h2>
              <p className="text-xs font-semibold text-foreground/60 uppercase">
                Important questions and teacher PDFs visible directly.
              </p>
            </div>
          </div>
          <div className="bg-background border border-foreground/20 p-2">
            <ExamCentrePanel compact onOpenFull={() => onPageChange("exam")} />
          </div>
        </section>

        <section className="p-6 border-2 border-foreground/30 bg-background/50 shadow-lg">
          <h2 className="text-2xl font-black font-serif uppercase tracking-tight text-foreground border-b-4 border-foreground/60 pb-2 mb-6">Class Notes Archive</h2>
          <NotesLibrary />
        </section>
      </div>
    </div>
  );
}
