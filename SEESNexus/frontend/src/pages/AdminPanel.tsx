import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users as UsersIcon,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Activity,
  Calendar,
  Loader2,
  Rocket,
  Plus,
  Pencil,
  Trash2,
  Cpu,
  Newspaper,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import hardwareService from "../services/hardwareService";
import adminService from "../services/adminService";
import type { DashboardStats } from "../services/adminService";
import projectService from "../services/projectService";
import eventService from "../services/eventService";
import HardwareFormPanel from "../components/hardware/HardwareFormPanel";
import EventFormPanel from "../components/events/EventFormPanel";
import { formatError } from "../utils/errorHelper";
import type { HardwareLoan, User, Project, Event, Hardware } from "../types";
import { UserRole, ProjectStatus } from "../types";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

type AdminTab =
  | "OVERVIEW"
  | "USERS"
  | "HARDWARE"
  | "HARDWARE_LOANS"
  | "PROJECTS_REVIEW"
  | "EVENTS";

const LOAN_STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  APPROVED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  RETURNED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  REJECTED: "bg-red-500/20 text-red-400 border-red-500/30",
};

const ROLE_CLASSES: Record<string, string> = {
  ADMIN: "bg-red-500/20 text-red-400",
  CONTRIBUTOR: "bg-yellow-500/20 text-yellow-400",
  STUDENT: "bg-emerald-500/20 text-emerald-400",
};

// Matches the limit fetchAll requests. A page coming back shorter than this
// means there's nothing left to load.
const PAGE_SIZE = 100;

type ListKey = "users" | "loans" | "projects" | "events" | "hardware";

interface ListPageInfo {
  page: number;
  hasMore: boolean;
  isLoadingMore: boolean;
}

const INITIAL_PAGE_INFO: Record<ListKey, ListPageInfo> = {
  users: { page: 1, hasMore: false, isLoadingMore: false },
  loans: { page: 1, hasMore: false, isLoadingMore: false },
  projects: { page: 1, hasMore: false, isLoadingMore: false },
  events: { page: 1, hasMore: false, isLoadingMore: false },
  hardware: { page: 1, hasMore: false, isLoadingMore: false },
};

