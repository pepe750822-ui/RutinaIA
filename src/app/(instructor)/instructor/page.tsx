import { Suspense } from "react";
import InviteStudentForm from "@/components/instructor/InviteStudentForm";
import StudentList from "@/components/instructor/StudentList";

export default function InstructorPage() {
  return (
    <main className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen gap-8">
      <h1 className="text-xl font-bold self-start">Panel de instructor</h1>

      <InviteStudentForm />

      <Suspense
        fallback={
          <div className="w-full max-w-sm text-center text-[--fg-muted] text-sm">Cargando alumnos…</div>
        }
      >
        <StudentList />
      </Suspense>
    </main>
  );
}
