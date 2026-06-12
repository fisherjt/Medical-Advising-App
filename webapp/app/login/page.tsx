"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    // Redirect based on role — the server will enforce the correct landing page
    router.push("/advisor");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#3063A5] px-8 py-6 text-white text-center">
          <div className="font-serif text-3xl font-extrabold tracking-tight">BYU</div>
          <div className="border-t border-white/40 my-1" />
          <div className="text-xs font-bold tracking-[0.3em]">IDAHO</div>
          <p className="text-blue-100 text-xs mt-2 font-medium">Pre-Health Professions Advising Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3063A5]"
              placeholder="you@byui.edu"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3063A5]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3063A5] hover:bg-[#244C82] text-white font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-400 pb-4">
          Access restricted to authorized BYU-I personnel and students.
        </p>
      </div>
    </div>
  );
}
