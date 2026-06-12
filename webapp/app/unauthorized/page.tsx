export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900">Access Denied</h1>
        <p className="text-slate-500 text-sm">You do not have permission to view this page.</p>
        <a href="/" className="inline-block mt-4 text-sm font-semibold text-[#3063A5] hover:underline">
          Return to dashboard
        </a>
      </div>
    </div>
  );
}
