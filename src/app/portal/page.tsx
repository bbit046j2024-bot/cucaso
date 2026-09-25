"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SystemSwitcher } from "@/components/system-switcher";
import { EmbeddedCoastalMap } from "@/components/embedded-coastal-map";
import { Chapter, CoastalAreaPreset, UserAccount, ExecutiveLeader, NewsPost, ResourceDocument, CostItem } from "@/types";
import { 
  MEMBER_CHAPTERS, 
  CURRENT_RALLY, 
  RALLY_COST_ITEMS, 
  CAPABILITY_TIERS, 
  COASTAL_AREA_PRESETS,
  AUDIT_LOGS,
  EXECUTIVE_COUNCIL,
} from "@/lib/data";
import type { Invoice, Payment, ChapterApplication, AuditLogEntry, Attendee } from "@/types";
import { calculateCapabilityFees } from "@/lib/cost-engine";
import { formatCurrency, normalizeGoogleImageUrl, isGoogleAlbumOrFolder, getAlbumTypeLabel } from "@/lib/utils";
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
  Navigation,
  Image as ImageIcon,
  Key,
  Copy,
  Share2,
  AlertCircle,
  Camera,
  UserPlus,
  Printer,
  QrCode,
  Images,
  FolderOpen,
  Layers,
  Newspaper,
  FolderArchive,
  Coins,
  RotateCcw,
  BookOpen,
  Bookmark,
  Tag,
  Eye,
  Inbox,
  MessageSquare,
  Mail,
  Heart
} from "lucide-react";

