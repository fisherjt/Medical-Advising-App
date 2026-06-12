import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";

export default async function AdvisorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role === "STUDENT") redirect("/student");

  const students = await prisma.studentProfile.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-serif font-extrabold text-[#3063A5] text-xl">BYU-I</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pre-Health Advisor Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Signed in as <strong>{session.user?.name}</strong></span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Advisee Cohort</h1>
          <p className="text-slate-500 text-sm mt-1">
            {students.length} student{students.length !== 1 ? "s" : ""} in your cohort
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Track</th>
                <th className="px-6 py-3 text-center">Cum GPA</th>
                <th className="px-6 py-3 text-center">Sci GPA</th>
                <th className="px-6 py-3 text-center">Shadowing</th>
                <th className="px-6 py-3 text-center">Clinical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm">
                    No students yet. Add students via the Admin panel.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900">{s.user.name}</td>
                    <td className="px-6 py-4 text-slate-500">{s.track}</td>
                    <td className="px-6 py-4 text-center font-mono font-bold text-[#3063A5]">{s.gpa.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center font-mono text-slate-600">{s.scienceGpa.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">{s.shadowingHours}h</td>
                    <td className="px-6 py-4 text-center">{s.clinicalHours}h</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
