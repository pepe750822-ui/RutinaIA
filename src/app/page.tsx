// Auth-based routing (redirect to /dashboard or /login) is added in Step 3.
// This stub returns 200 so the Step 1 gate passes.
export default function RootPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[--background]">
      <p className="text-[--fg-muted] text-sm">RutinaIA</p>
    </main>
  );
}