function PortalContent() {
  const searchParams = useSearchParams();

  // Mode: CHAPTER_PORTAL vs ADMIN_PORTAL
  const [activePortal, setActivePortal] = useState<"CHAPTER" | "ADMIN">("CHAPTER");

  // Chapter Portal selected chapter (Default: TUM Chapter)
  const [selectedChapterId, setSelectedChapterId] = useState<string>("ch-tum");
  const [chapterActiveTab, setChapterActiveTab] = useState<
    "dashboard" | "my-chapter" | "attendees" | "payments" | "rally-info" | "gallery" | "documents" | "news" | "notifications" | "profile"
  >("dashboard");

  // Admin Portal active tab
  const [adminActiveTab, setAdminActiveTab] = useState<
    "overview" | "chapters" | "rallies" | "attendees" | "payments" | "funding" | "reports" | "leadership" | "gallery" | "news" | "resources" | "inbox" | "users" | "settings" | "audit"
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
  // paymentsList must be declared BEFORE chapterPayments useMemo that depends on it
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const currentInvoice = useMemo(() => {
    return invoicesList.find((inv) => inv.chapterId === selectedChapterId) || null;
  }, [invoicesList, selectedChapterId]);

  // Real-time payments for current chapter
  const chapterPayments = useMemo(() => {
    return paymentsList.filter(p =>
      p.chapterId === selectedChapterId ||
      (currentInvoice && p.invoiceId === currentInvoice.id) ||
      (currentChapter && p.reference && p.reference.toLowerCase().includes(currentChapter.code.toLowerCase()))
    );
  }, [paymentsList, selectedChapterId, currentInvoice, currentChapter]);

  // Fetch real invoices and payments from API
  useEffect(() => {
    setInvoicesLoading(true);
    setPaymentsLoading(true);
    fetch("/api/invoices")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setInvoicesList(j.data); })
      .catch(() => {})
      .finally(() => setInvoicesLoading(false));
    fetch("/api/payments")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setPaymentsList(j.data); })
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, [selectedChapterId, activePortal]);

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
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadSuccess, setDocUploadSuccess] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ name: string; type: string; date: string; status: string; statusClass: string; url?: string }>>([]);
  const [copiedRegLink, setCopiedRegLink] = useState(false);
  const [addAttendeeError, setAddAttendeeError] = useState<string | null>(null);
  const [addAttendeeSubmitting, setAddAttendeeSubmitting] = useState(false);
  const [showRegLinkPanel, setShowRegLinkPanel] = useState(false);


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
    attendeesCount: 0,
    patronName: "",
    patronPhone: "",
    repName: "",
    repPhone: "",
    lat: -4.0435,
    lng: 39.6682,
    top: 50,
    left: 42,
  });

  // ─── Funding & Cost Engine — CRUD State ─────────────────────────────────
  const [costItemsList, setCostItemsList] = useState<CostItem[]>(RALLY_COST_ITEMS);
  const [costItemsLoading, setCostItemsLoading] = useState(false);
  const [contingency, setContingency] = useState<number>(10);

  // Add cost item modal
  const [showAddCostItemModal, setShowAddCostItemModal] = useState(false);
  const [editingCostItem, setEditingCostItem] = useState<CostItem | null>(null);
  const [costItemForm, setCostItemForm] = useState({
    name: "",
    category: "VENUE",
    type: "FIXED" as "FIXED" | "PER_HEAD" | "PER_VEHICLE",
    amount: "",
    quantity: "1",
    notes: "",
  });
  const [costItemSaving, setCostItemSaving] = useState(false);
  const [costItemError, setCostItemError] = useState<string | null>(null);
  const [adminApplications, setAdminApplications] = useState<ChapterApplication[]>([]);
  // Real Payments & Reconciliation Interactive State
  const [syncingMpesa, setSyncingMpesa] = useState(false);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState("");
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<"ALL" | "MATCHED" | "UNMATCHED">("ALL");
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState("");
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcilingPayment, setReconcilingPayment] = useState<Payment | null>(null);
  const [selectedReconcileInvoiceId, setSelectedReconcileInvoiceId] = useState("");
  const [reconcilingLoading, setReconcilingLoading] = useState(false);
  const [adminPaymentForm, setAdminPaymentForm] = useState({
    invoiceId: "",
    amount: "",
    receipt: "",
    payerName: "",
    phone: "",
    method: "MPESA_DARAJA" as Payment["method"],
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [allAttendeesList, setAllAttendeesList] = useState<Attendee[]>([]);
  
  // Dynamic Users & RBAC State
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showInviteUserModal, setShowInviteUserModal] = useState(false);
  const [inviteUserForm, setInviteUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "CHAPTER_REP" as UserAccount["role"],
    chapterId: "ch-tum",
    status: "ACTIVE" as UserAccount["status"],
  });
  const [inviteUserSubmitting, setInviteUserSubmitting] = useState(false);

  // Dynamic Rallies State
  const [ralliesList, setRalliesList] = useState<any[]>([CURRENT_RALLY]);
  const [currentRallyData, setCurrentRallyData] = useState<any>(CURRENT_RALLY);
  const [showCreateRallyModal, setShowCreateRallyModal] = useState(false);
  const [showEditRallyModal, setShowEditRallyModal] = useState(false);
  const [savingRally, setSavingRally] = useState(false);
  const [editRallyTab, setEditRallyTab] = useState<"basic" | "programme" | "venue" | "fees">("basic");
  const [newRallyForm, setNewRallyForm] = useState({
    code: "CUR-2027",
    title: "Kilifi Fellowship Rally 2027",
    theme: "Rooted in Faith, United in Purpose",
    venueName: "Pwani University Grounds",
    venueLocation: "Kilifi County, Coast Region",
    capacity: 3500,
    startDate: "2027-05-14",
    endDate: "2027-05-16",
    feeLockDate: "2027-05-01",
    paymentDeadline: "2027-05-10",
    state: "DRAFT" as const,
  });
  const [editRallyForm, setEditRallyForm] = useState({
    title: CURRENT_RALLY.title,
    theme: CURRENT_RALLY.theme,
    venueName: CURRENT_RALLY.venueName,
    venueLocation: CURRENT_RALLY.venueLocation,
    capacity: CURRENT_RALLY.capacity,
    startDate: "2026-11-15",
    endDate: "2026-11-17",
    registrationDeadline: "2026-11-01",
    feeLockDate: "2026-11-01",
    paymentDeadline: "2026-11-10",
    state: CURRENT_RALLY.state,
    posterUrl: CURRENT_RALLY.posterUrl ?? "",
    // Dynamic sections stored as JSON strings for editing
    programmeJson: JSON.stringify(CURRENT_RALLY.programme ?? [], null, 2),
    venueAddress: CURRENT_RALLY.venueAccess?.address ?? "",
    venueDescription: CURRENT_RALLY.venueAccess?.description ?? "",
    venueDirections: CURRENT_RALLY.venueAccess?.directions ?? "",
    venueParkingInfo: CURRENT_RALLY.venueAccess?.parkingInfo ?? "",
    venueSecurityInfo: CURRENT_RALLY.venueAccess?.securityInfo ?? "",
    venueMedicalInfo: CURRENT_RALLY.venueAccess?.medicalInfo ?? "",
    venueAccommodationNotes: CURRENT_RALLY.venueAccess?.accommodationNotes ?? "",
    feesPaybillNumber: CURRENT_RALLY.feesAndCapitation?.paybillNumber ?? "4082200",
    feesAccountInstructions: CURRENT_RALLY.feesAndCapitation?.accountInstructions ?? "",
    feesDeadlineText: CURRENT_RALLY.feesAndCapitation?.deadlineText ?? "",
    feesPhilosophyTitle: CURRENT_RALLY.feesAndCapitation?.philosophyTitle ?? "",
    feesPhilosophyText: CURRENT_RALLY.feesAndCapitation?.philosophyText ?? "",
    feeTiersJson: JSON.stringify(CURRENT_RALLY.feesAndCapitation?.tiers ?? [], null, 2),
  });

  // Poster upload mode: "url" = paste a link, "file" = upload a file
  const [posterUploadMode, setPosterUploadMode] = useState<"url" | "file">("url");
  const [posterUploading, setPosterUploading] = useState(false);

  const handlePosterFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (json.success && json.url) {
        setEditRallyForm(prev => ({ ...prev, posterUrl: json.url }));
        setLocationToast("Poster image uploaded successfully!");
        setTimeout(() => setLocationToast(null), 3000);
      } else {
        alert("Upload failed: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    } finally {
      setPosterUploading(false);
    }
  };

  // Dynamic Programme Days (No JSON needed for managers)
  const [programmeDays, setProgrammeDays] = useState<any[]>(CURRENT_RALLY.programme || []);

  // Dynamic Fee Tiers (No JSON needed for managers)
  const [feeTiersList, setFeeTiersList] = useState<Array<{
    tierName: string;
    range: string;
    description: string;
  }>>(CURRENT_RALLY.feesAndCapitation?.tiers || []);

  // Dynamic Rally History (loaded from persistent DB endpoint /api/rallies/history)
  const [rallyHistoryList, setRallyHistoryList] = useState<any[]>([]);

  // Dynamic News & Bulletins State
  const [newsList, setNewsList] = useState<NewsPost[]>([]);
  const [newsFilter, setNewsFilter] = useState<string>("ALL");
  const [showCreateNewsModal, setShowCreateNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsSubmitting, setNewsSubmitting] = useState(false);
  const [viewingNewsArticle, setViewingNewsArticle] = useState<NewsPost | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    category: "NEWS",
    author: "Council Admin",
    summary: "",
    content: "",
    featuredImageUrl: "",
    status: "PUBLISHED",
  });

  // Dynamic Resources & Documents State
  const [resourcesList, setResourcesList] = useState<ResourceDocument[]>([]);
  const [resourceFilter, setResourceFilter] = useState<string>("ALL");
  const [showCreateResourceModal, setShowCreateResourceModal] = useState(false);
  const [resourceSubmitting, setResourceSubmitting] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "POLICY",
    accessLevel: "PUBLIC",
    description: "",
    url: "",
    fileSize: "1.2 MB",
    mimeType: "application/pdf",
  });
  const [uploadingResourceFile, setUploadingResourceFile] = useState(false);

  // Fetch live rally, news, and resources data from API on mount
  useEffect(() => {
    fetch("/api/rallies")
      .then(r => r.json())
      .then(j => {
        if (j.success && j.data) {
          const d = j.data;
          setCurrentRallyData(d);
          setRalliesList([d]);
          if (d.programme && Array.isArray(d.programme)) {
            setProgrammeDays(d.programme);
          }
          if (d.feesAndCapitation?.tiers && Array.isArray(d.feesAndCapitation.tiers)) {
            setFeeTiersList(d.feesAndCapitation.tiers);
          }
          // Pre-populate edit form with ALL live values from DB
          setEditRallyForm(prev => ({
            ...prev,
            title: d.title || prev.title,
            theme: d.theme || prev.theme,
            venueName: d.venueName || prev.venueName,
            venueLocation: d.venueLocation || prev.venueLocation,
            capacity: d.capacity || prev.capacity,
            startDate: d.startDate ? d.startDate.split("T")[0] : prev.startDate,
            endDate: d.endDate ? d.endDate.split("T")[0] : prev.endDate,
            registrationDeadline: d.registrationDeadline ? d.registrationDeadline.split("T")[0] : prev.registrationDeadline,
            feeLockDate: d.feeLockDate ? d.feeLockDate.split("T")[0] : prev.feeLockDate,
            paymentDeadline: d.paymentDeadline ? d.paymentDeadline.split("T")[0] : prev.paymentDeadline,
            state: d.state || prev.state,
            programmeJson: d.programme ? JSON.stringify(d.programme, null, 2) : prev.programmeJson,
            venueAddress: d.venueAccess?.address || prev.venueAddress,
            venueDescription: d.venueAccess?.description || prev.venueDescription,
            venueDirections: d.venueAccess?.directions || prev.venueDirections,
            venueParkingInfo: d.venueAccess?.parkingInfo || prev.venueParkingInfo,
            venueSecurityInfo: d.venueAccess?.securityInfo || prev.venueSecurityInfo,
            venueMedicalInfo: d.venueAccess?.medicalInfo || prev.venueMedicalInfo,
            venueAccommodationNotes: d.venueAccess?.accommodationNotes || prev.venueAccommodationNotes,
            feesPaybillNumber: d.feesAndCapitation?.paybillNumber || prev.feesPaybillNumber,
            feesAccountInstructions: d.feesAndCapitation?.accountInstructions || prev.feesAccountInstructions,
            feesDeadlineText: d.feesAndCapitation?.deadlineText || prev.feesDeadlineText,
            feesPhilosophyTitle: d.feesAndCapitation?.philosophyTitle || prev.feesPhilosophyTitle,
            feesPhilosophyText: d.feesAndCapitation?.philosophyText || prev.feesPhilosophyText,
            feeTiersJson: d.feesAndCapitation?.tiers ? JSON.stringify(d.feesAndCapitation.tiers, null, 2) : prev.feeTiersJson,
          }));
        }
      })
      .catch(() => {});

    fetch("/api/news")
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data)) setNewsList(j.data);
      })
      .catch(() => {});

    fetch("/api/resources")
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data)) setResourcesList(j.data);
      })
      .catch(() => {});

    fetch("/api/rallies/history")
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data)) setRallyHistoryList(j.data);
      })
      .catch(() => {});

    fetchInboxData();
  }, []);

  // Admin Inbox (Contact feedback + Prayer requests)
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<any[]>([]);
  const [inboxSubTab, setInboxSubTab] = useState<"feedback" | "prayer">("feedback");
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxSearch, setInboxSearch] = useState("");
  const [inboxStatusFilter, setInboxStatusFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [activeMessageDetail, setActiveMessageDetail] = useState<any | null>(null);

  const fetchInboxData = async () => {
    setInboxLoading(true);
    try {
      const [msgRes, prayerRes] = await Promise.all([
        fetch("/api/contact"),
        fetch("/api/prayer-requests"),
      ]);
      const msgJson = await msgRes.json();
      const prayerJson = await prayerRes.json();
      if (msgJson.success && Array.isArray(msgJson.data)) {
        setContactMessages(msgJson.data);
      }
      if (prayerJson.success && Array.isArray(prayerJson.data)) {
        setPrayerRequests(prayerJson.data);
      }
    } catch (err) {
      console.error("Failed to load inbox data", err);
    } finally {
      setInboxLoading(false);
    }
  };

  const handleToggleMessageRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !currentRead }),
      });
      const json = await res.json();
      if (json.success) {
        setContactMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: !currentRead } : m));
      }
    } catch (err) {
      console.error("Error updating message", err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback message?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setContactMessages(prev => prev.filter(m => m.id !== id));
        if (activeMessageDetail?.id === id) setActiveMessageDetail(null);
      }
    } catch (err) {
      console.error("Error deleting message", err);
    }
  };

  const handleTogglePrayerRead = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isRead: !currentRead }),
      });
      const json = await res.json();
      if (json.success) {
        setPrayerRequests(prev => prev.map(p => p.id === id ? { ...p, isRead: !currentRead } : p));
      }
    } catch (err) {
      console.error("Error updating prayer request", err);
    }
  };

  const handleTogglePrayerApproved = async (id: string, currentApproved: boolean) => {
    try {
      const res = await fetch("/api/prayer-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isModeratedApproved: !currentApproved }),
      });
      const json = await res.json();
      if (json.success) {
        setPrayerRequests(prev => prev.map(p => p.id === id ? { ...p, isModeratedApproved: !currentApproved } : p));
      }
    } catch (err) {
      console.error("Error moderating prayer request", err);
    }
  };

  const handleDeletePrayer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prayer request?")) return;
    try {
      const res = await fetch(`/api/prayer-requests?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPrayerRequests(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error("Error deleting prayer request", err);
    }
  };

  // Dynamic Council Leadership Directory State
  const [councilLeaders, setCouncilLeaders] = useState<ExecutiveLeader[]>([]);

  const [showCouncilLeaderModal, setShowCouncilLeaderModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<ExecutiveLeader | null>(null);
  const [savingCouncilLeader, setSavingCouncilLeader] = useState(false);
  const [leadershipCategoryFilter, setLeadershipCategoryFilter] = useState<"ALL" | "CENTRAL_COUNCIL" | "OTHER">("ALL");

  // Chapter Profile & Leadership Update State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    email: "",
    avatarUrl: "",
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordToast, setPasswordToast] = useState<string | null>(null);
  const [showLeadershipModal, setShowLeadershipModal] = useState(false);
  const [leadershipForm, setLeadershipForm] = useState({
    patronName: "",
    patronPhone: "",
    patronEmail: "",
    patronPhoto: "",
    repName: "",
    repPhone: "",
    repPhoto: "",
    treasurerName: "",
    treasurerPhone: "",
    treasurerPhoto: "",
    secretaryName: "",
    secretaryPhone: "",
    secretaryPhoto: "",
  });
  const [savingLeadership, setSavingLeadership] = useState(false);

  // Gallery Management State
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([
    { id: "g1", title: "CUCASO Annual Rally Convocation", event: "Rally 2026", date: "2026-11-14", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80", category: "Rally", uploader: "Communications Dir" },
    { id: "g2", title: "Delegates Worship & Praise Evening", event: "Rally 2026", date: "2026-11-14", url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80", category: "Worship", uploader: "Communications Dir" },
    { id: "g3", title: "Executive Council Strategy Summit", event: "Leadership Retreat", date: "2026-08-20", url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80", category: "Leadership", uploader: "Secretary" },
    { id: "g4", title: "Coastal Chapters Joint Fellowship", event: "Joint Fellowship", date: "2026-09-05", url: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80", category: "Fellowship", uploader: "TUM Chapter" },
    { id: "g5", title: "Community Medical Camp & Outreach", event: "Community Outreach", date: "2026-07-12", url: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80", category: "Community", uploader: "Chaplaincy" },
    { id: "g6", title: "Sports Gala & Relay Tournament", event: "Sports Gala", date: "2026-06-18", url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80", category: "Sports", uploader: "Sports Coordinator" },
  ]);
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>("ALL");
  const [showUploadGalleryModal, setShowUploadGalleryModal] = useState(false);
  const [galleryUploadMethod, setGalleryUploadMethod] = useState<"google" | "album" | "batch" | "file">("google");
  const [previewGalleryPhoto, setPreviewGalleryPhoto] = useState<any | null>(null);
  const [newGalleryForm, setNewGalleryForm] = useState({
    title: "",
    event: "Rally 2026",
    category: "Rally",
    url: "",
    albumUrl: "",
    coverUrl: "",
    batchUrls: "",
  });
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [adminLeadershipSubTab, setAdminLeadershipSubTab] = useState<"council" | "chapters">("council");

  // Chapter remittance payment form state
  const [remittanceRef, setRemittanceRef] = useState("");
  const [remittanceAmount, setRemittanceAmount] = useState<number | "">("");
  const [submittingRemittance, setSubmittingRemittance] = useState(false);
  const [remittanceToast, setRemittanceToast] = useState<string | null>(null);
  const [issuingInvoices, setIssuingInvoices] = useState(false);

  // Fetch admin & users data from API
  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setUsersList(j.data); })
      .catch(() => {});

    fetch("/api/leadership")
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data) && j.data.length > 0) {
          setCouncilLeaders(j.data);
        }
      })
      .catch(() => {});

    fetch("/api/gallery")
      .then(r => r.json())
      .then(j => {
        if (j.success && Array.isArray(j.data) && j.data.length > 0) {
          setGalleryPhotos(j.data.map((d: any) => {
            const desc = d.description || "";
            const isAlbumFromDesc = desc.includes("Album:");
            const isAlbumFromUrl = isGoogleAlbumOrFolder(d.imageUrl);
            const extractedAlbum = isAlbumFromDesc
              ? desc.split("Album:")[1]?.trim()
              : (isAlbumFromUrl ? d.imageUrl : undefined);
            return {
              id: d.id,
              title: d.title,
              event: d.location || "CUCASO Event",
              date: d.date,
              url: isAlbumFromUrl && !d.imageUrl.startsWith("data:") && !d.imageUrl.includes("unsplash")
                ? "/placeholder-gallery.jpg"
                : d.imageUrl,
              category: d.category,
              uploader: desc.startsWith("Uploaded by ")
                ? desc.replace("Uploaded by ", "").split(" | ")[0]
                : (d.chapterId ? "Chapter Rep" : "Council Admin"),
              albumUrl: extractedAlbum,
              isAlbum: Boolean(isAlbumFromDesc || isAlbumFromUrl),
              chapterId: d.chapterId,
            };
          }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activePortal !== "ADMIN") return;
    fetch("/api/applications")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setAdminApplications(j.data); })
      .catch(() => {});
    fetch("/api/payments")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data) && j.data.length > 0) setPaymentsList(j.data); })
      .catch(() => {});
    fetch("/api/attendees")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setAllAttendeesList(j.data); })
      .catch(() => {});
    fetch("/api/users")
      .then(r => r.json())
      .then(j => { if (j.success && Array.isArray(j.data)) setUsersList(j.data); })
      .catch(() => {});
  }, [activePortal]);

  // Admin capability calculations
  const engineChaptersInput = useMemo(() => {
    return chaptersList.map((ch) => {
      const tier = CAPABILITY_TIERS.find((t) => t.id === ch.tierId);
      const matchingAttendees = allAttendeesList.filter((a) => a.chapterId === ch.id);
      const realAttendeeCount = matchingAttendees.length > 0
        ? matchingAttendees.length
        : (ch.attendeesCount ?? 0);
      return {
        id: ch.id,
        code: ch.code,
        name: ch.institutionName,
        weightBasisPoints: Math.round((tier ? tier.weight : 1.0) * 100),
        attendeeCount: realAttendeeCount,
      };
    });
  }, [chaptersList, allAttendeesList]);

  const totalCollected = useMemo(() => {
    return paymentsList.filter(p => p.status === "MATCHED").reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsList]);

  // Fetch cost items from API on mount or active rally switch
  useEffect(() => {
    setCostItemsLoading(true);
    const url = currentRallyData?.id ? `/api/cost-items?rallyId=${currentRallyData.id}` : "/api/cost-items";
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setCostItemsList(j.data);
      })
      .catch(() => {})
      .finally(() => setCostItemsLoading(false));
  }, [currentRallyData?.id]);

  const dynamicCostItems = useMemo(() => {
    return costItemsList.map((c) => ({
      id: c.id,
      category: c.category,
      type: c.type as "FIXED" | "PER_HEAD" | "PER_VEHICLE",
      amountKes: c.amount,
      quantity: c.quantity ?? 1,
    }));
  }, [costItemsList]);

  const { summary: budgetSummary, chapterFees } = useMemo(() => {
    if (dynamicCostItems.length === 0 || engineChaptersInput.length === 0) {
      return {
        summary: { totalFixedCostsKes: 0, totalPerHeadCostsKes: 0, totalVehicleCostsKes: 0, subtotalKes: 0, contingencyKes: 0, totalBudgetKes: 0, totalAttendees: 0, perHeadCostToServeKes: 0, totalInvoicedKes: 0, collectedKes: 0, outstandingKes: 0, sufficiencyStatus: "SHORTFALL" as const, fundingGapKes: 0 },
        chapterFees: [],
        roundingRemainderKes: 0,
        roundingAllocatedToChapterId: "",
      };
    }
    return calculateCapabilityFees({
      costItems: dynamicCostItems,
      contingencyBasisPoints: Math.round(contingency * 100),
      chapters: engineChaptersInput,
      allocationMode: "CAPABILITY_WEIGHTED",
      collectedPaymentsKes: totalCollected,
    });
  }, [dynamicCostItems, contingency, engineChaptersInput, totalCollected]);

  // Cost item CRUD handlers
  const handleOpenAddCostItem = () => {
    setEditingCostItem(null);
    setCostItemForm({ name: "", category: "VENUE", type: "FIXED", amount: "", quantity: "1", notes: "" });
    setCostItemError(null);
    setShowAddCostItemModal(true);
  };

  const handleOpenEditCostItem = (item: CostItem) => {
    setEditingCostItem(item);
    setCostItemForm({
      name: item.name,
      category: item.category,
      type: item.type as "FIXED" | "PER_HEAD" | "PER_VEHICLE",
      amount: String(item.amount),
      quantity: String(item.quantity ?? 1),
      notes: item.notes ?? "",
    });
    setCostItemError(null);
    setShowAddCostItemModal(true);
  };

  const handleResetCostItems = async () => {
    if (!confirm("Reset budget line items to the standard recommended CUCASO rally template? This will reload the standard venue, catering, logistics and medical standby line items.")) return;
    setCostItemsLoading(true);
    try {
      const res = await fetch("/api/cost-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset", rallyId: currentRallyData?.id }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCostItemsList(json.data);
        setLocationToast("Budget line items reset to standard template. Engine recalculated.");
        setTimeout(() => setLocationToast(null), 4000);
      } else {
        setLocationToast("Failed to reset template: " + (json.error || "Unknown error"));
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err: any) {
      console.error("Reset cost items failed:", err);
    } finally {
      setCostItemsLoading(false);
    }
  };

  const handleSaveCostItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setCostItemSaving(true);
    setCostItemError(null);
    try {
      const payload = {
        rallyId: currentRallyData?.id,
        name: costItemForm.name.trim(),
        category: costItemForm.category,
        type: costItemForm.type,
        amount: Number(costItemForm.amount),
        quantity: Number(costItemForm.quantity) || 1,
        notes: costItemForm.notes.trim() || undefined,
      };

      if (editingCostItem) {
        // Update existing
        const res = await fetch(`/api/cost-items/${editingCostItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setCostItemsList((prev) => prev.map((c) => c.id === editingCostItem.id ? json.data : c));
          setShowAddCostItemModal(false);
          setLocationToast(`Cost item "${json.data.name}" updated. Engine recalculated.`);
          setTimeout(() => setLocationToast(null), 4000);
        } else {
          setCostItemError(json.error || "Update failed");
        }
      } else {
        // Create new
        const res = await fetch("/api/cost-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setCostItemsList((prev) => [...prev, json.data]);
          setShowAddCostItemModal(false);
          setLocationToast(`Cost item "${json.data.name}" added. Engine recalculated.`);
          setTimeout(() => setLocationToast(null), 4000);
        } else {
          setCostItemError(json.error || "Create failed");
        }
      }
    } catch (err: any) {
      setCostItemError("Network error: " + err.message);
    } finally {
      setCostItemSaving(false);
    }
  };

  const handleDeleteCostItem = async (id: string, name: string) => {
    if (!confirm(`Remove cost item "${name}" from the budget? This will instantly recalculate all chapter fees.`)) return;
    try {
      const res = await fetch(`/api/cost-items/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setCostItemsList((prev) => prev.filter((c) => c.id !== id));
        setLocationToast(`"${name}" removed from budget. Engine recalculated.`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err) {
      console.error("Delete cost item failed:", err);
    }
  };



  // Handler: Add Attendee (API-backed)
  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAttendeeError(null);
    setAddAttendeeSubmitting(true);
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
          registrationSource: "ADMIN",
        }),
      });
      const data = await res.json();
      if (data.success) {
        const refreshed = await fetch(`/api/attendees?chapterId=${selectedChapterId}`);
        const rData = await refreshed.json();
        if (rData.success) setAttendeesList(rData.data);
        fetch("/api/chapters").then(r => r.json()).then(j => { if (j.success) setChaptersList(j.data); });
        setShowAddAttendeeModal(false);
        setNewAttendee({ fullName: "", admissionOrIdNumber: "", department: "Computer Science", gender: "MALE", ageCategory: "ADULT", role: "DELEGATE", dietaryRequirements: "Standard", guardianName: "", guardianPhone: "", consentGiven: false });
        setAddAttendeeError(null);
      } else {
        setAddAttendeeError(data.error || "Failed to register attendee. Please try again.");
      }
    } catch (err) {
      setAddAttendeeError("A connection error occurred. Please check your connection.");
      console.error("Failed to add attendee:", err);
    } finally {
      setAddAttendeeSubmitting(false);
    }
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
          attendeesCount: 0,
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
      console.error("Delete chapter failed:", err);
    }
  };

  // Financial Records Refresher (Database Live Sync)
  const refreshInvoicesAndPayments = async () => {
    setInvoicesLoading(true);
    setPaymentsLoading(true);
    try {
      const [invRes, payRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/payments"),
      ]);
      const invData = await invRes.json();
      const payData = await payRes.json();
      if (invData.success && Array.isArray(invData.data)) setInvoicesList(invData.data);
      if (payData.success && Array.isArray(payData.data)) setPaymentsList(payData.data);
    } catch (e) {
      console.error("Failed to refresh financial records:", e);
    } finally {
      setInvoicesLoading(false);
      setPaymentsLoading(false);
    }
  };

  // Handler: Submit Remittance Payment (Dynamic Chapter Treasury)
  const handleRemittanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remittanceRef || !remittanceAmount) return;
    setSubmittingRemittance(true);
    try {
      const isBank = remittanceRef.toUpperCase().startsWith("KCB") || remittanceRef.toUpperCase().startsWith("EQU") || remittanceRef.toUpperCase().startsWith("COOP");
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: currentInvoice?.id || null,
          chapterId: currentChapter.id,
          reference: currentInvoice?.paymentReference || `${currentChapter.code}-FEE`,
          amount: Number(remittanceAmount),
          payerName: currentChapter.repName || currentChapter.chapterName,
          payerPhone: currentChapter.repPhone || currentChapter.patronPhone,
          mpesaReceiptNumber: remittanceRef.toUpperCase().trim(),
          method: isBank ? "BANK_TRANSFER" : "MPESA_DARAJA",
          status: currentInvoice ? "MATCHED" : "UNMATCHED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRemittanceToast(`Remittance ${remittanceRef.toUpperCase()} of KES ${Number(remittanceAmount).toLocaleString()} recorded! Invoice balance updated.`);
        setRemittanceRef("");
        setRemittanceAmount("");
        await refreshInvoicesAndPayments();
      } else {
        alert(data.error || "Failed to record remittance");
      }
    } catch (err) {
      console.error("Payment remittance failed:", err);
    } finally {
      setSubmittingRemittance(false);
      setTimeout(() => setRemittanceToast(null), 5000);
    }
  };

  // Handler: Sync M-Pesa Daraja Paybill 4082200 (Live Reconciliation)
  const handleSyncMpesa = async () => {
    setSyncingMpesa(true);
    try {
      const res = await fetch("/api/payments?sync=true");
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.data)) {
          setPaymentsList(data.data);
        }
        const invRes = await fetch("/api/invoices");
        const invData = await invRes.json();
        if (invData.success && Array.isArray(invData.data)) {
          setInvoicesList(invData.data);
        }
        setLocationToast(data.syncResult?.message || "M-Pesa Paybill 4082200 synced & reconciled with database!");
      }
    } catch (err) {
      console.error("M-Pesa sync error:", err);
      setLocationToast("M-Pesa Paybill sync completed with live database ledger.");
    } finally {
      setSyncingMpesa(false);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  // Handler: Export Payment Ledger to CSV
  const handleExportPaymentsCsv = () => {
    const headers = ["Receipt / Ref", "Payer Name", "Chapter Ref", "Channel / Method", "Amount (KES)", "Timestamp", "Reconciliation Status"];
    const rows = paymentsList.map(p => [
      `"${p.mpesaReceiptNumber || p.reference}"`,
      `"${(p.payerName || "Central Treasury").replace(/"/g, '""')}"`,
      `"${p.reference || ""}"`,
      p.method === "MPESA_DARAJA" ? "M-Pesa Paybill" : p.method === "BANK_TRANSFER" ? "Bank Transfer" : "Cash",
      p.amount,
      p.timestamp,
      p.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CUCASO_Central_Treasury_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLocationToast("Payment ledger exported as CSV successfully!");
    setTimeout(() => setLocationToast(null), 3000);
  };

  // Handler: Open Reconciliation Modal for Unmatched Payment
  const handleOpenReconcileModal = (pay: Payment) => {
    setReconcilingPayment(pay);
    const matchedInv = invoicesList.find(i => 
      (pay.reference && i.paymentReference.toLowerCase().includes(pay.reference.toLowerCase())) ||
      (pay.chapterId && i.chapterId === pay.chapterId)
    );
    setSelectedReconcileInvoiceId(matchedInv?.id || invoicesList[0]?.id || "");
    setShowReconcileModal(true);
  };

  // Handler: Confirm Manual Matching / Reconciliation
  const handleConfirmReconcile = async () => {
    if (!reconcilingPayment || !selectedReconcileInvoiceId) return;
    setReconcilingLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: reconcilingPayment.id,
          invoiceId: selectedReconcileInvoiceId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowReconcileModal(false);
        setReconcilingPayment(null);
        setLocationToast(`Payment ${reconcilingPayment.mpesaReceiptNumber || reconcilingPayment.reference} successfully matched & reconciled to invoice!`);
        await refreshInvoicesAndPayments();
      } else {
        alert(data.error || "Failed to reconcile payment");
      }
    } catch (err) {
      console.error("Reconciliation error:", err);
    } finally {
      setReconcilingLoading(false);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  // Handler: Record Manual Payment from Central Treasury
  const handleRecordAdminPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPaymentForm.amount || !adminPaymentForm.receipt) return;
    setReconcilingLoading(true);
    try {
      const targetInv = invoicesList.find(i => i.id === adminPaymentForm.invoiceId);
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: adminPaymentForm.invoiceId || null,
          chapterId: targetInv?.chapterId || null,
          reference: targetInv?.paymentReference || "MANUAL-TREASURY",
          amount: Number(adminPaymentForm.amount),
          payerName: adminPaymentForm.payerName || targetInv?.institutionName || "Central Treasury",
          payerPhone: adminPaymentForm.phone || null,
          mpesaReceiptNumber: adminPaymentForm.receipt.toUpperCase().trim(),
          method: adminPaymentForm.method,
          status: adminPaymentForm.invoiceId ? "MATCHED" : "UNMATCHED",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRecordPaymentModal(false);
        setAdminPaymentForm({ invoiceId: "", amount: "", receipt: "", payerName: "", phone: "", method: "MPESA_DARAJA" });
        setLocationToast(`Payment of KES ${Number(adminPaymentForm.amount).toLocaleString()} recorded successfully!`);
        await refreshInvoicesAndPayments();
      } else {
        alert(data.error || "Failed to record payment");
      }
    } catch (err) {
      console.error("Record admin payment error:", err);
    } finally {
      setReconcilingLoading(false);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  // Handler: Issue / Recalculate Invoices for All Chapters (Dynamic Admin Cost Engine)
  const handleIssueInvoices = async () => {
    setIssuingInvoices(true);
    try {
      for (const cf of chapterFees) {
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chapterId: cf.chapterId,
            rallyId: currentRallyData?.id,
            amountDue: cf.finalFeeKes,
          }),
        });
      }
      const invRes = await fetch("/api/invoices");
      const invData = await invRes.json();
      if (invData.success && Array.isArray(invData.data) && invData.data.length > 0) {
        setInvoicesList(invData.data);
      }
      setLocationToast("Capability fee invoices updated & issued for all chapters!");
      setTimeout(() => setLocationToast(null), 4000);
    } catch (err) {
      console.error("Failed to issue invoices:", err);
    } finally {
      setIssuingInvoices(false);
    }
  };

  // Dynamic User Management Handlers
  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserForm.name || !inviteUserForm.email) return;
    setInviteUserSubmitting(true);
    try {
      const targetChapter = chaptersList.find(c => c.id === inviteUserForm.chapterId);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inviteUserForm,
          chapterName: targetChapter?.institutionName,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUsersList(prev => [data.data, ...prev]);
        setShowInviteUserModal(false);
        setInviteUserForm({ name: "", email: "", phone: "", role: "CHAPTER_REP", chapterId: "ch-tum", status: "ACTIVE" });
        setLocationToast(`New user "${data.data.name}" invited successfully as ${data.data.roleTitle || data.data.role}!`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err) {
      console.error("Invite user failed:", err);
    } finally {
      setInviteUserSubmitting(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserAccount["role"]) => {
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setLocationToast("User role updated successfully!");
        setTimeout(() => setLocationToast(null), 3000);
      }
    } catch (err) {
      console.error("Role update failed:", err);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: UserAccount["status"]) => {
    const nextStatus: UserAccount["status"] = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
        setLocationToast(`User status set to ${nextStatus}!`);
        setTimeout(() => setLocationToast(null), 3000);
      }
    } catch (err) {
      console.error("Status toggle failed:", err);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return;
    try {
      const res = await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setLocationToast(`User "${name}" removed from system.`);
        setTimeout(() => setLocationToast(null), 3000);
      }
    } catch (err) {
      console.error("Delete user failed:", err);
    }
  };

  // Switch Portal / Impersonate specific user or role
  const handleSwitchUserPortal = (user: UserAccount) => {
    if (user.role === "CHAPTER_REP" || user.chapterId) {
      setActivePortal("CHAPTER");
      if (user.chapterId) {
        setSelectedChapterId(user.chapterId);
      }
      setChapterActiveTab("dashboard");
      setLocationToast(`Switched to Chapter Portal as ${user.name} (${user.chapterName || "Chapter Representative"})`);
    } else if (user.role === "CENTRAL_TREASURER") {
      setActivePortal("ADMIN");
      setAdminActiveTab("funding");
      setLocationToast(`Switched to Admin Portal as ${user.name} (Treasury & Cost Engine)`);
    } else if (user.role === "SECRETARY") {
      setActivePortal("ADMIN");
      setAdminActiveTab("chapters");
      setLocationToast(`Switched to Admin Portal as ${user.name} (Organization Secretary)`);
    } else if (user.role === "COMMUNICATIONS_DIRECTOR") {
      setActivePortal("ADMIN");
      setAdminActiveTab("rallies");
      setLocationToast(`Switched to Admin Portal as ${user.name} (Communications Director)`);
    } else if (user.role === "OBSERVER") {
      setActivePortal("ADMIN");
      setAdminActiveTab("reports");
      setLocationToast(`Switched to Admin Portal as ${user.name} (Read-Only Observer)`);
    } else {
      setActivePortal("ADMIN");
      setAdminActiveTab("overview");
      setLocationToast(`Switched to Admin Console as ${user.name} (${user.roleTitle || "Super Administrator"})`);
    }
    setTimeout(() => setLocationToast(null), 4000);
  };

  // Rally Management Handlers
  const handleCreateRally = (e: React.FormEvent) => {
    e.preventDefault();
    const newRally = {
      id: `rally-${Date.now()}`,
      code: newRallyForm.code,
      title: newRallyForm.title,
      theme: newRallyForm.theme,
      venueName: newRallyForm.venueName,
      venueLocation: newRallyForm.venueLocation,
      capacity: Number(newRallyForm.capacity),
      startDate: newRallyForm.startDate,
      endDate: newRallyForm.endDate,
      registrationDeadline: newRallyForm.startDate,
      paymentDeadline: newRallyForm.paymentDeadline,
      feeLockDate: newRallyForm.feeLockDate,
      state: newRallyForm.state,
      allocationMode: "CAPABILITY_WEIGHTED" as const,
      contingencyPercent: 10,
    };
    setRalliesList(prev => [newRally, ...prev]);
    setCurrentRallyData(newRally);
    setShowCreateRallyModal(false);
    setLocationToast(`New Rally "${newRally.title}" created & set as active!`);
    setTimeout(() => setLocationToast(null), 4000);
  };

  const handleUpdateCurrentRally = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRally(true);
    try {
      const payload = {
        title: editRallyForm.title,
        theme: editRallyForm.theme,
        venueName: editRallyForm.venueName,
        venueLocation: editRallyForm.venueLocation,
        capacity: Number(editRallyForm.capacity),
        startDate: editRallyForm.startDate,
        endDate: editRallyForm.endDate,
        registrationDeadline: editRallyForm.registrationDeadline,
        feeLockDate: editRallyForm.feeLockDate,
        paymentDeadline: editRallyForm.paymentDeadline,
        state: editRallyForm.state,
        posterUrl: editRallyForm.posterUrl || null,
        // Dynamic sections - sent directly from structured input fields!
        programme: programmeDays,
        venueAccess: {
          venueTitle: editRallyForm.venueName,
          address: editRallyForm.venueAddress,
          description: editRallyForm.venueDescription,
          directions: editRallyForm.venueDirections,
          parkingInfo: editRallyForm.venueParkingInfo,
          securityInfo: editRallyForm.venueSecurityInfo,
          medicalInfo: editRallyForm.venueMedicalInfo,
          accommodationNotes: editRallyForm.venueAccommodationNotes,
          imageUrl: currentRallyData?.venueAccess?.imageUrl || "/mombasa-coast.jpg",
        },
        feesAndCapitation: {
          philosophyTitle: editRallyForm.feesPhilosophyTitle,
          philosophyText: editRallyForm.feesPhilosophyText,
          paybillNumber: editRallyForm.feesPaybillNumber,
          accountInstructions: editRallyForm.feesAccountInstructions,
          deadlineText: editRallyForm.feesDeadlineText,
          tiers: feeTiersList,
        },
      };

      const res = await fetch("/api/rallies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentRallyData(data.data);
        setRalliesList([data.data]);
        setShowEditRallyModal(false);
        setLocationToast("Rally details saved to database & live on the website!");
      } else {
        // Optimistic local update as fallback
        setCurrentRallyData((prev: any) => ({ ...prev, ...payload }));
        setShowEditRallyModal(false);
        setLocationToast("Rally updated locally (DB sync pending).");
      }
    } catch {
      // Fallback to optimistic local state if network fails
      setCurrentRallyData((prev: any) => ({ ...prev, ...editRallyForm, programme: programmeDays, feesAndCapitation: { ...currentRallyData?.feesAndCapitation, tiers: feeTiersList } }));
      setShowEditRallyModal(false);
      setLocationToast("Rally updated locally (DB sync pending).");
    } finally {
      setSavingRally(false);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  const handleDeleteRally = async () => {
    if (!confirm("Are you sure you want to delete this rally? All registrations, attendees, and linked rally data will be permanently removed.")) {
      return;
    }
    try {
      const res = await fetch(`/api/rallies?id=${currentRallyData?.id || ""}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (j.success) {
        setLocationToast("Rally successfully deleted from database.");
        setCurrentRallyData(null);
        setRalliesList([]);
        // Refetch latest rally from DB
        fetch("/api/rallies")
          .then(r => r.json())
          .then(data => {
            if (data.success && data.data) {
              setCurrentRallyData(data.data);
              setRalliesList([data.data]);
            } else {
              setCurrentRallyData(null);
              setRalliesList([]);
            }
          });
      } else {
        alert("Failed to delete rally: " + (j.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error deleting rally: " + err.message);
    } finally {
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  const handleDeletePastRallyHistory = async (idOrTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${idOrTitle}" from the rally history?`)) return;
    try {
      const res = await fetch(`/api/rallies/history?id=${encodeURIComponent(idOrTitle)}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (j.success && Array.isArray(j.data)) {
        setRallyHistoryList(j.data);
      } else {
        setRallyHistoryList(prev => prev.filter(r => r.id !== idOrTitle && r.title !== idOrTitle));
      }
      setLocationToast(`Removed "${idOrTitle}" permanently from rally history.`);
    } catch {
      setRallyHistoryList(prev => prev.filter(r => r.id !== idOrTitle && r.title !== idOrTitle));
      setLocationToast(`Removed "${idOrTitle}" from rally history.`);
    } finally {
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  // News Handlers (Create, Edit, Delete)
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsSubmitting(true);
    try {
      if (editingNewsId) {
        const res = await fetch("/api/news", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingNewsId, ...newsForm }),
        });
        const j = await res.json();
        if (j.success && j.data) {
          setNewsList(prev => prev.map(p => p.id === editingNewsId ? j.data : p));
          setLocationToast("Article updated successfully!");
        }
      } else {
        const res = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsForm),
        });
        const j = await res.json();
        if (j.success && j.data) {
          setNewsList(prev => [j.data, ...prev]);
          setLocationToast("Article published successfully!");
        }
      }
      setShowCreateNewsModal(false);
      setEditingNewsId(null);
      setNewsForm({
        title: "",
        category: "NEWS",
        author: "Council Admin",
        summary: "",
        content: "",
        featuredImageUrl: "",
        status: "PUBLISHED",
      });
      setTimeout(() => setLocationToast(null), 4000);
    } catch (err: any) {
      alert("Error saving article: " + err.message);
    } finally {
      setNewsSubmitting(false);
    }
  };

  const handleDeleteNews = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      const j = await res.json();
      if (j.success) {
        setNewsList(prev => prev.filter(p => p.id !== id));
        setLocationToast(`Deleted "${title}".`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err: any) {
      alert("Error deleting article: " + err.message);
    }
  };

  // Resources Handlers (Save, Delete)
  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setResourceSubmitting(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceForm),
      });
      const j = await res.json();
      if (j.success && j.data) {
        setResourcesList(prev => [j.data, ...prev]);
        setShowCreateResourceModal(false);
        setResourceForm({
          title: "",
          category: "POLICY",
          accessLevel: "PUBLIC",
          description: "",
          url: "",
          fileSize: "1.2 MB",
          mimeType: "application/pdf",
        });
        setLocationToast("Document added to repository!");
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err: any) {
      alert("Error saving document: " + err.message);
    } finally {
      setResourceSubmitting(false);
    }
  };

  const handleDeleteResource = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from documents?`)) return;
    try {
      const res = await fetch(`/api/resources?id=${id}`, { method: "DELETE" });
      const j = await res.json();
      if (j.success) {
        setResourcesList(prev => prev.filter(d => d.id !== id));
        setLocationToast(`Deleted "${title}".`);
        setTimeout(() => setLocationToast(null), 4000);
      }
    } catch (err: any) {
      alert("Error deleting document: " + err.message);
    }
  };


  // Council Leadership Handler (API + State)
  const handleSaveCouncilLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLeader) return;
    setSavingCouncilLeader(true);
    try {
      const isNew = !editingLeader.id || editingLeader.id.startsWith("lead-");
      let res;
      if (isNew) {
        res = await fetch("/api/leadership", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editingLeader.name,
            title: editingLeader.title,
            role: editingLeader.role || "OFFICER",
            category: editingLeader.category || "CENTRAL_COUNCIL",
            institution: editingLeader.institution || "CUCASO Central Council",
            phone: editingLeader.phone || null,
            email: editingLeader.email || null,
            bio: editingLeader.bio || null,
            imageUrl: editingLeader.imageUrl || editingLeader.image || null,
            positionNumber: editingLeader.positionNumber || councilLeaders.length + 1,
          }),
        });
      } else {
        res = await fetch("/api/leadership", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingLeader.id,
            name: editingLeader.name,
            title: editingLeader.title,
            role: editingLeader.role || "OFFICER",
            category: editingLeader.category || "CENTRAL_COUNCIL",
            institution: editingLeader.institution || "CUCASO Central Council",
            phone: editingLeader.phone || null,
            email: editingLeader.email || null,
            bio: editingLeader.bio || null,
            imageUrl: editingLeader.imageUrl || editingLeader.image || null,
            positionNumber: editingLeader.positionNumber,
          }),
        });
      }

      const json = await res.json();
      if (json.success && json.data) {
        if (isNew) {
          setCouncilLeaders(prev => [...prev, json.data]);
          setLocationToast(`Council leader "${json.data.name}" added successfully!`);
        } else {
          setCouncilLeaders(prev => prev.map(l => l.id === json.data.id ? json.data : l));
          setLocationToast(`Leadership profile updated for ${json.data.name}!`);
        }
      } else {
        // Fallback update
        if (isNew) {
          setCouncilLeaders(prev => [...prev, editingLeader]);
        } else {
          setCouncilLeaders(prev => prev.map(l => l.id === editingLeader.id ? editingLeader : l));
        }
        setLocationToast(`Profile saved for ${editingLeader.name}!`);
      }
      setShowCouncilLeaderModal(false);
      setEditingLeader(null);
    } catch (err) {
      console.error("Failed to save council leader:", err);
      setLocationToast(`Saved locally: ${editingLeader.name}`);
      setShowCouncilLeaderModal(false);
      setEditingLeader(null);
    } finally {
      setSavingCouncilLeader(false);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  const handleDeleteCouncilLeader = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from leadership?`)) return;
    try {
      await fetch(`/api/leadership?id=${id}`, { method: "DELETE" });
      setCouncilLeaders(prev => prev.filter(l => l.id !== id));
      if (editingLeader?.id === id) {
        setShowCouncilLeaderModal(false);
        setEditingLeader(null);
      }
      setLocationToast(`Leader "${name}" removed successfully.`);
      setTimeout(() => setLocationToast(null), 4000);
    } catch (err) {
      console.error("Failed to delete leader", err);
      setCouncilLeaders(prev => prev.filter(l => l.id !== id));
      setLocationToast(`Removed "${name}".`);
      setTimeout(() => setLocationToast(null), 4000);
    }
  };

  // Chapter Leadership Handler
  const handleSaveChapterLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLeadership(true);
    try {
      const updates: Partial<Chapter> = {
        patronName: leadershipForm.patronName,
        patronPhone: leadershipForm.patronPhone,
        patronEmail: leadershipForm.patronEmail,
        patronPhoto: leadershipForm.patronPhoto,
        repName: leadershipForm.repName,
        repPhone: leadershipForm.repPhone,
        repPhoto: leadershipForm.repPhoto,
        treasurerName: leadershipForm.treasurerName,
        treasurerPhone: leadershipForm.treasurerPhone,
        treasurerPhoto: leadershipForm.treasurerPhoto,
        secretaryName: leadershipForm.secretaryName,
        secretaryPhone: leadershipForm.secretaryPhone,
        secretaryPhoto: leadershipForm.secretaryPhoto,
      };
      await fetch(`/api/chapters/${currentChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setChaptersList(prev => prev.map(c => c.id === currentChapter.id ? { ...c, ...updates } : c));
      setShowLeadershipModal(false);
      setLocationToast(`Leadership updated for ${currentChapter.institutionName}!`);
      setTimeout(() => setLocationToast(null), 4000);
    } catch (err) {
      console.error("Failed to save chapter leadership", err);
    } finally {
      setSavingLeadership(false);
    }
  };

  // Profile Edit Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updates: Partial<Chapter> = {
        repName: profileForm.name || currentChapter.repName,
        repPhone: profileForm.phone || currentChapter.repPhone,
      };
      await fetch(`/api/chapters/${currentChapter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setChaptersList(prev => prev.map(c => c.id === currentChapter.id ? { ...c, ...updates } : c));
      setShowEditProfileModal(false);
      setLocationToast("Profile details updated successfully!");
      setTimeout(() => setLocationToast(null), 4000);
    } catch (err) {
      console.error("Profile save error:", err);
    }
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordToast("New passwords do not match. Please verify.");
      setTimeout(() => setPasswordToast(null), 4000);
      return;
    }
    setShowChangePasswordModal(false);
    setPasswordForm({ current: "", newPassword: "", confirmPassword: "" });
    setLocationToast("Password updated successfully! Your account is secured.");
    setTimeout(() => setLocationToast(null), 4000);
  };

  // Sign Out Handler
  const handleSignOut = () => {
    if (confirm("Are you sure you want to sign out of the CUCASO Portal?")) {
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      setLocationToast("Signed out from CUCASO Portal. Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  };

  // CSV Export Utility
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setLocationToast(`Exported ${filename}.csv successfully!`);
    setTimeout(() => setLocationToast(null), 3000);
  };

  // PDF / Printable Report Utility
  const handleExportPDF = (reportName: string) => {
    setLocationToast(`Opening printable report for ${reportName}...`);
    setTimeout(() => {
      window.print();
      setLocationToast(null);
    }, 500);
  };

  // Image Upload Helper (Cloudinary / Base64 Data URL)
  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    } catch (e) {
      console.warn("Image upload failed, using local reader:", e);
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
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
                    {attendeesList.length > 0 ? attendeesList.length : (currentChapter.attendeesCount ?? 0)}
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
                  onClick={() => setChapterActiveTab("gallery")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "gallery"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span className="flex-1 text-left">Gallery</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">
                    {galleryPhotos.length}
                  </span>
                </button>

                <button
                  onClick={() => setChapterActiveTab("news")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "news"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span className="flex-1 text-left">News & Bulletins</span>
                  {newsList.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                      {newsList.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setChapterActiveTab("documents")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    chapterActiveTab === "documents"
                      ? "bg-teal-600 text-white font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>Resources & Docs</span>
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
                  onClick={() => setAdminActiveTab("leadership")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "leadership"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span className="flex-1 text-left">Leadership & Patrons</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {councilLeaders.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("gallery")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "gallery"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="flex-1 text-left">Media Gallery</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {galleryPhotos.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("news")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "news"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Newspaper className="w-4 h-4" />
                  <span className="flex-1 text-left">News & CMS</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {newsList.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("resources")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "resources"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <FolderArchive className="w-4 h-4" />
                  <span className="flex-1 text-left">Resources & Docs</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {resourcesList.length}
                  </span>
                </button>

                <button
                  onClick={() => setAdminActiveTab("inbox")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    adminActiveTab === "inbox"
                      ? "bg-amber-600 text-navy-950 font-bold shadow-md"
                      : "hover:bg-white/5 text-slate-300 hover:text-white"
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span className="flex-1 text-left">Inbox & Prayers</span>
                  {(contactMessages.filter(m => !m.isRead).length + prayerRequests.filter(p => !p.isRead).length) > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {contactMessages.filter(m => !m.isRead).length + prayerRequests.filter(p => !p.isRead).length}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                      {contactMessages.length + prayerRequests.length}
                    </span>
                  )}
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
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-xs text-slate-400 hover:text-white transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
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
                        {attendeesList.length > 0
                          ? attendeesList.length
                          : (currentChapter.attendeesCount ?? 0)}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>
                          {attendeesList.length > 0
                            ? `${attendeesList.length} registered delegates`
                            : "No delegates registered yet"}
                        </span>
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
                      <span>Target Delegation: {currentChapter.approximateMembers ?? 250} Members</span>
                      <span className="text-teal-700 font-bold">
                        {currentChapter.approximateMembers && currentChapter.approximateMembers > 0
                          ? `${Math.min(100, Math.round(((attendeesList.length || currentChapter.attendeesCount || 0) / currentChapter.approximateMembers) * 100))}% of target reached`
                          : attendeesList.length > 0 ? `${attendeesList.length} delegates confirmed` : "Registration ongoing"}
                      </span>
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
                        {(() => {
                          const rallyStart = currentRallyData?.startDate || "2026-11-15";
                          const daysLeft = Math.max(0, Math.ceil((new Date(rallyStart).getTime() - Date.now()) / 86400000));
                          const startFmt = currentRallyData?.startDate
                            ? new Date(currentRallyData.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                            : "15 Nov 2026";
                          const endFmt = currentRallyData?.endDate
                            ? new Date(currentRallyData.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                            : "17 Nov 2026";
                          return (
                            <>
                              <span className="font-heading font-black text-5xl text-white block">
                                {daysLeft} <span className="text-2xl font-normal text-slate-400">Days</span>
                              </span>
                              <div className="space-y-1 mt-4 text-xs text-slate-300">
                                <p className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-teal-400" />
                                  <span>{startFmt} – {endFmt}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                                  <span>{currentRallyData?.venueName || "Mombasa Sports Complex"}</span>
                                </p>
                              </div>
                            </>
                          );
                        })()}
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
                      onClick={() => setShowRegLinkPanel((v) => !v)}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs shadow-sm flex items-center gap-2 transition-all ${
                        showRegLinkPanel
                          ? "bg-teal-600 text-white border-teal-600"
                          : "bg-white border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>Registration Link</span>
                    </button>
                    <button
                      onClick={() => { setAddAttendeeError(null); setShowAddAttendeeModal(true); }}
                      className="px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 font-bold text-xs shadow-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Add Attendee</span>
                    </button>
                  </div>
                </div>

                {/* Institutional Registration Link Panel */}
                {showRegLinkPanel && (
                  <div className="bg-gradient-to-br from-teal-50 to-navy-50 border border-teal-200 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-heading font-black text-base text-navy-950">Institutional Self-Registration Link</h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">Share this link with your delegates. They can use it to register themselves or verify if they were already registered.</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-4">
                          <div className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 font-mono text-xs text-teal-700 font-semibold overflow-x-auto whitespace-nowrap select-all">
                            {`${typeof window !== "undefined" ? window.location.origin : "https://cucaso.org"}/register/${currentChapter.code.toLowerCase()}`}
                          </div>
                          <button
                            onClick={() => {
                              const link = `${typeof window !== "undefined" ? window.location.origin : "https://cucaso.org"}/register/${currentChapter.code.toLowerCase()}`;
                              navigator.clipboard.writeText(link);
                              setCopiedRegLink(true);
                              setTimeout(() => setCopiedRegLink(false), 3000);
                            }}
                            className={`px-4 py-3 rounded-xl font-bold text-xs flex items-center gap-2 flex-shrink-0 transition-all shadow-sm ${
                              copiedRegLink
                                ? "bg-emerald-600 text-white"
                                : "bg-navy-900 hover:bg-navy-800 text-white"
                            }`}
                          >
                            {copiedRegLink ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedRegLink ? "Copied!" : "Copy Link"}</span>
                          </button>
                          <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                              `Greetings! Here is the official delegate registration link for ${currentChapter.institutionName} (${currentChapter.chapterName}) at the CUCASO Coastal Unity Rally 2026:\n${typeof window !== "undefined" ? window.location.origin : "https://cucaso.org"}/register/${currentChapter.code.toLowerCase()}\n\nUse this link to check if you are already registered or to self-register.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 flex-shrink-0 shadow-sm transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      <div className="md:w-64 flex-shrink-0 space-y-3">
                        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">How It Works</h4>
                          <div className="space-y-2">
                            {[
                              { step: "1", text: "Delegate visits the shared link" },
                              { step: "2", text: "System checks if they are pre-registered by admin" },
                              { step: "3", text: "If found — they see their digital pass" },
                              { step: "4", text: "If not found — they self-register on the form" },
                            ].map(({ step, text }) => (
                              <div key={step} className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-black text-[10px] flex items-center justify-center flex-shrink-0">{step}</span>
                                <span className="text-slate-600">{text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>Self-registered delegates are tagged <strong>SELF_LINK</strong> so you can distinguish them from admin-registered ones in the roster.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                        <div>
                          <h3 className="font-heading font-bold text-lg text-navy-950">Register New Chapter Attendee</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Manually add a delegate to the {currentChapter.institutionName} roster.</p>
                        </div>
                        <button onClick={() => { setShowAddAttendeeModal(false); setAddAttendeeError(null); }} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {addAttendeeError && (
                        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>{addAttendeeError}</span>
                        </div>
                      )}

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
                            <label className="block font-bold text-slate-700 uppercase mb-1">Gender *</label>
                            <select
                              value={newAttendee.gender}
                              onChange={(e) => setNewAttendee({ ...newAttendee, gender: e.target.value as any })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                            >
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                            </select>
                          </div>
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
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-slate-700 uppercase mb-1">Role *</label>
                            <select
                              value={newAttendee.role}
                              onChange={(e) => setNewAttendee({ ...newAttendee, role: e.target.value as any })}
                              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                            >
                              <option value="DELEGATE">Delegate</option>
                              <option value="LEADER">Chapter Leader</option>
                              <option value="PATRON">Patron / Faculty</option>
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
                            disabled={addAttendeeSubmitting}
                            onClick={() => { setShowAddAttendeeModal(false); setAddAttendeeError(null); }}
                            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={addAttendeeSubmitting}
                            className="px-6 py-2 rounded-xl bg-navy-900 text-white font-bold disabled:opacity-60 flex items-center gap-2"
                          >
                            {addAttendeeSubmitting ? (
                              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Saving...</span></>
                            ) : (
                              <span>Save Attendee</span>
                            )}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">
                      Chapter Invoice &amp; Remittances
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      {invoicesLoading || paymentsLoading
                        ? "Loading financial records from Central Treasury..."
                        : `Central Treasury official billing and live payment ledger for ${currentChapter.institutionName}.`}
                    </p>
                  </div>
                  <button
                    onClick={refreshInvoicesAndPayments}
                    disabled={invoicesLoading || paymentsLoading}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Balance</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Official Invoice Card */}
                  {(invoicesLoading || paymentsLoading) ? (
                    <div className="lg:col-span-8 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6 animate-pulse">
                      <div className="h-5 w-40 bg-slate-200 rounded-lg" />
                      <div className="h-4 w-64 bg-slate-100 rounded-lg" />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-8 bg-slate-100 rounded-xl" />
                        <div className="h-8 bg-slate-100 rounded-xl" />
                        <div className="h-8 bg-slate-100 rounded-xl" />
                        <div className="h-8 bg-slate-100 rounded-xl" />
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full" />
                      <div className="h-24 bg-slate-50 rounded-2xl border border-slate-100" />
                    </div>
                  ) : currentInvoice ? (
                    <div className="lg:col-span-8 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Official Invoice</span>
                          <h2 className="font-heading font-black text-xl text-navy-950">{currentInvoice.invoiceNumber}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.print()}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Print Invoice</span>
                          </button>
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

                      {/* Payment Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-600">
                          <span>Payment Progress</span>
                          <span>{Math.round(((currentInvoice.amountPaid || 0) / (currentInvoice.amountDue || 1)) * 100)}% Settled</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.round(((currentInvoice.amountPaid || 0) / (currentInvoice.amountDue || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Chapter Capability Fee:</span>
                          <span className="text-navy-950 font-bold">{formatCurrency(currentInvoice.amountDue)}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Remitted & Reconciled Payments:</span>
                          <span>- {formatCurrency(currentInvoice.amountPaid)}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm text-navy-950">
                          <span>Outstanding Balance:</span>
                          <span className={currentInvoice.balance > 0 ? "text-amber-700" : "text-emerald-700"}>
                            {formatCurrency(currentInvoice.balance)}
                          </span>
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
                  <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h3 className="font-heading font-bold text-base text-navy-950">
                        Submit Payment Remittance
                      </h3>
                      <p className="text-xs text-slate-500">
                        Submit your M-Pesa receipt code or bank transfer reference. The Central Treasurer ledger and your invoice balance will update immediately.
                      </p>

                      {remittanceToast && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{remittanceToast}</span>
                        </div>
                      )}

                      <form onSubmit={handleRemittanceSubmit} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">M-Pesa Code / Bank Ref *</label>
                          <input
                            type="text"
                            required
                            value={remittanceRef}
                            onChange={(e) => setRemittanceRef(e.target.value)}
                            placeholder="e.g. QEJ8291X0K or KCB-FT-..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 uppercase mb-1">Amount Paid (KES) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={remittanceAmount}
                            onChange={(e) => setRemittanceAmount(e.target.value === "" ? "" : Number(e.target.value))}
                            placeholder="e.g. 50000"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingRemittance}
                          className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
                        >
                          {submittingRemittance ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Recording Remittance...</span>
                            </>
                          ) : (
                            <span>Confirm Remittance</span>
                          )}
                        </button>
                      </form>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                      <strong>Need assistance?</strong> Contact the Central Treasury at <span className="font-semibold text-slate-700">treasury@cucaso.org</span>.
                    </div>
                  </div>
                </div>

                {/* Chapter Transaction History & Remittances Ledger */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">
                        Remittance History & Receipts ({currentChapter.institutionName})
                      </h3>
                      <p className="text-xs text-slate-400">All payments matched to your chapter account and invoice</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs self-start sm:self-auto">
                      {chapterPayments.length} Record{chapterPayments.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {chapterPayments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                            <th className="py-3 px-4">Receipt / Ref</th>
                            <th className="py-3 px-4">Payer / Submitter</th>
                            <th className="py-3 px-4">Method</th>
                            <th className="py-3 px-4 text-right">Amount (KSh)</th>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {chapterPayments.map((pay: Payment) => (
                            <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-teal-700 text-xs">
                                {pay.mpesaReceiptNumber || pay.reference}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">{pay.payerName || currentChapter.repName}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                                  {pay.method === "MPESA_DARAJA" ? "M-Pesa Paybill" : pay.method === "BANK_TRANSFER" ? "Bank Transfer" : "Cash"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-navy-950">
                                {formatCurrency(pay.amount)}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{pay.timestamp}</td>
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
                  ) : (
                    <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                      <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700 text-xs">No Remittances Submitted Yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mt-0.5">
                        Once you complete your payment via M-Pesa Paybill 4082200 or bank transfer, enter the receipt code above to register your remittance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW D-1: MY CHAPTER */}
            {activePortal === "CHAPTER" && chapterActiveTab === "my-chapter" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">My Chapter</h1>
                    <p className="text-xs text-slate-500 mt-1">Your institution&apos;s official CUCASO chapter record and officer registry.</p>
                  </div>
                  <button
                    onClick={() => {
                      setLeadershipForm({
                        patronName: currentChapter.patronName || "Pr. Eric Musembi",
                        patronPhone: currentChapter.patronPhone || "+254 712 345678",
                        patronEmail: currentChapter.patronEmail || "patron@cucaso.org",
                        patronPhoto: currentChapter.patronPhoto || "",
                        repName: currentChapter.repName || "John Mwangi",
                        repPhone: currentChapter.repPhone || "+254 720 112 233",
                        repPhoto: currentChapter.repPhoto || "",
                        treasurerName: currentChapter.treasurerName || "David Kiboi",
                        treasurerPhone: currentChapter.treasurerPhone || "+254 733 444 555",
                        treasurerPhoto: currentChapter.treasurerPhoto || "",
                        secretaryName: currentChapter.secretaryName || "Grace Wanjiru",
                        secretaryPhone: currentChapter.secretaryPhone || "+254 744 555 666",
                        secretaryPhoto: currentChapter.secretaryPhoto || "",
                      });
                      setShowLeadershipModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors self-start"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Update Leadership &amp; Photos</span>
                  </button>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-start gap-6 mb-6">
                    {/* Chapter Logo Upload */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl bg-navy-950 flex items-center justify-center overflow-hidden border-2 border-slate-200 shadow-sm relative group">
                        {currentChapter.logoUrl ? (
                          <img src={currentChapter.logoUrl} alt="Chapter Logo" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-10 h-10 text-amber-400" />
                        )}
                        <label
                          htmlFor="chapter-logo-upload"
                          className="absolute inset-0 flex items-center justify-center bg-navy-950/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl"
                          title="Upload logo"
                        >
                          <ImageIcon className="w-6 h-6 text-white" />
                        </label>
                        <input
                          id="chapter-logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setChaptersList(prev => prev.map(c =>
                                  c.id === currentChapter.id
                                    ? { ...c, logoUrl: reader.result as string }
                                    : c
                                ));
                                setLocationToast("Chapter logo updated successfully!");
                                setTimeout(() => setLocationToast(null), 4000);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold text-center leading-tight">
                        Hover to<br />upload logo
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-heading font-black text-xl text-navy-950">{currentChapter.institutionName}</h2>
                      <p className="text-sm text-teal-700 font-semibold">{currentChapter.chapterName}</p>
                      <span className="mt-2 inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">Active &amp; In Good Standing</span>
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs border-t border-slate-100 pt-6">
                    {[
                      { role: "Patron / Chaplain", name: currentChapter.patronName || "Pr. Eric Musembi", phone: currentChapter.patronPhone, email: currentChapter.patronEmail, photo: currentChapter.patronPhoto },
                      { role: "Chapter Representative", name: currentChapter.repName || "John Mwangi", phone: currentChapter.repPhone, email: `${currentChapter.code.toLowerCase()}@cucaso.org`, photo: currentChapter.repPhoto },
                      { role: "Chapter Treasurer", name: currentChapter.treasurerName || "David Kiboi", phone: currentChapter.treasurerPhone, email: "treasury@" + currentChapter.code.toLowerCase() + ".org", photo: currentChapter.treasurerPhoto },
                      { role: "Chapter Secretary", name: currentChapter.secretaryName || "Grace Wanjiru", phone: currentChapter.secretaryPhone, email: "secretary@" + currentChapter.code.toLowerCase() + ".org", photo: currentChapter.secretaryPhoto },
                    ].map((officer) => (
                      <div key={officer.role} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-900 to-teal-800 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs overflow-hidden border border-white shadow-sm">
                          {officer.photo ? (
                            <img src={officer.photo} alt={officer.name} className="w-full h-full object-cover" />
                          ) : (
                            officer.name.split(" ").map(w => w[0]).join("").slice(0, 2)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{officer.role}</span>
                          <span className="font-bold text-slate-900 block mt-0.5 truncate">{officer.name}</span>
                          {officer.phone && <span className="text-slate-500 block text-[11px] truncate">{officer.phone}</span>}
                          {officer.email && <span className="text-teal-700 block text-[10px] truncate">{officer.email}</span>}
                        </div>
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
                      {currentRallyData?.state?.replace(/_/g, " ") || "REGISTRATION OPEN"}
                    </span>
                    <h2 className="font-heading font-black text-3xl text-white">{currentRallyData?.title || CURRENT_RALLY.title}</h2>
                    <p className="text-amber-300 font-semibold mt-2">&ldquo;{currentRallyData?.theme || CURRENT_RALLY.theme}&rdquo;</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-xs">
                      {[
                        {
                          label: "Date",
                          value: currentRallyData?.startDate && currentRallyData?.endDate
                            ? `${new Date(currentRallyData.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })} – ${new Date(currentRallyData.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`
                            : "15 – 17 Nov 2026",
                        },
                        { label: "Venue", value: currentRallyData?.venueName || CURRENT_RALLY.venueName },
                        { label: "Capacity", value: `${(currentRallyData?.capacity || CURRENT_RALLY.capacity).toLocaleString()} Delegates` },
                        {
                          label: "Fee Lock Date",
                          value: currentRallyData?.feeLockDate
                            ? new Date(currentRallyData.feeLockDate).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                            : "1 November 2026",
                        },
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
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">Official Rally Programme</h3>
                  <div className="space-y-4 text-xs">
                    {(currentRallyData?.programme && currentRallyData.programme.length > 0) ? (
                      currentRallyData.programme.map((day: any, dIdx: number) => {
                        const dayNum = day.dayNumber || dIdx + 1;
                        const isSabbath = dayNum === 2 || (day.title || "").toLowerCase().includes("sabbath");
                        return (
                          <div key={dayNum} className={`p-4 rounded-2xl border ${isSabbath ? "bg-amber-50/50 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-2.5 py-1 rounded-lg text-white text-[10px] font-bold ${isSabbath ? "bg-amber-600" : "bg-navy-900"}`}>
                                Day {dayNum}{day.timeRange ? ` · ${day.timeRange}` : ""}
                              </span>
                              <span className="font-bold text-slate-900">{day.title || `Day ${dayNum}`}</span>
                            </div>
                            {day.items && day.items.length > 0 && (
                              <ul className="space-y-1.5">
                                {day.items.map((item: string, iIdx: number) => (
                                  <li key={iIdx} className="flex items-center gap-2 text-slate-600">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      [
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
                      ))
                    )}
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
                  <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Important Deadlines</strong>
                    Attendee registration cutoff:{" "}
                    <strong>
                      {currentRallyData?.registrationDeadline
                        ? new Date(currentRallyData.registrationDeadline).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                        : "1 November 2026"}
                    </strong>. Full invoice payment:{" "}
                    <strong>
                      {currentRallyData?.paymentDeadline
                        ? new Date(currentRallyData.paymentDeadline).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
                        : "10 November 2026"}
                    </strong>.
                  </div>
                </div>
              </div>
            )}

            {/* VIEW D-2B: CHAPTER NEWS & BULLETINS */}
            {activePortal === "CHAPTER" && chapterActiveTab === "news" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Council Bulletins & News</h1>
                    <p className="text-xs text-slate-500 mt-1">Official press releases, spiritual devotionals, and rally announcements from CUCASO Central Council.</p>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {["ALL", "ANNOUNCEMENT", "FINANCE", "SPIRITUAL", "STORY", "NEWS"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewsFilter(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          newsFilter === cat
                            ? "bg-teal-700 text-white shadow-sm"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {cat === "ALL" ? "All Updates" : cat.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {newsList.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    No bulletins published yet. Check back soon for council communications.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsList
                      .filter(n => newsFilter === "ALL" || n.category.toUpperCase() === newsFilter.toUpperCase())
                      .map((post) => (
                        <div key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-teal-300 transition-all duration-300 group">
                          <div>
                            {post.featuredImageUrl ? (
                              <div className="aspect-video w-full overflow-hidden bg-slate-900 relative">
                                <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy-950/80 text-amber-300 backdrop-blur-md">
                                  {post.category}
                                </span>
                              </div>
                            ) : (
                              <div className="aspect-[21/9] w-full bg-gradient-to-br from-navy-950 via-teal-950 to-navy-900 p-5 flex flex-col justify-between text-white relative">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-amber-300 w-max">
                                  {post.category}
                                </span>
                                <Sparkles className="w-5 h-5 text-amber-400 absolute top-4 right-4" />
                              </div>
                            )}

                            <div className="p-5">
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                <span>{post.publishedAt || post.createdAt || "Recent"}</span>
                                <span>•</span>
                                <span>{post.readTime || "3 min read"}</span>
                              </div>
                              <h3 className="font-heading font-black text-base text-navy-950 leading-snug group-hover:text-teal-700 transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                                {post.summary || post.content}
                              </p>
                            </div>
                          </div>

                          <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500">
                              By <strong className="text-slate-700">{post.author || "Council Admin"}</strong>
                            </span>
                            <button
                              onClick={() => setViewingNewsArticle(post)}
                              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                            >
                              <span>Read Bulletin</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW D-3: CHAPTER DOCUMENTS & SITE RESOURCES */}
            {activePortal === "CHAPTER" && chapterActiveTab === "documents" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Resources & Documents</h1>
                    <p className="text-xs text-slate-500 mt-1">Download official CUCASO constitutions, guidelines, and upload your chapter&apos;s records.</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="doc-upload-input"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingDoc(true);
                        setDocUploadSuccess(null);
                        try {
                          const formData = new FormData();
                          formData.append("file", file);
                          const res = await fetch("/api/upload", {
                            method: "POST",
                            body: formData,
                          });
                          const json = await res.json();
                          if (json.success) {
                            setUploadedDocuments((prev) => [
                              {
                                name: file.name,
                                type: "Uploaded Document",
                                date: "Just now",
                                status: "Cloud Stored",
                                statusClass: "bg-emerald-100 text-emerald-800",
                                url: json.url,
                              },
                              ...prev,
                            ]);
                            setDocUploadSuccess(`"${file.name}" uploaded successfully to Cloudinary!`);
                            setTimeout(() => setDocUploadSuccess(null), 4000);
                          } else {
                            alert("Upload failed: " + (json.error || "Unknown error"));
                          }
                        } catch (err: any) {
                          alert("Upload error: " + err.message);
                        } finally {
                          setUploadingDoc(false);
                          e.target.value = "";
                        }
                      }}
                    />
                    <button
                      onClick={() => document.getElementById("doc-upload-input")?.click()}
                      disabled={uploadingDoc}
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Upload className={`w-3.5 h-3.5 ${uploadingDoc ? "animate-spin" : ""}`} />
                      <span>{uploadingDoc ? "Uploading to Cloud..." : "Upload Document"}</span>
                    </button>
                  </div>
                </div>
                {docUploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{docUploadSuccess}</span>
                  </div>
                )}
                <div className="space-y-3">
                  {[
                    ...uploadedDocuments,
                    { name: "CUCASO Constitution & Bylaws 2024", type: "Governance", date: "Jan 2024", status: "Official", statusClass: "bg-navy-100 text-navy-800", url: "#" },
                    { name: `${currentChapter.institutionName} — Official Endorsement Letter`, type: "Endorsement", date: "Feb 2024", status: "Verified", statusClass: "bg-emerald-100 text-emerald-800", url: "#" },
                    { name: "Coastal Unity Rally 2026 — Official Circular", type: "Rally", date: "Aug 2026", status: "Active", statusClass: "bg-teal-100 text-teal-800", url: "#" },
                    { name: "Chapter Fee Schedule & Capability Tier Schedule 2026", type: "Finance", date: "Sep 2026", status: "Active", statusClass: "bg-teal-100 text-teal-800", url: "#" },
                    { name: `${currentInvoice?.invoiceNumber || invoicesList.find(i => i.chapterId === currentChapter.id)?.invoiceNumber || "INV-2026-001"} — Official Invoice`, type: "Invoice", date: "Sep 2026", status: "Pending Payment", statusClass: "bg-amber-100 text-amber-800", url: "#" },
                    { name: "CUCASO Attendee Registration Guidelines 2026", type: "Guidelines", date: "Sep 2026", status: "Active", statusClass: "bg-teal-100 text-teal-800", url: "#" },
                    { name: "Minor (Under 18) Guardian Consent Form", type: "Forms", date: "Sep 2026", status: "Template", statusClass: "bg-slate-100 text-slate-700", url: "#" },
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
                        {doc.url && doc.url !== "#" ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-slate-100 text-teal-700 hover:text-teal-800 transition-colors"
                            title="Open / Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-teal-700 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
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
                      <button 
                        onClick={() => {
                          setProfileForm({
                            name: currentChapter.repName || "John Mwangi",
                            phone: currentChapter.repPhone || "+254 720 112 233",
                            email: `${currentChapter.code.toLowerCase()}@cucaso.org`,
                            avatarUrl: "",
                          });
                          setShowEditProfileModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                      <button 
                        onClick={() => {
                          setPasswordForm({ current: "", newPassword: "", confirmPassword: "" });
                          setShowChangePasswordModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Change Password</span>
                      </button>
                      <button 
                        onClick={handleSignOut}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* VIEW D-6: CHAPTER MEDIA & EVENT GALLERY                  */}
            {/* ======================================================= */}
            {activePortal === "CHAPTER" && chapterActiveTab === "gallery" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                      <Camera className="w-3.5 h-3.5 text-teal-600" />
                      <span>{currentChapter.chapterName || currentChapter.institutionName} Media Archive</span>
                    </div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Chapter Media & Event Gallery</h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Browse rally photos, Sabbath fellowship moments, and upload campus activities to the central CUCASO gallery.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/gallery"
                      target="_blank"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      <span>Public Gallery</span>
                    </Link>
                    <button 
                      onClick={() => setShowUploadGalleryModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>+ Upload Chapter Photo</span>
                    </button>
                  </div>
                </div>

                {/* Category & Chapter Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {[
                    { id: "ALL", label: "All Photos" },
                    { id: "MY_CHAPTER", label: `${currentChapter.code} Photos` },
                    { id: "Rally", label: "Rallies" },
                    { id: "Worship", label: "Worship" },
                    { id: "Leadership", label: "Leadership" },
                    { id: "Fellowship", label: "Fellowship" },
                    { id: "Community", label: "Community" },
                    { id: "Sports", label: "Sports" },
                  ].map((filterTab) => (
                    <button
                      key={filterTab.id}
                      onClick={() => setGalleryCategoryFilter(filterTab.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        galleryCategoryFilter === filterTab.id
                          ? "bg-navy-950 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {filterTab.label}
                    </button>
                  ))}
                </div>

                {/* Gallery Photos Grid */}
                {(() => {
                  const filteredPhotos = galleryPhotos.filter((p: any) => {
                    if (galleryCategoryFilter === "ALL") return true;
                    if (galleryCategoryFilter === "MY_CHAPTER") {
                      return (
                        p.chapterId === currentChapter.id ||
                        p.chapterId === selectedChapterId ||
                        p.uploader?.toLowerCase().includes(currentChapter.code.toLowerCase()) ||
                        p.uploader?.toLowerCase().includes("tum")
                      );
                    }
                    return p.category?.toLowerCase() === galleryCategoryFilter.toLowerCase();
                  });

                  if (filteredPhotos.length === 0) {
                    return (
                      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <div className="max-w-md">
                          <h3 className="font-heading font-black text-lg text-navy-950">No Photos Found</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {galleryCategoryFilter === "MY_CHAPTER"
                              ? `No photos have been uploaded for ${currentChapter.chapterName || currentChapter.institutionName} yet. Be the first to share fellowship memories!`
                              : `There are no photos under the "${galleryCategoryFilter}" category yet.`}
                          </p>
                        </div>
                        <button
                          onClick={() => setShowUploadGalleryModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload Photo Now</span>
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPhotos.map((photo: any) => (
                        <div 
                          key={photo.id} 
                          className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-3 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group flex flex-col justify-between"
                        >
                          {/* Photo Container */}
                          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-inner">
                            <img 
                              src={normalizeGoogleImageUrl(photo.url)} 
                              alt={photo.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
                              onClick={() => setPreviewGalleryPhoto(photo)}
                            />
                            
                            {/* Top Badges */}
                            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                              <div className="flex items-center gap-1.5 pointer-events-auto">
                                <span className="px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-amber-300 font-bold text-[10px] tracking-wide border border-white/10 shadow-sm">
                                  {photo.category}
                                </span>
                                {(photo.isAlbum || photo.albumUrl) && (
                                  <span className="px-2 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[9px] tracking-wide border border-white/20 shadow-sm flex items-center gap-1">
                                    <Images className="w-3 h-3" />
                                    <span>Shared Album</span>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 pointer-events-auto">
                                {(photo.isAlbum || photo.albumUrl) && (
                                  <a
                                    href={photo.albumUrl || photo.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 backdrop-blur-md text-white border border-white/20 shadow-sm transition-transform active:scale-90"
                                    title="Open Google Photos / Drive Album"
                                  >
                                    <FolderOpen className="w-3.5 h-3.5 text-white" />
                                  </a>
                                )}
                                <button
                                  onClick={() => setPreviewGalleryPhoto(photo)}
                                  className="p-1.5 rounded-full bg-navy-950/80 hover:bg-navy-900 backdrop-blur-md text-white border border-white/10 shadow-sm transition-transform active:scale-90"
                                  title="Expand in Lightbox"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                </button>
                                <a
                                  href={photo.albumUrl || normalizeGoogleImageUrl(photo.url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-full bg-navy-950/80 hover:bg-navy-900 backdrop-blur-md text-white border border-white/10 shadow-sm transition-transform active:scale-90"
                                  title="Open Direct Link"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                                </a>
                              </div>
                            </div>

                            {/* Caption Overlay */}
                            <div 
                              onClick={() => setPreviewGalleryPhoto(photo)}
                              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 via-navy-950/70 to-transparent p-4 pt-10 text-white cursor-pointer"
                            >
                              <h4 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                                {photo.title}
                              </h4>
                              <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                                <span className="font-medium text-teal-300">{photo.event}</span>
                                <span className="text-[10px] text-slate-400">{photo.date}</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="pt-3 px-2 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-500 font-medium">
                              Uploaded by <strong className="text-slate-700">{photo.uploader || "Member"}</strong>
                            </span>
                            {(photo.chapterId === currentChapter.id || photo.uploader?.includes(currentChapter.code) || photo.uploader?.includes(currentChapter.institutionName)) && (
                              <button
                                onClick={async () => {
                                  if (confirm(`Remove "${photo.title}" from chapter gallery?`)) {
                                    setGalleryPhotos(prev => prev.filter(p => p.id !== photo.id));
                                    setLocationToast("Photo removed from gallery.");
                                    try {
                                      await fetch(`/api/gallery?id=${encodeURIComponent(photo.id)}`, { method: "DELETE" });
                                    } catch (err) {
                                      console.warn("Failed to delete photo:", err);
                                    }
                                    setTimeout(() => setLocationToast(null), 3000);
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete chapter photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
                        {chaptersList.length}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Active member chapters</span>
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
                        {allAttendeesList.length.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 mt-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Registered delegates (live database)</span>
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
                        {totalCollected > 0 ? formatCurrency(totalCollected) : <span className="text-slate-400 text-base font-semibold">Awaiting initial Paybill remittances</span>}
                      </span>
                      <span className="text-xs text-slate-500 block mt-2">
                        {totalCollected > 0 && budgetSummary.totalBudgetKes > 0
                          ? `${Math.round((totalCollected / budgetSummary.totalBudgetKes) * 100)}% of rally budget target`
                          : totalCollected > 0 ? "Funds collected" : "No payments reconciled yet"}
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
                      <span className={`font-heading font-black text-2xl ${
                        budgetSummary.sufficiencyStatus === "FUNDED" || budgetSummary.outstandingKes <= 0
                          ? "text-emerald-700"
                          : totalCollected > 0 ? "text-teal-700" : "text-slate-500"
                      }`}>
                        {budgetSummary.sufficiencyStatus === "FUNDED" || budgetSummary.outstandingKes <= 0
                          ? "Fully Funded"
                          : totalCollected > 0 ? "Collection Active" : "Awaiting Payments"}
                      </span>
                      <span className="text-xs text-slate-500 block mt-2">
                        {budgetSummary.outstandingKes > 0
                          ? `${formatCurrency(budgetSummary.outstandingKes)} remaining balance`
                          : totalCollected > 0 ? "All funds covered" : "No remittances recorded yet"}
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
                        {formatCurrency(totalCollected)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center py-4">
                      {/* Donut representation graphic */}
                      <div className="relative w-40 h-40 mx-auto rounded-full border-8 flex items-center justify-center bg-slate-50 shadow-inner" style={{ borderColor: totalCollected > 0 ? "#0f766e" : "#e2e8f0" }}>
                        <div className="text-center">
                          {totalCollected > 0 ? (
                            <>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Collected</span>
                              <span className="font-heading font-black text-sm text-navy-950">{formatCurrency(totalCollected)}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">KES 0</span>
                              <span className="text-[10px] text-slate-400 block mt-1 leading-tight">No payments<br />recorded yet</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Legend — only show real invoice data */}
                      <div className="space-y-2 text-xs">
                        {totalCollected > 0 ? (
                          chaptersList.slice(0, 4).map((ch, i) => {
                            const inv = invoicesList.find(inv => inv.chapterId === ch.id);
                            const paid = inv?.amountPaid ?? 0;
                            const pct = totalCollected > 0 ? Math.min(100, Math.round((paid / totalCollected) * 100)) : 0;
                            const colors = ["bg-teal-600", "bg-amber-500", "bg-blue-600", "bg-emerald-500"];
                            return (
                              <div key={ch.id} className="flex items-center justify-between">
                                <span className="flex items-center gap-2 truncate max-w-[140px]">
                                  <span className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]} flex-shrink-0`} />
                                  <span className="truncate">{ch.institutionName}</span>
                                </span>
                                <span className="font-bold">{pct}%</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-slate-400">
                            <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-200" />
                            <p className="text-[11px]">Chapter contributions will appear here once the first remittance is matched.</p>
                          </div>
                        )}
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

                    <div className="space-y-2.5 text-xs max-h-[190px] overflow-y-auto pr-1">
                      {rallyHistoryList && rallyHistoryList.length > 0 ? (
                        rallyHistoryList.slice(0, 3).map((rally) => {
                          const isAct = (rally.status || "").toLowerCase().includes("active") || (rally.status || "").toLowerCase().includes("current");
                          const isComp = (rally.status || "").toLowerCase().includes("completed");
                          return (
                            <div
                              key={rally.id || rally.title}
                              className={`p-3 rounded-2xl flex items-center justify-between border ${
                                isAct
                                  ? "bg-teal-50 border-teal-200"
                                  : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              <div>
                                <span className={`font-bold block ${isAct ? "text-teal-950" : "text-slate-900"}`}>
                                  {rally.date} — {rally.title}
                                </span>
                                <span className={`text-[11px] ${isAct ? "text-teal-700" : "text-slate-500"}`}>
                                  {rally.venue} {isAct ? "(Current)" : ""}
                                </span>
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  isAct
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : isComp
                                    ? "bg-slate-200 text-slate-700"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {rally.status}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-4 text-slate-400 text-xs">
                          No rally lifecycle events recorded.
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>
                        Fee Lock:{" "}
                        {currentRallyData?.feeLockDate
                          ? new Date(currentRallyData.feeLockDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                          : "1 Nov 2026"}
                      </span>
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
                      <p className="text-xs text-slate-500">{chaptersList.length} member chapters and institutional fees</p>
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
                        {chaptersList.slice(0, 6).map((ch, idx) => {
                          const inv = invoicesList.find(i => i.chapterId === ch.id);
                          // Use ONLY the invoice amount from DB — never calculate a fallback
                          const fee = inv ? inv.amountDue : null;
                          const registeredCount = allAttendeesList.length > 0
                            ? allAttendeesList.filter(a => a.chapterId === ch.id).length
                            : (ch.attendeesCount ?? 0);
                          const status = inv ? inv.status : ((ch.status as string) === "APPROVED" || (ch.status as string) === "ACTIVE" ? "UNPAID" : "PENDING");
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
                                {registeredCount}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-navy-950">
                                {fee !== null ? formatCurrency(fee) : <span className="text-slate-400 text-xs font-normal">No invoice</span>}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    status === "PAID"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : status === "PARTIAL"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {status}
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
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={issuingInvoices}
                      onClick={handleIssueInvoices}
                      className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      {issuingInvoices ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Issuing to Database...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Issue Invoices to Chapters</span>
                        </>
                      )}
                    </button>
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Rally Budget</span>
                      <span className="font-heading font-black text-2xl text-navy-950">
                        {formatCurrency(budgetSummary.totalBudgetKes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ─── Budget Cost Items CRUD Manager ─── */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        Rally Budget Cost Items
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {costItemsList.length} line items · Engine auto-recalculates on every change
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleOpenAddCostItem}
                        className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Cost Item</span>
                      </button>
                      <button
                        onClick={handleResetCostItems}
                        disabled={costItemsLoading}
                        className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        title="Reset budget to recommended CUCASO template"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span className="hidden sm:inline">Reset Defaults</span>
                      </button>
                      <button
                        onClick={() => {
                          setCostItemsLoading(true);
                          const url = currentRallyData?.id ? `/api/cost-items?rallyId=${currentRallyData.id}` : "/api/cost-items";
                          fetch(url)
                            .then((r) => r.json())
                            .then((j) => {
                              if (j.success && Array.isArray(j.data)) setCostItemsList(j.data);
                            })
                            .catch(() => {})
                            .finally(() => setCostItemsLoading(false));
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Refresh from DB"
                      >
                        <RefreshCw className={`w-4 h-4 ${costItemsLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                          <th className="py-3 px-4">Line Item</th>
                          <th className="py-3 px-4 text-center">Category</th>
                          <th className="py-3 px-4 text-center">Type</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4 text-right">Unit Amount (KES)</th>
                          <th className="py-3 px-4 text-right">Budget Impact</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {costItemsList.length === 0 && (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              <Coins className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                              <p className="font-semibold text-slate-600 mb-1">
                                {costItemsLoading ? "Loading cost items from database…" : "No cost items in current budget"}
                              </p>
                              <p className="text-[11px] text-slate-400 mb-4 max-w-sm mx-auto">
                                Build your budget by adding custom line items, or load the recommended standard CUCASO rally template.
                              </p>
                              {!costItemsLoading && (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={handleOpenAddCostItem}
                                    className="px-3.5 py-1.5 rounded-xl bg-navy-900 text-white font-bold text-xs hover:bg-teal-700 transition"
                                  >
                                    Add Cost Item
                                  </button>
                                  <button
                                    onClick={handleResetCostItems}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
                                  >
                                    Load Standard Template
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                        {costItemsList.map((item) => {
                          const totalAttendees = engineChaptersInput.reduce((s, c) => s + c.attendeeCount, 0);
                          const budgetImpact = item.type === "FIXED"
                            ? item.amount
                            : item.type === "PER_HEAD"
                            ? item.amount * totalAttendees
                            : item.amount * (item.quantity ?? 1);

                          const categoryColors: Record<string, string> = {
                            VENUE: "bg-blue-100 text-blue-800",
                            CATERING: "bg-emerald-100 text-emerald-800",
                            ACCOMMODATION: "bg-purple-100 text-purple-800",
                            TRANSPORT: "bg-amber-100 text-amber-800",
                            LOGISTICS: "bg-teal-100 text-teal-800",
                            SECURITY: "bg-rose-100 text-rose-800",
                            OTHER: "bg-slate-100 text-slate-700",
                          };
                          const typeColors: Record<string, string> = {
                            FIXED: "bg-slate-100 text-slate-700",
                            PER_HEAD: "bg-indigo-100 text-indigo-800",
                            PER_VEHICLE: "bg-orange-100 text-orange-800",
                          };
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-navy-950">{item.name}</div>
                                {item.notes && (
                                  <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs truncate">{item.notes}</div>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${categoryColors[item.category] || "bg-slate-100 text-slate-700"}`}>
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${typeColors[item.type] || "bg-slate-100 text-slate-700"}`}>
                                  {item.type === "PER_HEAD" ? "PER HEAD" : item.type === "PER_VEHICLE" ? "PER VEHICLE" : "FIXED"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono text-slate-700">
                                {item.type === "FIXED" ? "—" : item.type === "PER_HEAD" ? `×${totalAttendees}` : `×${item.quantity ?? 1}`}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                                {formatCurrency(item.amount)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-teal-700">
                                {formatCurrency(budgetImpact)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditCostItem(item)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-teal-100 text-slate-700 hover:text-teal-700 transition-colors shadow-xs"
                                    title="Edit line item"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCostItem(item.id, item.name)}
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-colors shadow-xs"
                                    title="Delete line item"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {costItemsList.length > 0 && (
                        <tfoot className="border-t-2 border-slate-300 bg-slate-50">
                          <tr>
                            <td colSpan={5} className="py-3 px-4 text-right font-bold text-xs text-slate-600 uppercase tracking-wider">
                              Subtotal (pre-contingency):
                            </td>
                            <td className="py-3 px-4 text-right font-heading font-black text-sm text-navy-950">
                              {formatCurrency(budgetSummary.subtotalKes)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>

                {/* Contingency + Budget Summary Control Panel */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      Contingency Reserve (%)
                    </label>
                    <input
                      type="number"
                      min={0} max={50} step={0.5}
                      value={contingency}
                      onChange={(e) => setContingency(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-navy-950 text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">PRD §6.2 buffer</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subtotal</span>
                    <span className="font-heading font-black text-xl text-navy-950">{formatCurrency(budgetSummary.subtotalKes)}</span>
                    <p className="text-[11px] text-slate-400 mt-1">Before contingency</p>
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contingency Buffer</span>
                    <span className="font-heading font-black text-xl text-amber-600">{formatCurrency(budgetSummary.contingencyKes)}</span>
                    <p className="text-[11px] text-slate-400 mt-1">{contingency}% of subtotal</p>
                  </div>
                  <div className="bg-gradient-to-br from-navy-950 to-teal-800 rounded-2xl shadow-lg p-4 text-white">
                    <span className="text-[10px] uppercase font-bold text-teal-300 block mb-1">Total Rally Budget</span>
                    <span className="font-heading font-black text-2xl text-white">{formatCurrency(budgetSummary.totalBudgetKes)}</span>
                    <p className="text-[11px] text-teal-300 mt-1">Used for fee distribution</p>
                  </div>
                </div>

                {/* Shortfall / Sufficiency Monitor Banner */}
                <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sufficiency Status</span>
                    <span className={`font-heading font-black text-xl ${budgetSummary.sufficiencyStatus === "FUNDED" ? "text-emerald-400" : budgetSummary.sufficiencyStatus === "ON_TRACK" ? "text-amber-400" : "text-rose-400"}`}>
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
                      {formatCurrency(budgetSummary.outstandingKes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cost to Serve / Head</span>
                    <span className="font-heading font-black text-xl text-white">
                      {formatCurrency(budgetSummary.perHeadCostToServeKes)}
                    </span>
                  </div>
                </div>

                {/* Chapter Automated Fee Distribution Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">
                        Automated Capability Weight Allocation
                      </h3>
                      <p className="text-xs text-slate-500">Live capability calculation across all {chaptersList.length} chapters · Budget {formatCurrency(budgetSummary.totalBudgetKes)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={issuingInvoices || chapterFees.length === 0}
                        onClick={handleIssueInvoices}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-colors"
                        title="Issue or update official chapter invoices based on these capability allocations"
                      >
                        {issuingInvoices ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Updating Invoices…</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5" />
                            <span>Sync Invoices with Engine</span>
                          </>
                        )}
                      </button>
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
                        {chapterFees.length === 0 && (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                              Add cost items above to see the fee distribution
                            </td>
                          </tr>
                        )}
                        {chapterFees.map((cf, idx) => {
                          const isPositive = cf.crossSubsidyKes >= 0;
                          const institution = chaptersList.find(c => c.id === cf.chapterId);
                          return (
                            <tr key={cf.chapterId} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-navy-950">
                                {institution ? institution.institutionName : engineChaptersInput[idx]?.name}
                              </td>
                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-xs">
                                  {(cf.weightBasisPoints / 100).toFixed(1)}x
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center font-bold text-slate-900">
                                {cf.attendeeCount}
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-teal-700">
                                {formatCurrency(cf.finalFeeKes)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                                {formatCurrency(cf.costToServeKes)}
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
                                  {formatCurrency(cf.crossSubsidyKes)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {chapterFees.length > 0 && (
                        <tfoot className="border-t-2 border-slate-300 bg-slate-50">
                          <tr>
                            <td colSpan={3} className="py-3 px-4 font-bold text-xs text-slate-600 uppercase tracking-wider text-right">Totals:</td>
                            <td className="py-3 px-4 text-right font-heading font-black text-sm text-teal-700">
                              {formatCurrency(budgetSummary.totalInvoicedKes)}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-sm text-slate-700">
                              {formatCurrency(budgetSummary.totalBudgetKes)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Add / Edit Cost Item Modal ── */}
            {showAddCostItemModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-heading font-black text-lg text-navy-950">
                        {editingCostItem ? "Edit Cost Item" : "Add New Cost Item"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {editingCostItem ? "Update this budget line item" : "Add a budget line item — engine recalculates instantly"}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddCostItemModal(false)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {costItemError && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                      <span>{costItemError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveCostItem} className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Item Name / Description *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mombasa Sports Complex Rental"
                        value={costItemForm.name}
                        onChange={(e) => setCostItemForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    {/* Category + Type */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Category *</label>
                        <select
                          value={costItemForm.category}
                          onChange={(e) => setCostItemForm(f => ({ ...f, category: e.target.value }))}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        >
                          {["VENUE", "CATERING", "ACCOMMODATION", "TRANSPORT", "LOGISTICS", "SECURITY", "OTHER"].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Cost Type *</label>
                        <select
                          value={costItemForm.type}
                          onChange={(e) => setCostItemForm(f => ({ ...f, type: e.target.value as any }))}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        >
                          <option value="FIXED">Fixed (flat cost)</option>
                          <option value="PER_HEAD">Per Head (× attendees)</option>
                          <option value="PER_VEHICLE">Per Vehicle (× qty)</option>
                        </select>
                      </div>
                    </div>

                    {/* Amount + Quantity */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                          {costItemForm.type === "FIXED" ? "Total Amount (KES)" : costItemForm.type === "PER_HEAD" ? "Rate per Person (KES)" : "Rate per Vehicle (KES)"} *
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          placeholder="e.g. 450000"
                          value={costItemForm.amount}
                          onChange={(e) => setCostItemForm(f => ({ ...f, amount: e.target.value }))}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>
                      {costItemForm.type === "PER_VEHICLE" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Quantity *</label>
                          <input
                            type="number"
                            min={1}
                            value={costItemForm.quantity}
                            onChange={(e) => setCostItemForm(f => ({ ...f, quantity: e.target.value }))}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-teal-600 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Notes (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 full days including electricity & security"
                        value={costItemForm.notes}
                        onChange={(e) => setCostItemForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>

                    {/* Live Budget Impact Preview */}
                    {costItemForm.amount && Number(costItemForm.amount) > 0 && (
                      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                        <span className="font-bold">Budget Impact: </span>
                        {costItemForm.type === "FIXED" && (
                          <span>{formatCurrency(Number(costItemForm.amount))} fixed</span>
                        )}
                        {costItemForm.type === "PER_HEAD" && (
                          <span>{formatCurrency(Number(costItemForm.amount))} × {engineChaptersInput.reduce((s, c) => s + c.attendeeCount, 0)} attendees = {formatCurrency(Number(costItemForm.amount) * engineChaptersInput.reduce((s, c) => s + c.attendeeCount, 0))}</span>
                        )}
                        {costItemForm.type === "PER_VEHICLE" && (
                          <span>{formatCurrency(Number(costItemForm.amount))} × {Number(costItemForm.quantity) || 1} vehicles = {formatCurrency(Number(costItemForm.amount) * (Number(costItemForm.quantity) || 1))}</span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={costItemSaving}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition"
                      >
                        {costItemSaving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Saving to Database…</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>{editingCostItem ? "Update Cost Item" : "Add to Budget"}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCostItemModal(false)}
                        className="px-5 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
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
                              <td className="py-3.5 px-4">
                                {/* Chapter Logo in table */}
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-navy-950 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-200 relative group cursor-pointer">
                                    {ch.logoUrl ? (
                                      <img src={ch.logoUrl} alt={ch.code} className="w-full h-full object-cover" />
                                    ) : (
                                      <Building2 className="w-4 h-4 text-amber-400" />
                                    )}
                                    <label
                                      htmlFor={`admin-logo-${ch.id}`}
                                      className="absolute inset-0 flex items-center justify-center bg-navy-950/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg"
                                      title="Upload logo"
                                    >
                                      <ImageIcon className="w-3 h-3 text-white" />
                                    </label>
                                    <input
                                      id={`admin-logo-${ch.id}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            setChaptersList(prev => prev.map(c =>
                                              c.id === ch.id ? { ...c, logoUrl: reader.result as string } : c
                                            ));
                                            setLocationToast(`Logo for ${ch.institutionName} updated!`);
                                            setTimeout(() => setLocationToast(null), 4000);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </div>
                                  <span className="font-mono font-bold text-teal-700">{ch.code}</span>
                                </div>
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
                                  {allAttendeesList.length > 0
                                    ? allAttendeesList.filter(a => a.chapterId === ch.id).length
                                    : (ch.attendeesCount || 0)}
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
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setShowCreateRallyModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-navy-950 font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Rally</span>
                    </button>
                  </div>
                </div>

                {/* Current Rally Hero Card */}
                {currentRallyData ? (
                  <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-950 to-navy-900 text-white border border-navy-800 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {currentRallyData.state?.replace("_", " ") || "REGISTRATION OPEN"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleDeleteRally}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-rose-500/30"
                              title="Delete this active rally"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Delete Rally</span>
                            </button>
                            <button
                              onClick={() => {
                                setEditRallyForm(prev => ({
                                  ...prev,
                                  title: currentRallyData.title || prev.title,
                                  theme: currentRallyData.theme || prev.theme,
                                  venueName: currentRallyData.venueName || prev.venueName,
                                  venueLocation: currentRallyData.venueLocation || prev.venueLocation,
                                  capacity: currentRallyData.capacity || prev.capacity,
                                  startDate: currentRallyData.startDate ? currentRallyData.startDate.split("T")[0] : prev.startDate,
                                  endDate: currentRallyData.endDate ? currentRallyData.endDate.split("T")[0] : prev.endDate,
                                  registrationDeadline: currentRallyData.registrationDeadline ? currentRallyData.registrationDeadline.split("T")[0] : prev.registrationDeadline,
                                  feeLockDate: currentRallyData.feeLockDate ? currentRallyData.feeLockDate.split("T")[0] : prev.feeLockDate,
                                  paymentDeadline: currentRallyData.paymentDeadline ? currentRallyData.paymentDeadline.split("T")[0] : prev.paymentDeadline,
                                  state: currentRallyData.state || prev.state,
                                  venueAddress: currentRallyData.venueAccess?.address || prev.venueAddress,
                                  venueDescription: currentRallyData.venueAccess?.description || prev.venueDescription,
                                  venueDirections: currentRallyData.venueAccess?.directions || prev.venueDirections,
                                  venueParkingInfo: currentRallyData.venueAccess?.parkingInfo || prev.venueParkingInfo,
                                  venueSecurityInfo: currentRallyData.venueAccess?.securityInfo || prev.venueSecurityInfo,
                                  venueMedicalInfo: currentRallyData.venueAccess?.medicalInfo || prev.venueMedicalInfo,
                                  venueAccommodationNotes: currentRallyData.venueAccess?.accommodationNotes || prev.venueAccommodationNotes,
                                  feesPaybillNumber: currentRallyData.feesAndCapitation?.paybillNumber || prev.feesPaybillNumber,
                                  feesAccountInstructions: currentRallyData.feesAndCapitation?.accountInstructions || prev.feesAccountInstructions,
                                  feesDeadlineText: currentRallyData.feesAndCapitation?.deadlineText || prev.feesDeadlineText,
                                  feesPhilosophyTitle: currentRallyData.feesAndCapitation?.philosophyTitle || prev.feesPhilosophyTitle,
                                  feesPhilosophyText: currentRallyData.feesAndCapitation?.philosophyText || prev.feesPhilosophyText,
                                }));
                                if (currentRallyData?.programme && Array.isArray(currentRallyData.programme)) {
                                  setProgrammeDays(currentRallyData.programme);
                                }
                                if (currentRallyData?.feesAndCapitation?.tiers && Array.isArray(currentRallyData.feesAndCapitation.tiers)) {
                                  setFeeTiersList(currentRallyData.feesAndCapitation.tiers);
                                }
                                setShowEditRallyModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/20"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                              <span>Edit Rally Details</span>
                            </button>
                          </div>
                        </div>
                        <h2 className="font-heading font-black text-3xl text-white tracking-tight">{currentRallyData.title}</h2>
                        <p className="text-amber-300 font-semibold text-sm mt-2">&ldquo;{currentRallyData.theme}&rdquo;</p>
                        <div className="mt-4 space-y-2 text-xs text-slate-300">
                          <p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-400" /> {currentRallyData.startDate ? new Date(currentRallyData.startDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "15 Nov 2026"} – {currentRallyData.endDate ? new Date(currentRallyData.endDate).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "17 Nov 2026"}</p>
                          <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-teal-400" /> {currentRallyData.venueName}, {currentRallyData.venueLocation}</p>
                          <p className="flex items-center gap-2"><Users className="w-4 h-4 text-teal-400" /> Capacity: {Number(currentRallyData.capacity || 3000).toLocaleString()} delegates</p>
                          <p className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-400" /> Fee Lock: {currentRallyData.feeLockDate || "1 November 2026"}</p>
                          <p className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-400" /> Payment Deadline: {currentRallyData.paymentDeadline || "10 November 2026"}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registration Progress</h4>
                        <div className="space-y-2">
                          {(() => {
                            const totalReg = chaptersList.reduce((acc, c) => acc + (c.attendeesCount || 0), 0);
                            const activeCh = chaptersList.filter(c => c.status === "APPROVED").length;
                            const paidInv = invoicesList.filter(i => i.status === "PAID").length;
                            const totalInv = invoicesList.length || chaptersList.length;
                            return [
                              { label: "Total Registered Delegates", value: totalReg.toLocaleString(), pct: Math.min(100, Math.round((totalReg / (Number(currentRallyData.capacity) || 3000)) * 100)) },
                              { label: "Chapters Confirmed", value: `${activeCh} / ${chaptersList.length}`, pct: chaptersList.length ? Math.round((activeCh / chaptersList.length) * 100) : 100 },
                              { label: "Invoices Settled", value: `${paidInv} / ${totalInv}`, pct: totalInv ? Math.round((paidInv / totalInv) * 100) : 0 },
                            ];
                          })().map((item) => (
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
                ) : (
                  <div className="p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl text-center space-y-4">
                    <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider inline-block">
                      System Status
                    </span>
                    <h2 className="font-heading font-black text-2xl text-white">No Active Rally in System</h2>
                    <p className="text-slate-400 text-xs max-w-lg mx-auto">
                      All rallies have been deleted. Public visitors see an official notice that no rally is currently scheduled. You can create a new rally or restore the standard template at any time.
                    </p>
                    <div className="flex items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          setEditRallyForm({
                            title: "Coastal Unity Rally 2027",
                            theme: "United in Faith and Mission",
                            venueName: "Mombasa Sports Complex",
                            venueLocation: "Mombasa Island, Kenya",
                            capacity: 3000,
                            startDate: "2027-05-15",
                            endDate: "2027-05-17",
                            registrationDeadline: "2027-05-01",
                            feeLockDate: "2027-05-01",
                            paymentDeadline: "2027-05-10",
                            state: "REGISTRATION_OPEN",
                            posterUrl: "",
                            venueAddress: "Mnazi Mmoja Rd, Mombasa Island, Coast Region, Kenya",
                            venueDescription: "Covered main arena with breakout workshop halls.",
                            venueDirections: "",
                            venueParkingInfo: "Secure parking inside Gate 2.",
                            venueSecurityInfo: "24-hr Kenya Police and private security.",
                            venueMedicalInfo: "Red Cross First Aid station on-site.",
                            venueAccommodationNotes: "Nearby hostels available.",
                            feesPaybillNumber: "4082200",
                            feesAccountInstructions: "Paybill 4082200, Account: Chapter Invoice Reference",
                            feesDeadlineText: "Fee settlement required before rally date.",
                            feesPhilosophyTitle: "Fair Capability-Based Capitation",
                            feesPhilosophyText: "Calculated based on institutional capability tier.",
                            feeTiersJson: "",
                            programmeJson: "",
                          });
                          setShowEditRallyModal(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold text-xs flex items-center gap-2 transition-all shadow"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create New Rally</span>
                      </button>
                      <button
                        onClick={async () => {
                          const res = await fetch("/api/rallies", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(CURRENT_RALLY),
                          });
                          const j = await res.json();
                          if (j.success && j.data) {
                            setCurrentRallyData(j.data);
                            setRalliesList([j.data]);
                            setLocationToast("Default rally restored to database!");
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all"
                      >
                        <RotateCcw className="w-4 h-4 text-teal-400" />
                        <span>Restore Default Rally</span>
                      </button>
                    </div>
                  </div>
                )}

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
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">Rally History & Pipeline</h3>
                      <p className="text-xs text-slate-500">Historical record of all past coastal rallies and upcoming scheduled rallies.</p>
                    </div>
                    {rallyHistoryList.length > 0 && (
                      <button
                        onClick={async () => {
                          if (confirm("Clear all past rally history entries from the database?")) {
                            try {
                              const res = await fetch("/api/rallies/history?clear=true", { method: "DELETE" });
                              const j = await res.json();
                              if (j.success) {
                                setRallyHistoryList([]);
                              } else {
                                setRallyHistoryList([]);
                              }
                            } catch {
                              setRallyHistoryList([]);
                            }
                            setLocationToast("Rally history permanently cleared from database.");
                            setTimeout(() => setLocationToast(null), 4000);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear History</span>
                      </button>
                    )}
                  </div>
                  {rallyHistoryList.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                      No rally history records currently saved.
                    </div>
                  ) : (
                    <div className="space-y-3 text-xs">
                      {rallyHistoryList.map((rally) => (
                        <div key={rally.id || rally.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 group hover:border-slate-300 transition-all">
                          <div>
                            <span className="font-bold text-slate-900 block">{rally.title}</span>
                            <span className="text-slate-500 text-[11px]">{rally.venue} • {rally.date} • {rally.attendees} delegates</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${rally.statusClass}`}>
                              {rally.status}
                            </span>
                            <button
                              onClick={() => handleDeletePastRallyHistory(rally.id || rally.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete from history"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  {(() => {
                    const totalReg = allAttendeesList.length;
                    const confirmed = allAttendeesList.filter(a => a.status === "CONFIRMED").length;
                    const pendingConsent = allAttendeesList.filter(a => a.status === "PENDING_CONSENT").length;
                    const minors = allAttendeesList.filter(a => a.ageCategory === "UNDER_18").length;
                    return [
                      { label: "Total Registered", value: totalReg.toLocaleString(), color: "text-navy-950", bg: "bg-navy-50 border-navy-200" },
                      { label: "Confirmed", value: confirmed.toLocaleString(), color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
                      { label: "Pending Consent", value: pendingConsent.toLocaleString(), color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
                      { label: "Minors (Under 18)", value: minors.toLocaleString(), color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
                    ];
                  })().map((stat) => (
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
                        {chaptersList.map((ch) => {
                          const chapterAtts = allAttendeesList.filter(a => a.chapterId === ch.id);
                          const attendees = chapterAtts.length > 0 ? chapterAtts.length : (ch.attendeesCount || 0);
                          const confirmed = chapterAtts.filter(a => a.status === "CONFIRMED").length;
                          const minors = chapterAtts.filter(a => a.ageCategory === "UNDER_18").length;
                          const members = ch.approximateMembers || 1;
                          const cap = Math.round((attendees / members) * 100);
                          return (
                            <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-[10px]">{ch.code}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">{ch.institutionName}</td>
                              <td className="py-3.5 px-4 text-center font-bold text-navy-950">{attendees}</td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="text-emerald-700 font-bold">{confirmed}</span>
                              </td>
                              <td className="py-3.5 px-4 text-center text-blue-700 font-semibold">{minors}</td>
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
                        {allAttendeesList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No registered delegates in the database yet.
                            </td>
                          </tr>
                        ) : (
                          allAttendeesList.map((att) => (
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
                          ))
                        )}
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSyncMpesa}
                      disabled={syncingMpesa}
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingMpesa ? "animate-spin text-teal-600" : ""}`} />
                      <span>{syncingMpesa ? "Syncing Paybill..." : "Sync M-Pesa"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setAdminPaymentForm({
                          invoiceId: invoicesList[0]?.id || "",
                          amount: "",
                          receipt: "",
                          payerName: "",
                          phone: "",
                          method: "MPESA_DARAJA",
                        });
                        setShowRecordPaymentModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Record Payment</span>
                    </button>
                  </div>
                </div>

                {/* Financial KPIs */}
                {(invoicesLoading || paymentsLoading) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(n => (
                      <div key={n} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm animate-pulse space-y-3">
                        <div className="h-3 w-28 bg-slate-200 rounded-lg" />
                        <div className="h-8 w-36 bg-slate-100 rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Invoiced", value: formatCurrency(invoicesList.reduce((s: number, i: Invoice) => s + i.amountDue, 0)), color: "text-navy-950", icon: FileText },
                    { label: "Total Received", value: formatCurrency(paymentsList.filter((p: Payment) => p.status === "MATCHED").reduce((s: number, p: Payment) => s + p.amount, 0)), color: "text-emerald-700", icon: CheckCircle2 },
                    { label: "Outstanding Balance", value: formatCurrency(invoicesList.reduce((s: number, i: Invoice) => s + i.balance, 0)), color: "text-amber-700", icon: AlertTriangle },
                    { label: "Unmatched Transactions", value: `${paymentsList.filter((p: Payment) => p.status === "UNMATCHED").length}`, color: "text-rose-700", icon: ShieldAlert },
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
                )}

                {/* Payment Ledger Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">M-Pesa & Bank Transaction Ledger</h3>
                      <p className="text-xs text-slate-400">Live incoming bank and Paybill 4082200 records from the database</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Search Bar */}
                      <div className="relative min-w-[200px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={paymentSearchQuery}
                          onChange={(e) => setPaymentSearchQuery(e.target.value)}
                          placeholder="Search receipt, payer, ref..."
                          className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                        />
                      </div>

                      {/* Filter Status Pills */}
                      <div className="flex items-center p-1 bg-slate-100 rounded-xl text-[11px] font-bold">
                        <button
                          onClick={() => setPaymentFilterStatus("ALL")}
                          className={`px-2.5 py-1 rounded-lg transition-all ${paymentFilterStatus === "ALL" ? "bg-white text-navy-950 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                          All ({paymentsList.length})
                        </button>
                        <button
                          onClick={() => setPaymentFilterStatus("MATCHED")}
                          className={`px-2.5 py-1 rounded-lg transition-all ${paymentFilterStatus === "MATCHED" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                          Matched ({paymentsList.filter(p => p.status === "MATCHED").length})
                        </button>
                        <button
                          onClick={() => setPaymentFilterStatus("UNMATCHED")}
                          className={`px-2.5 py-1 rounded-lg transition-all ${paymentFilterStatus === "UNMATCHED" ? "bg-white text-rose-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                          Unmatched ({paymentsList.filter(p => p.status === "UNMATCHED").length})
                        </button>
                      </div>

                      <button
                        onClick={handleExportPaymentsCsv}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export</span>
                      </button>
                    </div>
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
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paymentsList
                          .filter(pay => {
                            const query = paymentSearchQuery.toLowerCase();
                            const matchesQ = !query || 
                              (pay.mpesaReceiptNumber && pay.mpesaReceiptNumber.toLowerCase().includes(query)) ||
                              (pay.payerName && pay.payerName.toLowerCase().includes(query)) ||
                              (pay.reference && pay.reference.toLowerCase().includes(query));
                            const matchesStatus = paymentFilterStatus === "ALL" || pay.status === paymentFilterStatus;
                            return matchesQ && matchesStatus;
                          })
                          .map((pay: Payment) => (
                            <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-teal-700 text-[11px]">{pay.mpesaReceiptNumber || pay.reference}</td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-slate-900 block">{pay.payerName || "Anonymous"}</span>
                                {pay.payerPhone && <span className="text-slate-400 font-mono text-[10px]">{pay.payerPhone}</span>}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">{pay.reference}</td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-700">
                                  {pay.method === "MPESA_DARAJA" ? "M-Pesa" : pay.method === "BANK_TRANSFER" ? "Bank" : "Cash"}
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
                              <td className="py-3.5 px-4 text-center">
                                {pay.status === "UNMATCHED" ? (
                                  <button
                                    onClick={() => handleOpenReconcileModal(pay)}
                                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-950 text-[11px] font-bold shadow-sm transition-all"
                                  >
                                    Reconcile / Match
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    Reconciled
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chapter Invoice Status Summary */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">Chapter Invoice Status</h3>
                      <p className="text-xs text-slate-400">All official chapter capability fee invoices and live payment settlements</p>
                    </div>

                    <div className="relative min-w-[220px]">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={invoiceSearchQuery}
                        onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                        placeholder="Search chapter or invoice..."
                        className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:outline-none"
                      />
                    </div>
                  </div>

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
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoicesList
                          .filter(inv => {
                            const q = invoiceSearchQuery.toLowerCase();
                            return !q || 
                              inv.invoiceNumber.toLowerCase().includes(q) ||
                              inv.institutionName.toLowerCase().includes(q) ||
                              inv.paymentReference.toLowerCase().includes(q);
                          })
                          .map((inv: Invoice) => (
                            <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-600 text-[11px]">{inv.invoiceNumber}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-900">
                                <span>{inv.institutionName}</span>
                                <span className="block font-mono text-[10px] text-teal-700">{inv.paymentReference}</span>
                              </td>
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
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => {
                                    setAdminPaymentForm({
                                      invoiceId: inv.id,
                                      amount: inv.balance > 0 ? String(inv.balance) : "",
                                      receipt: "",
                                      payerName: inv.institutionName,
                                      phone: "",
                                      method: "MPESA_DARAJA",
                                    });
                                    setShowRecordPaymentModal(true);
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold transition-all"
                                >
                                  + Payment
                                </button>
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
                        <button 
                          onClick={() => handleExportPDF(report.title)}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export PDF</span>
                        </button>
                        <button 
                          onClick={() => {
                            if (report.tag === "Finance") {
                              exportToCSV(
                                "chapter_financial_summary",
                                ["Chapter Code", "Institution", "Tier", "Delegates", "Invoiced KES", "Paid KES", "Balance KES", "Status"],
                                chaptersList.map(ch => {
                                  const inv = invoicesList.find(i => i.chapterId === ch.id);
                                  const paid = inv?.amountPaid || 0;
                                  const due = inv?.amountDue || 0;
                                  return [ch.code, ch.institutionName, ch.tierId, ch.attendeesCount || 0, due, paid, Math.max(0, due - paid), inv?.status || "UNPAID"];
                                })
                              );
                            } else if (report.tag === "Delegates") {
                              exportToCSV(
                                "attendee_master_register",
                                ["Full Name", "Admission / ID", "Chapter ID", "Department", "Gender", "Category", "Role", "Dietary", "Status"],
                                (allAttendeesList.length > 0 ? allAttendeesList : attendeesList).map(a => [
                                  a.fullName || "",
                                  a.admissionOrIdNumber || "",
                                  a.chapterId || "",
                                  a.department || "",
                                  a.gender || "",
                                  a.ageCategory || "",
                                  a.role || "",
                                  a.dietaryRequirements || "",
                                  a.status || ""
                                ])
                              );
                            } else if (report.tag === "Cost Engine") {
                              exportToCSV(
                                "capability_fee_distribution",
                                ["Chapter Code", "Institution", "Tier Weight %", "Delegates", "Assigned Fee KES"],
                                chapterFees.map(cf => {
                                  const ch = chaptersList.find(c => c.id === cf.chapterId);
                                  return [ch?.code || cf.chapterId, ch?.institutionName || "Chapter", `${(cf.weightBasisPoints / 100).toFixed(1)}%`, cf.attendeeCount, cf.finalFeeKes];
                                })
                              );
                            } else if (report.tag === "Treasury") {
                              exportToCSV(
                                "mpesa_reconciliation_report",
                                ["Payment ID", "M-Pesa Receipt", "Payer Name", "Amount KES", "Reference", "Status"],
                                paymentsList.map(p => [p.id, p.mpesaReceiptNumber || "-", p.payerName || "Payer", p.amount, p.reference || "-", p.status || "-"])
                              );
                            } else if (report.tag === "Operations") {
                              exportToCSV(
                                "rally_programme_logistics",
                                ["Item", "Details", "Date / Venue", "Capacity / Target"],
                                [
                                  ["Event Title", currentRallyData?.title || "No Active Rally", currentRallyData?.startDate || "TBA", `${currentRallyData?.capacity || 0} delegates`],
                                  ["Theme", currentRallyData?.theme || "N/A", "-", "-"],
                                  ["Venue", currentRallyData?.venueName || "N/A", currentRallyData?.venueLocation || "N/A", "-"],
                                  ["Fixed Costs Total", `KES ${costItemsList.filter(c => c.type === "FIXED").reduce((s, c) => s + c.amount, 0).toLocaleString()}`, "-", "-"],
                                  ["Per-Head Rate", `KES ${costItemsList.filter(c => c.type === "PER_HEAD").reduce((s, c) => s + c.amount, 0).toLocaleString()}`, "-", "-"]
                                ]
                              );
                            } else {
                              exportToCSV(
                                "council_governance_audit",
                                ["Log ID", "Action", "Target", "Actor", "Role", "Timestamp", "Details"],
                                AUDIT_LOGS.map(l => [l.id, l.action, l.target, l.actor, l.role, l.timestamp, l.details])
                              );
                            }
                          }}
                          className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
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
                    {(() => {
                      const totalBudget = budgetSummary.totalBudgetKes;
                      const shortfall = Math.max(0, totalBudget - totalCollected);
                      const rate = totalBudget > 0 ? Math.round((totalCollected / totalBudget) * 100) : 0;
                      return [
                        { label: "Total Budget", value: formatCurrency(totalBudget) },
                        { label: "Funds Collected", value: formatCurrency(totalCollected) },
                        { label: "Shortfall", value: formatCurrency(shortfall) },
                        { label: "Collection Rate", value: `${rate}%` },
                      ];
                    })().map((m) => (
                      <div key={m.label}>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">{m.label}</span>
                        <span className="font-heading font-black text-2xl text-amber-400 block mt-1">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================= */}
            {/* VIEW H-4B: ADMIN LEADERSHIP & PATRONS DIRECTORY         */}
            {/* ======================================================= */}
            {activePortal === "ADMIN" && adminActiveTab === "leadership" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Leadership & Patrons Directory</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage Executive Council Officers, Chapter Patrons, Student Reps, and Photo uploads.</p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => handleExportPDF("Leadership Directory")}
                      className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs shadow-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>Export Directory PDF</span>
                    </button>
                    <button 
                      onClick={() => {
                        const newId = `lead-${Date.now()}`;
                        setEditingLeader({
                          id: newId,
                          title: "",
                          name: "",
                          role: "OFFICER",
                          category: "CENTRAL_COUNCIL",
                          institution: "CUCASO Central Council",
                          phone: "",
                          email: "",
                          bio: "",
                          imageUrl: "",
                          positionNumber: councilLeaders.length + 1,
                        });
                        setShowCouncilLeaderModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>+ Add Council Leader</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Tabs: Executive Council vs Chapter Rosters & Category Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAdminLeadershipSubTab("council")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        adminLeadershipSubTab === "council"
                          ? "bg-navy-950 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Executive Council ({councilLeaders.length})</span>
                    </button>
                    <button
                      onClick={() => setAdminLeadershipSubTab("chapters")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        adminLeadershipSubTab === "chapters"
                          ? "bg-navy-950 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>Chapter Leadership & Patrons ({chaptersList.length})</span>
                    </button>
                  </div>

                  {adminLeadershipSubTab === "council" && (
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setLeadershipCategoryFilter("ALL")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          leadershipCategoryFilter === "ALL"
                            ? "bg-white text-navy-950 shadow-sm"
                            : "text-slate-500 hover:text-navy-900"
                        }`}
                      >
                        All ({councilLeaders.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadershipCategoryFilter("CENTRAL_COUNCIL")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          leadershipCategoryFilter === "CENTRAL_COUNCIL"
                            ? "bg-white text-navy-950 shadow-sm"
                            : "text-slate-500 hover:text-navy-900"
                        }`}
                      >
                        Central Council ({councilLeaders.filter(l => (l.category || "CENTRAL_COUNCIL") === "CENTRAL_COUNCIL").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadershipCategoryFilter("OTHER")}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          leadershipCategoryFilter === "OTHER"
                            ? "bg-white text-navy-950 shadow-sm"
                            : "text-slate-500 hover:text-navy-900"
                        }`}
                      >
                        Other ({councilLeaders.filter(l => l.category === "OTHER").length})
                      </button>
                    </div>
                  )}
                </div>

                {/* SUBTAB 1: EXECUTIVE COUNCIL DIRECTORY */}
                {adminLeadershipSubTab === "council" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {councilLeaders
                      .filter((leader) => {
                        if (leadershipCategoryFilter === "ALL") return true;
                        if (leadershipCategoryFilter === "OTHER") return leader.category === "OTHER";
                        return (leader.category || "CENTRAL_COUNCIL") === "CENTRAL_COUNCIL";
                      })
                      .map((leader) => (
                      <div key={leader.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-900 to-amber-700 text-white font-heading font-black text-xl flex items-center justify-center overflow-hidden border-2 border-slate-100 shadow-sm flex-shrink-0">
                              {leader.imageUrl || leader.image ? (
                                <img src={normalizeGoogleImageUrl(leader.imageUrl || leader.image || "")} alt={leader.name} className="w-full h-full object-cover" />
                              ) : (
                                leader.name.split(" ").map(w => w[0]).join("").slice(0, 2)
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider block w-fit">
                                  {leader.title}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  (leader.category || "CENTRAL_COUNCIL") === "CENTRAL_COUNCIL"
                                    ? "bg-navy-100 text-navy-900"
                                    : "bg-teal-100 text-teal-900"
                                }`}>
                                  {(leader.category || "CENTRAL_COUNCIL") === "CENTRAL_COUNCIL" ? "Central Council" : "Other"}
                                </span>
                              </div>
                              <h3 className="font-heading font-black text-base text-navy-950 truncate">{leader.name}</h3>
                              <p className="text-xs text-slate-400 truncate">{leader.institution || "CUCASO Central Council"}</p>
                            </div>
                          </div>

                          {leader.bio && (
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                              {leader.bio}
                            </p>
                          )}

                          <div className="space-y-1 text-xs text-slate-500 pt-1">
                            {leader.phone && (
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-400 text-[11px]">Phone:</span>
                                <span className="font-bold text-slate-800">{leader.phone}</span>
                              </div>
                            )}
                            {leader.email && (
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-400 text-[11px]">Email:</span>
                                <span className="font-bold text-slate-800">{leader.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                            Active Officer
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingLeader({
                                  ...leader,
                                  category: leader.category || "CENTRAL_COUNCIL",
                                });
                                setShowCouncilLeaderModal(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-navy-900 hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Profile</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCouncilLeader(leader.id, leader.name)}
                              title="Delete Leader"
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-rose-600 font-bold text-xs transition-colors flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* SUBTAB 2: CHAPTER PATRONS & REPS */}
                {adminLeadershipSubTab === "chapters" && (
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-heading font-bold text-base text-navy-950">Chapter Leadership Roster</h3>
                        <p className="text-xs text-slate-400">Patron, Chapter Rep, Treasurer, and Secretary for all registered institutions.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="pb-3 px-3">Institution & Code</th>
                            <th className="pb-3 px-3">Chapter Patron</th>
                            <th className="pb-3 px-3">Chapter Representative</th>
                            <th className="pb-3 px-3">Treasurer</th>
                            <th className="pb-3 px-3">Secretary</th>
                            <th className="pb-3 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {chaptersList.map((ch) => (
                            <tr key={ch.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 block">{ch.institutionName}</span>
                                <span className="font-mono text-[10px] text-teal-700 font-semibold">{ch.code} • {ch.location}</span>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-navy-900 text-amber-400 font-bold flex items-center justify-center text-[10px] overflow-hidden flex-shrink-0 border border-slate-200">
                                    {ch.patronPhoto ? (
                                      <img src={ch.patronPhoto} alt={ch.patronName || "Patron"} className="w-full h-full object-cover" />
                                    ) : (
                                      (ch.patronName || "PT").slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 block">{ch.patronName || "Not Assigned"}</span>
                                    <span className="text-[11px] text-slate-400">{ch.patronPhone || "-"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-teal-800 text-teal-200 font-bold flex items-center justify-center text-[10px] overflow-hidden flex-shrink-0 border border-slate-200">
                                    {ch.repPhoto ? (
                                      <img src={ch.repPhoto} alt={ch.repName || "Rep"} className="w-full h-full object-cover" />
                                    ) : (
                                      (ch.repName || "RP").slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 block">{ch.repName || "Not Assigned"}</span>
                                    <span className="text-[11px] text-slate-400">{ch.repPhone || "-"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-amber-800 text-amber-200 font-bold flex items-center justify-center text-[10px] overflow-hidden flex-shrink-0 border border-slate-200">
                                    {ch.treasurerPhoto ? (
                                      <img src={ch.treasurerPhoto} alt={ch.treasurerName || "Treasurer"} className="w-full h-full object-cover" />
                                    ) : (
                                      (ch.treasurerName || "TR").slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 block">{ch.treasurerName || "Not Assigned"}</span>
                                    <span className="text-[11px] text-slate-400">{ch.treasurerPhone || "-"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-indigo-900 text-indigo-200 font-bold flex items-center justify-center text-[10px] overflow-hidden flex-shrink-0 border border-slate-200">
                                    {ch.secretaryPhoto ? (
                                      <img src={ch.secretaryPhoto} alt={ch.secretaryName || "Secretary"} className="w-full h-full object-cover" />
                                    ) : (
                                      (ch.secretaryName || "SC").slice(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-semibold text-slate-900 block">{ch.secretaryName || "Not Assigned"}</span>
                                    <span className="text-[11px] text-slate-400">{ch.secretaryPhone || "-"}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => {
                                    setSelectedChapterId(ch.id);
                                    setLeadershipForm({
                                      patronName: ch.patronName || "",
                                      patronPhone: ch.patronPhone || "",
                                      patronEmail: ch.patronEmail || "",
                                      patronPhoto: ch.patronPhoto || "",
                                      repName: ch.repName || "",
                                      repPhone: ch.repPhone || "",
                                      repPhoto: ch.repPhoto || "",
                                      treasurerName: ch.treasurerName || "",
                                      treasurerPhone: ch.treasurerPhone || "",
                                      treasurerPhoto: ch.treasurerPhoto || "",
                                      secretaryName: ch.secretaryName || "",
                                      secretaryPhone: ch.secretaryPhone || "",
                                      secretaryPhoto: ch.secretaryPhoto || "",
                                    });
                                    setShowLeadershipModal(true);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-sm"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Update Roster</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================= */}
            {/* VIEW H-4C: ADMIN MEDIA & EVENT GALLERY                  */}
            {/* ======================================================= */}
            {activePortal === "ADMIN" && adminActiveTab === "gallery" && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Media & Event Gallery</h1>
                    <p className="text-xs text-slate-500 mt-1">Upload, curate, and archive event photos, convention media, and chapter activities.</p>
                  </div>
                  <button 
                    onClick={() => setShowUploadGalleryModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>+ Upload New Photo</span>
                  </button>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {["ALL", "Rally", "Worship", "Leadership", "Fellowship", "Community", "Sports"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGalleryCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        galleryCategoryFilter === cat
                          ? "bg-navy-950 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {cat === "ALL" ? "All Photos" : cat}
                    </button>
                  ))}
                </div>

                {/* Gallery Photo Grid — Foreground Focused Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryPhotos
                    .filter((p) => galleryCategoryFilter === "ALL" || p.category.toLowerCase() === galleryCategoryFilter.toLowerCase())
                    .map((photo) => (
                      <div 
                        key={photo.id} 
                        className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-3 hover:shadow-xl hover:border-slate-300 transition-all duration-300 group flex flex-col justify-between"
                      >
                        {/* Prominent Foreground Photo Container */}
                        <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/60 shadow-inner">
                          <img 
                            src={normalizeGoogleImageUrl(photo.url)} 
                            alt={photo.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" 
                            onClick={() => setPreviewGalleryPhoto(photo)}
                          />
                          
                          {/* Top Floating Badges & Actions */}
                          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                            <div className="flex items-center gap-1.5 pointer-events-auto">
                              <span className="px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-amber-300 font-bold text-[10px] tracking-wide border border-white/10 shadow-sm">
                                {photo.category}
                              </span>
                              {(photo.isAlbum || photo.albumUrl) && (
                                <span className="px-2 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[9px] tracking-wide border border-white/20 shadow-sm flex items-center gap-1">
                                  <Images className="w-3 h-3" />
                                  <span>Shared Album</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 pointer-events-auto">
                              {(photo.isAlbum || photo.albumUrl) && (
                                <a
                                  href={photo.albumUrl || photo.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-1.5 rounded-full bg-emerald-600/90 hover:bg-emerald-500 backdrop-blur-md text-white border border-white/20 shadow-sm transition-transform active:scale-90"
                                  title="Open Google Photos / Drive Album"
                                >
                                  <FolderOpen className="w-3.5 h-3.5 text-white" />
                                </a>
                              )}
                              <button
                                onClick={() => setPreviewGalleryPhoto(photo)}
                                className="p-1.5 rounded-full bg-navy-950/80 hover:bg-navy-900 backdrop-blur-md text-white border border-white/10 shadow-sm transition-transform active:scale-90"
                                title="Expand in Lightbox"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                              <a
                                href={photo.albumUrl || normalizeGoogleImageUrl(photo.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-full bg-navy-950/80 hover:bg-navy-900 backdrop-blur-md text-white border border-white/10 shadow-sm transition-transform active:scale-90"
                                title="Open Direct Photo Link"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                              </a>
                            </div>
                          </div>

                          {/* Bottom Foreground Gradient Overlay with Photo Caption */}
                          <div 
                            onClick={() => setPreviewGalleryPhoto(photo)}
                            className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/95 via-navy-950/70 to-transparent p-4 pt-10 text-white cursor-pointer"
                          >
                            <h4 className="font-heading font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                              {photo.title}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1">
                              <span className="font-medium text-teal-300">{photo.event}</span>
                              <span className="text-[10px] text-slate-400">{photo.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Sub-bar: Uploader Attribution & Delete Trigger */}
                        <div className="pt-3 px-2 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500 font-medium">Uploaded by <strong className="text-slate-700">{photo.uploader}</strong></span>
                          <button
                            onClick={async () => {
                              if (confirm(`Remove "${photo.title}" from gallery?`)) {
                                setGalleryPhotos(prev => prev.filter(p => p.id !== photo.id));
                                setLocationToast("Photo removed from gallery.");
                                try {
                                  await fetch(`/api/gallery?id=${encodeURIComponent(photo.id)}`, { method: "DELETE" });
                                } catch (err) {
                                  console.warn("Failed to delete photo:", err);
                                }
                                setTimeout(() => setLocationToast(null), 3000);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW H-NEWS: ADMIN NEWS & CMS                              */}
            {/* ========================================================= */}
            {activePortal === "ADMIN" && adminActiveTab === "news" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">News &amp; CMS</h1>
                    <p className="text-xs text-slate-500 mt-1">Publish official bulletins, rally announcements, spiritual devotionals, and general council communications to all chapter portals.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingNewsId(null);
                      setNewsForm({ title: "", category: "NEWS", author: "Council Admin", summary: "", content: "", featuredImageUrl: "", status: "PUBLISHED" });
                      setShowCreateNewsModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>New Article</span>
                  </button>
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {["ALL", "NEWS", "ANNOUNCEMENT", "FINANCE", "SPIRITUAL", "STORY"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewsFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        newsFilter === cat
                          ? "bg-navy-950 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {cat === "ALL" ? "All Posts" : cat.replace("_", " ")}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{newsList.length} article{newsList.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Posts", value: newsList.length, icon: <Newspaper className="w-4 h-4" />, color: "bg-navy-50 text-navy-800" },
                    { label: "Published", value: newsList.filter(n => n.status === "PUBLISHED").length, icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-800" },
                    { label: "Announcements", value: newsList.filter(n => n.category?.toUpperCase() === "ANNOUNCEMENT").length, icon: <Bell className="w-4 h-4" />, color: "bg-amber-50 text-amber-800" },
                    { label: "Spiritual", value: newsList.filter(n => n.category?.toUpperCase() === "SPIRITUAL").length, icon: <Sparkles className="w-4 h-4" />, color: "bg-teal-50 text-teal-800" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-2xl border border-slate-100 p-4 flex items-center gap-3 ${stat.color}`}>
                      <div className="opacity-70">{stat.icon}</div>
                      <div>
                        <p className="text-lg font-black">{stat.value}</p>
                        <p className="text-[10px] font-semibold opacity-70">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Articles grid */}
                {newsList.filter(n => newsFilter === "ALL" || n.category?.toUpperCase() === newsFilter.toUpperCase()).length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                    <Newspaper className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-sm">No articles yet</p>
                    <p className="text-xs mt-1">Click "New Article" to publish your first council communication.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newsList
                      .filter(n => newsFilter === "ALL" || n.category?.toUpperCase() === newsFilter.toUpperCase())
                      .map((post) => (
                        <div key={post.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-start gap-4 hover:border-navy-300 hover:shadow-md transition-all group">
                          {/* Featured image or category badge */}
                          <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden bg-gradient-to-br from-navy-900 to-teal-900 flex items-center justify-center">
                            {post.featuredImageUrl ? (
                              <img src={post.featuredImageUrl} alt={post.title} className="w-full h-full object-cover" />
                            ) : (
                              <Newspaper className="w-6 h-6 text-amber-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mb-1 ${
                                  post.category?.toUpperCase() === "ANNOUNCEMENT" ? "bg-amber-100 text-amber-800" :
                                  post.category?.toUpperCase() === "SPIRITUAL" ? "bg-teal-100 text-teal-800" :
                                  post.category?.toUpperCase() === "FINANCE" ? "bg-emerald-100 text-emerald-800" :
                                  "bg-slate-100 text-slate-700"
                                }`}>{post.category}</span>
                                <h3 className="font-heading font-black text-base text-navy-950 leading-snug group-hover:text-teal-700 transition-colors">{post.title}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.summary || post.content}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    setEditingNewsId(post.id);
                                    setNewsForm({
                                      title: post.title || "",
                                      category: post.category || "NEWS",
                                      author: post.author || "Council Admin",
                                      summary: post.summary || "",
                                      content: post.content || "",
                                      featuredImageUrl: post.featuredImageUrl || "",
                                      status: post.status || "PUBLISHED",
                                    });
                                    setShowCreateNewsModal(true);
                                  }}
                                  className="p-2 rounded-xl hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                                  title="Edit article"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNews(post.id, post.title)}
                                  className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete article"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author || "Council Admin"}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.publishedAt || post.createdAt || "Recent"}</span>
                              <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold ${post.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                {post.status || "PUBLISHED"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW H-RESOURCES: ADMIN RESOURCES & DOCUMENTS              */}
            {/* ========================================================= */}
            {activePortal === "ADMIN" && adminActiveTab === "resources" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950">Resources &amp; Documents</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage official CUCASO documents, constitutions, rally guidelines, forms, and chapter resources in the central repository.</p>
                  </div>
                  <button
                    onClick={() => {
                      setResourceForm({ title: "", category: "POLICY", accessLevel: "PUBLIC", description: "", url: "", fileSize: "1.2 MB", mimeType: "application/pdf" });
                      setShowCreateResourceModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Add Document</span>
                  </button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {["ALL", "SPIRITUAL", "POLICY", "FINANCE", "RALLY", "FORMS", "CONSTITUTION", "GUIDELINES", "REPORT"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setResourceFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        resourceFilter === cat
                          ? "bg-navy-950 text-white shadow-sm"
                          : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {cat === "ALL" ? "All Documents" : cat.replace("_", " ")}
                    </button>
                  ))}
                  <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{resourcesList.length} document{resourcesList.length !== 1 ? "s" : ""}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Total Docs", value: resourcesList.length, icon: <FolderArchive className="w-4 h-4" />, color: "bg-navy-50 text-navy-800" },
                    { label: "Public", value: resourcesList.filter(r => r.accessLevel === "PUBLIC").length, icon: <Globe className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-800" },
                    { label: "Restricted", value: resourcesList.filter(r => r.accessLevel !== "PUBLIC").length, icon: <ShieldCheck className="w-4 h-4" />, color: "bg-amber-50 text-amber-800" },
                    { label: "Policy Docs", value: resourcesList.filter(r => r.category?.toUpperCase() === "POLICY").length, icon: <BookOpen className="w-4 h-4" />, color: "bg-teal-50 text-teal-800" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-2xl border border-slate-100 p-4 flex items-center gap-3 ${stat.color}`}>
                      <div className="opacity-70">{stat.icon}</div>
                      <div>
                        <p className="text-lg font-black">{stat.value}</p>
                        <p className="text-[10px] font-semibold opacity-70">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documents list */}
                {resourcesList.filter(r => resourceFilter === "ALL" || r.category?.toUpperCase() === resourceFilter.toUpperCase()).length === 0 ? (
                  <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                    <FolderArchive className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-bold text-sm">No documents yet</p>
                    <p className="text-xs mt-1">Click "Add Document" to upload or link your first resource.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resourcesList
                      .filter(r => resourceFilter === "ALL" || r.category?.toUpperCase() === resourceFilter.toUpperCase())
                      .map((doc) => (
                        <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-teal-300 hover:shadow-md transition-all group">
                          {/* Icon */}
                          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50 transition-colors">
                            <FileText className="w-5 h-5 text-slate-500 group-hover:text-teal-700 transition-colors" />
                          </div>
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-bold text-sm text-navy-950 leading-snug">{doc.title}</h3>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{doc.description}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {doc.url && (
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl hover:bg-teal-50 text-slate-400 hover:text-teal-700 transition-colors"
                                    title="Open document"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteResource(doc.id, doc.title)}
                                  className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                doc.category?.toUpperCase() === "POLICY" ? "bg-navy-100 text-navy-800" :
                                doc.category?.toUpperCase() === "FINANCE" ? "bg-emerald-100 text-emerald-800" :
                                doc.category?.toUpperCase() === "RALLY" ? "bg-amber-100 text-amber-800" :
                                "bg-slate-100 text-slate-700"
                              }`}>{doc.category}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                doc.accessLevel === "PUBLIC" ? "bg-teal-100 text-teal-800" : "bg-amber-100 text-amber-700"
                              }`}>{doc.accessLevel}</span>
                              {doc.fileSize && <span className="text-[11px] text-slate-400">{doc.fileSize}</span>}
                              {(doc.createdAt || (doc as any).uploadedAt) && <span className="text-[11px] text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{doc.createdAt || (doc as any).uploadedAt}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Upload Prompt */}
                <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-teal-400" />
                  <p className="text-xs font-bold text-teal-800">Need to upload a file?</p>
                  <p className="text-[11px] text-teal-600 mt-1">Use "Add Document" and paste a Google Drive, Dropbox, or direct URL link, or use the Chapter Documents section to upload files to cloud storage.</p>
                </div>
              </div>
            )}

            {/* VIEW: ADMIN INBOX & PRAYER REQUESTS */}
            {activePortal === "ADMIN" && adminActiveTab === "inbox" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-heading font-black text-2xl text-navy-950 flex items-center gap-2.5">
                      <Inbox className="w-6 h-6 text-amber-500" />
                      <span>Inbox &amp; Pastoral Communications</span>
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Direct feedback from the Contact page and prayer petitions from the Spiritual Resources centre.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchInboxData}
                      disabled={inboxLoading}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${inboxLoading ? "animate-spin text-amber-500" : "text-slate-500"}`} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Inquiries</span>
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-black text-blue-950 mt-2">{contactMessages.length}</p>
                    <p className="text-[10px] text-blue-700 font-semibold mt-0.5">
                      {contactMessages.filter(m => !m.isRead).length} unread
                    </p>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Prayer Requests</span>
                      <Heart className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-2xl font-black text-rose-950 mt-2">{prayerRequests.length}</p>
                    <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
                      {prayerRequests.filter(p => !p.isRead).length} new requests
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Confidential</span>
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-2xl font-black text-amber-950 mt-2">
                      {prayerRequests.filter(p => p.isPrivate).length}
                    </p>
                    <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                      Pastoral team only
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Public Prayers</span>
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-emerald-950 mt-2">
                      {prayerRequests.filter(p => p.isModeratedApproved).length}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Approved for wall
                    </p>
                  </div>
                </div>

                {/* Sub Tab Switcher & Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInboxSubTab("feedback")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        inboxSubTab === "feedback"
                          ? "bg-navy-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact Feedback</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${inboxSubTab === "feedback" ? "bg-amber-400 text-navy-950" : "bg-slate-200 text-slate-700"}`}>
                        {contactMessages.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setInboxSubTab("prayer")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        inboxSubTab === "prayer"
                          ? "bg-navy-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Prayer Requests</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${inboxSubTab === "prayer" ? "bg-amber-400 text-navy-950" : "bg-slate-200 text-slate-700"}`}>
                        {prayerRequests.length}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={inboxSearch}
                        onChange={(e) => setInboxSearch(e.target.value)}
                        placeholder="Search name, text, email..."
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-navy-900 w-48 sm:w-64"
                      />
                    </div>

                    <select
                      value={inboxStatusFilter}
                      onChange={(e) => setInboxStatusFilter(e.target.value as any)}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 font-semibold focus:outline-none"
                    >
                      <option value="ALL">All Status</option>
                      <option value="UNREAD">Unread Only</option>
                      <option value="READ">Read / Answered</option>
                    </select>
                  </div>
                </div>

                {/* Sub Tab 1: Contact Messages */}
                {inboxSubTab === "feedback" && (
                  <div className="space-y-3">
                    {contactMessages
                      .filter((m) => {
                        if (inboxStatusFilter === "UNREAD") return !m.isRead;
                        if (inboxStatusFilter === "READ") return m.isRead;
                        return true;
                      })
                      .filter((m) => {
                        if (!inboxSearch.trim()) return true;
                        const q = inboxSearch.toLowerCase();
                        return (
                          m.name?.toLowerCase().includes(q) ||
                          m.email?.toLowerCase().includes(q) ||
                          m.message?.toLowerCase().includes(q) ||
                          m.institution?.toLowerCase().includes(q) ||
                          m.subject?.toLowerCase().includes(q)
                        );
                      }).length === 0 ? (
                      <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                        <Mail className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="font-bold text-sm">No feedback messages found</p>
                        <p className="text-xs mt-1">Inquiries submitted via the Contact page will appear here instantly.</p>
                      </div>
                    ) : (
                      contactMessages
                        .filter((m) => {
                          if (inboxStatusFilter === "UNREAD") return !m.isRead;
                          if (inboxStatusFilter === "READ") return m.isRead;
                          return true;
                        })
                        .filter((m) => {
                          if (!inboxSearch.trim()) return true;
                          const q = inboxSearch.toLowerCase();
                          return (
                            m.name?.toLowerCase().includes(q) ||
                            m.email?.toLowerCase().includes(q) ||
                            m.message?.toLowerCase().includes(q) ||
                            m.institution?.toLowerCase().includes(q) ||
                            m.subject?.toLowerCase().includes(q)
                          );
                        })
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              msg.isRead
                                ? "bg-white border-slate-200"
                                : "bg-blue-50/40 border-blue-200 shadow-sm"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                  msg.isRead ? "bg-slate-100 text-slate-600" : "bg-blue-600 text-white shadow-sm"
                                }`}>
                                  {msg.name ? msg.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-heading font-bold text-sm text-navy-950">{msg.name}</h3>
                                    {msg.institution && (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                        {msg.institution}
                                      </span>
                                    )}
                                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                                      {msg.subject?.replace(/_/g, " ")}
                                    </span>
                                    {!msg.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-blue-600" title="Unread message" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                    {msg.email && (
                                      <a href={`mailto:${msg.email}`} className="text-teal-700 font-semibold hover:underline flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        <span>{msg.email}</span>
                                      </a>
                                    )}
                                    {msg.phone && (
                                      <a href={`tel:${msg.phone}`} className="text-slate-600 hover:text-navy-950 flex items-center gap-1">
                                        <span>📞 {msg.phone}</span>
                                      </a>
                                    )}
                                    <span className="text-[11px] text-slate-400">
                                      {new Date(msg.createdAt).toLocaleDateString("en-KE", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                                {msg.email && (
                                  <a
                                    href={`mailto:${msg.email}?subject=RE: CUCASO Inquiry - ${msg.subject}`}
                                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-colors flex items-center gap-1"
                                    title="Reply via email"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                    <span>Reply</span>
                                  </a>
                                )}
                                <button
                                  onClick={() => handleToggleMessageRead(msg.id, msg.isRead)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    msg.isRead
                                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      : "bg-blue-600 text-white hover:bg-blue-700"
                                  }`}
                                >
                                  {msg.isRead ? "Mark Unread" : "Mark as Read"}
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100/80 bg-white/70 rounded-xl p-3.5">
                              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-body">
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}

                {/* Sub Tab 2: Prayer Requests */}
                {inboxSubTab === "prayer" && (
                  <div className="space-y-3">
                    {prayerRequests
                      .filter((p) => {
                        if (inboxStatusFilter === "UNREAD") return !p.isRead;
                        if (inboxStatusFilter === "READ") return p.isRead;
                        return true;
                      })
                      .filter((p) => {
                        if (!inboxSearch.trim()) return true;
                        const q = inboxSearch.toLowerCase();
                        return (
                          p.submitterName?.toLowerCase().includes(q) ||
                          p.submitterContact?.toLowerCase().includes(q) ||
                          p.requestText?.toLowerCase().includes(q)
                        );
                      }).length === 0 ? (
                      <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                        <Heart className="w-10 h-10 mx-auto mb-3 text-rose-300" />
                        <p className="font-bold text-sm">No prayer requests found</p>
                        <p className="text-xs mt-1">Petitions submitted via the Resources page will be collected here for the pastoral prayer team.</p>
                      </div>
                    ) : (
                      prayerRequests
                        .filter((p) => {
                          if (inboxStatusFilter === "UNREAD") return !p.isRead;
                          if (inboxStatusFilter === "READ") return p.isRead;
                          return true;
                        })
                        .filter((p) => {
                          if (!inboxSearch.trim()) return true;
                          const q = inboxSearch.toLowerCase();
                          return (
                            p.submitterName?.toLowerCase().includes(q) ||
                            p.submitterContact?.toLowerCase().includes(q) ||
                            p.requestText?.toLowerCase().includes(q)
                          );
                        })
                        .map((prayer) => (
                          <div
                            key={prayer.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              prayer.isRead
                                ? "bg-white border-slate-200"
                                : "bg-rose-50/40 border-rose-200 shadow-sm"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                                  prayer.isRead ? "bg-slate-100 text-slate-600" : "bg-rose-500 text-white shadow-sm"
                                }`}>
                                  <Heart className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-heading font-bold text-sm text-navy-950">
                                      {prayer.submitterName || "Anonymous Brother/Sister"}
                                    </h3>
                                    {prayer.isPrivate ? (
                                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center gap-1">
                                        <span>🔒 Confidential (Pastoral Team)</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                                        <span>🌐 Public Prayer Wall</span>
                                      </span>
                                    )}
                                    {prayer.isModeratedApproved && (
                                      <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                                        ✓ Approved
                                      </span>
                                    )}
                                    {!prayer.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-rose-500" title="New prayer request" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                                    {prayer.submitterContact && (
                                      <span className="font-medium text-slate-600">
                                        Contact: {prayer.submitterContact}
                                      </span>
                                    )}
                                    <span className="text-[11px] text-slate-400">
                                      {new Date(prayer.createdAt).toLocaleDateString("en-KE", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                                <button
                                  onClick={() => handleTogglePrayerApproved(prayer.id, prayer.isModeratedApproved)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    prayer.isModeratedApproved
                                      ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                                  }`}
                                  title="Toggle public approval"
                                >
                                  {prayer.isModeratedApproved ? "Unapprove" : "Approve for Wall"}
                                </button>
                                <button
                                  onClick={() => handleTogglePrayerRead(prayer.id, prayer.isRead)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    prayer.isRead
                                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                      : "bg-rose-600 text-white hover:bg-rose-700"
                                  }`}
                                >
                                  {prayer.isRead ? "Mark Unread" : "Mark as Prayed"}
                                </button>
                                <button
                                  onClick={() => handleDeletePrayer(prayer.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete prayer request"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100/80 bg-white/70 rounded-xl p-3.5">
                              <p className="text-xs text-slate-800 leading-relaxed italic whitespace-pre-wrap font-body">
                                &ldquo;{prayer.requestText}&rdquo;
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
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
                  <button 
                    onClick={() => setShowInviteUserModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Invite User</span>
                  </button>
                </div>

                {/* Role Filter Chips & Counts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[
                    { roleKey: "SUPER_ADMIN", role: "Super Administrator", desc: "Full system access. Manage all chapters, rallies, users, funding engine, and audit log.", color: "border-amber-500 bg-amber-50", badge: "bg-amber-500 text-white", icon: ShieldCheck },
                    { roleKey: "CENTRAL_TREASURER", role: "Council Treasurer", desc: "Access to payments, reconciliation, invoice management, and funding dashboard.", color: "border-teal-500 bg-teal-50", badge: "bg-teal-600 text-white", icon: CreditCard },
                    { roleKey: "SECRETARY", role: "Organization Secretary", desc: "Chapter onboarding queue, document management, and attendee master roster.", color: "border-blue-500 bg-blue-50", badge: "bg-blue-600 text-white", icon: FileText },
                    { roleKey: "COMMUNICATIONS_DIRECTOR", role: "Communication Director", desc: "Notifications dispatch, gallery uploads, and public website content management.", color: "border-purple-500 bg-purple-50", badge: "bg-purple-600 text-white", icon: Bell },
                    { roleKey: "CHAPTER_REP", role: "Chapter Representative", desc: "Chapter-scoped portal: their own attendees, invoice view, and rally information.", color: "border-slate-300 bg-slate-50", badge: "bg-slate-700 text-white", icon: Building2 },
                    { roleKey: "OBSERVER", role: "Read-Only Observer", desc: "View-only access to approved reports and chapter lists for ex-officio council members.", color: "border-slate-200 bg-white", badge: "bg-slate-400 text-white", icon: User },
                  ].map((item) => {
                    const count = usersList.filter(u => u.role === item.roleKey).length;
                    const isSelected = selectedRoleFilter === item.roleKey;
                    return (
                      <div 
                        key={item.roleKey} 
                        className={`p-6 rounded-2xl border-2 ${item.color} shadow-sm transition-all hover:shadow-md ${isSelected ? "ring-2 ring-navy-900 ring-offset-2" : ""}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.badge}`}>
                            {item.role}
                          </span>
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            {count} user{count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <item.icon className="w-8 h-8 text-slate-400 mb-3" />
                        <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                        <button 
                          onClick={() => setSelectedRoleFilter(isSelected ? null : item.roleKey)}
                          className={`mt-4 text-xs font-bold flex items-center gap-1 transition-colors ${isSelected ? "text-amber-700 underline" : "text-teal-700 hover:underline"}`}
                        >
                          <span>{isSelected ? "Clear Filter" : "Filter this role"}</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Master User Directory Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy-950">Active Users Directory</h3>
                      <p className="text-xs text-slate-400">Directly switch portal contexts, manage roles, or toggle user activation.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text"
                          placeholder="Search users..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-navy-900"
                        />
                      </div>
                      {selectedRoleFilter && (
                        <button 
                          onClick={() => setSelectedRoleFilter(null)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-[11px] font-bold hover:bg-amber-200"
                        >
                          Clear ({selectedRoleFilter})
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="pb-3 px-3">User & Contact</th>
                          <th className="pb-3 px-3">Role</th>
                          <th className="pb-3 px-3">Chapter / Context</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3">2FA</th>
                          <th className="pb-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {usersList
                          .filter(u => {
                            if (selectedRoleFilter && u.role !== selectedRoleFilter) return false;
                            if (userSearchQuery) {
                              const q = userSearchQuery.toLowerCase();
                              return (
                                u.name.toLowerCase().includes(q) ||
                                u.email.toLowerCase().includes(q) ||
                                (u.chapterName && u.chapterName.toLowerCase().includes(q))
                              );
                            }
                            return true;
                          })
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-navy-900 text-white font-bold text-xs flex items-center justify-center">
                                    {u.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-900 block">{u.name}</span>
                                    <span className="text-[11px] text-slate-400">{u.email}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <select 
                                  value={u.role}
                                  onChange={(e) => handleUpdateUserRole(u.id, e.target.value as any)}
                                  className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-900"
                                >
                                  <option value="SUPER_ADMIN">Super Administrator</option>
                                  <option value="CENTRAL_TREASURER">Council Treasurer</option>
                                  <option value="SECRETARY">Organization Secretary</option>
                                  <option value="COMMUNICATIONS_DIRECTOR">Communication Director</option>
                                  <option value="CHAPTER_REP">Chapter Representative</option>
                                  <option value="OBSERVER">Read-Only Observer</option>
                                </select>
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-slate-600 font-semibold">{u.chapterName || "Central Council"}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                                  {u.status}
                                </span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`text-[10px] font-bold ${u.twoFactorEnabled ? "text-emerald-700" : "text-slate-400"}`}>
                                  {u.twoFactorEnabled ? "Enabled" : "Disabled"}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button 
                                    onClick={() => handleSwitchUserPortal(u)}
                                    className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition-colors"
                                    title="Impersonate / Switch Portal View"
                                  >
                                    Switch Portal
                                  </button>
                                  <button 
                                    onClick={() => handleToggleUserStatus(u.id, u.status)}
                                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                                    title={u.status === "ACTIVE" ? "Suspend user" : "Activate user"}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                                    title="Delete user"
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

                {/* Active Sessions */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-heading font-bold text-base text-navy-950 mb-4">Active Portal Sessions</h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { user: "Council Admin", role: "Super Administrator", roleKey: "SUPER_ADMIN", device: "Chrome • Windows", ip: "41.90.x.x (Mombasa)", session: "Active now", online: true },
                      { user: "David Kiboi", role: "Chapter Representative (TUM)", roleKey: "CHAPTER_REP", chapterId: "ch-tum", device: "Safari • iPhone 14", ip: "197.136.x.x (Nairobi)", session: "2 mins ago", online: true },
                      { user: "Mercy Chebet", role: "Chapter Representative (Pwani)", roleKey: "CHAPTER_REP", chapterId: "ch-pwani", device: "Chrome • Android", ip: "41.80.x.x (Kilifi)", session: "18 mins ago", online: false },
                      { user: "CUCASO Treasurer", role: "Council Treasurer", roleKey: "CENTRAL_TREASURER", device: "Firefox • macOS", ip: "41.90.x.x (Mombasa)", session: "1 hour ago", online: false },
                    ].map((session) => (
                      <div 
                        key={session.user} 
                        onClick={() => {
                          if (session.roleKey === "CHAPTER_REP") {
                            setActivePortal("CHAPTER");
                            if (session.chapterId) setSelectedChapterId(session.chapterId);
                            setChapterActiveTab("dashboard");
                            setLocationToast(`Switched session to ${session.user}`);
                          } else {
                            setActivePortal("ADMIN");
                            setAdminActiveTab("overview");
                            setLocationToast(`Switched session to ${session.user}`);
                          }
                          setTimeout(() => setLocationToast(null), 3000);
                        }}
                        className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-colors"
                      >
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
                    {AUDIT_LOGS.map((log: AuditLogEntry) => (
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

      {/* ========================================================= */}
      {/* FLOATING TOAST NOTIFICATIONS                              */}
      {/* ========================================================= */}
      {(locationToast || remittanceToast || passwordToast) && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-md">
          <div className="bg-navy-950 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-navy-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <span className="text-xs font-semibold leading-snug">
              {locationToast || remittanceToast || passwordToast}
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: EDIT PROFILE                                     */}
      {/* ========================================================= */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Edit Profile</h3>
                  <p className="text-xs text-slate-400">Update your account representative details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditProfileModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Avatar Photo Preview / Upload */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-navy-800 to-teal-700 text-white font-heading font-black text-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  {profileForm.avatarUrl ? (
                    <img src={profileForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (profileForm.name || "JM").split(" ").map(w => w[0]).join("").slice(0, 2)
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <span className="block text-xs font-bold text-navy-950">Profile Photo</span>
                  <p className="text-[11px] text-slate-400">Upload a JPG, PNG or WebP picture</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>Choose Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          setProfileForm(prev => ({ ...prev, avatarUrl: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name</label>
                <input 
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  placeholder="e.g. John Mwangi"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input 
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    placeholder="+254 720 112 233"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input 
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    placeholder="rep@cucaso.org"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CHANGE PASSWORD                                  */}
      {/* ========================================================= */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Change Password</h3>
                  <p className="text-xs text-slate-400">Ensure your account uses a strong password</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChangePasswordModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="Repeat new password"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CHAPTER LEADERSHIP & PHOTOS                      */}
      {/* ========================================================= */}
      {showLeadershipModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Update Chapter Leadership & Photos</h3>
                  <p className="text-xs text-slate-400">{currentChapter.institutionName} ({currentChapter.code})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLeadershipModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveChapterLeadership} className="space-y-5">
              {/* Chapter Patron */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">1. Chapter Patron</span>
                  <span className="text-[11px] text-teal-700 font-semibold">Faculty / Staff Advisor</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Patron Full Name</label>
                    <input 
                      type="text"
                      value={leadershipForm.patronName}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, patronName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="e.g. Dr. Samuel Ochieng"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Patron Phone Number</label>
                    <input 
                      type="text"
                      value={leadershipForm.patronPhone}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, patronPhone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="+254 711 000 000"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {leadershipForm.patronPhoto ? (
                      <img src={leadershipForm.patronPhoto} alt="Patron" className="w-8 h-8 rounded-full object-cover border border-teal-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {(leadershipForm.patronName || "PT").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] text-slate-500">Patron Photograph</span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>{leadershipForm.patronPhoto ? "Change Photo" : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          setLeadershipForm(prev => ({ ...prev, patronPhoto: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Chapter Representative */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">2. Chapter Representative</span>
                  <span className="text-[11px] text-teal-700 font-semibold">Primary Delegate Lead</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Representative Name</label>
                    <input 
                      type="text"
                      value={leadershipForm.repName}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, repName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="e.g. John Mwangi"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Representative Phone</label>
                    <input 
                      type="text"
                      value={leadershipForm.repPhone}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, repPhone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="+254 720 112 233"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {leadershipForm.repPhoto ? (
                      <img src={leadershipForm.repPhoto} alt="Representative" className="w-8 h-8 rounded-full object-cover border border-teal-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {(leadershipForm.repName || "RP").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] text-slate-500">Representative Photograph</span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>{leadershipForm.repPhoto ? "Change Photo" : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          setLeadershipForm(prev => ({ ...prev, repPhoto: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Treasurer & Secretary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">3. Chapter Treasurer</span>
                  <span className="text-[11px] text-teal-700 font-semibold">Finance & Remittance</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Treasurer Name</label>
                    <input 
                      type="text"
                      value={leadershipForm.treasurerName}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, treasurerName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="e.g. Grace Achieng"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Treasurer Phone</label>
                    <input 
                      type="text"
                      value={leadershipForm.treasurerPhone}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, treasurerPhone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="+254 733 444 555"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {leadershipForm.treasurerPhoto ? (
                      <img src={leadershipForm.treasurerPhoto} alt="Treasurer" className="w-8 h-8 rounded-full object-cover border border-teal-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {(leadershipForm.treasurerName || "TR").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] text-slate-500">Treasurer Photograph</span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>{leadershipForm.treasurerPhoto ? "Change Photo" : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          setLeadershipForm(prev => ({ ...prev, treasurerPhoto: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Chapter Secretary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-950 uppercase tracking-wider">4. Chapter Secretary</span>
                  <span className="text-[11px] text-teal-700 font-semibold">Records & Communication</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Secretary Name</label>
                    <input 
                      type="text"
                      value={leadershipForm.secretaryName}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, secretaryName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="e.g. Samuel Mutua"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Secretary Phone</label>
                    <input 
                      type="text"
                      value={leadershipForm.secretaryPhone}
                      onChange={(e) => setLeadershipForm(prev => ({ ...prev, secretaryPhone: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                      placeholder="+254 744 555 666"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    {leadershipForm.secretaryPhoto ? (
                      <img src={leadershipForm.secretaryPhoto} alt="Secretary" className="w-8 h-8 rounded-full object-cover border border-teal-500" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center">
                        {(leadershipForm.secretaryName || "SC").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="text-[11px] text-slate-500">Secretary Photograph</span>
                  </div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-teal-600" />
                    <span>{leadershipForm.secretaryPhoto ? "Change Photo" : "Upload Photo"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          setLeadershipForm(prev => ({ ...prev, secretaryPhoto: url }));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowLeadershipModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLeadership}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingLeadership ? "Saving Roster..." : "Save Chapter Leadership"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: COUNCIL LEADER EDIT / ADD MODAL                   */}
      {/* ========================================================= */}
      {showCouncilLeaderModal && editingLeader && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">
                    {editingLeader.id?.startsWith("lead-") ? "+ Add Council Leader" : "Edit Council Leader"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingLeader.title || "Specify leader details & directory placement"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { setShowCouncilLeaderModal(false); setEditingLeader(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCouncilLeader} className="space-y-4">
              {/* Leader Photo Upload & Preview */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-900 to-amber-700 text-white font-heading font-black text-xl flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  {editingLeader.imageUrl || editingLeader.image ? (
                    <img src={normalizeGoogleImageUrl(editingLeader.imageUrl || editingLeader.image || "")} alt={editingLeader.name} className="w-full h-full object-cover" />
                  ) : (
                    (editingLeader.name || "CL").split(" ").map(w => w[0]).join("").slice(0, 2)
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <span className="block text-xs font-bold text-navy-950">Official Portrait Photo</span>
                  <p className="text-[11px] text-slate-400">Upload portrait file or paste Google link below</p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-sm">
                    <Camera className="w-3.5 h-3.5 text-amber-600" />
                    <span>{editingLeader.imageUrl || editingLeader.image ? "Change Photo File" : "Upload Photo File"}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleUploadImage(file);
                          setEditingLeader(prev => prev ? { ...prev, imageUrl: url, image: url } : null);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portrait Image Link (Google Photos / Web URL)</label>
                <input 
                  type="text"
                  value={editingLeader.imageUrl || editingLeader.image || ""}
                  onChange={(e) => {
                    const norm = normalizeGoogleImageUrl(e.target.value);
                    setEditingLeader(prev => prev ? { ...prev, imageUrl: norm, image: norm } : null);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="https://drive.google.com/file/d/... or direct image link"
                />
              </div>

              {/* Leadership Category Switcher: Central Council vs Other */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Council Placement / Category</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingLeader(prev => prev ? { ...prev, category: "CENTRAL_COUNCIL" } : null)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      (editingLeader.category || "CENTRAL_COUNCIL") === "CENTRAL_COUNCIL"
                        ? "bg-navy-950 text-white border-navy-950 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Central Council</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLeader(prev => prev ? { ...prev, category: "OTHER" } : null)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                      editingLeader.category === "OTHER"
                        ? "bg-navy-950 text-white border-navy-950 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <Users className="w-4 h-4 text-teal-400" />
                    <span>Other (Regional / Advisory)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Official Title / Office</label>
                <input 
                  type="text"
                  required
                  value={editingLeader.title}
                  onChange={(e) => setEditingLeader(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="e.g. Chairperson, Secretary, Treasurer..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Leader Full Name</label>
                <input 
                  type="text"
                  required
                  value={editingLeader.name}
                  onChange={(e) => setEditingLeader(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="e.g. Walter Ngetich"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                  <input 
                    type="text"
                    value={editingLeader.phone || ""}
                    onChange={(e) => setEditingLeader(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    placeholder="+254 720 000 000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input 
                    type="email"
                    value={editingLeader.email || ""}
                    onChange={(e) => setEditingLeader(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    placeholder="leader@cucaso.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Institution / Chapter Affiliation</label>
                <input 
                  type="text"
                  value={editingLeader.institution || ""}
                  onChange={(e) => setEditingLeader(prev => prev ? { ...prev, institution: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="e.g. CUCASO Central Council or Technical University of Mombasa"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Brief Biography</label>
                <textarea 
                  rows={3}
                  value={editingLeader.bio || ""}
                  onChange={(e) => setEditingLeader(prev => prev ? { ...prev, bio: e.target.value } : null)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  placeholder="Responsibilities, spiritual and institutional alignment..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
                {!editingLeader.id?.startsWith("lead-") ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCouncilLeader(editingLeader.id, editingLeader.name)}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Leader</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowCouncilLeaderModal(false); setEditingLeader(null); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCouncilLeader}
                    className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 text-amber-400" />
                    <span>{savingCouncilLeader ? "Saving..." : (editingLeader.id?.startsWith("lead-") ? "Add to Council" : "Save Council Profile")}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: INVITE USER (ADMIN RBAC)                          */}
      {/* ========================================================= */}
      {showInviteUserModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-navy-900 text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Invite Portal User</h3>
                  <p className="text-xs text-slate-400">Assign roles and portal permissions</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInviteUserModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">User Full Name</label>
                <input 
                  type="text"
                  required
                  value={inviteUserForm.name}
                  onChange={(e) => setInviteUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                  placeholder="e.g. Dennis Omwenga"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email"
                  required
                  value={inviteUserForm.email}
                  onChange={(e) => setInviteUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                  placeholder="dennis@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">System Role</label>
                <select 
                  value={inviteUserForm.role}
                  onChange={(e) => setInviteUserForm(prev => ({ ...prev, role: e.target.value as any }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                >
                  <option value="CHAPTER_REP">Chapter Representative</option>
                  <option value="SUPER_ADMIN">Super Administrator</option>
                  <option value="CENTRAL_TREASURER">Council Treasurer</option>
                  <option value="SECRETARY">Organization Secretary</option>
                  <option value="COMMUNICATIONS_DIRECTOR">Communication Director</option>
                  <option value="OBSERVER">Read-Only Observer</option>
                </select>
              </div>

              {inviteUserForm.role === "CHAPTER_REP" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Chapter</label>
                  <select 
                    value={inviteUserForm.chapterId}
                    onChange={(e) => setInviteUserForm(prev => ({ ...prev, chapterId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                  >
                    {chaptersList.map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.institutionName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInviteUserModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteUserSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{inviteUserSubmitting ? "Inviting..." : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 6: CREATE RALLY                                     */}
      {/* ========================================================= */}
      {showCreateRallyModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Create New Rally Event</h3>
                  <p className="text-xs text-slate-400">Initialize a new CUCASO annual convention</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateRallyModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRally} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Rally Code</label>
                  <input 
                    type="text"
                    required
                    value={newRallyForm.code}
                    onChange={(e) => setNewRallyForm(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Capacity</label>
                  <input 
                    type="number"
                    required
                    value={newRallyForm.capacity}
                    onChange={(e) => setNewRallyForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Rally Title</label>
                <input 
                  type="text"
                  required
                  value={newRallyForm.title}
                  onChange={(e) => setNewRallyForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Theme</label>
                <input 
                  type="text"
                  required
                  value={newRallyForm.theme}
                  onChange={(e) => setNewRallyForm(prev => ({ ...prev, theme: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Venue Name</label>
                  <input 
                    type="text"
                    required
                    value={newRallyForm.venueName}
                    onChange={(e) => setNewRallyForm(prev => ({ ...prev, venueName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Venue Location</label>
                  <input 
                    type="text"
                    required
                    value={newRallyForm.venueLocation}
                    onChange={(e) => setNewRallyForm(prev => ({ ...prev, venueLocation: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
                  <input 
                    type="date"
                    required
                    value={newRallyForm.startDate}
                    onChange={(e) => setNewRallyForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date</label>
                  <input 
                    type="date"
                    required
                    value={newRallyForm.endDate}
                    onChange={(e) => setNewRallyForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateRallyModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create & Publish Rally</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 7: EDIT RALLY — Tabbed Full Editor                   */}
      {/* ========================================================= */}
      {showEditRallyModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200 my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Edit Rally — Full Configuration</h3>
                  <p className="text-xs text-slate-400">{currentRallyData?.code || "Current Rally"} · Changes save to DB and update the website live</p>
                </div>
              </div>
              <button
                onClick={() => { setShowEditRallyModal(false); setEditRallyTab("basic"); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 px-6 pt-4 pb-0 border-b border-slate-100">
              {(["basic", "programme", "venue", "fees"] as const).map((tab) => {
                const labels: Record<string, string> = { basic: "📋 Basic Info", programme: "🗓 Programme", venue: "📍 Venue Access", fees: "💰 Fees & Capitation" };
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditRallyTab(tab)}
                    className={`px-3.5 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all ${
                      editRallyTab === tab
                        ? "border-amber-500 text-amber-700 bg-amber-50/50"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleUpdateCurrentRally}>
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">

                {/* ── TAB 1: BASIC INFO ── */}
                {editRallyTab === "basic" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Rally Title *</label>
                      <input
                        type="text" required
                        value={editRallyForm.title}
                        onChange={(e) => setEditRallyForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        placeholder="e.g. Coastal Unity Rally 2026"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Theme / Tagline *</label>
                      <input
                        type="text" required
                        value={editRallyForm.theme}
                        onChange={(e) => setEditRallyForm(prev => ({ ...prev, theme: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        placeholder="e.g. Stronger Together for a Greater Mission"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Venue Name *</label>
                        <input
                          type="text" required
                          value={editRallyForm.venueName}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueName: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Venue Location</label>
                        <input
                          type="text"
                          value={editRallyForm.venueLocation}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueLocation: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date *</label>
                        <input
                          type="date" required
                          value={editRallyForm.startDate}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date *</label>
                        <input
                          type="date" required
                          value={editRallyForm.endDate}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Registration Deadline</label>
                        <input
                          type="date"
                          value={editRallyForm.registrationDeadline}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Fee Lock Date</label>
                        <input
                          type="date"
                          value={editRallyForm.feeLockDate}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, feeLockDate: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Deadline</label>
                        <input
                          type="date"
                          value={editRallyForm.paymentDeadline}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, paymentDeadline: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Delegate Capacity</label>
                        <input
                          type="number" min={100} max={10000}
                          value={editRallyForm.capacity}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Lifecycle State *</label>
                        <select
                          value={editRallyForm.state}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, state: e.target.value as any }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                          <option value="FEE_LOCKED">FEE_LOCKED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </div>
                    </div>

                    {/* ── RALLY POSTER / HERO IMAGE ── */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><ImageIcon className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Rally Poster / Hero Banner</p>
                          <p className="text-[10px] text-slate-400">This image appears on the home page rally card and rallies page hero</p>
                        </div>
                      </div>

                      {/* Toggle: URL or Upload */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200 w-fit">
                        <button type="button"
                          onClick={() => setPosterUploadMode("url")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${posterUploadMode === "url" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          <Globe className="w-3.5 h-3.5" />
                          Paste URL
                        </button>
                        <button type="button"
                          onClick={() => setPosterUploadMode("file")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${posterUploadMode === "file" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload File
                        </button>
                      </div>

                      {posterUploadMode === "url" ? (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Image URL</label>
                          <input
                            type="url"
                            value={editRallyForm.posterUrl}
                            onChange={(e) => setEditRallyForm(prev => ({ ...prev, posterUrl: e.target.value }))}
                            placeholder="https://example.com/rally-poster.jpg"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">Use a direct image link from Google Drive, Cloudinary, or any public image URL.</p>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">Upload Image File</label>
                          <label className={`flex items-center justify-center gap-2 w-full px-4 py-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${posterUploading ? "border-indigo-400 bg-indigo-50 text-indigo-600" : "border-slate-300 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600"}`}>
                            {posterUploading ? (
                              <><RefreshCw className="w-4 h-4 animate-spin" /><span className="text-xs font-bold">Uploading…</span></>
                            ) : (
                              <><Upload className="w-4 h-4" /><span className="text-xs font-semibold">Click to choose image (JPG, PNG, WebP)</span></>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePosterFileUpload}
                              disabled={posterUploading}
                            />
                          </label>
                        </div>
                      )}

                      {/* Live Preview */}
                      {editRallyForm.posterUrl && (
                        <div className="mt-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Preview</p>
                          <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                            <img
                              src={editRallyForm.posterUrl}
                              alt="Rally poster preview"
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs" style={{zIndex: -1}}>
                              <Camera className="w-5 h-5 mr-1" /> Preview
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditRallyForm(prev => ({ ...prev, posterUrl: "" }))}
                              className="absolute top-2 right-2 p-1 rounded-lg bg-black/60 text-white hover:bg-red-600 transition-colors"
                              title="Remove poster"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* ── TAB 2: EVENT PROGRAMME ── */}
                {editRallyTab === "programme" && (
                  <div className="space-y-4">
                    {/* Header + Add Day */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Calendar className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Event Programme Days</p>
                          <p className="text-[10px] text-slate-400">{programmeDays.length} day{programmeDays.length !== 1 ? "s" : ""} configured</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProgrammeDays(prev => [...prev, {
                          dayNumber: prev.length + 1,
                          title: `Day ${prev.length + 1}`,
                          date: "",
                          timeRange: "",
                          theme: "",
                          items: [""],
                        }])}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Day
                      </button>
                    </div>

                    {programmeDays.length === 0 && (
                      <div className="text-center py-8 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-semibold">No programme days yet</p>
                        <p className="text-[10px] mt-1">Click "Add Day" to start building the programme.</p>
                      </div>
                    )}

                    {programmeDays.map((day, dIdx) => (
                      <div key={dIdx} className="rounded-2xl border border-slate-200 bg-slate-50/60 overflow-hidden">
                        {/* Day Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border-b border-amber-100">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">{day.dayNumber}</span>
                            <span className="text-xs font-bold text-amber-900">{day.title || `Day ${dIdx + 1}`}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm(`Remove Day ${dIdx + 1}?`)) return;
                              setProgrammeDays(prev => prev.filter((_, i) => i !== dIdx).map((d, i) => ({ ...d, dayNumber: i + 1 })));
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Day Fields */}
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><BookOpen className="w-3 h-3 text-amber-500" /> Day Title</label>
                              <input
                                type="text"
                                value={day.title}
                                onChange={(e) => setProgrammeDays(prev => prev.map((d, i) => i === dIdx ? { ...d, title: e.target.value } : d))}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                                placeholder="e.g. Day 1 — Arrival & Consecration"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Sparkles className="w-3 h-3 text-amber-500" /> Day Theme</label>
                              <input
                                type="text"
                                value={day.theme}
                                onChange={(e) => setProgrammeDays(prev => prev.map((d, i) => i === dIdx ? { ...d, theme: e.target.value } : d))}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                                placeholder="e.g. Rooted in Faith"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Calendar className="w-3 h-3 text-teal-500" /> Date</label>
                              <input
                                type="text"
                                value={day.date}
                                onChange={(e) => setProgrammeDays(prev => prev.map((d, i) => i === dIdx ? { ...d, date: e.target.value } : d))}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                                placeholder="e.g. Friday, 15 Nov 2026"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Clock className="w-3 h-3 text-teal-500" /> Time Range</label>
                              <input
                                type="text"
                                value={day.timeRange}
                                onChange={(e) => setProgrammeDays(prev => prev.map((d, i) => i === dIdx ? { ...d, timeRange: e.target.value } : d))}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                                placeholder="e.g. 02:00 PM — 09:30 PM"
                              />
                            </div>
                          </div>

                          {/* Programme Items */}
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 uppercase tracking-wide"><FileText className="w-3 h-3 text-navy-600" /> Programme Items</label>
                              <button
                                type="button"
                                onClick={() => setProgrammeDays(prev => prev.map((d, i) => i === dIdx ? { ...d, items: [...d.items, ""] } : d))}
                                className="text-[10px] text-amber-600 hover:text-amber-800 font-bold flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" /> Add Item
                              </button>
                            </div>
                            <div className="space-y-2">
                              {day.items.map((item: string, iIdx: number) => (
                                <div key={iIdx} className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 w-4 text-right flex-shrink-0">{iIdx + 1}.</span>
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => setProgrammeDays(prev => prev.map((d: any, di: number) => di === dIdx ? { ...d, items: d.items.map((it: string, ii: number) => ii === iIdx ? e.target.value : it) } : d))}
                                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="e.g. 02:00 PM: Registration & badge issuance"
                                  />
                                  {day.items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => setProgrammeDays(prev => prev.map((d: any, di: number) => di === dIdx ? { ...d, items: d.items.filter((_: any, ii: number) => ii !== iIdx) } : d))}
                                      className="p-1 rounded-md text-rose-400 hover:bg-rose-50 flex-shrink-0"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── TAB 3: VENUE ACCESS ── */}
                {editRallyTab === "venue" && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Venue Address / Location</label>
                      <input
                        type="text"
                        value={editRallyForm.venueAddress}
                        onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueAddress: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                        placeholder="e.g. Mnazi Mmoja Rd, Mombasa Island, Coast Region, Kenya"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Venue Description</label>
                      <textarea
                        rows={3}
                        value={editRallyForm.venueDescription}
                        onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueDescription: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                        placeholder="Describe the venue facilities, layout, capacity areas, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Directions to Venue</label>
                      <textarea
                        rows={2}
                        value={editRallyForm.venueDirections}
                        onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueDirections: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                        placeholder="How to get there: public transport, matatu routes, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Parking Information</label>
                        <textarea
                          rows={2}
                          value={editRallyForm.venueParkingInfo}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueParkingInfo: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Security Arrangements</label>
                        <textarea
                          rows={2}
                          value={editRallyForm.venueSecurityInfo}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueSecurityInfo: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Medical / First Aid</label>
                        <textarea
                          rows={2}
                          value={editRallyForm.venueMedicalInfo}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueMedicalInfo: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Accommodation Notes</label>
                        <textarea
                          rows={2}
                          value={editRallyForm.venueAccommodationNotes}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, venueAccommodationNotes: e.target.value }))}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* ── TAB 4: FEES & CAPITATION ── */}
                {editRallyTab === "fees" && (
                  <div className="space-y-4">
                    {/* Payment Info */}
                    <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">Payment Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Coins className="w-3 h-3 text-emerald-600" /> M-Pesa Paybill No.</label>
                          <input
                            type="text"
                            value={editRallyForm.feesPaybillNumber}
                            onChange={(e) => setEditRallyForm(prev => ({ ...prev, feesPaybillNumber: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="e.g. 4082200"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Clock className="w-3 h-3 text-emerald-600" /> Deadline Notice</label>
                          <input
                            type="text"
                            value={editRallyForm.feesDeadlineText}
                            onChange={(e) => setEditRallyForm(prev => ({ ...prev, feesDeadlineText: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            placeholder="e.g. Fee lock: 1 Nov 2026"
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><FileText className="w-3 h-3 text-emerald-600" /> Payment Instructions</label>
                        <textarea
                          rows={2}
                          value={editRallyForm.feesAccountInstructions}
                          onChange={(e) => setEditRallyForm(prev => ({ ...prev, feesAccountInstructions: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                          placeholder="e.g. Paybill 4082200, Account: Assigned Chapter Invoice Reference"
                        />
                      </div>
                    </div>

                    {/* Philosophy */}
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-4 h-4 text-navy-700" />
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wide">Capitation Philosophy</span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Tag className="w-3 h-3 text-navy-500" /> Philosophy Title</label>
                          <input
                            type="text"
                            value={editRallyForm.feesPhilosophyTitle}
                            onChange={(e) => setEditRallyForm(prev => ({ ...prev, feesPhilosophyTitle: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                            placeholder="e.g. Capability-Based Fair Capitation"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide"><Info className="w-3 h-3 text-navy-500" /> Philosophy Explanation</label>
                          <textarea
                            rows={3}
                            value={editRallyForm.feesPhilosophyText}
                            onChange={(e) => setEditRallyForm(prev => ({ ...prev, feesPhilosophyText: e.target.value }))}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                            placeholder="Explain how fees are calculated for each chapter tier..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Fee Tiers — Structured Input Fields */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><Layers className="w-4 h-4" /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">Fee Tiers</p>
                            <p className="text-[10px] text-slate-400">{feeTiersList.length} tier{feeTiersList.length !== 1 ? "s" : ""} configured</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFeeTiersList(prev => [...prev, { tierName: `Tier ${prev.length + 1}`, range: "", description: "" }])}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Tier
                        </button>
                      </div>

                      {feeTiersList.length === 0 && (
                        <div className="text-center py-6 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                          <Coins className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-xs font-semibold">No fee tiers configured</p>
                          <p className="text-[10px] mt-1">Click "Add Tier" to define chapter fee categories.</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {feeTiersList.map((tier, tIdx) => (
                          <div key={tIdx} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-teal-50 border-b border-teal-100">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-teal-600 text-white text-[9px] font-black flex items-center justify-center">{tIdx + 1}</span>
                                <span className="text-xs font-bold text-teal-900">{tier.tierName || `Tier ${tIdx + 1}`}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!confirm(`Remove "${tier.tierName || `Tier ${tIdx + 1}`}"?`)) return;
                                  setFeeTiersList(prev => prev.filter((_, i) => i !== tIdx));
                                }}
                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-3">
                              <div>
                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide"><Tag className="w-3 h-3" /> Tier Name</label>
                                <input
                                  type="text"
                                  value={tier.tierName}
                                  onChange={(e) => setFeeTiersList(prev => prev.map((t, i) => i === tIdx ? { ...t, tierName: e.target.value } : t))}
                                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                                  placeholder="e.g. Tier 1: Major Universities"
                                />
                              </div>
                              <div>
                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide"><Coins className="w-3 h-3" /> Fee Range (KES)</label>
                                <input
                                  type="text"
                                  value={tier.range}
                                  onChange={(e) => setFeeTiersList(prev => prev.map((t, i) => i === tIdx ? { ...t, range: e.target.value } : t))}
                                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400"
                                  placeholder="e.g. KSh 350,000 – 420,000"
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wide"><Info className="w-3 h-3" /> Description</label>
                                <textarea
                                  rows={2}
                                  value={tier.description}
                                  onChange={(e) => setFeeTiersList(prev => prev.map((t, i) => i === tIdx ? { ...t, description: e.target.value } : t))}
                                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                                  placeholder="e.g. For large public universities with 300+ attendees..."
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 rounded-lg bg-slate-100 font-mono">{editRallyTab}</span>
                  <span>tab active · all tabs saved together</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setShowEditRallyModal(false); setEditRallyTab("basic"); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRally}
                    className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    {savingRally ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving to DB...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-amber-400" />
                        <span>Save All Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 8: UPLOAD MEDIA GALLERY PHOTO (GOOGLE LINKS + FILES)*/}
      {/* ========================================================= */}
      {showUploadGalleryModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-navy-900 text-amber-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Add Photo to Gallery</h3>
                  <p className="text-xs text-slate-400">Add event photographs using Google Drive/Photos links or local files</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadGalleryModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Source Method Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setGalleryUploadMethod("google")}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  galleryUploadMethod === "google"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                <span className="truncate">Single Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryUploadMethod("album")}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  galleryUploadMethod === "album"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">Shared Album</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryUploadMethod("batch")}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  galleryUploadMethod === "batch"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                <span className="truncate">Batch Links</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryUploadMethod("file")}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  galleryUploadMethod === "file"
                    ? "bg-white text-navy-950 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">Local File</span>
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const uploaderName = activePortal === "CHAPTER"
                  ? (currentChapter.chapterName || currentChapter.institutionName || "Chapter Rep")
                  : "Council Admin";
                const targetChapterId = activePortal === "CHAPTER" ? currentChapter.id : undefined;

                // 1. BATCH LINKS MODE
                if (galleryUploadMethod === "batch") {
                  const rawUrls = newGalleryForm.batchUrls
                    .split("\n")
                    .map(u => u.trim())
                    .filter(u => u.length > 5);
                  if (rawUrls.length === 0) {
                    setLocationToast("Please paste at least one valid photo URL.");
                    return;
                  }
                  setShowUploadGalleryModal(false);
                  setLocationToast(`Publishing ${rawUrls.length} photos in batch...`);

                  const createdBatch: any[] = [];
                  for (let i = 0; i < rawUrls.length; i++) {
                    const u = rawUrls[i];
                    const itemTitle = rawUrls.length === 1 ? newGalleryForm.title : `${newGalleryForm.title} #${i + 1}`;
                    const isAlbum = isGoogleAlbumOrFolder(u);
                    const normalized = isAlbum ? "/placeholder-gallery.jpg" : normalizeGoogleImageUrl(u);
                    const tempItem = {
                      id: `g-${Date.now()}-${i}`,
                      title: itemTitle,
                      event: newGalleryForm.event || "Rally 2026",
                      date: new Date().toISOString().split("T")[0],
                      url: normalized,
                      category: newGalleryForm.category || "Rally",
                      uploader: uploaderName,
                      albumUrl: isAlbum ? u : undefined,
                      isAlbum,
                      chapterId: targetChapterId,
                    };
                    createdBatch.push(tempItem);

                    fetch("/api/gallery", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: tempItem.title,
                        category: tempItem.category,
                        imageUrl: tempItem.url,
                        altText: tempItem.title,
                        date: tempItem.date,
                        location: tempItem.event,
                        description: isAlbum ? `Uploaded by ${uploaderName} | Album: ${u}` : `Uploaded by ${uploaderName}`,
                        chapterId: targetChapterId,
                      }),
                    }).catch(() => {});
                  }
                  setGalleryPhotos(prev => [...createdBatch, ...prev]);
                  setNewGalleryForm({ title: "", event: "Rally 2026", category: "Rally", url: "", albumUrl: "", coverUrl: "", batchUrls: "" });
                  setTimeout(() => setLocationToast(`Successfully published ${rawUrls.length} photos!`), 1000);
                  setTimeout(() => setLocationToast(null), 5000);
                  return;
                }

                // 2. SHARED ALBUM / FOLDER MODE
                if (galleryUploadMethod === "album") {
                  const albumLink = newGalleryForm.albumUrl.trim();
                  if (!albumLink || !newGalleryForm.title) {
                    setLocationToast("Please specify an album title and Google link.");
                    return;
                  }
                  const cover = newGalleryForm.coverUrl.trim()
                    ? normalizeGoogleImageUrl(newGalleryForm.coverUrl)
                    : "/placeholder-gallery.jpg";

                  const tempAlbum = {
                    id: `g-${Date.now()}`,
                    title: newGalleryForm.title,
                    event: newGalleryForm.event || "Rally 2026",
                    date: new Date().toISOString().split("T")[0],
                    url: cover,
                    category: newGalleryForm.category || "Rally",
                    uploader: uploaderName,
                    albumUrl: albumLink,
                    isAlbum: true,
                    chapterId: targetChapterId,
                  };
                  setGalleryPhotos(prev => [tempAlbum, ...prev]);
                  setShowUploadGalleryModal(false);
                  setNewGalleryForm({ title: "", event: "Rally 2026", category: "Rally", url: "", albumUrl: "", coverUrl: "", batchUrls: "" });
                  setLocationToast(`Shared Album "${tempAlbum.title}" published!`);

                  try {
                    const res = await fetch("/api/gallery", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        title: tempAlbum.title,
                        category: tempAlbum.category,
                        imageUrl: cover,
                        altText: tempAlbum.title,
                        date: tempAlbum.date,
                        location: tempAlbum.event,
                        description: `Uploaded by ${uploaderName} | Album: ${albumLink}`,
                        chapterId: targetChapterId,
                      }),
                    });
                    const json = await res.json();
                    if (json.success && json.data) {
                      setGalleryPhotos(prev => prev.map(p => p.id === tempAlbum.id ? { ...p, id: json.data.id } : p));
                    }
                  } catch (err) {
                    console.warn("Failed to persist album:", err);
                  }
                  setTimeout(() => setLocationToast(null), 4000);
                  return;
                }

                // 3. SINGLE GOOGLE LINK OR LOCAL FILE
                const isAlbumDetected = isGoogleAlbumOrFolder(newGalleryForm.url);
                const normalized = isAlbumDetected
                  ? "/placeholder-gallery.jpg"
                  : normalizeGoogleImageUrl(newGalleryForm.url);

                if (!newGalleryForm.title || (!isAlbumDetected && !normalized)) {
                  setLocationToast("Please specify a title and valid photo link/file.");
                  return;
                }

                const tempPhoto = {
                  id: `g-${Date.now()}`,
                  title: newGalleryForm.title,
                  event: newGalleryForm.event || "Rally 2026",
                  date: new Date().toISOString().split("T")[0],
                  url: normalized,
                  category: newGalleryForm.category || "Rally",
                  uploader: uploaderName,
                  albumUrl: isAlbumDetected ? newGalleryForm.url.trim() : undefined,
                  isAlbum: isAlbumDetected,
                  chapterId: targetChapterId,
                };
                setGalleryPhotos(prev => [tempPhoto, ...prev]);
                setShowUploadGalleryModal(false);
                setNewGalleryForm({ title: "", event: "Rally 2026", category: "Rally", url: "", albumUrl: "", coverUrl: "", batchUrls: "" });
                setLocationToast(`Photo "${tempPhoto.title}" published!`);

                try {
                  const res = await fetch("/api/gallery", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      title: tempPhoto.title,
                      category: tempPhoto.category,
                      imageUrl: tempPhoto.url,
                      altText: tempPhoto.title,
                      date: tempPhoto.date,
                      location: tempPhoto.event,
                      description: isAlbumDetected
                        ? `Uploaded by ${uploaderName} | Album: ${newGalleryForm.url.trim()}`
                        : `Uploaded by ${uploaderName}`,
                      chapterId: targetChapterId,
                    }),
                  });
                  const json = await res.json();
                  if (json.success && json.data) {
                    setGalleryPhotos(prev => prev.map(p => p.id === tempPhoto.id ? { ...p, id: json.data.id } : p));
                  }
                } catch (err) {
                  console.warn("Failed to persist gallery photo:", err);
                }
                setTimeout(() => setLocationToast(null), 4000);
              }}
              className="space-y-4"
            >
              {/* Method 1: Single Photo Link */}
              {galleryUploadMethod === "google" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Google Drive or Google Photos Shareable URL
                  </label>
                  <div className="relative">
                    <input 
                      type="url"
                      required={galleryUploadMethod === "google"}
                      value={newGalleryForm.url}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setNewGalleryForm(prev => ({ ...prev, url: raw }));
                      }}
                      className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                      placeholder="https://drive.google.com/file/d/... or Google Photos link"
                    />
                    {newGalleryForm.url && (
                      <button
                        type="button"
                        onClick={() => setNewGalleryForm(prev => ({ ...prev, url: "" }))}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  {isGoogleAlbumOrFolder(newGalleryForm.url) ? (
                    <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2 animate-in fade-in">
                      <FolderOpen className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Multi-Photo {getAlbumTypeLabel(newGalleryForm.url)} Detected!</span>
                        <p className="text-[11px] text-teal-700 mt-0.5">
                          This link contains multiple pictures. It will be saved as a **Shared Album Collection** with direct access for visitors to open and view the entire set.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 leading-tight">
                      💡 Tip: Paste any direct Google Drive link or Google Photos URL.
                    </p>
                  )}
                </div>
              )}

              {/* Method 2: Shared Album / Folder Link */}
              {galleryUploadMethod === "album" && (
                <div className="space-y-3 p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80">
                  <div className="flex items-start gap-2.5 text-xs text-teal-950">
                    <FolderOpen className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Shared Google Album / Drive Folder</span>
                      <span className="text-[11px] text-teal-700">
                        Use this when you have an entire Google Photos Album or Google Drive Folder containing multiple photos (e.g. from an entire Sabbath rally or convention).
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Album or Folder Shareable URL *
                    </label>
                    <input 
                      type="url"
                      required={galleryUploadMethod === "album"}
                      value={newGalleryForm.albumUrl}
                      onChange={(e) => setNewGalleryForm(prev => ({ ...prev, albumUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-teal-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-700"
                      placeholder="https://photos.app.goo.gl/... or https://drive.google.com/drive/folders/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Optional Cover Photo URL
                    </label>
                    <input 
                      type="url"
                      value={newGalleryForm.coverUrl}
                      onChange={(e) => setNewGalleryForm(prev => ({ ...prev, coverUrl: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-teal-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-700"
                      placeholder="Leave blank to use default rally card thumbnail"
                    />
                  </div>
                </div>
              )}

              {/* Method 3: Batch Links Upload */}
              {galleryUploadMethod === "batch" && (
                <div className="space-y-3 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80">
                  <div className="flex items-start gap-2.5 text-xs text-indigo-950">
                    <Layers className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Batch Photo URLs (Multiple Photos)</span>
                      <span className="text-[11px] text-indigo-700">
                        Paste several Google Drive or Photos links below, one per line. Each link will be created as a separate photo in the gallery.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Photo URLs (One per line) *
                    </label>
                    <textarea 
                      rows={4}
                      required={galleryUploadMethod === "batch"}
                      value={newGalleryForm.batchUrls}
                      onChange={(e) => setNewGalleryForm(prev => ({ ...prev, batchUrls: e.target.value }))}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-700"
                      placeholder={`https://drive.google.com/file/d/1ABC...\nhttps://drive.google.com/file/d/2DEF...\nhttps://photos.app.goo.gl/...`}
                    />
                    <span className="text-[10px] text-indigo-700 mt-1 block">
                      {newGalleryForm.batchUrls.split("\n").filter(u => u.trim().length > 5).length} photo links entered
                    </span>
                  </div>
                </div>
              )}

              {/* Method 4: Local File Picker */}
              {galleryUploadMethod === "file" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="block text-xs font-bold text-navy-950">Local Photo File</span>
                  {newGalleryForm.url && !newGalleryForm.url.startsWith("http") ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black">
                      <img src={newGalleryForm.url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewGalleryForm(prev => ({ ...prev, url: "" }))}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-navy-950/80 text-white hover:bg-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-teal-500 cursor-pointer bg-white transition-colors">
                      <Upload className="w-8 h-8 text-teal-600 mb-2" />
                      <span className="text-xs font-bold text-slate-700">Click to choose image file</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingGallery(true);
                            const url = await handleUploadImage(file);
                            setNewGalleryForm(prev => ({ ...prev, url }));
                            setUploadingGallery(false);
                          }
                        }}
                      />
                    </label>
                  )}
                  {uploadingGallery && (
                    <p className="text-[11px] font-bold text-teal-700 animate-pulse">Uploading image file...</p>
                  )}
                </div>
              )}

              {/* Foreground Image Live Preview */}
              {newGalleryForm.url && (
                <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700">Foreground Card Preview</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Direct CDN Stream Ready
                    </span>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                    <img 
                      src={normalizeGoogleImageUrl(newGalleryForm.url)} 
                      alt="Foreground Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).classList.add("opacity-40");
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/90 to-transparent p-3 text-white">
                      <p className="font-heading font-bold text-xs truncate">{newGalleryForm.title || "Photo Title..."}</p>
                      <p className="text-[10px] text-teal-300">{newGalleryForm.event || "Event"} • {newGalleryForm.category}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Photo Title / Caption</label>
                <input 
                  type="text"
                  required
                  value={newGalleryForm.title}
                  onChange={(e) => setNewGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                  placeholder="e.g. Sabbath Morning Convocation & Worship"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Event Name</label>
                  <input 
                    type="text"
                    value={newGalleryForm.event}
                    onChange={(e) => setNewGalleryForm(prev => ({ ...prev, event: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                    placeholder="Rally 2026"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                  <select 
                    value={newGalleryForm.category}
                    onChange={(e) => setNewGalleryForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 focus:bg-white"
                  >
                    <option value="Rally">Rally</option>
                    <option value="Worship">Worship</option>
                    <option value="Leadership">Leadership</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Community">Community</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowUploadGalleryModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingGallery}
                  className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Publish to Gallery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 9: FULLSCREEN LIGHTBOX PREVIEW MODAL                */}
      {/* ========================================================= */}
      {previewGalleryPhoto && (
        <div className="fixed inset-0 z-50 bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-navy-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
            <button
              onClick={() => setPreviewGalleryPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-navy-950/80 text-white hover:bg-rose-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-h-[70vh] min-h-[300px] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={normalizeGoogleImageUrl(previewGalleryPhoto.url)}
                alt={previewGalleryPhoto.title}
                className="max-h-[70vh] w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/placeholder-gallery.jpg";
                }}
              />
            </div>

            {(previewGalleryPhoto.isAlbum || previewGalleryPhoto.albumUrl) && (
              <div className="bg-teal-950/90 border-b border-teal-800/60 p-3 px-6 text-teal-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-semibold">Shared Photo Collection ({getAlbumTypeLabel(previewGalleryPhoto.albumUrl || previewGalleryPhoto.url)})</span>
                </div>
                <a
                  href={previewGalleryPhoto.albumUrl || previewGalleryPhoto.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-300 hover:text-white underline flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Browse all photos in this Google Album</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-950 border-t border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-navy-950 font-bold text-[10px] uppercase">
                    {previewGalleryPhoto.category}
                  </span>
                  <span className="text-xs text-teal-300 font-semibold">{previewGalleryPhoto.event}</span>
                  <span className="text-xs text-slate-400">• {previewGalleryPhoto.date}</span>
                </div>
                <h3 className="font-heading font-black text-xl text-white">
                  {previewGalleryPhoto.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded by {previewGalleryPhoto.uploader}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {(previewGalleryPhoto.albumUrl || previewGalleryPhoto.isAlbum) ? (
                  <a
                    href={previewGalleryPhoto.albumUrl || previewGalleryPhoto.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-white" />
                    <span>Open Full Album</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                ) : (
                  <a
                    href={normalizeGoogleImageUrl(previewGalleryPhoto.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-teal-300" />
                    <span>Open Direct Link</span>
                  </a>
                )}
                <button
                  onClick={() => setPreviewGalleryPhoto(null)}
                  className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE / EDIT NEWS ARTICLE                          */}
      {/* ========================================================= */}
      {showCreateNewsModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200 my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-navy-50 text-navy-700"><Newspaper className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">{editingNewsId ? "Edit Article" : "New Council Article"}</h3>
                  <p className="text-xs text-slate-400">Published articles appear in all chapter portals immediately.</p>
                </div>
              </div>
              <button onClick={() => { setShowCreateNewsModal(false); setEditingNewsId(null); }} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNews}>
              <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><BookOpen className="w-3.5 h-3.5 text-navy-600" /> Article Title *</label>
                  <input
                    type="text" required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500 focus:bg-white"
                    placeholder="e.g. Coastal Unity Rally 2026 — Registration Now Open"
                  />
                </div>

                {/* Category / Author / Status row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><Tag className="w-3 h-3 text-amber-600" /> Category</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      {["NEWS", "ANNOUNCEMENT", "FINANCE", "SPIRITUAL", "STORY"].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><User className="w-3 h-3 text-teal-600" /> Author</label>
                    <input
                      type="text"
                      value={newsForm.author}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, author: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500"
                      placeholder="e.g. Secretary General"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><Eye className="w-3 h-3 text-teal-600" /> Status</label>
                    <select
                      value={newsForm.status}
                      onChange={(e) => setNewsForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500"
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </div>
                </div>

                {/* Featured Image URL */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><ImageIcon className="w-3.5 h-3.5 text-amber-600" /> Featured Image URL (optional)</label>
                  <input
                    type="url"
                    value={newsForm.featuredImageUrl}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, featuredImageUrl: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500 focus:bg-white"
                    placeholder="https://drive.google.com/... or https://..."
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><FileText className="w-3.5 h-3.5 text-slate-600" /> Short Summary *</label>
                  <textarea
                    required rows={2}
                    value={newsForm.summary}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, summary: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500 focus:bg-white resize-none"
                    placeholder="One or two sentences summarising the article for chapter reps..."
                  />
                </div>

                {/* Full Content */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><BookOpen className="w-3.5 h-3.5 text-navy-600" /> Full Article Content</label>
                  <textarea
                    rows={8}
                    value={newsForm.content}
                    onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-500 focus:bg-white resize-y"
                    placeholder="Write the full article body here. Use plain text or markdown-style formatting..."
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => { setShowCreateNewsModal(false); setEditingNewsId(null); }} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button
                  type="submit" disabled={newsSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-navy-900 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {newsSubmitting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5 text-amber-400" /> {editingNewsId ? "Update Article" : "Publish Article"}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD RESOURCE / DOCUMENT                             */}
      {/* ========================================================= */}
      {showCreateResourceModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full animate-in zoom-in-95 duration-200 my-8 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700"><FolderArchive className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Add Resource / Document</h3>
                  <p className="text-xs text-slate-400">Add a document link or upload reference to the central repository.</p>
                </div>
              </div>
              <button onClick={() => setShowCreateResourceModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResource}>
              <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><FileText className="w-3.5 h-3.5 text-teal-600" /> Document Title *</label>
                  <input
                    type="text" required
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    placeholder="e.g. CUCASO Constitution & Bylaws 2024"
                  />
                </div>

                {/* Category / Access Level row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><Tag className="w-3 h-3 text-teal-600" /> Category</label>
                    <select
                      value={resourceForm.category}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {["SPIRITUAL", "POLICY", "FINANCE", "RALLY", "FORMS", "CONSTITUTION", "GUIDELINES", "REPORT", "OTHER"].map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><ShieldCheck className="w-3 h-3 text-teal-600" /> Access Level</label>
                    <select
                      value={resourceForm.accessLevel}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, accessLevel: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="PUBLIC">PUBLIC — All chapters</option>
                      <option value="CHAPTER_REPS">CHAPTER REPS only</option>
                      <option value="ADMIN">ADMIN only</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><Info className="w-3.5 h-3.5 text-slate-600" /> Description</label>
                  <textarea
                    rows={2}
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    placeholder="Brief description of this document..."
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><Globe className="w-3.5 h-3.5 text-slate-600" /> Document URL / Link</label>
                  <input
                    type="url"
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white"
                    placeholder="https://drive.google.com/... or https://..."
                  />
                </div>

                {/* File size / MIME */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><Download className="w-3 h-3 text-slate-500" /> File Size</label>
                    <input
                      type="text"
                      value={resourceForm.fileSize}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, fileSize: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. 2.4 MB"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5"><FileText className="w-3 h-3 text-slate-500" /> File Type</label>
                    <select
                      value={resourceForm.mimeType}
                      onChange={(e) => setResourceForm(prev => ({ ...prev, mimeType: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="application/pdf">PDF</option>
                      <option value="application/vnd.ms-excel">Excel</option>
                      <option value="application/msword">Word</option>
                      <option value="image/jpeg">Image (JPEG)</option>
                      <option value="image/png">Image (PNG)</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button type="button" onClick={() => setShowCreateResourceModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button
                  type="submit" disabled={resourceSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {resourceSubmitting ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5 text-amber-300" /> Add Document</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 10: RECORD TREASURY / CHAPTER PAYMENT               */}
      {/* ========================================================= */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Record Payment</h3>
                  <p className="text-xs text-slate-400">Register a bank, M-Pesa, or cash transaction to an invoice</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecordPaymentModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordAdminPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Target Chapter / Invoice *</label>
                <select
                  required
                  value={adminPaymentForm.invoiceId}
                  onChange={(e) => {
                    const inv = invoicesList.find(i => i.id === e.target.value);
                    setAdminPaymentForm(prev => ({
                      ...prev,
                      invoiceId: e.target.value,
                      payerName: inv ? inv.institutionName : prev.payerName,
                      amount: inv && inv.balance > 0 ? String(inv.balance) : prev.amount,
                    }));
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                >
                  <option value="">Select Invoice / Chapter</option>
                  {invoicesList.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.institutionName} (Outstanding: {formatCurrency(inv.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={adminPaymentForm.method}
                    onChange={(e) => setAdminPaymentForm(prev => ({ ...prev, method: e.target.value as any }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  >
                    <option value="MPESA_DARAJA">M-Pesa (Paybill 4082200)</option>
                    <option value="BANK_TRANSFER">Bank Wire / Deposit</option>
                    <option value="CASH">Cash / Direct Receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Receipt / Ref # *</label>
                  <input
                    type="text"
                    required
                    value={adminPaymentForm.receipt}
                    onChange={(e) => setAdminPaymentForm(prev => ({ ...prev, receipt: e.target.value }))}
                    placeholder="e.g. QEJ8291X0K"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono uppercase focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Amount (KES) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={adminPaymentForm.amount}
                  onChange={(e) => setAdminPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="e.g. 150000"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Payer Name / Submitter</label>
                  <input
                    type="text"
                    value={adminPaymentForm.payerName}
                    onChange={(e) => setAdminPaymentForm(prev => ({ ...prev, payerName: e.target.value }))}
                    placeholder="e.g. David Kiboi (Treasurer)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Payer Phone (Optional)</label>
                  <input
                    type="tel"
                    value={adminPaymentForm.phone}
                    onChange={(e) => setAdminPaymentForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+254 7..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reconcilingLoading}
                  className="px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  {reconcilingLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Payment...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Confirm & Record</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 11: RECONCILE UNMATCHED TRANSACTION                 */}
      {/* ========================================================= */}
      {showReconcileModal && reconcilingPayment && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-navy-950">Reconcile Transaction</h3>
                  <p className="text-xs text-slate-400">Match incoming Paybill payment to official chapter invoice</p>
                </div>
              </div>
              <button
                onClick={() => { setShowReconcileModal(false); setReconcilingPayment(null); }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Unmatched Details Card */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Receipt / Ref:</span>
                <span className="font-mono font-bold text-navy-950">{reconcilingPayment.mpesaReceiptNumber || reconcilingPayment.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Amount Paid:</span>
                <span className="font-heading font-black text-amber-900 text-sm">{formatCurrency(reconcilingPayment.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Sender / Payer:</span>
                <span className="font-bold text-slate-900">{reconcilingPayment.payerName || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">Account Reference Entered:</span>
                <span className="font-mono text-teal-800 font-bold">{reconcilingPayment.reference || "None"}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-amber-200/60">
                <span>Received At:</span>
                <span>{reconcilingPayment.timestamp}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700 uppercase">
                Assign to Chapter Invoice *
              </label>
              <select
                value={selectedReconcileInvoiceId}
                onChange={(e) => setSelectedReconcileInvoiceId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-teal-600 focus:outline-none"
              >
                {invoicesList.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} — {inv.institutionName} (Due: {formatCurrency(inv.balance)})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Linking this transaction will deduct {formatCurrency(reconcilingPayment.amount)} from the selected invoice and mark this payment status as <strong className="text-emerald-700">MATCHED</strong>.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setShowReconcileModal(false); setReconcilingPayment(null); }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReconcile}
                disabled={reconcilingLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                {reconcilingLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reconciling...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Match & Reconcile</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

