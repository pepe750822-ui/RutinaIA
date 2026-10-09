import InviteStudentForm from "@/components/instructor/InviteStudentForm";

export default function InstructorPage() {
  return (
    <main className="flex flex-col items-center px-4 pt-8 pb-24 min-h-screen gap-8">
      <h1 className="text-xl font-bold self-start">Panel de instructor</h1>
      <InviteStudentForm />
    </main>
  );
}
