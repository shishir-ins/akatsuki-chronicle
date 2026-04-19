import { useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, Download, Eye, FileBadge2 } from "lucide-react";
import { examResourcesStore, type ExamResource } from "@/lib/store";
import { getAllSubjects } from "@/lib/academics";
import { cn } from "@/lib/utils";

interface ExamCentrePanelProps {
  compact?: boolean;
  onOpenFull?: () => void;
}

export default function ExamCentrePanel({
  compact = false,
  onOpenFull,
}: ExamCentrePanelProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [viewingPdf, setViewingPdf] = useState<ExamResource | null>(null);
  const resources = examResourcesStore.getAll();

  const subjects = useMemo(
    () => ["All", ...getAllSubjects(resources.map((resource) => resource.subject))],
    [resources],
  );

  const filteredResources = useMemo(() => {
    const subjectFiltered =
      selectedSubject === "All"
        ? resources
        : resources.filter((resource) => resource.subject === selectedSubject);

    return compact ? subjectFiltered.slice(0, 4) : subjectFiltered;
  }, [compact, resources, selectedSubject]);

  if (viewingPdf?.fileUrl) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <button
          onClick={() => setViewingPdf(null)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          Back to exam centre
        </button>
        <div className="surface overflow-hidden" style={{ height: "80vh" }}>
          <iframe src={viewingPdf.fileUrl} className="h-full w-full border-0" title={viewingPdf.title} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <BookOpenCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Exam Centre</h2>
            <p className="text-sm text-muted-foreground">
              Important questions and teacher PDFs, organised subject-wise.
            </p>
          </div>
        </div>
        {compact && onOpenFull && (
          <button
            onClick={onOpenFull}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/30 hover:text-primary"
          >
            Open full exam centre
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {!compact && subjects.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                selectedSubject === subject
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {subject}
            </button>
          ))}
        </div>
      )}

      {filteredResources.length === 0 ? (
        <div className="surface p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No exam resources have been uploaded yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2 stagger-children">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="surface-interactive rounded-[1.5rem] p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {resource.subject}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">{resource.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {resource.resourceType === "important_questions"
                      ? "Important questions"
                      : "Teacher shared PDF"}
                  </p>
                </div>
                <div className="rounded-2xl bg-secondary p-3 text-primary">
                  <FileBadge2 className="h-5 w-5" />
                </div>
              </div>

              {resource.description && (
                <div className="mt-4 rounded-2xl border border-primary/15 bg-primary/8 p-4 text-sm leading-6 text-foreground/90">
                  {resource.description}
                </div>
              )}

              {resource.fileUrl && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setViewingPdf(resource)}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <Eye className="h-4 w-4" />
                    View PDF
                  </button>
                  <a
                    href={resource.fileUrl}
                    download={resource.fileName || `${resource.title}.pdf`}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
