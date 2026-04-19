import { GraduationCap } from "lucide-react";
import NotesLibrary from "@/components/NotesLibrary";

export default function NotesPage() {
  return (
    <div className="newspaper-theme min-h-screen pb-24 pt-24 bg-background text-foreground transition-colors duration-500">
      <div className="container mx-auto px-4 sm:px-8 max-w-5xl animate-fade-in-up">
        <section className="p-6 md:p-10 border-2 border-foreground/30 bg-[#f4ebd8] shadow-2xl">
          <div className="flex items-center gap-4 border-b-4 border-foreground/60 pb-4 mb-8">
             <div className="flex h-14 w-14 items-center justify-center border-2 border-foreground/30 bg-foreground/5 text-foreground">
                <GraduationCap className="h-8 w-8" />
             </div>
             <div>
               <h1 className="text-3xl md:text-5xl font-black font-serif uppercase tracking-tight text-foreground">
                 Class Notes Archive
               </h1>
               <p className="mt-1 text-sm font-semibold text-foreground/60 uppercase tracking-widest">
                 Complete Semester-wise Resources
               </p>
             </div>
          </div>
          <NotesLibrary />
        </section>
      </div>
    </div>
  );
}
