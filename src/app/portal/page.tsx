"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SystemSwitcher } from "@/components/system-switcher";
import { EmbeddedCoastalMap } from "@/components/embedded-coastal-map";
import { Chapter, CoastalAreaPreset } from "@/types";
import { 
  MEMBER_CHAPTERS, 
  CURRENT_RALLY, 
  RALLY_COST_ITEMS, 
  CAPABILITY_TIERS, 
  COASTAL_AREA_PRESETS
} from "@/lib/data";
import type { Invoice, Payment, ChapterApplication, AuditLogEntry, Attendee } from "@/types";
import { calculateCapabilityFees } from "@/lib/cost-engine";
import { formatCurrency } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Calendar, 
  FileText, 
  Bell, 
  User, 
  LogOut, 
  ShieldCheck, 
  PieChart, 
  FileSpreadsheet, 
  Settings, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  ChevronDown, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Info,
  Check,
  Ban,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  MapPin,
  Map,
  Edit3,
  Trash2,
  Save,
  Globe,
  Compass,
  Navigation
} from "lucide-react";

function PortalContent() {
  const searchParams = useSearchParams();

  // Mode: CHAPTER_PORTAL vs ADMIN_PORTAL
  const [activePortal, setActivePortal] = useState<"CHAPTER" | "ADMIN">("CHAPTER");

  // Chapter Portal selected chapter (Default: TUM Chapter)
  const [selectedChapterId, setSelectedChapterId] = useState<string>("ch-tum");
  const [chapterActiveTab, setChapterActiveTab] = useState<
    "dashboard" | "my-chapter" | "attendees" | "payments" | "rally-info" | "documents" | "notifications" | "profile"
  >("dashboard");

  // Admin Portal active tab
  const [adminActiveTab, setAdminActiveTab] = useState<
    "overview" | "chapters" | "rallies" | "attendees" | "payments" | "funding" | "reports" | "users" | "settings" | "audit"
  >("overview");

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "ADMIN") {
      setActivePortal("ADMIN");
    } else if (mode === "CHAPTER") {
      setActivePortal("CHAPTER");
    }

    const chapter = searchParams.get("chapter");
    if (chapter) {
      setSelectedChapterId(chapter);
    }
  }, [searchParams]);

  // Mobile sidebar open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dynamic Chapters and Locations
  const [chaptersList, setChaptersList] = useState<Chapter[]>(MEMBER_CHAPTERS);
  const [chaptersSubTab, setChaptersSubTab] = useState<"map" | "list" | "onboarding">("map");
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [mapSelectedChapterId, setMapSelectedChapterId] = useState<string>("ch-tum");
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);

  // Fetch live chapters from API
  useEffect(() => {
    fetch("/api/chapters")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setChaptersList(json.data);
        }
      })
      .catch((e) => console.warn("Live chapters fetch error:", e));
  }, []);

  // Chapter state data
  const currentChapter = useMemo(() => {
    return chaptersList.find((c) => c.id === selectedChapterId) || chaptersList[0] || MEMBER_CHAPTERS[0];
  }, [chaptersList, selectedChapterId]);

  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);
  const currentInvoice = useMemo(() => {
    return invoicesList.find((inv) => inv.chapterId === selectedChapterId) || null;
  }, [invoicesList, selectedChapterId]);

  // Fetch invoices from API
  useEffect(() => {
    fetch("/api/invoices")
      .then(r => r.json())
      .then(j => { if (j.success) setInvoicesList(j.data); })
      .catch(() => {});
  }, []);

  // Attendees — fetched from API, filtered by chapter
  const [attendeesList, setAttendeesList] = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  useEffect(() => {
    if (!selectedChapterId) return;
    setAttendeesLoading(true);
    fetch(`/api/attendees?chapterId=${selectedChapterId}`)
      .then(r => r.json())
      .then(j => { if (j.success) setAttendeesList(j.data); })
      .catch(() => {})
      .finally(() => setAttendeesLoading(false));
  }, [selectedChapterId]);
  const [attendeeSearch, setAttendeeSearch] = useState("");
  const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
  const [newAttendee, setNewAttendee] = useState({
    fullName: "",
    admissionOrIdNumber: "",
    department: "Computer Science",
    gender: "MALE" as "MALE" | "FEMALE",
    ageCategory: "ADULT" as "ADULT" | "UNDER_18",
    role: "DELEGATE" as "DELEGATE" | "LEADER" | "PATRON",
    dietaryRequirements: "Standard",
    guardianName: "",
    guardianPhone: "",
    consentGiven: false,
  });

  // New Chapter Modal Form State
  const [newChapterForm, setNewChapterForm] = useState({
    code: "",
    institutionName: "",
    chapterName: "",
    type: "COLLEGE" as "UNIVERSITY" | "COLLEGE" | "SECONDARY" | "PRIMARY" | "OTHER",
    sector: "PUBLIC" as "PUBLIC" | "PRIVATE",
    location: "Mombasa Island",
    tierId: "TIER_3",
    approximateMembers: 150,
    attendeesCount: 120,
    patronName: "",
    patronPhone: "",
    repName: "",
    repPhone: "",
    lat: -4.0435,
    lng: 39.6682,
    top: 50,
    left: 42,
  });

  // Admin Cost Engine Variables (Strictly inside Admin Portal)
  const [fixedCosts, setFixedCosts] = useState<number>(1220000); // 450k venue + 350k sound + 220k tents + 120k security + 80k medics
  const [perHeadRate, setPerHeadRate] = useState<number>(850);
  const [contingency, setContingency] = useState<number>(10);
  const [adminApplications, setAdminApplications] = useState<ChapterApplication[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Fetch admin data from API
  useEffect(() => {
    if (activePortal !== "ADMIN") return;
    fetch("/api/applications")
      .then(r => r.json())
      .then(j => { if (j.success) setAdminApplications(j.data); })
      .catch(() => {});
    fetch("/api/payments")
      .then(r => r.json())
      .then(j => { if (j.success) setPaymentsList(j.data); })
      .catch(() => {});
  }, [activePortal]);

  // Admin capability calculations
  const engineChaptersInput = useMemo(() => {
    return chaptersList.map((ch) => {
      const tier = CAPABILITY_TIERS.find((t) => t.id === ch.tierId);
      return {
        id: ch.id,
        code: ch.code,
        name: ch.institutionName,
        weight: tier ? tier.weight : 1.0,
        attendeeCount: ch.attendeesCount || 100,
      };
    });
  }, [chaptersList]);

  const totalCollected = useMemo(() => {
    return paymentsList.filter(p => p.status === "MATCHED").reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsList]);

  const dynamicCostItems = useMemo(() => {
    return [
      { id: "fixed-total", rallyId: "rally-cur-2026", category: "VENUE" as const, name: "Fixed Infrastructure & Venue", type: "FIXED" as const, amount: fixedCosts },
      { id: "var-catering", rallyId: "rally-cur-2026", category: "CATERING" as const, name: "Delegate Meals & Handbooks", type: "PER_HEAD" as const, amount: perHeadRate },
    ];
  }, [fixedCosts, perHeadRate]);

  const { summary: budgetSummary, chapterFees } = useMemo(() => {
    return calculateCapabilityFees({
      costItems: dynamicCostItems,
      contingencyPercent: contingency,
      chapters: engineChaptersInput,
      allocationMode: "CAPABILITY_WEIGHTED",
      collectedPayments: totalCollected,
    });
  }, [dynamicCostItems, contingency, engineChaptersInput, totalCollected]);

  // Handler: Add Attendee (API-backed)
  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/attendees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rallyId: CURRENT_RALLY.id,
          chapterId: selectedChapterId,
          fullName: newAttendee.fullName,
          admissionOrIdNumber: newAttendee.admissionOrIdNumber,
          department: newAttendee.department,
          gender: newAttendee.gender,
          ageCategory: newAttendee.ageCategory,
          role: newAttendee.role,
          dietaryRequirements: newAttendee.dietaryRequirements,
          guardianName: newAttendee.ageCategory === "UNDER_18" ? newAttendee.guardianName : undefined,
          guardianPhone: newAttendee.ageCategory === "UNDER_18" ? newAttendee.guardianPhone : undefined,
          consentGiven: newAttendee.ageCategory === "UNDER_18" ? newAttendee.consentGiven : true,
          status: newAttendee.ageCategory === "UNDER_18" && !newAttendee.consentGiven ? "PENDING_CONSENT" : "CONFIRMED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await fetch(`/api/attendees?chapterId=${selectedChapterId}`);
        const rData = await refreshed.json();
        if (rData.success) setAttendeesList(rData.data);
        fetch("/api/chapters").then(r => r.json()).then(j => { if (j.success) setChaptersList(j.data); });
      }
    } catch (err) {
      console.error("Failed to add attendee:", err);
    }
    setShowAddAttendeeModal(false);
    setNewAttendee({ fullName: "", admissionOrIdNumber: "", department: "Computer Science", gender: "MALE", ageCategory: "ADULT", role: "DELEGATE", dietaryRequirements: "Standard", guardianName: "", guardianPhone: "", consentGiven: false });
  };

  // Handler: Approve Chapter in Admin
  const handleApproveChapter = async (appId: string, assignedTier: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: "APPROVED", assignedTier }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminApplications((prev) =>
          prev.map((app) =>
            app.id === appId
              ? { ...app, status: "APPROVED" as const, assignedTier, notes: `Approved with ${assignedTier}` }
              : app
          )
        );
        // Refresh chapters
        fetch("/api/chapters")
          .then((r) => r.json())
          .then((j) => { if (j.success) setChaptersList(j.data); });
        setLocationToast("Chapter application approved & chartered into database!");
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Update Chapter Location & GPS Coordinates on Map
  const handleUpdateChapterLocation = async (chapterId: string, updates: Partial<Chapter>) => {
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setChaptersList((prev) => prev.map((c) => (c.id === chapterId ? data.data : c)));
        if (editingChapter?.id === chapterId) {
          setEditingChapter(data.data);
        }
        setLocationToast(`Map updated! ${data.data.institutionName} moved to ${data.data.location}.`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err) {
      console.error("Failed to update chapter location", err);
    }
  };

  // Handler: Create New Chapter in Database
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Chapter> = {
        code: newChapterForm.code || `CHP-${chaptersList.length + 1}`,
        institutionName: newChapterForm.institutionName,
        chapterName: newChapterForm.chapterName,
        type: newChapterForm.type,
        sector: newChapterForm.sector,
        location: newChapterForm.location,
        status: "APPROVED",
        tierId: newChapterForm.tierId,
        approximateMembers: Number(newChapterForm.approximateMembers),
        attendeesCount: Number(newChapterForm.attendeesCount),
        patronName: newChapterForm.patronName,
        patronPhone: newChapterForm.patronPhone,
        repName: newChapterForm.repName,
        repPhone: newChapterForm.repPhone,
        coordinates: { lat: Number(newChapterForm.lat), lng: Number(newChapterForm.lng) },
        mapPosition: { top: Number(newChapterForm.top), left: Number(newChapterForm.left) },
      };

      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setChaptersList((prev) => [...prev, data.data]);
        setShowAddChapterModal(false);
        setNewChapterForm({
          code: "",
          institutionName: "",
          chapterName: "",
          type: "COLLEGE",
          sector: "PUBLIC",
          location: "Mombasa Island",
          tierId: "TIER_3",
          approximateMembers: 150,
          attendeesCount: 120,
          patronName: "",
          patronPhone: "",
          repName: "",
          repPhone: "",
          lat: -4.0435,
          lng: 39.6682,
          top: 50,
          left: 42,
        });
        setLocationToast(`New chapter "${data.data.institutionName}" successfully added & pinned to map!`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err) {
      console.error("Failed to create chapter", err);
    }
  };

  // Handler: Delete Chapter from Platform
  const handleDeleteChapter = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from member chapters?`)) return;
    try {
      const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setChaptersList((prev) => prev.filter((c) => c.id !== id));
        setLocationToast(`Chapter "${name}" removed from database and map.`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col antialiased overflow-hidden">
      <SystemSwitcher />

      {/* ─── App Shell: Sidebar + Content ─── */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* ========================================================= */}
        {/* SIDEBAR (Matches image1.png and image2.png)               */}
        {/* ========================================================= */}
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-navy-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            w-64 flex-shrink-0 bg-navy-950 text-slate-300 border-r border-navy-800/80
            flex flex-col justify-between overflow-y-auto
            transition-transform duration-300 ease-in-out
            max-lg:fixed max-lg:inset-y-0 max-lg:top-0 max-lg:z-40
            lg:relative lg:translate-x-0
            ${ sidebarOpen ? "translate-x-0" : "max-lg:-translate-x-full" }
          `}
        >
          <div>
            {/* Sidebar Brand + Portal Toggle */}
            <div className="px-5 py-4 border-b border-navy-800/80">
              {/* Brand row */}
              <div className="flex items-center justify-between mb-4">
                <BrandLogo variant="dark" size="sm" href="/" />
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Chapter / Admin toggle */}
              <div className="flex items-center rounded-xl bg-navy-900 p-1 gap-1">
                <button
                  onClick={() => setActivePortal("CHAPTER")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    activePortal === "CHAPTER"
                      ? "bg-teal-500 text-navy-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>Chapter</span>
                </button>
                <button
                  onClick={() => setActivePortal("ADMIN")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    activePortal === "ADMIN"
                      ? "bg-amber-400 text-navy-950 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Chapter quick-select (chapter portal only) */}
            {activePortal === "CHAPTER" && (
              <div className="px-4 py-3 bg-navy-900/50 border-b border-navy-800/60">
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">Active Chapter</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => setSelectedChapterId(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {chaptersList.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.code} — {ch.institutionName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* CHAPTER PORTAL NAV */}
            {activePortal === "CHAPTER" ? (
              <nav className="p-4 space-y-1 text-xs font-semibold">
                <button
                  onClick={() => setChapterActiveTab("dashboard")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "dashboard"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("my-chapter")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "my-chapter"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>My Chapter</span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("attendees")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "attendees"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="flex-1 text-left">Attendees</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">
                    {currentChapter.attendeesCount}
                  </span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("payments")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "payments"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payments & Invoices</span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("rally-info")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "rally-info"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Rally Info</span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("documents")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "documents"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("notifications")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "notifications"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  <span className="flex-1 text-left">Notifications</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                </button>

                <button
                  onClick={() => setChapterActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "profile"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              </nav>
            ) : (
              /* ADMIN PORTAL NAV (Matches image1.png Admin Sidebar) */
              <nav className="p-4 space-y-1 text-xs font-semibold">
                <button
                  onClick={() => setAdminActiveTab("overview")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "overview"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>System Overview</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("chapters")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "chapters"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="flex-1 text-left">Chapter Management</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-navy-950 text-[10px] font-bold">
                    {adminApplications.filter(a => a.status === "UNDER_REVIEW").length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("rallies")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "rallies"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Rally Management</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("attendees")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "attendees"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Attendee Master Roster</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("payments")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "payments"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Payments & Reconciliation</span>
                </button>

                {/* THE AUTOMATED CALCULATIONS AND RELATED FIELDS ARE STRICTLY HERE */}
                <button
                  onClick={() => setAdminActiveTab("funding")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "funding"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  <span className="flex-1 text-left">Funding & Cost Engine</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                    Auto
                  </span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("reports")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "reports"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Logistics & Reports</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("users")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "users"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Users & Roles (RBAC)</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("settings")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "settings"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>System Settings</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("audit")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "audit"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Audit Trail</span>
                </button>
              </nav>
            )}
          </div>

          {/* Sidebar Footer Log Out */}
          <div className="p-4 border-t border-navy-800">
            <Link
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </Link>
          </div>
        </aside>

        {/* ========================================================= */}
        {/* MAIN PORTAL WORKSPACE                                     */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
          {/* ─── Workspace Top Bar ─── */}
          <header className="bg-white border-b border-slate-200 px-5 sm:px-8 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 mr-1"
              >
                <Menu className="w-5 h-5" />
              </button>

              {activePortal === "CHAPTER" ? (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-0.5">Chapter Portal</p>
                  <h2 className="text-base sm:text-lg font-black text-navy-950 leading-tight">
                    {currentChapter.institutionName}
                  </h2>
                </div>
              ) : (
                <div>
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest leading-none mb-0.5">Executive Admin Console</p>
                  <h2 className="text-base sm:text-lg font-black text-navy-950 leading-tight">
                    CUCASO Council Dashboard
                  </h2>
                </div>
              )}
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              </button>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className={`w-9 h-9 rounded-full font-black text-xs flex items-center justify-center shadow-sm ${
                  activePortal === "CHAPTER"
                    ? "bg-gradient-to-br from-teal-600 to-navy-900 text-white"
                    : "bg-gradient-to-br from-amber-400 to-amber-600 text-navy-950"
                }`}>
                  {activePortal === "CHAPTER" ? currentChapter.code?.slice(0, 2).toUpperCase() || "CH" : "AD"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {activePortal === "CHAPTER" ? currentChapter.repName || "Chapter Rep" : "Council Admin"}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-tight">
                    {activePortal === "CHAPTER" ? currentChapter.location || "Mombasa" : "System Administrator"}
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* ─── Workspace Body ─── */}
          <main className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
            {/* ======================================================= */}
            {/* VIEW A: CHAPTER PORTAL DASHBOARD (Matches image1.png)   */}
            {/* ======================================================= */}
            {activePortal === "CHAPTER" && chapterActiveTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Header Welcome Message */}
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
                    Welcome back, {currentChapter.repName || "John"}!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Here is your {currentChapter.institutionName} rally summary and delegation status.
                  </p>
                </div>

                {/* 4 KPI Cards (Matches image1.png Chapter Portal) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: Total Attendees */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Attendees
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-3xl text-navy-950">
                        {currentChapter.attendeesCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+12% since last rally</span>
                      </span>
                    </div>
                  </div>

                  {/* Card 2: Chapter Fee */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Your Chapter Fee
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-3xl text-navy-950">
                        {currentInvoice ? formatCurrency(currentInvoice.amountDue) : <span className="text-slate-400 text-xl">Pending invoice</span>}
                      </span>
                      <span className="text-xs text-slate-500 block mt-2">
                        {currentInvoice ? "Based on capability tier" : "Invoice will be issued by admin"}
                      </span>
                    </div>
                  </div>

                  {/* Card 3: Paid Amount */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Paid Amount
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-3xl text-navy-950">
                        {currentInvoice ? formatCurrency(currentInvoice.amountPaid) : <span className="text-slate-400 text-xl">KSh 0</span>}
                      </span>
                      <span className="text-xs font-bold text-amber-700 block mt-2">
                        {currentInvoice && currentInvoice.amountDue > 0
                          ? `${Math.round((currentInvoice.amountPaid / currentInvoice.amountDue) * 100)}% of required amount`
                          : "No payment recorded yet"}
                      </span>
                    </div>
                  </div>

                  {/* Card 4: Funding Status */}
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Funding Status
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-2xl text-emerald-700">
                        {currentInvoice ? (currentInvoice.status === "PAID" ? "Settled" : currentInvoice.amountPaid > 0 ? "Partial" : "Unpaid") : "Awaiting Invoice"}
                      </span>
                      <span className="text-xs text-slate-500 block mt-2">
                        {currentInvoice
                          ? currentInvoice.balance > 0
                            ? `KSh ${currentInvoice.balance.toLocaleString()} pending`
                            : "All funds covered"
                          : "Invoice not yet issued"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid: Attendee Trend Chart & Rally Countdown Widget */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Attendee Trend Chart (Left 8 Cols) */}
                  <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="font-heading font-bold text-base text-navy-950">
                          Attendee Registration Trend
                        </h3>
                        <p className="text-xs text-slate-500">Monthly delegate submissions leading to Fee Lock</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                        2026 Season
                      </span>
                    </div>

                    {/* Stylized Trend Visualization Curve */}
                    <div className="h-56 relative flex items-end justify-between gap-2 pt-8 px-4 pb-2 border-b border-slate-100">
                      {[
                        { month: "Jan", count: 40, height: "15%" },
                        { month: "Feb", count: 65, height: "25%" },
                        { month: "Mar", count: 90, height: "35%" },
                        { month: "Apr", count: 110, height: "42%" },
                        { month: "May", count: 135, height: "50%" },
                        { month: "Jun", count: 160, height: "60%" },
                        { month: "Jul", count: 185, height: "70%" },
                        { month: "Aug", count: 215, height: "82%" },
                        { month: "Sep", count: 248, height: "95%" },
                      ].map((bar) => (
                        <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group">
                          <div className="w-full bg-slate-100 rounded-t-lg relative flex items-end justify-center group-hover:bg-teal-100 transition-colors" style={{ height: "180px" }}>
                            <div 
                              className="w-full rounded-t-lg bg-gradient-to-t from-teal-700 to-teal-500 group-hover:from-teal-600 group-hover:to-teal-400 transition-all relative"
                              style={{ height: bar.height }}
                            >
                              {bar.month === "Sep" && (
                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-navy-950 text-white font-mono font-bold text-[10px] shadow-sm whitespace-nowrap">
                                  {bar.count} Confirmed
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">{bar.month}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Target Delegation: 250 Delegates</span>
                      <span className="text-teal-700 font-bold">99.2% of target reached</span>
                    </div>
                  </div>

                  {/* Rally Countdown Card (Right 4 Cols - Matches image1.png) */}
                  <div className="lg:col-span-4 p-6 rounded-3xl bg-gradient-to-br from-navy-950 to-navy-900 text-white border border-navy-800 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs uppercase font-bold tracking-wider text-amber-400">
                          Rally Countdown
                        </span>
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>

                      <div className="my-6">
                        <span className="font-heading font-black text-5xl text-white block">
                          42 <span className="text-2xl font-normal text-slate-400">Days</span>
                        </span>
                        <div className="space-y-1 mt-4 text-xs text-slate-300">
                          <p className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-teal-400" />
                            <span>15 – 17 November 2026</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-teal-400" />
                            <span>Mombasa Sports Complex</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => setChapterActiveTab("rally-info")}
                        className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-xs shadow-md transition-all text-center block"
                      >
                        View Rally Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Attendees Table (Matches image1.png) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">
                        Recent Chapter Attendees
                      </h3>
                      <p className="text-xs text-slate-500">Registered student delegates from your institution</p>
                    </div>
                    <button
                      onClick={() => setChapterActiveTab("attendees")}
                      className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                    >
                      <span>View all ({attendeesList.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Name</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Registration Date</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendeesList.slice(0, 5).map((att, idx) => (
                          <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900">
                              {att.fullName}
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {att.admissionOrIdNumber}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {att.department || "Academic Division"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500">
                              {att.registrationDate}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  att.status === "CONFIRMED"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-amber-100 text-amber-800 border border-amber-200"
                                }`}
                              >
                                {att.status === "CONFIRMED" ? "Confirmed" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW B: CHAPTER ATTENDEES (Full Roster & Add Modal) */}
            {activePortal === "CHAPTER" && chapterActiveTab === "attendees" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">
                      Chapter Attendee Roster
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage student delegates, verify guardian consent for minors, and prepare for rally accreditation.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowAddAttendeeModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 font-bold text-xs shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Add Attendee</span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search attendee by name or ID..."
                      value={attendeeSearch}
                      onChange={(e) => setAttendeeSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900">{attendeesList.length}</span> registered delegates
                  </div>
                </div>

                {/* Attendees Full Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Delegate Name</th>
                          <th className="py-3 px-4">Admission / ID</th>
                          <th className="py-3 px-4">Department</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Dietary</th>
                          <th className="py-3 px-4">Guardian Consent</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendeesList
                          .filter(a => a.fullName.toLowerCase().includes(attendeeSearch.toLowerCase()) || a.admissionOrIdNumber.toLowerCase().includes(attendeeSearch.toLowerCase()))
                          .map((att) => (
                            <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-slate-900">
                                {att.fullName}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">
                                {att.admissionOrIdNumber}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                {att.department}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                                  {att.ageCategory}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                {att.dietaryRequirements || "Standard"}
                              </td>
                              <td className="py-3.5 px-4">
                                {att.ageCategory === "UNDER_18" ? (
                                  att.guardianConsent?.consentGiven ? (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Verified ({att.guardianConsent.guardianName})</span>
                                    </span>
                                  ) : (
                                    <span className="text-rose-700 font-semibold flex items-center gap-1 text-[11px]">
                                      <ShieldAlert className="w-3.5 h-3.5" />
                                      <span>Required (<button onClick={() => {
                                        setAttendeesList(attendeesList.map(item => item.id === att.id ? { ...item, status: "CONFIRMED", guardianConsent: { guardianName: "Guardian Confirmed", guardianPhone: "+254 700 111 222", consentGiven: true, consentDate: "2026-09-19" } } : item));
                                      }} className="underline">Verify</button>)</span>
                                    </span>
                                  )
                                ) : (
                                  <span className="text-slate-400">Adult (N/A)</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    att.status === "CONFIRMED"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {att.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Add Attendee Modal */}
                {showAddAttendeeModal && (
                  <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <h3 className="font-heading font-bold text-lg text-navy-950">
                          Register New Chapter Attendee
                        </h3>
                        <button onClick={() => setShowAddAttendeeModal(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleAddAttendee} className="space-y-4 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mercy Atieno"
                            value={newAttendee.fullName}
                            onChange={(e) => setNewAttendee({ ...newAttendee, fullName: e.target.value })}
                            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Admission / ID Number *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. TUM/ENG/2024/099"
                              value={newAttendee.admissionOrIdNumber}
                              onChange={(e) => setNewAttendee({ ...newAttendee, admissionOrIdNumber: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Department</label>
                            <input
                              type="text"
                              placeholder="e.g. Health Sciences"
                              value={newAttendee.department}
                              onChange={(e) => setNewAttendee({ ...newAttendee, department: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Age Category *</label>
                            <select
                              value={newAttendee.ageCategory}
                              onChange={(e) => setNewAttendee({ ...newAttendee, ageCategory: e.target.value as any })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                            >
                              <option value="ADULT">Adult (18+)</option>
                              <option value="UNDER_18">Under 18 (Minor)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Dietary</label>
                            <select
                              value={newAttendee.dietaryRequirements}
                              onChange={(e) => setNewAttendee({ ...newAttendee, dietaryRequirements: e.target.value })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                            >
                              <option value="Standard">Standard</option>
                              <option value="Vegetarian">Vegetarian</option>
                              <option value="Vegan">Vegan</option>
                              <option value="Gluten-Free">Gluten-Free</option>
                            </select>
                          </div>
                        </div>

                        {newAttendee.ageCategory === "UNDER_18" && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                            <span className="font-bold text-amber-900 block">Minor Guardian Consent Required:</span>
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Parent/Guardian Name"
                                value={newAttendee.guardianName}
                                onChange={(e) => setNewAttendee({ ...newAttendee, guardianName: e.target.value })}
                                className="px-3 py-1.5 border border-slate-300 rounded-lg"
                              />
                              <input
                                type="tel"
                                placeholder="Guardian Phone"
                                value={newAttendee.guardianPhone}
                                onChange={(e) => setNewAttendee({ ...newAttendee, guardianPhone: e.target.value })}
                                className="px-3 py-1.5 border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="checkbox"
                                id="minorConsent"
                                checked={newAttendee.consentGiven}
                                onChange={(e) => setNewAttendee({ ...newAttendee, consentGiven: e.target.checked })}
                              />
                              <label htmlFor="minorConsent" className="text-slate-700 cursor-pointer">
                                Signed guardian consent form physically verified
                              </label>
                            </div>
                          </div>
                        )}

                        <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setShowAddAttendeeModal(false)}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-navy-900 text-white font-bold"
                          >
                            Save Attendee
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW C: CHAPTER PAYMENTS & INVOICES */}
            {activePortal === "CHAPTER" && chapterActiveTab === "payments" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl text-navy-950">
                    Chapter Invoice & Remittances
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Central Treasury official billing for {currentChapter.institutionName}.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Official Invoice Card */}
                  {currentInvoice ? (
                    <div className="lg:col-span-8 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Official Invoice</span>
                          <h2 className="font-heading font-black text-xl text-navy-950">{currentInvoice.invoiceNumber}</h2>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          currentInvoice.status === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : currentInvoice.amountPaid > 0
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {currentInvoice.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Billed Institution:</span>
                          <span className="font-bold text-slate-900">{currentChapter.institutionName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Assigned Payment Reference:</span>
                          <span className="font-mono font-bold text-teal-700 text-sm">{currentInvoice.paymentReference}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Payment Due Date:</span>
                          <span className="font-semibold text-slate-900">{currentInvoice.dueDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Central M-Pesa Paybill:</span>
                          <span className="font-mono font-bold text-slate-900 text-sm">4082200</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Chapter Capability Fee:</span>
                          <span className="text-navy-950">{formatCurrency(currentInvoice.amountDue)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700">
                          <span>Remitted & Reconciled Payments:</span>
                          <span>- {formatCurrency(currentInvoice.amountPaid)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-navy-950">
                          <span>Outstanding Balance:</span>
                          <span className="text-amber-700">{formatCurrency(currentInvoice.balance)}</span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-800 flex items-start gap-2">
                        <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong>Payment Instructions:</strong> Go to M-PESA &gt; Lipa na M-PESA &gt; Paybill &gt; Business No: <strong>4082200</strong> &gt; Account No: <strong>{currentInvoice.paymentReference}</strong>. Your remittance will be automatically matched to this invoice.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="lg:col-span-8 p-12 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <h3 className="font-heading font-black text-lg text-navy-950">No Invoice Issued Yet</h3>
                      <p className="text-xs text-slate-500 max-w-sm">
                        An official capability fee invoice for {currentChapter.institutionName} has not been issued yet by the Central Treasury.
                      </p>
                    </div>
                  )}

                  {/* Log Remittance Form */}
                  <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                    <h3 className="font-heading font-bold text-base text-navy-950">
                      Submit Payment Remittance
                    </h3>
                    <p className="text-xs text-slate-500">
                      If paid via bank or manual transfer, submit the transaction code for Central Treasurer reconciliation.
                    </p>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">M-Pesa Code / Bank Ref *</label>
                        <input
                          type="text"
                          placeholder="e.g. QEJ8291X0K"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 uppercase mb-1">Amount Paid (KES) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 80000"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => alert("Remittance submitted for Central Treasurer verification!")}
                        className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
                      >
                        Confirm Remittance
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW D-1: MY CHAPTER */}
            {activePortal === "CHAPTER" && chapterActiveTab === "my-chapter" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl text-navy-950">My Chapter</h1>
                  <p className="text-xs text-slate-500 mt-1">Your institution&apos;s official CUCASO chapter record and officer registry.</p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-navy-950 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="font-heading font-black text-xl text-navy-950">{currentChapter.institutionName}</h2>
                      <p className="text-sm text-teal-700 font-semibold">{currentChapter.chapterName}</p>
                    </div>
                    <span className="ml-auto px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">Active &amp; In Good Standing</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-xs">
                    {[
                      { label: "Chapter Code", value: currentChapter.code },
                      { label: "Institution Type", value: currentChapter.type },
                      { label: "Sector", value: currentChapter.sector },
                      { label: "Location", value: currentChapter.location.split(",")[0] },
                      { label: "Capability Tier", value: currentChapter.tierId?.replace("_", " ") || "TIER 1" },
                      { label: "Approx. Members", value: String(currentChapter.approximateMembers) },
                      { label: "Rally Delegates", value: String(currentChapter.attendeesCount) },
                      { label: "Chapter Since", value: new Date(currentChapter.createdAt || "2024-01-01").getFullYear().toString() },
                    ].map((item) => (
                      <div key={item.label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{item.label}</span>
                        <span className="font-bold text-slate-900 block mt-0.5">{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-t border-slate-100 pt-6">
                    {[
                      { role: "Patron / Chaplain", name: currentChapter.patronName || "Pr. Eric Musembi", phone: currentChapter.patronPhone },
                      { role: "Chapter Representative", name: currentChapter.repName || "John Mwangi", phone: currentChapter.repPhone },
                      { role: "Chapter Treasurer", name: currentChapter.treasurerName || "David Kiboi", phone: currentChapter.treasurerPhone },
                    ].map((officer) => (
                      <div key={officer.role} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{officer.role}</span>
                        <span className="font-bold text-slate-900 block mt-1">{officer.name}</span>
                        {officer.phone && <span className="text-slate-500">{officer.phone}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW D-2: RALLY INFORMATION */}
            {activePortal === "CHAPTER" && chapterActiveTab === "rally-info" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl text-navy-950">Rally Information</h1>
                  <p className="text-xs text-slate-500 mt-1">Official information about the upcoming Coastal Unity Rally 2026.</p>
                </div>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-950 to-navy-900 text-white border border-navy-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      REGISTRATION OPEN
                    </span>
                    <h2 className="font-heading font-black text-3xl text-white">{CURRENT_RALLY.title}</h2>
                    <p className="text-amber-300 font-semibold mt-2">&ldquo;{CURRENT_RALLY.theme}&rdquo;</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
                      {[
                        { label: "Date", value: "15 – 17 Nov 2026" },
                        { label: "Venue", value: CURRENT_RALLY.venueName },
                        { label: "Capacity", value: `${CURRENT_RALLY.capacity.toLocaleString()} Delegates` },
                        { label: "Fee Lock Date", value: "1 November 2026" },
                      ].map((item) => (
                        <div key={item.label}>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{item.label}</span>
                          <span className="font-bold text-white block mt-0.5">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">3-Day Programme Overview</h3>
                  <div className="space-y-4 text-xs">
                    {[
                      { day: "Friday, 15 Nov", theme: "Arrival & Opening Ceremony", items: ["Chapter delegations arrive & register", "Welcome devotional & cultural showcase", "Opening service & keynote address", "Evening praise concert"] },
                      { day: "Saturday, 16 Nov — Sabbath", theme: "The Main Sabbath Experience", items: ["Morning devotional & Sabbath School", "Keynote sermon — Convention Hall", "Lunch fellowship (full catering)", "Afternoon Youth Rally & Mission Vigil", "Sabbath closing & praise night"] },
                      { day: "Sunday, 17 Nov", theme: "Mission Momentum & Closing", items: ["Morning prayer & Bible study", "Chapter breakout sessions (ministry skills)", "Awards & leadership recognition ceremony", "Council announcements & closing commission"] },
                    ].map((session) => (
                      <div key={session.day} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-2.5 py-1 rounded-lg bg-navy-900 text-white text-[10px] font-bold">{session.day}</span>
                          <span className="font-bold text-slate-900">{session.theme}</span>
                        </div>
                        <ul className="space-y-1.5">
                          {session.items.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-slate-600">
                              <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Important Deadlines</strong>
                    Attendee registration cutoff: <strong>1 November 2026</strong>. Full invoice payment: <strong>10 November 2026</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* VIEW D-3: CHAPTER DOCUMENTS */}
            {activePortal === "CHAPTER" && chapterActiveTab === "documents" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Chapter Documents</h1>
                    <p className="text-xs text-slate-500 mt-1">Official CUCASO documents, circulars, and your chapter&apos;s submitted endorsement files.</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Document</span>
                  </button>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "CUCASO Constitution & Bylaws 2024", type: "Governance", date: "Jan 2024", status: "Official", statusClass: "bg-navy-100 text-navy-800" },
                    { name: `${currentChapter.institutionName} — Official Endorsement Letter`, type: "Endorsement", date: "Feb 2024", status: "Verified", statusClass: "bg-emerald-100 text-emerald-800" },
                    { name: "Coastal Unity Rally 2026 — Official Circular", type: "Rally", date: "Aug 2026", status: "Active", statusClass: "bg-teal-100 text-teal-800" },
                    { name: "Chapter Fee Schedule & Capability Tier Schedule 2026", type: "Finance", date: "Sep 2026", status: "Active", statusClass: "bg-teal-100 text-teal-800" },
                    { name: `${INVOICES.find(i => i.chapterId === currentChapter.id)?.invoiceNumber || "INV-2026-001"} — Official Invoice`, type: "Invoice", date: "Sep 2026", status: "Pending Payment", statusClass: "bg-amber-100 text-amber-800" },
                    { name: "CUCASO Attendee Registration Guidelines 2026", type: "Guidelines", date: "Sep 2026", status: "Active", statusClass: "bg-teal-100 text-teal-800" },
                    { name: "Minor (Under 18) Guardian Consent Form", type: "Forms", date: "Sep 2026", status: "Template", statusClass: "bg-slate-100 text-slate-700" },
                  ].map((doc) => (
                    <div key={doc.name} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-4 hover:border-teal-400 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-teal-50 group-hover:text-teal-700 transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-sm block">{doc.name}</span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span>{doc.type}</span>
                            <span>&bull;</span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${doc.statusClass}`}>{doc.status}</span>
                        <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-700 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW D-4: NOTIFICATIONS */}
            {activePortal === "CHAPTER" && chapterActiveTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Notifications</h1>
                    <p className="text-xs text-slate-500 mt-1">Official communications from the CUCASO Central Secretariat.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs">3 Unread</span>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Invoice Due Reminder — 10 November 2026", body: `Your chapter (${currentChapter.code}) has an outstanding invoice balance. Please complete payment via M-Pesa Paybill 4082200 before the deadline.`, time: "2 hours ago", type: "URGENT", read: false },
                    { title: "Coastal Unity Rally 2026 — Registration Now Open", body: "Chapter delegate registration is officially open. Use the Chapter Portal to add, edit, and submit your delegation list before the 1 November cutoff.", time: "3 days ago", type: "INFO", read: false },
                    { title: "Fee Lock Date Approaching — 1 November 2026", body: "The rally fee schedule will be locked on 1 November 2026. Ensure all attendees are registered before this date to avoid surcharges.", time: "5 days ago", type: "WARNING", read: false },
                    { title: "Chapter Accreditation Confirmed", body: `Your chapter (${currentChapter.institutionName}) has been officially approved and assigned ${currentChapter.tierId?.replace("_", " ") || "Tier 1"} status by the CUCASO Executive Council.`, time: "2 months ago", type: "SUCCESS", read: true },
                    { title: "Welcome to the CUCASO Chapter Portal", body: "Your chapter portal access has been activated. You can now register delegates, view your invoice, and access all rally documents.", time: "6 months ago", type: "INFO", read: true },
                  ].map((notif) => (
                    <div key={notif.title} className={`p-5 rounded-2xl border shadow-sm flex items-start gap-4 ${notif.read ? "bg-white border-slate-200" : "bg-blue-50/50 border-blue-200"}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        notif.type === "URGENT" ? "bg-rose-100 text-rose-700" :
                        notif.type === "WARNING" ? "bg-amber-100 text-amber-700" :
                        notif.type === "SUCCESS" ? "bg-emerald-100 text-emerald-700" :
                        "bg-blue-100 text-blue-700"
                      }`}>
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <span className={`font-bold text-sm ${notif.read ? "text-slate-700" : "text-slate-900"}`}>{notif.title}</span>
                          {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{notif.body}</p>
                        <span className="text-[10px] text-slate-400 block mt-2">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW D-5: PROFILE */}
            {activePortal === "CHAPTER" && chapterActiveTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl text-navy-950">My Profile</h1>
                  <p className="text-xs text-slate-500 mt-1">Manage your chapter representative account and contact details.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-800 to-teal-700 text-white font-heading font-black text-2xl flex items-center justify-center">
                      {(currentChapter.repName || "JM").split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <span className="font-heading font-black text-lg text-navy-950 block">{currentChapter.repName || "John Mwangi"}</span>
                      <span className="text-xs text-teal-700 font-semibold block">Chapter Representative</span>
                      <span className="text-xs text-slate-400 block mt-0.5">{currentChapter.institutionName}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">Active Account</span>
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="font-heading font-bold text-base text-navy-950 pb-3 border-b border-slate-100">Account Details</h3>
                    {[
                      { label: "Full Name", value: currentChapter.repName || "John Mwangi" },
                      { label: "Phone Number", value: currentChapter.repPhone || "+254 720 112 233" },
                      { label: "Institution", value: currentChapter.institutionName },
                      { label: "Chapter Code", value: currentChapter.code },
                      { label: "Portal Role", value: "Chapter Representative" },
                      { label: "Account Status", value: "Active & Verified" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold">{item.label}</span>
                        <span className="font-bold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                      <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Change Password</span>
                      </button>
                      <button className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* VIEW E: ADMIN SYSTEM OVERVIEW (Matches image1.png)       */}
            {/* ======================================================= */}
            {activePortal === "ADMIN" && adminActiveTab === "overview" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
                    System Overview
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Overall statistics, rally registrations, and central financial liquidity.
                  </p>
                </div>

                {/* 4 Admin KPI Cards (Matches image1.png Admin Dashboard) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Chapters
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-3xl text-navy-950">
                        12
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+2 this year</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Attendees
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-3xl text-navy-950">
                        2,486
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>+18% vs last rally</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Total Funds Collected
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-3xl text-navy-950">
                        {formatCurrency(totalCollected)}
                      </span>
                      <span className="text-xs text-slate-500 block mt-2">
                        87% of rally budget target
                      </span>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Overall Status
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <span className="font-heading font-black text-2xl text-emerald-700">
                        On Track
                      </span>
                      <span className="text-xs text-slate-500 block mt-2">
                        All systems go & fully audited
                      </span>
                    </div>
                  </div>
                </div>

                {/* Donut Funding Overview & Rally Status Widgets (Matches image1.png) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Funding Overview Donut Representation (Left 6 Cols) */}
                  <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-base text-navy-950">
                          Funding Overview
                        </h3>
                        <p className="text-xs text-slate-500">Proportional contributions by chapter</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        KSh 3.42M
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-center py-4">
                      {/* Donut representation graphic */}
                      <div className="relative w-40 h-40 mx-auto rounded-full border-8 border-teal-600 flex items-center justify-center bg-slate-50 shadow-inner">
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Collected</span>
                          <span className="font-heading font-black text-sm text-navy-950">KSh 3.42M</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                            <span>TUM Chapter</span>
                          </span>
                          <span className="font-bold">24%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span>Pwani University</span>
                          </span>
                          <span className="font-bold">18%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <span>Mombasa Poly</span>
                          </span>
                          <span className="font-bold">15%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                            <span>Other Chapters</span>
                          </span>
                          <span className="font-bold">43%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Central Paybill: 4082200</span>
                      <button onClick={() => setAdminActiveTab("funding")} className="text-teal-700 font-bold hover:underline">
                        Open Cost Engine →
                      </button>
                    </div>
                  </div>

                  {/* Rally Status Timeline Widget (Right 6 Cols) */}
                  <div className="lg:col-span-6 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-base text-navy-950">
                          Rally Lifecycle Status
                        </h3>
                        <p className="text-xs text-slate-500">Recurring coastal rally events</p>
                      </div>
                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">Jun 2026 — Coast Fellowship Rally</span>
                          <span className="text-[11px] text-slate-500">Mombasa Sports Complex</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px]">
                          Completed
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-teal-950 block">Nov 2026 — Coastal Unity Rally</span>
                          <span className="text-[11px] text-teal-700">Mombasa Sports Complex (Current)</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                          Registration Open
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">May 2027 — Kilifi Fellowship Rally</span>
                          <span className="text-[11px] text-slate-500">Pwani University Grounds</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Planned
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Fee Lock Trigger: 1 Nov 2026</span>
                      <button onClick={() => setAdminActiveTab("rallies")} className="text-teal-700 font-bold hover:underline">
                        Manage Rallies →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chapters Master Table (Matches image1.png Admin Panel) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">
                        Approved Chapters Ledger
                      </h3>
                      <p className="text-xs text-slate-500">12 member chapters and institutional fees</p>
                    </div>
                    <button onClick={() => setAdminActiveTab("chapters")} className="text-xs font-bold text-teal-700 hover:underline">
                      View all chapters →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">#</th>
                          <th className="py-3 px-4">Chapter Name</th>
                          <th className="py-3 px-4">Institution</th>
                          <th className="py-3 px-4 text-center">Attendees</th>
                          <th className="py-3 px-4 text-right">Fee (KSh)</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MEMBER_CHAPTERS.slice(0, 5).map((ch, idx) => {
                          const inv = INVOICES.find(i => i.chapterId === ch.id) || INVOICES[0];
                          return (
                            <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-navy-950">
                                {ch.chapterName}
                              </td>
                              <td className="py-3.5 px-4 text-slate-600">
                                {ch.institutionName}
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                {ch.attendeesCount}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-navy-950">
                                {formatCurrency(inv.amountDue)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    inv.status === "PAID"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : inv.status === "PARTIAL"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-rose-100 text-rose-800"
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* VIEW F: ADMIN FUNDING & AUTOMATED COST ENGINE (EXCLUSIVE) */}
            {/* ======================================================= */}
            {activePortal === "ADMIN" && adminActiveTab === "funding" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold uppercase mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Confidential Executive Module</span>
                    </div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">
                      Capability Funding & Automated Cost Engine
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Per PRD Section 6: Automated capability-weighted fee distribution, contingency controls, and live shortfall analysis.
                    </p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rally Budget</span>
                    <span className="font-heading font-black text-2xl text-navy-950">
                      {formatCurrency(budgetSummary.totalBudget)}
                    </span>
                  </div>
                </div>

                {/* Automated Engine Sliders & Fixed/Variable Rate Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Fixed Costs (Venue, Sound, Security) KES
                    </label>
                    <input
                      type="number"
                      value={fixedCosts}
                      onChange={(e) => setFixedCosts(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-navy-950 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Shared according to Capability Weights</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Per-Head Catering Rate (KES)
                    </label>
                    <input
                      type="number"
                      value={perHeadRate}
                      onChange={(e) => setPerHeadRate(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-navy-950 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">Meals, badges, handbook per attendee</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Contingency Reserve (%)
                    </label>
                    <input
                      type="number"
                      value={contingency}
                      onChange={(e) => setContingency(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-bold text-navy-950 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">PRD Section 6.2 requirement</span>
                  </div>
                </div>

                {/* Shortfall / Sufficiency Monitor Banner */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sufficiency Status</span>
                    <span className="font-heading font-black text-xl text-emerald-400">
                      {budgetSummary.sufficiencyStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Funds Collected</span>
                    <span className="font-heading font-black text-xl text-teal-300">
                      {formatCurrency(totalCollected)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Funding Gap / Outstanding</span>
                    <span className="font-heading font-black text-xl text-amber-400">
                      {formatCurrency(budgetSummary.outstandingAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost to Serve / Head</span>
                    <span className="font-heading font-black text-xl text-white">
                      {formatCurrency(budgetSummary.perHeadCostToServe)}
                    </span>
                  </div>
                </div>

                {/* Chapter Automated Fee Distribution Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">
                        Automated Capability Weight Allocation
                      </h3>
                      <p className="text-xs text-slate-500">Live capability calculation across all 12 chapters</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Chapter</th>
                          <th className="py-3 px-4 text-center">Tier Weight</th>
                          <th className="py-3 px-4 text-center">Attendees</th>
                          <th className="py-3 px-4 text-right">Calculated Fee</th>
                          <th className="py-3 px-4 text-right">Cost to Serve</th>
                          <th className="py-3 px-4 text-right">Cross-Subsidy</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {chapterFees.map((cf, idx) => {
                          const isPositive = cf.crossSubsidy >= 0;
                          return (
                            <tr key={cf.chapterId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-navy-950">
                                {engineChaptersInput[idx]?.name}
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-xs">
                                  {cf.weightSnapshot.toFixed(1)}x
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                {cf.attendeeCount}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-teal-700">
                                {formatCurrency(cf.calculatedFee)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                {formatCurrency(cf.costToServe)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    isPositive
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}
                                  {formatCurrency(cf.crossSubsidy)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW G: ADMIN CHAPTER MANAGEMENT & DYNAMIC COASTAL MAP LOCATION MANAGER */}
            {activePortal === "ADMIN" && adminActiveTab === "chapters" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Location Toast Notification */}
                {locationToast && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-xs font-bold">{locationToast}</span>
                    </div>
                    <button 
                      onClick={() => setLocationToast(null)} 
                      className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl sm:text-3xl text-navy-950">
                      Chapters & Coastal Geographic Hub
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Dynamically configure chapter locations, GPS coordinates, live coastal map pins, and council onboarding.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddChapterModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register New Chapter</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                  <button
                    onClick={() => setChaptersSubTab("map")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      chaptersSubTab === "map"
                        ? "bg-navy-900 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Map className="w-4 h-4 text-amber-400" />
                    <span>Live Coastal Map & Location Editor</span>
                  </button>
                  <button
                    onClick={() => setChaptersSubTab("list")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      chaptersSubTab === "list"
                        ? "bg-navy-900 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Member Chapters Directory ({chaptersList.length})</span>
                  </button>
                  <button
                    onClick={() => setChaptersSubTab("onboarding")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      chaptersSubTab === "onboarding"
                        ? "bg-navy-900 text-white shadow-sm"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Council Onboarding Queue ({adminApplications.filter(a => a.status !== "APPROVED").length} Pending)</span>
                  </button>
                </div>

                {/* SUBTAB 1: DYNAMIC MAP & LIVE LOCATION EDITOR */}
                {chaptersSubTab === "map" && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: The Dynamic Coastal Map */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-2">
                          <Compass className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>Click any pin on the map or select a chapter on the right to edit coordinates.</span>
                        </div>
                        <span className="font-bold text-[10px] uppercase bg-amber-200/60 px-2 py-0.5 rounded">Live Map</span>
                      </div>

                      <EmbeddedCoastalMap
                        chapters={chaptersList}
                        selectedChapterId={editingChapter?.id || mapSelectedChapterId}
                        isAdmin={true}
                        onSelectChapter={(ch) => {
                          setMapSelectedChapterId(ch.id);
                          setEditingChapter(ch);
                        }}
                        onEditChapterLocation={(ch) => {
                          setMapSelectedChapterId(ch.id);
                          setEditingChapter(ch);
                        }}
                        className="shadow-lg h-[460px]"
                      />
                    </div>

                    {/* Right: Real-Time Location & Area Editor */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h3 className="font-heading font-bold text-base text-navy-950 flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-teal-600" />
                            <span>Location & Coordinate Controls</span>
                          </h3>
                          <p className="text-[11px] text-slate-500">Update area presets or precise GPS coordinates</p>
                        </div>
                        {editingChapter && (
                          <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-mono font-bold text-xs">
                            {editingChapter.code}
                          </span>
                        )}
                      </div>

                      {/* Chapter Selector */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                          Select Chapter to Position:
                        </label>
                        <select
                          value={editingChapter?.id || mapSelectedChapterId}
                          onChange={(e) => {
                            const found = chaptersList.find(c => c.id === e.target.value);
                            if (found) {
                              setMapSelectedChapterId(found.id);
                              setEditingChapter(found);
                            }
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none bg-slate-50"
                        >
                          {chaptersList.map((ch) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.institutionName} ({ch.code}) — {ch.location}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Active Editing Chapter Form */}
                      {(() => {
                        const targetChapter = editingChapter || chaptersList.find(c => c.id === mapSelectedChapterId) || chaptersList[0];
                        if (!targetChapter) return null;

                        return (
                          <div className="space-y-4 pt-1">
                            {/* Coastal Area Presets */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Quick Coastal Area Preset:
                              </label>
                              <select
                                onChange={(e) => {
                                  const preset = COASTAL_AREA_PRESETS.find(p => p.id === e.target.value);
                                  if (preset) {
                                    handleUpdateChapterLocation(targetChapter.id, {
                                      location: `${preset.name}, ${preset.county}`,
                                      coordinates: { lat: preset.lat, lng: preset.lng },
                                      mapPosition: { top: preset.top, left: preset.left },
                                    });
                                  }
                                }}
                                defaultValue=""
                                className="w-full px-3 py-2 border border-teal-300 rounded-xl text-xs font-bold text-teal-900 bg-teal-50/50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                              >
                                <option value="" disabled>Choose Coastal Geographic Area...</option>
                                {COASTAL_AREA_PRESETS.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({p.county}) [GPS: {p.lat}, {p.lng}]
                                  </option>
                                ))}
                              </select>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                Instantly applies verified geographic coordinates and coastal map pin position
                              </span>
                            </div>

                            {/* Location String Input */}
                            <div>
                              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Campus Location Name:
                              </label>
                              <div className="relative">
                                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={targetChapter.location}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setChaptersList(prev => prev.map(c => c.id === targetChapter.id ? { ...c, location: val } : c));
                                    if (editingChapter) setEditingChapter({ ...editingChapter, location: val });
                                  }}
                                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                  placeholder="e.g. Tudor, Mombasa Central"
                                />
                              </div>
                            </div>

                            {/* Lat & Lng Coordinate Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                  Latitude (°S)
                                </label>
                                <input
                                  type="number"
                                  step="0.0001"
                                  value={targetChapter.coordinates?.lat ?? -4.0435}
                                  onChange={(e) => {
                                    const latVal = parseFloat(e.target.value);
                                    const coords = { lat: latVal, lng: targetChapter.coordinates?.lng ?? 39.6682 };
                                    setChaptersList(prev => prev.map(c => c.id === targetChapter.id ? { ...c, coordinates: coords } : c));
                                    if (editingChapter) setEditingChapter({ ...editingChapter, coordinates: coords });
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                  Longitude (°E)
                                </label>
                                <input
                                  type="number"
                                  step="0.0001"
                                  value={targetChapter.coordinates?.lng ?? 39.6682}
                                  onChange={(e) => {
                                    const lngVal = parseFloat(e.target.value);
                                    const coords = { lat: targetChapter.coordinates?.lat ?? -4.0435, lng: lngVal };
                                    setChaptersList(prev => prev.map(c => c.id === targetChapter.id ? { ...c, coordinates: coords } : c));
                                    if (editingChapter) setEditingChapter({ ...editingChapter, coordinates: coords });
                                  }}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Map Percentage Placement Controls */}
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                              <span className="text-[11px] font-bold text-slate-700 block">
                                Coastal Map Pin Offset Sliders:
                              </span>
                              <div className="space-y-2">
                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                    <span>North / South (Top %):</span>
                                    <span className="font-mono text-navy-950 font-bold">{targetChapter.mapPosition?.top ?? 50}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="8"
                                    max="88"
                                    value={targetChapter.mapPosition?.top ?? 50}
                                    onChange={(e) => {
                                      const topVal = parseInt(e.target.value);
                                      const pos = { top: topVal, left: targetChapter.mapPosition?.left ?? 45 };
                                      setChaptersList(prev => prev.map(c => c.id === targetChapter.id ? { ...c, mapPosition: pos } : c));
                                      if (editingChapter) setEditingChapter({ ...editingChapter, mapPosition: pos });
                                    }}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                  />
                                </div>

                                <div>
                                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                                    <span>Inland / Coastline (Left %):</span>
                                    <span className="font-mono text-navy-950 font-bold">{targetChapter.mapPosition?.left ?? 45}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="12"
                                    max="82"
                                    value={targetChapter.mapPosition?.left ?? 45}
                                    onChange={(e) => {
                                      const leftVal = parseInt(e.target.value);
                                      const pos = { top: targetChapter.mapPosition?.top ?? 50, left: leftVal };
                                      setChaptersList(prev => prev.map(c => c.id === targetChapter.id ? { ...c, mapPosition: pos } : c));
                                      if (editingChapter) setEditingChapter({ ...editingChapter, mapPosition: pos });
                                    }}
                                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Save Button */}
                            <button
                              type="button"
                              onClick={() => {
                                handleUpdateChapterLocation(targetChapter.id, {
                                  location: targetChapter.location,
                                  coordinates: targetChapter.coordinates,
                                  mapPosition: targetChapter.mapPosition,
                                });
                              }}
                              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                            >
                              <Save className="w-4 h-4" />
                              <span>Save Location & Update Live Map</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* SUBTAB 2: MEMBER CHAPTERS DIRECTORY TABLE */}
                {chaptersSubTab === "list" && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-heading font-bold text-base text-navy-950">
                          Accredited Member Chapters Directory
                        </h3>
                        <p className="text-xs text-slate-500">
                          {chaptersList.length} approved Seventh-day Adventist institutional chapters
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowAddChapterModal(true)}
                          className="px-3.5 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Chapter</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Code</th>
                            <th className="py-3 px-4">Institution & Chapter</th>
                            <th className="py-3 px-4">Type & Sector</th>
                            <th className="py-3 px-4">Location & Coordinates</th>
                            <th className="py-3 px-4 text-center">Attendees</th>
                            <th className="py-3 px-4">Leadership Contacts</th>
                            <th className="py-3 px-4 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {chaptersList.map((ch) => (
                            <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-teal-700">
                                {ch.code}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-900 block">{ch.institutionName}</span>
                                <span className="text-[11px] text-slate-500">{ch.chapterName}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                                  {ch.type} • {ch.sector}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-slate-900 block flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                  <span>{ch.location}</span>
                                </span>
                                <span className="text-[10px] font-mono text-slate-400">
                                  {ch.coordinates?.lat?.toFixed(3)}° S, {ch.coordinates?.lng?.toFixed(3)}° E
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-bold text-xs">
                                  {ch.attendeesCount || 0}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-[11px]">
                                <span className="text-slate-800 block">Patron: {ch.patronName || "—"}</span>
                                <span className="text-slate-500 block">Rep: {ch.repName || "—"}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingChapter(ch);
                                      setMapSelectedChapterId(ch.id);
                                      setChaptersSubTab("map");
                                    }}
                                    className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors"
                                    title="Edit Location on Map"
                                  >
                                    <Map className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteChapter(ch.id, ch.institutionName)}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                                    title="Delete Chapter"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SUBTAB 3: COUNCIL ONBOARDING QUEUE */}
                {chaptersSubTab === "onboarding" && (
                  <div className="space-y-4">
                    {adminApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-navy-950 font-bold text-xs uppercase">
                              {app.type}
                            </span>
                            <span className="text-xs text-slate-400">• {app.location}</span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                app.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <h3 className="font-heading font-bold text-xl text-navy-950">
                            {app.institutionName}
                          </h3>
                          <p className="text-xs text-teal-700 font-semibold">{app.chapterName}</p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Patron:</span>
                              <span>{app.patronName} ({app.patronPhone})</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Chairperson:</span>
                              <span>{app.chairpersonName} ({app.chairpersonPhone})</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Endorsement Doc:</span>
                              <span className="font-mono text-teal-700">{app.endorsementDocument}</span>
                            </div>
                          </div>
                        </div>

                        {/* Council Decision Action */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          {app.status === "APPROVED" ? (
                            <div className="text-right">
                              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approved ({app.assignedTier})</span>
                              </span>
                              <span className="text-[10px] text-slate-400 block">Chapter Code Assigned</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveChapter(app.id, "TIER_3")}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Vote Approve (Tier 3)</span>
                              </button>
                              <button
                                onClick={() => alert("Request for additional endorsement sent to chapter applicant.")}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                              >
                                Request Info
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* MODAL: REGISTER NEW MEMBER CHAPTER */}
                {showAddChapterModal && (
                  <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                        <div>
                          <h3 className="font-heading font-black text-xl text-navy-950">
                            Register & Map New Member Chapter
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Add a new SDA student chapter to the database and place its pin on the coastal map.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowAddChapterModal(false)}
                          className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleCreateChapter} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Institution Name *</label>
                            <input
                              type="text"
                              required
                              value={newChapterForm.institutionName}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, institutionName: e.target.value })}
                              placeholder="e.g. Coast Institute of Technology"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Chapter Name *</label>
                            <input
                              type="text"
                              required
                              value={newChapterForm.chapterName}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, chapterName: e.target.value })}
                              placeholder="e.g. CIT Adventist Fellowship"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Chapter Code (Unique)</label>
                            <input
                              type="text"
                              value={newChapterForm.code}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, code: e.target.value })}
                              placeholder="e.g. CIT-13"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Institution Type</label>
                            <select
                              value={newChapterForm.type}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, type: e.target.value as any })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            >
                              <option value="UNIVERSITY">University</option>
                              <option value="COLLEGE">College / Polytechnic</option>
                              <option value="SECONDARY">Secondary School</option>
                              <option value="PRIMARY">Primary / Early</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Sector</label>
                            <select
                              value={newChapterForm.sector}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, sector: e.target.value as any })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            >
                              <option value="PUBLIC">Public</option>
                              <option value="PRIVATE">Private</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Capability Tier</label>
                            <select
                              value={newChapterForm.tierId}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, tierId: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            >
                              <option value="TIER_1">Tier 1 (2.0x weight — Major University)</option>
                              <option value="TIER_2">Tier 2 (1.5x weight — Mid Univ & Medical)</option>
                              <option value="TIER_3">Tier 3 (1.0x weight — Technical & Poly)</option>
                              <option value="TIER_4">Tier 4 (0.5x weight — Secondary & Early)</option>
                            </select>
                          </div>
                        </div>

                        {/* Coastal Area Preset Selector */}
                        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-2">
                          <label className="block font-bold text-teal-900">
                            Geographic Coastal Area Preset & Map Placement *
                          </label>
                          <select
                            onChange={(e) => {
                              const p = COASTAL_AREA_PRESETS.find(x => x.id === e.target.value);
                              if (p) {
                                setNewChapterForm({
                                  ...newChapterForm,
                                  location: `${p.name}, ${p.county}`,
                                  lat: p.lat,
                                  lng: p.lng,
                                  top: p.top,
                                  left: p.left,
                                });
                              }
                            }}
                            className="w-full px-3 py-2 border border-teal-300 rounded-xl font-bold text-teal-950 focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                          >
                            <option value="">Select Coastal Region Preset...</option>
                            {COASTAL_AREA_PRESETS.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.county}) [GPS: {p.lat}, {p.lng}]
                              </option>
                            ))}
                          </select>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                              <span className="text-[10px] text-slate-500 font-semibold block">Location string</span>
                              <input
                                type="text"
                                value={newChapterForm.location}
                                onChange={(e) => setNewChapterForm({ ...newChapterForm, location: e.target.value })}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 font-semibold block">GPS Latitude / Longitude</span>
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  step="0.001"
                                  value={newChapterForm.lat}
                                  onChange={(e) => setNewChapterForm({ ...newChapterForm, lat: parseFloat(e.target.value) })}
                                  className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                />
                                <input
                                  type="number"
                                  step="0.001"
                                  value={newChapterForm.lng}
                                  onChange={(e) => setNewChapterForm({ ...newChapterForm, lng: parseFloat(e.target.value) })}
                                  className="w-1/2 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Leadership info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Patron / Chaplain Name</label>
                            <input
                              type="text"
                              value={newChapterForm.patronName}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, patronName: e.target.value })}
                              placeholder="e.g. Pr. Samuel Mwamburi"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Representative Name</label>
                            <input
                              type="text"
                              value={newChapterForm.repName}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, repName: e.target.value })}
                              placeholder="e.g. Faith Ndinda"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Approximate Campus Members</label>
                            <input
                              type="number"
                              value={newChapterForm.approximateMembers}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, approximateMembers: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Initial Rally Quota</label>
                            <input
                              type="number"
                              value={newChapterForm.attendeesCount}
                              onChange={(e) => setNewChapterForm({ ...newChapterForm, attendeesCount: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => setShowAddChapterModal(false)}
                            className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md"
                          >
                            Save Chapter & Pin to Map
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW H-1: ADMIN RALLY MANAGEMENT */}
            {activePortal === "ADMIN" && adminActiveTab === "rallies" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Rally Management</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage rally lifecycle, venues, dates, cost items, and programme details.</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Create New Rally</span>
                  </button>
                </div>

                {/* Current Rally Hero Card */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-950 to-navy-900 text-white border border-navy-800 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        REGISTRATION OPEN
                      </span>
                      <h2 className="font-heading font-black text-3xl text-white tracking-tight">{CURRENT_RALLY.title}</h2>
                      <p className="text-amber-300 font-semibold text-sm mt-2">&ldquo;{CURRENT_RALLY.theme}&rdquo;</p>
                      <div className="mt-4 space-y-2 text-xs text-slate-300">
                        <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-400" /> 15 – 17 November 2026</p>
                        <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-400" /> {CURRENT_RALLY.venueName}, {CURRENT_RALLY.venueLocation}</p>
                        <p className="flex items-center gap-2"><Users className="w-4 h-4 text-teal-400" /> Capacity: {CURRENT_RALLY.capacity.toLocaleString()} delegates</p>
                        <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Fee Lock: 1 November 2026</p>
                        <p className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-400" /> Payment Deadline: 10 November 2026</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration Progress</h4>
                      <div className="space-y-2">
                        {[
                          { label: "Total Registered Delegates", value: "2,486", pct: 83 },
                          { label: "Chapters Confirmed", value: "12 / 12", pct: 100 },
                          { label: "Invoices Settled", value: "10 / 12", pct: 83 },
                        ].map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-300">{item.label}</span>
                              <span className="font-bold text-white">{item.value}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400" style={{ width: `${item.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost Items Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">Rally Budget Cost Items</h3>
                      <p className="text-xs text-slate-500">Fixed and per-head cost line items for Coastal Unity Rally 2026</p>
                    </div>
                    <button onClick={() => setAdminActiveTab("funding")} className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                      <span>Open Cost Engine</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Item</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4 text-center">Type</th>
                          <th className="py-3 px-4 text-right">Amount (KSh)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {RALLY_COST_ITEMS.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">{item.category}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.type === "FIXED" ? "bg-navy-100 text-navy-800" : "bg-teal-100 text-teal-800"}`}>
                                {item.type === "FIXED" ? "Fixed" : "Per Head"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-navy-950">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Past & Future Rallies Timeline */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">Rally History & Pipeline</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { title: "Coastal Unity Rally 2024", venue: "Mombasa Sports Complex", date: "Nov 2024", status: "Completed", statusClass: "bg-slate-200 text-slate-700", attendees: "2,105" },
                      { title: "Coast Fellowship Rally 2025 (Mid-Year)", venue: "Pwani University Grounds, Kilifi", date: "Jun 2025", status: "Completed", statusClass: "bg-slate-200 text-slate-700", attendees: "1,880" },
                      { title: "Coastal Unity Rally 2025", venue: "Mombasa Sports Complex", date: "Nov 2025", status: "Completed", statusClass: "bg-slate-200 text-slate-700", attendees: "2,310" },
                      { title: "Coastal Unity Rally 2026", venue: "Mombasa Sports Complex", date: "Nov 15–17, 2026", status: "Active", statusClass: "bg-emerald-100 text-emerald-800 border border-emerald-300", attendees: "2,486 (ongoing)" },
                      { title: "Kilifi Fellowship Rally 2027", venue: "Pwani University Grounds", date: "May 2027", status: "Planned", statusClass: "bg-amber-100 text-amber-800", attendees: "—" },
                    ].map((rally) => (
                      <div key={rally.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                        <div>
                          <span className="font-bold text-slate-900 block">{rally.title}</span>
                          <span className="text-slate-500 text-[11px]">{rally.venue} • {rally.date} • {rally.attendees} delegates</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${rally.statusClass}`}>
                          {rally.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW H-2: ADMIN ATTENDEE MASTER ROSTER */}
            {activePortal === "ADMIN" && adminActiveTab === "attendees" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Attendee Master Roster</h1>
                    <p className="text-xs text-slate-500 mt-1">All registered delegates across all chapters for Coastal Unity Rally 2026.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                    <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Bulk Import</span>
                    </button>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Registered", value: "2,486", color: "text-navy-950", bg: "bg-navy-50 border-navy-200" },
                    { label: "Confirmed", value: "2,372", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                    { label: "Pending Consent", value: "114", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
                    { label: "Minors (Under 18)", value: "87", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
                  ].map((stat) => (
                    <div key={stat.label} className={`p-5 rounded-2xl border ${stat.bg} shadow-sm`}>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">{stat.label}</span>
                      <span className={`font-heading font-black text-2xl ${stat.color} block mt-1`}>{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Master Table by Chapter */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">Delegation by Chapter</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Chapter</th>
                          <th className="py-3 px-4">Institution</th>
                          <th className="py-3 px-4 text-center">Registered</th>
                          <th className="py-3 px-4 text-center">Confirmed</th>
                          <th className="py-3 px-4 text-center">Minors</th>
                          <th className="py-3 px-4 text-center">Capacity %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {MEMBER_CHAPTERS.map((ch) => {
                          const attendees = ch.attendeesCount || 0;
                          const members = ch.approximateMembers || 1;
                          const cap = Math.round((attendees / members) * 100);
                          return (
                            <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-[10px]">{ch.code}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">{ch.institutionName}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-navy-950">{attendees}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="text-emerald-700 font-bold">{Math.round(attendees * 0.95)}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center text-blue-700 font-semibold">{Math.round(attendees * 0.04)}</td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center gap-2 justify-center">
                                  <div className="w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.min(cap, 100)}%` }} />
                                  </div>
                                  <span className="font-bold text-slate-700">{cap}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sample Individual Roster */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-base text-navy-950">Recent Registrations</h3>
                    <div className="relative w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input type="text" placeholder="Search delegate..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none" />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Delegate</th>
                          <th className="py-3 px-4">Chapter</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Dietary</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {SAMPLE_ATTENDEES.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 block">{att.fullName}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{att.admissionOrIdNumber}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 font-mono text-[10px]">{att.chapterId.replace("ch-", "").toUpperCase()}</td>
                            <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded bg-navy-100 text-navy-800 text-[10px] font-semibold">{att.role}</span></td>
                            <td className="py-3.5 px-4 text-slate-600">{att.ageCategory}</td>
                            <td className="py-3.5 px-4 text-slate-600">{att.dietaryRequirements || "Standard"}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${att.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW H-3: ADMIN PAYMENTS & RECONCILIATION */}
            {activePortal === "ADMIN" && adminActiveTab === "payments" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Payments & Reconciliation</h1>
                    <p className="text-xs text-slate-500 mt-1">Central treasury: M-Pesa Paybill 4082200 incoming transactions matched against chapter invoices.</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync M-Pesa</span>
                  </button>
                </div>

                {/* Financial KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Invoiced", value: formatCurrency(INVOICES.reduce((s, i) => s + i.amountDue, 0)), color: "text-navy-950", icon: FileText },
                    { label: "Total Received", value: formatCurrency(PAYMENTS_LEDGER.filter(p => p.status === "MATCHED").reduce((s, p) => s + p.amount, 0)), color: "text-emerald-700", icon: CheckCircle2 },
                    { label: "Outstanding Balance", value: formatCurrency(INVOICES.reduce((s, i) => s + i.balance, 0)), color: "text-amber-700", icon: AlertTriangle },
                    { label: "Unmatched Transactions", value: `${PAYMENTS_LEDGER.filter(p => p.status === "UNMATCHED").length}`, color: "text-rose-700", icon: ShieldAlert },
                  ].map((kpi) => (
                    <div key={kpi.label} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{kpi.label}</span>
                        <kpi.icon className="w-5 h-5 text-slate-300" />
                      </div>
                      <span className={`font-heading font-black text-2xl ${kpi.color}`}>{kpi.value}</span>
                    </div>
                  ))}
                </div>

                {/* Payment Ledger Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-base text-navy-950">M-Pesa & Bank Transaction Ledger</h3>
                    <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Receipt / Ref</th>
                          <th className="py-3 px-4">Payer</th>
                          <th className="py-3 px-4">Chapter Ref</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4 text-right">Amount (KSh)</th>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {PAYMENTS_LEDGER.map((pay) => (
                          <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-teal-700 text-[10px]">{pay.mpesaReceiptNumber}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">{pay.payerName}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 text-[10px]">{pay.reference}</td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                                {pay.method === "MPESA_DARAJA" ? "M-Pesa" : "Bank"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-navy-950">{formatCurrency(pay.amount)}</td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{pay.timestamp}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                pay.status === "MATCHED" ? "bg-emerald-100 text-emerald-800" :
                                pay.status === "UNMATCHED" ? "bg-rose-100 text-rose-800" :
                                "bg-amber-100 text-amber-800"
                              }`}>
                                {pay.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Invoice Status Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">Chapter Invoice Status</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Invoice #</th>
                          <th className="py-3 px-4">Chapter</th>
                          <th className="py-3 px-4 text-right">Invoiced</th>
                          <th className="py-3 px-4 text-right">Paid</th>
                          <th className="py-3 px-4 text-right">Balance</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {INVOICES.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-[10px]">{inv.invoiceNumber}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">{inv.institutionName}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-navy-950">{formatCurrency(inv.amountDue)}</td>
                            <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">{formatCurrency(inv.amountPaid)}</td>
                            <td className="py-3.5 px-4 text-right font-bold text-amber-700">{formatCurrency(inv.balance)}</td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{inv.dueDate}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                inv.status === "PAID" ? "bg-emerald-100 text-emerald-800" :
                                inv.status === "PARTIAL" ? "bg-amber-100 text-amber-800" :
                                "bg-rose-100 text-rose-800"
                              }`}>
                                {inv.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW H-4: ADMIN REPORTS */}
            {activePortal === "ADMIN" && adminActiveTab === "reports" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl text-navy-950">Logistics & Reports</h1>
                  <p className="text-xs text-slate-500 mt-1">Generate and export official reports for council meetings, county permits, and financial reconciliation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { title: "Chapter Financial Summary", desc: "Per-chapter fee invoices, payment status, and capability tier allocation for all 12 chapters.", icon: FileSpreadsheet, color: "text-teal-700", bg: "bg-teal-50 border-teal-200", tag: "Finance" },
                    { title: "Attendee Master Register", desc: "Full delegate roster with dietary requirements, accommodation requests, and guardian consent records.", icon: Users, color: "text-navy-700", bg: "bg-navy-50 border-navy-200", tag: "Delegates" },
                    { title: "Capability Fee Distribution", desc: "Automated cost engine output: tier weights, cross-subsidies, and per-chapter invoiced amounts.", icon: PieChart, color: "text-amber-700", bg: "bg-amber-50 border-amber-200", tag: "Cost Engine" },
                    { title: "M-Pesa Reconciliation Report", desc: "Matched, unmatched, and pending transactions from Paybill 4082200 with receipt verification.", icon: CreditCard, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", tag: "Treasury" },
                    { title: "Rally Programme & Logistics", desc: "Day-by-day programme, venue layout, catering quantities, and security deployment schedule.", icon: Calendar, color: "text-blue-700", bg: "bg-blue-50 border-blue-200", tag: "Operations" },
                    { title: "Council Governance Audit", desc: "Full immutable audit trail of all approval actions, fee recalibrations, and administrative decisions.", icon: History, color: "text-slate-700", bg: "bg-slate-50 border-slate-200", tag: "Governance" },
                  ].map((report) => (
                    <div key={report.title} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between group">
                      <div>
                        <div className={`w-12 h-12 rounded-2xl ${report.bg} border flex items-center justify-center mb-4`}>
                          <report.icon className={`w-6 h-6 ${report.color}`} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{report.tag}</span>
                        <h4 className="font-heading font-bold text-sm text-navy-950 mt-1 mb-2">{report.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">{report.desc}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <button className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>
                        <button className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Stats for Reports */}
                <div className="p-6 rounded-3xl bg-navy-950 text-white border border-navy-800 shadow-xl">
                  <h3 className="font-heading font-bold text-base text-white mb-4">Rally 2026 — Summary Metrics</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {[
                      { label: "Total Budget", value: "KSh 3.94M" },
                      { label: "Funds Collected", value: "KSh 3.42M" },
                      { label: "Shortfall", value: "KSh 0.52M" },
                      { label: "Collection Rate", value: "87%" },
                    ].map((m) => (
                      <div key={m.label}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{m.label}</span>
                        <span className="font-heading font-black text-2xl text-amber-400 block mt-1">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW H-5: ADMIN USERS & ROLES (RBAC) */}
            {activePortal === "ADMIN" && adminActiveTab === "users" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Users & Roles (RBAC)</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage system access, role assignments, and two-factor authentication for all portal users.</p>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Invite User</span>
                  </button>
                </div>

                {/* Role Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { role: "Super Administrator", desc: "Full system access. Manage all chapters, rallies, users, funding engine, and audit log.", users: 1, color: "border-amber-500 bg-amber-50", badge: "bg-amber-500 text-white", icon: ShieldCheck },
                    { role: "Council Treasurer", desc: "Access to payments, reconciliation, invoice management, and funding dashboard.", users: 2, color: "border-teal-500 bg-teal-50", badge: "bg-teal-600 text-white", icon: CreditCard },
                    { role: "Organization Secretary", desc: "Chapter onboarding queue, document management, and attendee master roster.", users: 1, color: "border-blue-500 bg-blue-50", badge: "bg-blue-600 text-white", icon: FileText },
                    { role: "Communication Director", desc: "Notifications dispatch, gallery uploads, and public website content management.", users: 1, color: "border-purple-500 bg-purple-50", badge: "bg-purple-600 text-white", icon: Bell },
                    { role: "Chapter Representative", desc: "Chapter-scoped portal: their own attendees, invoice view, and rally information.", users: 12, color: "border-slate-300 bg-slate-50", badge: "bg-slate-700 text-white", icon: Building2 },
                    { role: "Read-Only Observer", desc: "View-only access to approved reports and chapter lists for ex-officio council members.", users: 5, color: "border-slate-200 bg-white", badge: "bg-slate-400 text-white", icon: User },
                  ].map((item) => (
                    <div key={item.role} className={`p-6 rounded-2xl border-2 ${item.color} shadow-sm transition-shadow hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.badge}`}>
                          {item.role}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {item.users} user{item.users !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <item.icon className="w-8 h-8 text-slate-400 mb-3" />
                      <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                      <button className="mt-4 text-xs font-bold text-teal-700 hover:underline flex items-center gap-1">
                        <span>Manage users</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">Active Portal Sessions</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { user: "Council Admin", role: "Super Administrator", device: "Chrome • Windows", ip: "41.90.x.x (Mombasa)", session: "Active now", online: true },
                      { user: "David Kiboi", role: "Chapter Representative (TUM)", device: "Safari • iPhone 14", ip: "197.136.x.x (Nairobi)", session: "2 mins ago", online: true },
                      { user: "Mercy Chebet", role: "Chapter Representative (Pwani)", device: "Chrome • Android", ip: "41.80.x.x (Kilifi)", session: "18 mins ago", online: false },
                      { user: "CUCASO Treasurer", role: "Council Treasurer", device: "Firefox • macOS", ip: "41.90.x.x (Mombasa)", session: "1 hour ago", online: false },
                    ].map((session) => (
                      <div key={session.user} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center">
                              {session.user.split(" ").map(w => w[0]).join("").slice(0, 2)}
                            </div>
                            {session.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{session.user}</span>
                            <span className="text-slate-400 text-[10px]">{session.role} • {session.device}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`block font-semibold text-[11px] ${session.online ? "text-emerald-700" : "text-slate-400"}`}>{session.session}</span>
                          <span className="text-[10px] text-slate-400">{session.ip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW H-6: ADMIN SYSTEM SETTINGS */}
            {activePortal === "ADMIN" && adminActiveTab === "settings" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div>
                  <h1 className="font-heading font-black text-2xl text-navy-950">System Settings</h1>
                  <p className="text-xs text-slate-500 mt-1">Configure platform-wide defaults, notification templates, M-Pesa integration, and organizational metadata.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Org Settings */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="font-heading font-bold text-base text-navy-950 pb-2 border-b border-slate-100">Organization Settings</h3>
                    {[
                      { label: "Organization Name", value: "Coastal Universities and Colleges Adventist Students Organization" },
                      { label: "Acronym", value: "CUCASO" },
                      { label: "HQ Location", value: "Mombasa Coast Field Secretariat, Mombasa, Kenya" },
                      { label: "Primary Contact Email", value: "secretariat@cucaso.org" },
                      { label: "Constitution Status", value: "Approved & Active" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 text-xs">
                        <span className="text-slate-500 font-semibold w-40 flex-shrink-0">{item.label}</span>
                        <span className="font-bold text-slate-900 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Settings */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="font-heading font-bold text-base text-navy-950 pb-2 border-b border-slate-100">Financial & Payment Settings</h3>
                    {[
                      { label: "Central M-Pesa Paybill", value: "4082200" },
                      { label: "Currency", value: "KES (Kenyan Shilling)" },
                      { label: "Default Contingency %", value: "10%" },
                      { label: "Fee Allocation Mode", value: "Capability-Weighted" },
                      { label: "Payment Gateway", value: "Safaricom M-Pesa Daraja API" },
                      { label: "Bank Integration", value: "KCB & Equity Bank (Wire Transfer)" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-4 text-xs">
                        <span className="text-slate-500 font-semibold w-40 flex-shrink-0">{item.label}</span>
                        <span className="font-bold text-slate-900 text-right font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Notification Templates */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
                    <h3 className="font-heading font-bold text-base text-navy-950 pb-2 border-b border-slate-100">Notification Templates</h3>
                    {[
                      { name: "Chapter Approval Email", status: "Active", type: "Email" },
                      { name: "Invoice Dispatch SMS", status: "Active", type: "SMS" },
                      { name: "Payment Confirmation Email", status: "Active", type: "Email" },
                      { name: "Fee Lock Reminder SMS", status: "Active", type: "SMS" },
                      { name: "Rally Countdown Push", status: "Inactive", type: "Push" },
                    ].map((tmpl) => (
                      <div key={tmpl.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{tmpl.name}</span>
                          <span className="text-slate-400 ml-2 text-[10px]">{tmpl.type}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tmpl.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}>
                          {tmpl.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Approval Quorum Rules */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-3">
                    <h3 className="font-heading font-bold text-base text-navy-950 pb-2 border-b border-slate-100">Governance Rules</h3>
                    {[
                      { rule: "Chapter Approval Quorum", value: "Simple majority (7 of 12 executive votes)" },
                      { rule: "Tier Assignment Authority", value: "Organization Secretary + Treasurer sign-off" },
                      { rule: "Budget Amendment", value: "Requires Chairperson authorization" },
                      { rule: "Minor (Under 18) Consent", value: "Mandatory written guardian consent" },
                      { rule: "Registration Lock Trigger", value: "1 November each rally year" },
                      { rule: "Payment Deadline", value: "10 November each rally year" },
                    ].map((item) => (
                      <div key={item.rule} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase mb-0.5">{item.rule}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW H-7: ADMIN AUDIT LOG */}
            {activePortal === "ADMIN" && adminActiveTab === "audit" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">
                      System Governance & Audit Trail
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Immutable record of council approvals, payments matched, fee recalibrations, and administrative decisions.
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Audit PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Events", value: String(AUDIT_LOGS.length + 48), color: "text-navy-950" },
                    { label: "Today's Actions", value: "7", color: "text-teal-700" },
                    { label: "Critical Events", value: "0", color: "text-emerald-700" },
                    { label: "Actors", value: "4", color: "text-amber-700" },
                  ].map((s) => (
                    <div key={s.label} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{s.label}</span>
                      <span className={`font-heading font-black text-3xl ${s.color} block mt-1`}>{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="space-y-3">
                    {AUDIT_LOGS.map((log) => (
                      <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">{log.action}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-semibold text-slate-900">{log.target}</span>
                          </div>
                          <p className="text-slate-600">{log.details}</p>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-400 font-semibold">{log.actor}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] font-bold text-slate-600">{log.role}</span>
                          </div>
                        </div>
                        <span className="font-mono text-[11px] text-slate-400 whitespace-nowrap flex-shrink-0">
                          {log.timestamp}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function PortalMainPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-teal-500 rounded-full animate-spin" />
          <span className="text-xs font-bold text-navy-950">Loading CUCASO Portal...</span>
        </div>
      </div>
    }>
      <PortalContent />
    </Suspense>
  );
}

