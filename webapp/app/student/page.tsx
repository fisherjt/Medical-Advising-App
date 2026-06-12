import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SignOutButton from "@/components/SignOutButton";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as { id: string }).id;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId },
    include: { advisorNotes: { include: { advisor: true }, orderBy: { createdAt: "desc" }, take: 5 } },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-serif font-extrabold text-[#3063A5] text-xl">BYU-I</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">Welcome, <strong>{session.user?.name}</strong></span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-extrabold text-slate-900">My Pre-Health Dashboard</h1>

        {!profile ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-amber-800">
            Your advisor has not yet set up your profile. Please contact the Health Professions Advising Office.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Academic Profile</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400 text-xs">Track</span><p className="font-bold text-slate-900">{profile.track}</p></div>
                <div><span className="text-slate-400 text-xs">Cum GPA</span><p className="font-bold font-mono text-[#3063A5]">{profile.gpa.toFixed(2)}</p></div>
                <div><span className="text-slate-400 text-xs">Science GPA</span><p className="font-bold font-mono text-slate-900">{profile.scienceGpa.toFixed(2)}</p></div>
                <div><span className="text-slate-400 text-xs">{profile.examType} Score</span><p className="font-bold font-mono text-slate-900">{profile.examScore || "—"}</p></div>
              </div>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Experience Hours</h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-400 text-xs">Shadowing</span><p className="font-bold">{profile.shadowingHours}h</p></div>
                <div><span className="text-slate-400 text-xs">Clinical</span><p className="font-bold">{profile.clinicalHours}h</p></div>
                <div><span className="text-slate-400 text-xs">Service</span><p className="font-bold">{profile.serviceHours}h</p></div>
                <div><span className="text-slate-400 text-xs">Leadership</span><p className="font-bold">{profile.leadershipHours}h</p></div>
                <div><span className="text-slate-400 text-xs">Research</span><p className="font-bold">{profile.researchHours}h</p></div>
              </div>
            </div>

            {/* Advisor Notes */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Advisor Notes</h2>
              {profile.advisorNotes.length === 0 ? (
                <p className="text-slate-400 text-sm italic">No notes yet. Schedule an advising appointment in the Clarke Building.</p>
              ) : (
                profile.advisorNotes.map((note) => (
                  <div key={note.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-sm text-slate-700">{note.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{note.advisor.name} · {new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
