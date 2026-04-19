import { useState } from "react";
import NavBar from "@/components/NavBar";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import PlannerPage from "@/pages/PlannerPage";
import EnquiryPage from "@/pages/EnquiryPage";
import AiChatPage from "@/pages/AiChatPage";
import Footer from "@/components/Footer";
import ProjectsPage from "@/pages/ProjectsPage";
import ExamCentrePage from "@/pages/ExamCentrePage";
import NotesPage from "@/pages/NotesPage";
import FloatingActionButtons from "@/components/FloatingActionButtons";

export type AppPage =
  | "dashboard"
  | "exam"
  | "projects"
  | "planner"
  | "notes"
  | "ai"
  | "enquiry"
  | "admin";

const Index = () => {
  const [page, setPage] = useState<AppPage>("dashboard");

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="app-shell-background" />

      <NavBar currentPage={page} onPageChange={(nextPage) => setPage(nextPage as AppPage)} />

      <main className="animate-fade-in flex-1 relative z-10">
        {page === "dashboard" && <DashboardPage onPageChange={(next) => setPage(next as AppPage)} />}
        {page === "exam" && <ExamCentrePage onPageChange={(next) => setPage(next as AppPage)} />}
        {page === "projects" && <ProjectsPage onPageChange={(next) => setPage(next as AppPage)} />}
        {page === "planner" && <PlannerPage />}
        {page === "notes" && <NotesPage />}
        {page === "enquiry" && <EnquiryPage />}
        {page === "ai" && <AiChatPage />}
        {page === "admin" && <AdminPage />}
      </main>

      <FloatingActionButtons onPageChange={(nextPage) => setPage(nextPage as AppPage)} currentPage={page} />

      {page !== "ai" && <Footer onPageChange={(nextPage) => setPage(nextPage as AppPage)} />}
    </div>
  );
};

export default Index;