const AdminPanel = () => {
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");
  const [allLoans, setAllLoans] = useState<HardwareLoan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hardwareFormMode, setHardwareFormMode] = useState<
    "create" | "edit" | null
  >(null);
  const [editingHardware, setEditingHardware] = useState<Hardware | null>(null);
  const [eventFormMode, setEventFormMode] = useState<"create" | "edit" | null>(
    null,
  );
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [pageInfo, setPageInfo] =
    useState<Record<ListKey, ListPageInfo>>(INITIAL_PAGE_INFO);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );

  // Fetched independently of fetchAll (below), not folded into its
  // Promise.allSettled batch: this is one lightweight count query rather
  // than five full-record list fetches, so it typically resolves first —
  // letting the top stat cards show real numbers before the detail tabs'
  // data has finished loading, instead of both being gated on the slowest
  // of six parallel requests. Also the only source for total article count
  // and the only one immune to the 100-record page cap the list-derived
  // numbers below are subject to.
  useEffect(() => {
    adminService
      .getDashboardStats()
      .then(setDashboardStats)
      .catch(() => {});
  }, []);

  // allSettled, not all — these 5 tabs are independent, so one endpoint being
  // down (e.g. no events yet) shouldn't blank out the other 4 tabs' data.
  // limit: PAGE_SIZE on every call — the backend defaults to 10, which would
  // leave an admin unable to see/manage anything past the 10th user, loan,
  // etc. A result exactly PAGE_SIZE long means there may be more beyond it,
  // which is what drives each tab's "Load More" button.
  const fetchAll = useCallback(async () => {
    const [loansRes, usersRes, projectsRes, eventsRes, hardwareRes] =
      await Promise.allSettled([
        adminService.getAllLoans({ limit: PAGE_SIZE }),
        adminService.getUsers({ limit: PAGE_SIZE }),
        projectService.getAll({ limit: PAGE_SIZE }),
        eventService.getAll({ limit: PAGE_SIZE }),
        hardwareService.getAll({ limit: PAGE_SIZE }),
      ]);
    if (loansRes.status === "fulfilled") setAllLoans(loansRes.value);
    if (usersRes.status === "fulfilled") setUsers(usersRes.value);
    if (projectsRes.status === "fulfilled") setProjects(projectsRes.value);
    if (eventsRes.status === "fulfilled") setEvents(eventsRes.value);
    if (hardwareRes.status === "fulfilled") setHardware(hardwareRes.value);
    setPageInfo({
      loans: {
        page: 1,
        hasMore:
          loansRes.status === "fulfilled" &&
          loansRes.value.length === PAGE_SIZE,
        isLoadingMore: false,
      },
      users: {
        page: 1,
        hasMore:
          usersRes.status === "fulfilled" &&
          usersRes.value.length === PAGE_SIZE,
        isLoadingMore: false,
      },
      projects: {
        page: 1,
        hasMore:
          projectsRes.status === "fulfilled" &&
          projectsRes.value.length === PAGE_SIZE,
        isLoadingMore: false,
      },
      events: {
        page: 1,
        hasMore:
          eventsRes.status === "fulfilled" &&
          eventsRes.value.length === PAGE_SIZE,
        isLoadingMore: false,
      },
      hardware: {
        page: 1,
        hasMore:
          hardwareRes.status === "fulfilled" &&
          hardwareRes.value.length === PAGE_SIZE,
        isLoadingMore: false,
      },
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Generic "load next page and append" used by all 5 tabs — only the fetch
  // call and the state setter it appends to differ per tab.
  const loadMore = useCallback(
    async <T,>(
      key: ListKey,
      fetchPage: (page: number) => Promise<T[]>,
      append: (items: T[]) => void,
    ) => {
      setPageInfo((prev) => {
        const info = prev[key];
        if (!info.hasMore || info.isLoadingMore) return prev;
        return { ...prev, [key]: { ...info, isLoadingMore: true } };
      });

      const nextPage = pageInfo[key].page + 1;
      try {
        const items = await fetchPage(nextPage);
        append(items);
        setPageInfo((prev) => ({
          ...prev,
          [key]: {
            page: nextPage,
            hasMore: items.length === PAGE_SIZE,
            isLoadingMore: false,
          },
        }));
      } catch (err) {
        toast.error(formatError(err, "Failed to load more"));
        setPageInfo((prev) => ({
          ...prev,
          [key]: { ...prev[key], isLoadingMore: false },
        }));
      }
    },
    [pageInfo],
  );

  const handleLoadMoreUsers = () =>
    loadMore(
      "users",
      (page) => adminService.getUsers({ page, limit: PAGE_SIZE }),
      (items) => setUsers((prev) => [...prev, ...items]),
    );

  const handleLoadMoreLoans = () =>
    loadMore(
      "loans",
      (page) => adminService.getAllLoans({ page, limit: PAGE_SIZE }),
      (items) => setAllLoans((prev) => [...prev, ...items]),
    );

  const handleLoadMoreProjects = () =>
    loadMore(
      "projects",
      (page) => projectService.getAll({ page, limit: PAGE_SIZE }),
      (items) => setProjects((prev) => [...prev, ...items]),
    );

  const handleLoadMoreEvents = () =>
    loadMore(
      "events",
      (page) => eventService.getAll({ page, limit: PAGE_SIZE }),
      (items) => setEvents((prev) => [...prev, ...items]),
    );

  const handleLoadMoreHardware = () =>
    loadMore(
      "hardware",
      (page) => hardwareService.getAll({ page, limit: PAGE_SIZE }),
      (items) => setHardware((prev) => [...prev, ...items]),
    );

  // Optimistic update: flip status locally so the row updates instantly without a refetch.
  const handleApproveLoan = async (loanId: string) => {
    try {
      await adminService.approveLoan(loanId);
      toast.success("Loan approved");
      setAllLoans((prev) =>
        prev.map((l) => (l.id === loanId ? { ...l, status: "APPROVED" } : l)),
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to approve loan"));
    }
  };

  // The backend's reject endpoint accepts a reason but still doesn't persist
  // it anywhere (see admin.py) — collecting it here is a partial fix: it
  // forces the admin to articulate why now, and needs zero frontend changes
  // once the backend adds a column to actually store it.
  const handleRejectLoan = async (loanId: string) => {
    // null means the admin hit Cancel on the prompt itself — abort the
    // rejection entirely rather than treating it the same as an empty reason.
    const reasonInput = window.prompt("Reason for rejection (optional):");
    if (reasonInput === null) return;
    const reason = reasonInput.trim() || undefined;
    try {
      await adminService.rejectLoan(loanId, reason);
      toast.success("Loan rejected");
      setAllLoans((prev) =>
        prev.map((l) => (l.id === loanId ? { ...l, status: "REJECTED" } : l)),
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to reject loan"));
    }
  };

  const handleHardwareSaved = () => {
    setHardwareFormMode(null);
    setEditingHardware(null);
    fetchAll();
  };

  const handleEventSaved = () => {
    setEventFormMode(null);
    setEditingEvent(null);
    fetchAll();
  };

  const handleDeleteEvent = async (ev: Event) => {
    if (!window.confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    try {
      await eventService.remove(ev.id);
      toast.success("Event deleted");
      fetchAll();
    } catch (err) {
      toast.error(formatError(err, "Failed to delete event"));
    }
  };

  const handleUpdateUserRole = async (user: User, role: UserRole) => {
    if (role === user.role) return;
    if (user.id === currentUser?.id) {
      toast.error("You can't change your own role");
      return;
    }
    try {
      await adminService.updateUserRole(user.id, role);
      toast.success(`${user.full_name} is now ${role}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role } : u)),
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to update role"));
    }
  };

  const handleDeactivateUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("You can't deactivate your own account");
      return;
    }
    if (!window.confirm(`Deactivate ${user.full_name}? They will lose access.`))
      return;
    try {
      await adminService.deactivateUser(user.id);
      toast.success(`${user.full_name} deactivated`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: false } : u)),
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to deactivate user"));
    }
  };

  const handleUpdateProjectStatus = async (
    project: Project,
    status: ProjectStatus,
  ) => {
    if (status === project.status) return;
    try {
      await projectService.updateStatus(project.id, status);
      toast.success(`"${project.title}" marked ${status.replace("_", " ")}`);
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, status } : p)),
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to update project status"));
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`))
      return;
    try {
      await projectService.remove(project.id);
      toast.success("Project deleted");
      fetchAll();
    } catch (err) {
      toast.error(formatError(err, "Failed to delete project"));
    }
  };

  const handleDeleteHardware = async (hw: Hardware) => {
    if (!window.confirm(`Delete "${hw.name}"? This cannot be undone.`)) return;
    try {
      await hardwareService.remove(hw.id);
      toast.success("Hardware deleted");
      fetchAll();
    } catch (err) {
      toast.error(formatError(err, "Failed to delete hardware"));
    }
  };

  // The tab badge and "Pending Actions" widget need the actual loan
  // records (borrower, hardware, purpose), not just a count, so allLoans is
  // still fetched regardless of dashboardStats.
  const pendingLoans = allLoans.filter((l) => l.status === "PENDING");

  // Prefer the dedicated stats endpoint's numbers — they're true totals, not
  // capped at whatever page of the full list has been fetched — falling
  // back to what's been loaded locally only if that endpoint hasn't
  // resolved (or failed) yet.
  const totalUsers = dashboardStats?.total_users ?? users.length;
  const totalProjects = dashboardStats?.total_projects ?? projects.length;
  const activeLoanCount =
    dashboardStats?.active_loans ??
    allLoans.filter((l) => l.status === "APPROVED").length;
  const pendingLoanCount = dashboardStats?.pending_loans ?? pendingLoans.length;
  const statsStillLoading = !dashboardStats && isLoading;

  const overviewStats = [
    {
      label: "Total Users",
      value: statsStillLoading ? "—" : String(totalUsers),
      delta: `${totalUsers} registered`,
      icon: <UsersIcon size={20} />,
    },
    {
      label: "Active Loans",
      value: statsStillLoading ? "—" : String(activeLoanCount),
      delta:
        pendingLoanCount > 0 ? `${pendingLoanCount} pending` : "all clear",
      highlight: pendingLoanCount > 0,
      icon: <Package size={20} />,
    },
    {
      label: "Total Projects",
      value: statsStillLoading ? "—" : String(totalProjects),
      delta: `${totalProjects} submissions`,
      icon: <Rocket size={20} />,
    },
    {
      label: "Total Articles",
      value: dashboardStats ? String(dashboardStats.total_articles) : "—",
      delta: "published & drafts",
      icon: <Newspaper size={20} />,
    },
  ];

  return (
    <AppLayout>
      {/* Security scan-line overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,_transparent,_transparent_2px,_rgba(16,185,129,0.1)_3px)] bg-[length:100%_4px]" />
      </div>

      <div className="relative z-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-red-500 text-xs font-black tracking-[0.3em] mb-2">
              <Shield className="w-4 h-4 fill-red-500/20" />
              HIGH CLEARANCE ACCESS ONLY
            </div>
            <h1 className="text-xl md:text-4xl font-black italic tracking-tighter">
              ADMIN COMMAND CENTER
            </h1>
          </div>
          {/* Disabled, not removed — no backend endpoint exists for either yet.
              Wrapped in a span because disabled buttons get pointer-events: none,
              which would otherwise swallow the hover needed to show the title tooltip. */}
          <div className="flex flex-wrap gap-4">
            <span title="Backend endpoint not implemented yet">
              <Button
                disabled
                className="bg-white/5 border-white/10 hover:bg-white/10 text-gray-300 text-xs py-2 px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                EXPORT_LOGS
              </Button>
            </span>
            <span title="Backend endpoint not implemented yet">
              <Button
                disabled
                className="bg-red-500/20 border-red-500/50 hover:bg-red-500/30 text-red-400 text-xs py-2 px-6"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                EMERGENCY_HALT
              </Button>
            </span>
          </div>
        </header>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded border border-white/10 max-w-full overflow-x-auto">
          {(
            [
              "OVERVIEW",
              "USERS",
              "HARDWARE",
              "HARDWARE_LOANS",
              "PROJECTS_REVIEW",
              "EVENTS",
            ] as AdminTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 text-[10px] font-black transition-all duration-200 whitespace-nowrap relative ${
                activeTab === tab
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                  : "hover:bg-white/5 text-gray-500 hover:text-white"
              }`}
            >
              {tab.replace(/_/g, " ")}
              {tab === "HARDWARE_LOANS" && pendingLoans.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-black text-[8px] font-black rounded-full flex items-center justify-center">
                  {pendingLoans.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* OVERVIEW  */}
          {activeTab === "OVERVIEW" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <GlassCard className="xl:col-span-2 p-6 border-white/5">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    LIVE SYSTEM TRAFFIC
                  </h3>
                  {/* Decorative chart — no time-series endpoint yet */}
                  <div className="h-64 flex items-end gap-1">
                    {[...Array(60)].map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-emerald-500/40 hover:bg-emerald-400 transition-colors"
                        style={{
                          height: `${30 + Math.sin(i * 0.25) * 22 + Math.cos(i * 0.6) * 14}%`,
                        }}
                      />
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-6 border-white/5">
                  <h3 className="text-lg font-black mb-6">PENDING ACTIONS</h3>
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-8 bg-white/5 rounded animate-pulse"
                          />
                        ))}
                      </div>
                    ) : pendingLoans.length > 0 ? (
                      pendingLoans.slice(0, 4).map((loan) => (
                        <div
                          key={loan.id}
                          className="flex justify-between items-center text-[10px] border-b border-white/5 pb-3"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-emerald-500 font-bold">
                              Loan Request
                            </span>
                            <span className="text-gray-500 italic truncate max-w-[140px]">
                              {loan.hardware?.name ||
                                `NX-${loan.hardware_id.slice(0, 8).toUpperCase()}`}
                            </span>
                          </div>
                          <span className="text-yellow-500 font-black uppercase shrink-0">
                            PENDING
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest py-4 text-center">
                        No pending actions
                      </p>
                    )}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* USERS */}
          {activeTab === "USERS" && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-0 overflow-hidden border-white/5">
                {isLoading ? (
                  <TableLoader />
                ) : users.length === 0 ? (
                  <EmptyState
                    icon={<UsersIcon size={32} />}
                    label="No users found in registry"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[640px] text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-black tracking-widest text-emerald-500/70 border-b border-white/10 uppercase">
                          <th className="p-4">ENTITY</th>
                          <th className="p-4">EMAIL</th>
                          <th className="p-4">DEPARTMENT</th>
                          <th className="p-4">CLEARANCE</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/5">
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="p-4 font-bold italic">
                              {u.full_name}
                              {u.id === currentUser?.id && (
                                <span className="ml-2 text-[10px] font-black text-gray-500 not-italic">
                                  (YOU)
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-gray-400 font-mono text-[10px]">
                              {u.email}
                            </td>
                            <td className="p-4 text-gray-500">
                              {u.department || "—"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-black ${
                                  ROLE_CLASSES[u.role] ??
                                  "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`w-2 h-2 rounded-full inline-block mr-2 ${
                                  u.is_active ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              />
                              <span className="text-[10px] font-black text-gray-500">
                                {u.is_active ? "ACTIVE" : "SUSPENDED"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={u.role}
                                  disabled={u.id === currentUser?.id}
                                  onChange={(e) =>
                                    handleUpdateUserRole(
                                      u,
                                      e.target.value as UserRole,
                                    )
                                  }
                                  title={
                                    u.id === currentUser?.id
                                      ? "You can't change your own role"
                                      : undefined
                                  }
                                  className="bg-black/40 border border-white/10 rounded text-[10px] p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  {Object.values(UserRole).map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                </select>
                                {u.is_active && u.id !== currentUser?.id && (
                                  <button
                                    onClick={() => handleDeactivateUser(u)}
                                    title="Deactivate"
                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded border border-red-500/30 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <LoadMoreButton
                  hasMore={pageInfo.users.hasMore}
                  isLoading={pageInfo.users.isLoadingMore}
                  onClick={handleLoadMoreUsers}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* HARDWARE — inventory CRUD, distinct from HARDWARE_LOANS (loan approvals) */}
          {activeTab === "HARDWARE" && (
            <motion.div
              key="hardware"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-end">
                <Button
                  onClick={() => setHardwareFormMode("create")}
                  className="text-xs py-2 px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD HARDWARE
                </Button>
              </div>
              <GlassCard className="p-0 overflow-hidden border-white/5">
                {isLoading ? (
                  <TableLoader />
                ) : hardware.length === 0 ? (
                  <EmptyState
                    icon={<Cpu size={32} />}
                    label="No hardware in inventory"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-black tracking-widest text-emerald-500/70 border-b border-white/10 uppercase">
                          <th className="p-4">NAME</th>
                          <th className="p-4">CATEGORY</th>
                          <th className="p-4">SERIAL</th>
                          <th className="p-4">UNITS</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/5">
                        {hardware.map((hw) => (
                          <tr
                            key={hw.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="p-4 font-bold italic">{hw.name}</td>
                            <td className="p-4 text-emerald-400 font-black text-[10px]">
                              {hw.category}
                            </td>
                            <td className="p-4 text-gray-500 font-mono text-[10px]">
                              {hw.serial_number || "—"}
                            </td>
                            <td className="p-4 font-bold">
                              {hw.available_quantity}/{hw.quantity}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-black ${
                                  hw.status === "AVAILABLE"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : hw.status === "MAINTENANCE"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {hw.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingHardware(hw);
                                    setHardwareFormMode("edit");
                                  }}
                                  title="Edit"
                                  className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded border border-white/10 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteHardware(hw)}
                                  title="Delete"
                                  className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded border border-red-500/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <LoadMoreButton
                  hasMore={pageInfo.hardware.hasMore}
                  isLoading={pageInfo.hardware.isLoadingMore}
                  onClick={handleLoadMoreHardware}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* HARDWARE LOANS  */}
          {activeTab === "HARDWARE_LOANS" && (
            <motion.div
              key="loans"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-0 overflow-hidden border-white/5">
                {isLoading ? (
                  <TableLoader />
                ) : allLoans.length === 0 ? (
                  <EmptyState
                    icon={<Package size={32} />}
                    label="No loan records found"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-black tracking-widest text-emerald-500/70 border-b border-white/10 uppercase">
                          <th className="p-4">REQUEST_ID</th>
                          <th className="p-4">USER ENTITY</th>
                          <th className="p-4">HARDWARE_UNIT</th>
                          <th className="p-4">PURPOSE</th>
                          <th className="p-4">RETURN_BY</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/5">
                        {allLoans.map((loan) => (
                          <tr
                            key={loan.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="p-4 font-bold text-gray-500 font-mono">
                              NX-{loan.id.slice(0, 6).toUpperCase()}
                            </td>
                            <td className="p-4 font-bold">
                              {loan.borrower?.full_name ||
                                loan.borrower_id.slice(0, 8)}
                            </td>
                            <td className="p-4 font-bold italic text-emerald-400">
                              {loan.hardware?.name ||
                                loan.hardware_id.slice(0, 8)}
                            </td>
                            <td className="p-4 text-gray-400 max-w-[160px]">
                              <span className="line-clamp-1">
                                {loan.purpose}
                              </span>
                            </td>
                            <td className="p-4 text-gray-400 whitespace-nowrap">
                              {new Date(
                                loan.expected_return_date,
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-black border ${
                                  LOAN_STATUS_CLASSES[loan.status] ?? ""
                                }`}
                              >
                                {loan.status}
                              </span>
                            </td>
                            <td className="p-4">
                              {loan.status === "PENDING" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleApproveLoan(loan.id)}
                                    title="Approve"
                                    className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectLoan(loan.id)}
                                    title="Reject"
                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded border border-red-500/30 transition-colors"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-700 font-black">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <LoadMoreButton
                  hasMore={pageInfo.loans.hasMore}
                  isLoading={pageInfo.loans.isLoadingMore}
                  onClick={handleLoadMoreLoans}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* PROJECTS REVIEW — no dedicated approve/reject endpoint exists;
              this uses the same PUT /projects/{id} an owner would, relying on
              the backend's admin-bypasses-ownership check. */}
          {activeTab === "PROJECTS_REVIEW" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-0 overflow-hidden border-white/5">
                {isLoading ? (
                  <TableLoader />
                ) : projects.length === 0 ? (
                  <EmptyState
                    icon={<Rocket size={32} />}
                    label="No projects submitted"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-black tracking-widest text-emerald-500/70 border-b border-white/10 uppercase">
                          <th className="p-4">TITLE</th>
                          <th className="p-4">CATEGORY</th>
                          <th className="p-4">TECH_STACK</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4">SUBMITTED</th>
                          <th className="p-4">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/5">
                        {projects.map((p) => (
                          <tr
                            key={p.id}
                            className="hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="p-4 font-bold italic">{p.title}</td>
                            <td className="p-4 text-emerald-400 font-black text-[10px]">
                              {p.category}
                            </td>
                            <td className="p-4 text-gray-500 text-[10px]">
                              {p.tech_stack.slice(0, 3).join(", ")}
                              {p.tech_stack.length > 3 &&
                                ` +${p.tech_stack.length - 3}`}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded text-[10px] font-black ${
                                  p.status === "COMPLETED"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : p.status === "IN_PROGRESS"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-gray-500/20 text-gray-400"
                                }`}
                              >
                                {p.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 whitespace-nowrap">
                              {new Date(p.created_at).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={p.status}
                                  onChange={(e) =>
                                    handleUpdateProjectStatus(
                                      p,
                                      e.target.value as ProjectStatus,
                                    )
                                  }
                                  className="bg-black/40 border border-white/10 rounded text-[10px] p-1.5"
                                >
                                  {Object.values(ProjectStatus).map((s) => (
                                    <option key={s} value={s}>
                                      {s.replace("_", " ")}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleDeleteProject(p)}
                                  title="Delete"
                                  className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded border border-red-500/30 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <LoadMoreButton
                  hasMore={pageInfo.projects.hasMore}
                  isLoading={pageInfo.projects.isLoadingMore}
                  onClick={handleLoadMoreProjects}
                />
              </GlassCard>
            </motion.div>
          )}

          {/* EVENTS */}
          {activeTab === "EVENTS" && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-end">
                <Button
                  onClick={() => setEventFormMode("create")}
                  className="text-xs py-2 px-6"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  ADD EVENT
                </Button>
              </div>
              <GlassCard className="p-0 overflow-hidden border-white/5">
                {isLoading ? (
                  <TableLoader />
                ) : events.length === 0 ? (
                  <EmptyState
                    icon={<Calendar size={32} />}
                    label="No events on record"
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5 text-[10px] font-black tracking-widest text-emerald-500/70 border-b border-white/10 uppercase">
                          <th className="p-4">TITLE</th>
                          <th className="p-4">TYPE</th>
                          <th className="p-4">STARTS</th>
                          <th className="p-4">LOCATION</th>
                          <th className="p-4">CAPACITY</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs divide-y divide-white/5">
                        {events.map((e) => {
                          const past = new Date(e.end_date) < new Date();
                          const closed =
                            new Date(e.registration_deadline) < new Date();
                          return (
                            <tr
                              key={e.id}
                              className="hover:bg-white/[0.02] transition-colors"
                            >
                              <td className="p-4 font-bold italic">
                                {e.title}
                              </td>
                              <td className="p-4 text-emerald-400 font-black text-[10px]">
                                {e.event_type}
                              </td>
                              <td className="p-4 text-gray-400 whitespace-nowrap">
                                {new Date(e.start_date).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="p-4 text-gray-500 italic">
                                {e.location}
                              </td>
                              <td className="p-4 font-bold">
                                {e.max_participants ?? "Unlimited"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2 py-1 rounded text-[10px] font-black ${
                                    past
                                      ? "bg-gray-500/20 text-gray-400"
                                      : closed
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-emerald-500/20 text-emerald-400"
                                  }`}
                                >
                                  {past
                                    ? "PAST"
                                    : closed
                                      ? "REG. CLOSED"
                                      : "UPCOMING"}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingEvent(e);
                                      setEventFormMode("edit");
                                    }}
                                    title="Edit"
                                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded border border-white/10 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(e)}
                                    title="Delete"
                                    className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded border border-red-500/30 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                <LoadMoreButton
                  hasMore={pageInfo.events.hasMore}
                  isLoading={pageInfo.events.isLoadingMore}
                  onClick={handleLoadMoreEvents}
                />
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hardwareFormMode && (
          <HardwareFormPanel
            item={hardwareFormMode === "edit" ? editingHardware : null}
            onClose={() => {
              setHardwareFormMode(null);
              setEditingHardware(null);
            }}
            onSaved={handleHardwareSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {eventFormMode && (
          <EventFormPanel
            item={eventFormMode === "edit" ? editingEvent : null}
            onClose={() => {
              setEventFormMode(null);
              setEditingEvent(null);
            }}
            onSaved={handleEventSaved}
          />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

const StatCard = ({
  label,
  value,
  delta,
  icon,
  highlight = false,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <GlassCard className="p-5 border-white/5 hover:border-emerald-500/30 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span
        className={`text-[10px] font-black ${highlight ? "text-yellow-400" : "text-emerald-500/60"}`}
      >
        {delta}
      </span>
    </div>
    <div className="flex flex-col">
      <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
        {label}
      </span>
      <span className="text-3xl font-black italic tracking-tighter">
        {value}
      </span>
    </div>
  </GlassCard>
);

const TableLoader = () => (
  <div className="flex items-center justify-center p-16">
    <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
  </div>
);

const LoadMoreButton = ({
  hasMore,
  isLoading,
  onClick,
}: {
  hasMore: boolean;
  isLoading: boolean;
  onClick: () => void;
}) => {
  if (!hasMore) return null;
  return (
    <div className="flex justify-center p-4 border-t border-white/5">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors"
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {isLoading ? "Loading..." : "Load More"}
      </button>
    </div>
  );
};

const EmptyState = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-center p-16 gap-4 text-gray-700">
    {icon}
    <p className="text-[10px] font-black uppercase tracking-widest">{label}</p>
  </div>
);

export default AdminPanel;
