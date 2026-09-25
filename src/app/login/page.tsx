"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { 
  Lock, 
  Mail, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"CHAPTER" | "ADMIN">("CHAPTER");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole: "CHAPTER" | "ADMIN") => {
    setRole(newRole);
    setEmail("");
    setPassword("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (role === "ADMIN") {
        router.push("/portal?mode=ADMIN");
      } else {
        router.push("/portal?mode=CHAPTER");
      }
    }, 600);
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
            Select your credential tier to access your chapter dashboard or council administration panel.
          </p>
        </div>

        {/* Login Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
          
          {/* Role Switcher */}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" defaultChecked className="rounded text-teal-600" />
                <span>Keep session active</span>
              </label>
              <a href="#" className="text-teal-700 font-semibold hover:underline">
                Reset passphrase
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Enter {role === "CHAPTER" ? "Chapter Portal" : "Admin Panel"}</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>

          {/* Chapter Registration Trigger */}
          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Has your institution not joined yet? </span>
            <Link href="/apply" className="font-bold text-teal-700 hover:underline">
              Apply for Chapter Accreditation
            </Link>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-navy-950 transition-colors">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
