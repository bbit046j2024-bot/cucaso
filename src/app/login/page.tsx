"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import {
  Lock,
  Mail,
  Building2,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from "lucide-react";

const STAFF_ROLES = [
  "SUPER_ADMIN",
  "COUNCIL_MEMBER",
  "CENTRAL_TREASURER",
  "SECRETARY",
  "CHAPLAIN",
  "COMMUNICATIONS_DIRECTOR",
  "OBSERVER",
];

interface LoggedInUser {
  id: string;
  name: string;
  email: string;
  role: string;
  chapterId?: string | null;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"CHAPTER" | "ADMIN">("CHAPTER");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"CREDENTIALS" | "TOTP">("CREDENTIALS");
  const [totpCode, setTotpCode] = useState("");
  const [pendingUser, setPendingUser] = useState<LoggedInUser | null>(null);

  const handleRoleChange = (newRole: "CHAPTER" | "ADMIN") => {
    setRole(newRole);
    setError(null);
  };

  const destinationFor = (user: LoggedInUser): string => {
    const redirect = searchParams.get("redirect");
    // Only allow same-origin relative redirects (open-redirect protection)
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
      return redirect;
    }
    if (STAFF_ROLES.includes(user.role)) return "/portal?mode=ADMIN";
    if (user.chapterId) {
      return `/portal?mode=CHAPTER&chapter=${encodeURIComponent(user.chapterId)}`;
    }
    return "/portal?mode=CHAPTER";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Sign in failed. Please try again.");
        return;
      }
      if (data.requiresTwoFactor) {
        setPendingUser(data.user);
        setStep("TOTP");
        return;
      }
      router.push(destinationFor(data.user));
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: totpCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Verification failed. Please try again.");
        return;
      }
      if (pendingUser) router.push(destinationFor(pendingUser));
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <BrandLogo variant="light" size="lg" href="/" />
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
            Sign In to CUCASO
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            Sign in with your authorized account — you will be routed to the
            portal matching your role.
          </p>
        </div>

        {/* Login Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          {step === "CREDENTIALS" ? (
            <>
              {/* Role Switcher (prefills demo accounts) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => handleRoleChange("CHAPTER")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    role === "CHAPTER"
                      ? "bg-navy-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-navy-950"
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Chapter Leader</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("ADMIN")}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    role === "ADMIN"
                      ? "bg-navy-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-navy-950"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Council Admin</span>
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Authorized Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. name@cucaso.org"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Access Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span>Authenticating Credentials...</span>
                  ) : (
                    <>
                      <span>
                        Enter {role === "CHAPTER" ? "Chapter Portal" : "Admin Panel"}
                      </span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </form>

              {/* Chapter Registration Trigger */}
              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>Has your institution not joined yet? </span>
                <Link
                  href="/apply"
                  className="font-bold text-teal-700 hover:underline"
                >
                  Apply for Chapter Accreditation
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* TOTP 2FA Step */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg text-navy-950">
                  Two-Factor Authentication
                </h3>
                <p className="text-xs text-slate-500">
                  Enter the 6-digit code from your authenticator app to finish
                  signing in{pendingUser ? ` as ${pendingUser.name}` : ""}.
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleTotpVerify} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] text-lg font-bold py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                />
                <button
                  type="submit"
                  disabled={loading || totpCode.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying Code..." : "Verify & Sign In"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("CREDENTIALS");
                    setTotpCode("");
                    setError(null);
                    setPendingUser(null);
                  }}
                  className="w-full text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors"
          >
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">
          Loading sign in…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
