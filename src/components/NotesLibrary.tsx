import { useMemo, useState } from "react";
import { ArrowLeft, Download, Eye, LibraryBig } from "lucide-react";
import { getAllSubjects, getPeriodLabel, ACADEMIC_PERIODS } from "@/lib/academics";
import { notesStore, type Note } from "@/lib/store";

export default function NotesLibrary() {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [viewingPdf, setViewingPdf] = useState<Note | null>(null);
  const notes = notesStore.getAll();

  const notesForSelectedPeriod = useMemo(
    () => notes.filter((note) => note.periodId === selectedPeriod),
    [notes, selectedPeriod],
  );

  const subjectsForSelectedPeriod = useMemo(
    () => getAllSubjects(notesForSelectedPeriod.map((note) => note.subject)),
    [notesForSelectedPeriod],
  );

  const selectedNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          (!selectedPeriod || note.periodId === selectedPeriod) &&
          (!selectedSubject || note.subject === selectedSubject),
      ),
    [notes, selectedPeriod, selectedSubject],
  );

  if (viewingPdf) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <button
          onClick={() => setViewingPdf(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to library
        </button>
        <div className="surface overflow-hidden" style={{ height: "80vh" }}>
          <iframe src={viewingPdf.fileUrl} className="h-full w-full border-0" title={viewingPdf.title} />
        </div>
      </div>
    );
  }

  if (selectedPeriod && selectedSubject) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <button
          onClick={() => setSelectedSubject(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to subjects
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {getPeriodLabel(selectedPeriod)}
            </p>
            <h3 className="text-2xl font-semibold text-foreground">{selectedSubject}</h3>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {selectedNotes.length} file{selectedNotes.length === 1 ? "" : "s"}
          </span>
        </div>

        {selectedNotes.length === 0 ? (
          <div className="surface p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No PDFs have been added for this subject in this semester yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 stagger-children">
            {selectedNotes.map((note) => (
              <div key={note.id} className="surface-interactive flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{note.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{note.fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingPdf(note)}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <a
                    href={note.fileUrl}
                    download={note.fileName}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-secondary px-3 text-sm text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (selectedPeriod) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <button
          onClick={() => setSelectedPeriod(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to academic years
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Notes Library
            </p>
            <h3 className="text-2xl font-semibold text-foreground">{getPeriodLabel(selectedPeriod)}</h3>
          </div>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            {notesForSelectedPeriod.length} upload{notesForSelectedPeriod.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
          {subjectsForSelectedPeriod.map((subject) => {
            const count = notesForSelectedPeriod.filter((note) => note.subject === subject).length;
            return (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className="surface-interactive rounded-[1.4rem] p-5 text-left"
              >
                <p className="text-base font-semibold text-foreground">{subject}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {count} note{count === 1 ? "" : "s"} available
                </p>
              </button>
            );
          })}
          {subjectsForSelectedPeriod.length === 0 && (
            <div className="surface p-8 text-sm text-muted-foreground">
              This semester is ready, but no subject notes have been uploaded yet.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <LibraryBig className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">All-Year Notes Library</h2>
          <p className="text-sm text-muted-foreground">
            Browse semester-wise notes from 2nd year 2nd sem up to 4th year 2nd sem.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 stagger-children">
        {ACADEMIC_PERIODS.map((period) => {
          const periodNotes = notes.filter((note) => note.periodId === period.id);
          const subjectCount = new Set(periodNotes.map((note) => note.subject)).size;

          return (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className="surface-interactive rounded-[1.8rem] p-6 text-left"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                {period.id.toUpperCase()}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-foreground">{period.label}</h3>
              <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
                <span>{periodNotes.length} files</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                <span>{subjectCount} subjects</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
