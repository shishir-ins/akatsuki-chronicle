import { useMemo, useRef, useState } from "react";
import {
  announcementStore,
  deadlinesStore,
  enquiriesStore,
  examResourcesStore,
  notesStore,
  projectRegistryStore,
  tasksStore,
} from "@/lib/store";
import { sendNotification } from "@/lib/notifications";
import {
  ACADEMIC_PERIODS,
  APP_NAME,
  getAllSubjects,
  getPeriodLabel,
} from "@/lib/academics";
import frankyImg from "@/assets/franky.png";
import { toast } from "sonner";
import {
  CalendarPlus,
  FilePlus2,
  Files,
  Lock,
  Megaphone,
  MessageCircle,
  Reply,
  TableProperties,
  Trash2,
} from "lucide-react";

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [periodId, setPeriodId] = useState(ACADEMIC_PERIODS[0].id);
  const [subject, setSubject] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteFile, setNoteFile] = useState<File | null>(null);

  const [examSubject, setExamSubject] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examType, setExamType] = useState<"important_questions" | "teacher_pdf">("important_questions");
  const [examDescription, setExamDescription] = useState("");
  const [examFile, setExamFile] = useState<File | null>(null);

  const [announcementInput, setAnnouncementInput] = useState("");
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [task, setTask] = useState("");

  const [registrySubject, setRegistrySubject] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [studentNames, setStudentNames] = useState("");
  const [rollNumbers, setRollNumbers] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectSubmissionDate, setProjectSubmissionDate] = useState("");

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const noteFileInputRef = useRef<HTMLInputElement>(null);
  const examFileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setRefreshKey((current) => current + 1);

  const subjects = useMemo(
    () =>
      getAllSubjects(
        notesStore.getAll().map((note) => note.subject),
        examResourcesStore.getAll().map((resource) => resource.subject),
        projectRegistryStore.getAll().map((entry) => entry.subject),
      ),
    [refreshKey],
  );

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="surface-raised w-full max-w-sm p-8 text-center animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12 text-primary">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">Admin access</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the admin password to manage {APP_NAME}.
          </p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (password === "bloodyhell123") {
                  setAuthenticated(true);
                } else {
                  toast.error("Incorrect password");
                }
              }
            }}
            className="input-soft mt-6"
          />
          <button
            onClick={() => {
              if (password === "bloodyhell123") {
                setAuthenticated(true);
              } else {
                toast.error("Incorrect password");
              }
            }}
            className="btn-primary mt-4 w-full"
          >
            Enter admin panel
          </button>
        </div>
      </div>
    );
  }

  const notes = notesStore.getAll();
  const examResources = examResourcesStore.getAll();
  const deadlines = deadlinesStore.getAll();
  const tasks = tasksStore.getAll();
  const enquiries = enquiriesStore.getAll();
  const registryEntries = projectRegistryStore.getAll();
  void refreshKey;

  const saveNote = async () => {
    if (!subject.trim() || !noteTitle.trim() || !noteFile) {
      toast.error("Add a subject, note title, and PDF");
      return;
    }

    const fileUrl = await readFileAsDataUrl(noteFile);
    notesStore.add({
      subject: subject.trim(),
      title: noteTitle.trim(),
      periodId,
      fileUrl,
      fileName: noteFile.name,
    });

    sendNotification("New notes uploaded", `${subject.trim()} · ${noteTitle.trim()}`);
    setSubject("");
    setNoteTitle("");
    setNoteFile(null);
    if (noteFileInputRef.current) {
      noteFileInputRef.current.value = "";
    }
    toast.success("Notes uploaded");
    refresh();
  };

  const saveExamResource = async () => {
    if (!examSubject.trim() || !examTitle.trim()) {
      toast.error("Add a subject and title for the exam resource");
      return;
    }

    if (examType === "important_questions" && !examDescription.trim() && !examFile) {
      toast.error("Add important questions text or upload a PDF");
      return;
    }

    if (examType === "teacher_pdf" && !examFile) {
      toast.error("Upload the teacher PDF");
      return;
    }

    const fileUrl = examFile ? await readFileAsDataUrl(examFile) : undefined;

    examResourcesStore.add({
      subject: examSubject.trim(),
      title: examTitle.trim(),
      resourceType: examType,
      description: examDescription.trim() || undefined,
      fileUrl,
      fileName: examFile?.name,
    });

    sendNotification("Exam centre updated", `${examSubject.trim()} · ${examTitle.trim()}`);
    setExamSubject("");
    setExamTitle("");
    setExamDescription("");
    setExamFile(null);
    if (examFileInputRef.current) {
      examFileInputRef.current.value = "";
    }
    toast.success("Exam resource added");
    refresh();
  };

  const saveAnnouncement = () => {
    if (!announcementInput.trim()) {
      return;
    }
    announcementStore.set(announcementInput.trim());
    sendNotification("Announcement updated", announcementInput.trim());
    setAnnouncementInput("");
    toast.success("Announcement broadcast");
    refresh();
  };

  const saveDeadline = () => {
    if (!deadlineTitle.trim() || !deadlineDate) {
      toast.error("Add a deadline title and date");
      return;
    }

    deadlinesStore.add({
      title: deadlineTitle.trim(),
      dueDate: deadlineDate,
    });
    sendNotification("New deadline added", `${deadlineTitle.trim()} · ${deadlineDate}`);
    setDeadlineTitle("");
    setDeadlineDate("");
    toast.success("Deadline added");
    refresh();
  };

  const saveTask = () => {
    if (!task.trim()) {
      return;
    }

    tasksStore.add(task.trim());
    sendNotification("Dashboard task added", task.trim());
    setTask("");
    toast.success("Task added");
    refresh();
  };

  const saveRegistryEntry = () => {
    if (
      !registrySubject.trim() ||
      !batchNumber.trim() ||
      !studentNames.trim() ||
      !rollNumbers.trim() ||
      !projectTitle.trim() ||
      !projectSubmissionDate
    ) {
      toast.error("Complete every project registry field");
      return;
    }

    projectRegistryStore.add({
      subject: registrySubject.trim(),
      batchNumber: batchNumber.trim(),
      studentNames: studentNames.trim(),
      rollNumbers: rollNumbers.trim(),
      projectTitle: projectTitle.trim(),
      submissionDate: projectSubmissionDate,
    });

    setRegistrySubject("");
    setBatchNumber("");
    setStudentNames("");
    setRollNumbers("");
    setProjectTitle("");
    setProjectSubmissionDate("");
    toast.success("Project registry entry added");
    refresh();
  };

  const sendReply = (id: string) => {
    if (!replyText.trim()) {
      return;
    }
    enquiriesStore.reply(id, replyText.trim());
    setReplyText("");
    setReplyingTo(null);
    toast.success("Reply saved");
    refresh();
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="container pt-20 space-y-6 animate-fade-in-up">
        <section
          className="hero-panel relative overflow-hidden rounded-[2rem] p-7 md:p-9"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(244, 248, 242, 0.96), rgba(230, 238, 232, 0.94)), url(${frankyImg})`,
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Admin control centre
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Manage semester notes, exam resources, and subject-wise project records.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              This panel now powers the all-year notes library, the dashboard exam centre, and the
              structured project registry for every subject.
            </p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="surface p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Files className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Upload semester notes</h2>
                <p className="text-sm text-muted-foreground">
                  Store notes by year, semester, and subject.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <select value={periodId} onChange={(event) => setPeriodId(event.target.value)} className="input-soft">
                {ACADEMIC_PERIODS.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
              <input
                placeholder="Subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                list="admin-subjects"
                className="input-soft"
              />
              <input
                placeholder="Note title"
                value={noteTitle}
                onChange={(event) => setNoteTitle(event.target.value)}
                className="input-soft"
              />
              <label className="input-soft flex cursor-pointer items-center justify-between gap-3">
                <span className="truncate text-sm text-muted-foreground">
                  {noteFile ? noteFile.name : "Choose PDF for notes"}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Select
                </span>
                <input
                  ref={noteFileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => setNoteFile(event.target.files?.[0] || null)}
                />
              </label>
              <button onClick={saveNote} className="btn-primary w-full">
                Upload to notes library
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {notes.slice(0, 5).map((note) => (
                <div key={note.id} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{note.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {getPeriodLabel(note.periodId)} · {note.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      notesStore.delete(note.id);
                      refresh();
                    }}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="surface p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <FilePlus2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Update exam centre</h2>
                <p className="text-sm text-muted-foreground">
                  Add important questions or teacher PDFs subject-wise.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input
                placeholder="Subject"
                value={examSubject}
                onChange={(event) => setExamSubject(event.target.value)}
                list="admin-subjects"
                className="input-soft"
              />
              <input
                placeholder="Exam resource title"
                value={examTitle}
                onChange={(event) => setExamTitle(event.target.value)}
                className="input-soft"
              />
              <select
                value={examType}
                onChange={(event) => setExamType(event.target.value as "important_questions" | "teacher_pdf")}
                className="input-soft"
              >
                <option value="important_questions">Important questions</option>
                <option value="teacher_pdf">Teacher PDF</option>
              </select>
              <textarea
                placeholder="Important questions, instructions, or short notes..."
                value={examDescription}
                onChange={(event) => setExamDescription(event.target.value)}
                rows={4}
                className="input-soft resize-none"
              />
              <label className="input-soft flex cursor-pointer items-center justify-between gap-3">
                <span className="truncate text-sm text-muted-foreground">
                  {examFile ? examFile.name : "Choose optional PDF or teacher handout"}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Select
                </span>
                <input
                  ref={examFileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(event) => setExamFile(event.target.files?.[0] || null)}
                />
              </label>
              <button onClick={saveExamResource} className="btn-primary w-full">
                Publish to exam centre
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {examResources.slice(0, 5).map((resource) => (
                <div key={resource.id} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{resource.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {resource.subject} ·{" "}
                      {resource.resourceType === "important_questions" ? "Important questions" : "Teacher PDF"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      examResourcesStore.delete(resource.id);
                      refresh();
                    }}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="surface p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Dashboard updates</h2>
                <p className="text-sm text-muted-foreground">
                  Announcements, deadlines, and daily shared tasks.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <input
                placeholder="Announcement"
                value={announcementInput}
                onChange={(event) => setAnnouncementInput(event.target.value)}
                className="input-soft"
              />
              <button onClick={saveAnnouncement} className="btn-primary w-full">
                Broadcast announcement
              </button>

              <input
                placeholder="Deadline title"
                value={deadlineTitle}
                onChange={(event) => setDeadlineTitle(event.target.value)}
                className="input-soft"
              />
              <input
                type="date"
                value={deadlineDate}
                onChange={(event) => setDeadlineDate(event.target.value)}
                className="input-soft"
              />
              <button onClick={saveDeadline} className="btn-primary w-full">
                Add deadline
              </button>

              <input
                placeholder="Shared task for dashboard"
                value={task}
                onChange={(event) => setTask(event.target.value)}
                className="input-soft"
              />
              <button onClick={saveTask} className="btn-primary w-full">
                Add shared task
              </button>
            </div>

            <div className="mt-6 space-y-2">
              {deadlines.slice(0, 3).map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due {new Date(deadline.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      deadlinesStore.delete(deadline.id);
                      refresh();
                    }}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {tasks.slice(0, 3).map((dashboardTask) => (
                <div key={dashboardTask.id} className="flex items-center justify-between rounded-2xl border border-border bg-secondary/70 px-4 py-3 text-sm">
                  <p className="min-w-0 flex-1 truncate text-foreground">{dashboardTask.text}</p>
                  <button
                    onClick={() => {
                      tasksStore.delete(dashboardTask.id);
                      refresh();
                    }}
                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="surface p-6 md:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <TableProperties className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Project registry</h2>
                <p className="text-sm text-muted-foreground">
                  Subject-wise admin table for batches, students, and submission dates.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input
                placeholder="Subject"
                value={registrySubject}
                onChange={(event) => setRegistrySubject(event.target.value)}
                list="admin-subjects"
                className="input-soft"
              />
              <input
                placeholder="Batch number"
                value={batchNumber}
                onChange={(event) => setBatchNumber(event.target.value)}
                className="input-soft"
              />
              <input
                placeholder="Student names"
                value={studentNames}
                onChange={(event) => setStudentNames(event.target.value)}
                className="input-soft md:col-span-2"
              />
              <input
                placeholder="Roll numbers"
                value={rollNumbers}
                onChange={(event) => setRollNumbers(event.target.value)}
                className="input-soft md:col-span-2"
              />
              <input
                placeholder="Project title"
                value={projectTitle}
                onChange={(event) => setProjectTitle(event.target.value)}
                className="input-soft md:col-span-2"
              />
              <input
                type="date"
                value={projectSubmissionDate}
                onChange={(event) => setProjectSubmissionDate(event.target.value)}
                className="input-soft"
              />
              <button onClick={saveRegistryEntry} className="btn-primary">
                Add registry row
              </button>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-secondary/80 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Batch</th>
                      <th className="px-4 py-3 font-medium">Students</th>
                      <th className="px-4 py-3 font-medium">Roll nos</th>
                      <th className="px-4 py-3 font-medium">Project title</th>
                      <th className="px-4 py-3 font-medium">Submission date</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registryEntries.map((entry) => (
                      <tr key={entry.id} className="border-t border-border bg-card/70 text-foreground">
                        <td className="px-4 py-3">{entry.subject}</td>
                        <td className="px-4 py-3">{entry.batchNumber}</td>
                        <td className="px-4 py-3">{entry.studentNames}</td>
                        <td className="px-4 py-3">{entry.rollNumbers}</td>
                        <td className="px-4 py-3">{entry.projectTitle}</td>
                        <td className="px-4 py-3">
                          {new Date(entry.submissionDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              projectRegistryStore.delete(entry.id);
                              refresh();
                            }}
                            className="rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {registryEntries.length === 0 && (
                      <tr className="border-t border-border bg-card/70">
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No project registry rows yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <section className="surface p-6 md:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Student enquiries</h2>
              <p className="text-sm text-muted-foreground">
                Review questions and reply from the same panel.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {enquiries.map((enquiry) => (
              <article key={enquiry.id} className="rounded-[1.5rem] border border-border bg-secondary/70 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">{enquiry.name}</p>
                    <p className="mt-2 text-sm text-foreground">{enquiry.message}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!enquiry.reply && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === enquiry.id ? null : enquiry.id)}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                      >
                        <Reply className="mr-2 inline h-3.5 w-3.5" />
                        Reply
                      </button>
                    )}
                    <button
                      onClick={() => {
                        enquiriesStore.delete(enquiry.id);
                        refresh();
                      }}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {enquiry.reply && (
                  <div className="mt-4 rounded-[1.25rem] border border-primary/15 bg-primary/8 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                      Saved reply
                    </p>
                    <p className="mt-2 text-sm text-foreground">{enquiry.reply}</p>
                  </div>
                )}

                {replyingTo === enquiry.id && (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      className="input-soft flex-1"
                    />
                    <button onClick={() => sendReply(enquiry.id)} className="btn-primary sm:w-auto">
                      Save reply
                    </button>
                  </div>
                )}
              </article>
            ))}

            {enquiries.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No enquiries yet.
              </div>
            )}
          </div>
        </section>

        <datalist id="admin-subjects">
          {subjects.map((subjectOption) => (
            <option key={subjectOption} value={subjectOption} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
