import ExamCentrePanel from "@/components/ExamCentrePanel";
import frankyImg from "@/assets/franky.png";

export default function ExamCentrePage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="container pt-20 space-y-6 animate-fade-in-up">
        <section
          className="hero-panel relative overflow-hidden rounded-[2rem] p-7 md:p-9"
          style={{
            backgroundImage: `linear-gradient(120deg, rgba(244, 248, 242, 0.95), rgba(231, 238, 231, 0.92)), url(${frankyImg})`,
          }}
        >
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Exam Centre
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Everything needed for exam revision, one subject at a time.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              Students can review important questions, open teacher-shared PDFs, and stay focused
              on the right material before each exam.
            </p>
          </div>
        </section>

        <section className="surface p-6 md:p-7">
          <ExamCentrePanel />
        </section>
      </div>
    </div>
  );
}
