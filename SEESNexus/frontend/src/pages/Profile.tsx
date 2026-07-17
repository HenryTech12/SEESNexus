import React, { useState, useEffect, useCallback, useRef } from "react";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";
import {
  User,
  Shield,
  Package,
  Clock,
  LogOut,
  ChevronRight,
  Activity,
  Camera,
  Loader2,
  RotateCcw,
  Pencil,
  X,
  Check,
} from "lucide-react";
import hardwareService from "../services/hardwareService";
import authService from "../services/authService";
import uploadService from "../services/uploadService";
import { formatError } from "../utils/errorHelper";
import type { HardwareLoan } from "../types";
import toast from "react-hot-toast";

const STATUS_CLASSES: Record<string, string> = {
  APPROVED: "text-emerald-400 bg-emerald-500/10",
  PENDING: "text-yellow-400 bg-yellow-500/10",
  RETURNED: "text-gray-400 bg-gray-500/10",
  REJECTED: "text-red-400 bg-red-500/10",
};

const accessLabel = (role?: string) => {
  if (role === "ADMIN") return "ADMIN_ACCESS";
  if (role === "CONTRIBUTOR") return "LEVEL_02_ACCESS";
  return "LEVEL_01_ACCESS";
};

// Matches the fixed option lists Register.tsx uses for the same fields.
const DEPARTMENTS = [
  "Electrical/Electronics Engineering",
  "Computer Engineering",
  "Systems Engineering",
];
const LEVELS = ["100L", "200L", "300L", "400L", "500L"];

const Profile = () => {
  const { user, logout, updateUser } = useAuthStore();
  const [loans, setLoans] = useState<HardwareLoan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarLocalPreview, setAvatarLocalPreview] = useState("");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(
    null,
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  // Bumped on every avatar pick so a slow, superseded upload's response can't
  // clobber state set by a later pick (same race as the article cover image).
  const avatarUploadRequestIdRef = useRef(0);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [levelInput, setLevelInput] = useState("");

  // Revoke the blob: preview on unmount or replacement — otherwise it leaks.
  useEffect(() => {
    return () => {
      if (avatarLocalPreview) URL.revokeObjectURL(avatarLocalPreview);
    };
  }, [avatarLocalPreview]);

  const runAvatarUpload = async (file: File, requestId: number) => {
    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      const { url } = await uploadService.uploadImage(file);
      // A newer pick superseded this one while it was in flight — drop the
      // stale result instead of overwriting the newer selection's state.
      if (avatarUploadRequestIdRef.current !== requestId) return;
      await authService.updateMe({ profile_image_url: url });
      if (avatarUploadRequestIdRef.current !== requestId) return;
      updateUser({ profile_image_url: url });
      setAvatarLocalPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setPendingAvatarFile(null);
      toast.success("Profile picture updated");
    } catch (err) {
      if (avatarUploadRequestIdRef.current !== requestId) return;
      // Keep the local preview on failure instead of clearing it — same
      // vanishing-image bug class as the article composer's cover image.
      setAvatarError(formatError(err, "Failed to update profile picture"));
    } finally {
      if (avatarUploadRequestIdRef.current === requestId)
        setIsUploadingAvatar(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingAvatarFile(file);
    runAvatarUpload(file, ++avatarUploadRequestIdRef.current);
  };

  const handleRetryAvatar = () => {
    if (pendingAvatarFile)
      runAvatarUpload(pendingAvatarFile, ++avatarUploadRequestIdRef.current);
  };

  const handleStartEditProfile = () => {
    setBioInput(user?.bio || "");
    setDepartmentInput(user?.department || DEPARTMENTS[0]);
    setLevelInput(user?.level || LEVELS[0]);
    setIsEditingProfile(true);
  };

  const handleCancelEditProfile = () => setIsEditingProfile(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updated = await authService.updateMe({
        bio: bioInput,
        department: departmentInput,
        level: levelInput,
      });
      updateUser(updated);
      toast.success("Profile updated");
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(formatError(err, "Failed to update profile"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const displayedAvatarUrl = avatarLocalPreview || user?.profile_image_url;

  const fetchLoans = useCallback(async () => {
    try {
      const data = await hardwareService.getMyLoans();
      setLoans(data);
    } catch (error) {
      // No mock fallback for loans (unlike Articles/Events) — just stop loading with an empty list.
      console.error("Failed to fetch loans:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // The backend endpoint already exists and works — this was just never wired
  // up after the rewrite, leaving approved loans with no way to be returned.
  const handleReturnLoan = async (loan: HardwareLoan) => {
    if (
      !window.confirm(
        `Mark "${loan.hardware?.name || "this item"}" as returned?`,
      )
    )
      return;
    try {
      await hardwareService.returnLoan(loan.id);
      toast.success("Marked as returned");
      setLoans((prev) =>
        prev.map((l) =>
          l.id === loan.id ? { ...l, status: "RETURNED" } : l,
        ),
      );
    } catch (err) {
      toast.error(formatError(err, "Failed to mark loan as returned"));
    }
  };

  const activeLoanCount = loans.filter(
    (l) => l.status === "APPROVED" || l.status === "PENDING",
  ).length;

  const stats = [
    {
      label: "ASSETS_ON_LOAN",
      value: isLoading ? "—" : String(activeLoanCount).padStart(2, "0"),
      icon: Package,
    },
    {
      label: "PROTOCOL_STATUS",
      value: user?.is_active ? "ACTIVE" : "OFFLINE",
      icon: Shield,
    },
    {
      label: "TOTAL_LOANS",
      value: isLoading ? "—" : String(loans.length).padStart(2, "0"),
      icon: Clock,
    },
  ];

  const sortedLoans = [...loans].sort(
    (a, b) =>
      new Date(b.request_date).getTime() - new Date(a.request_date).getTime(),
  );

  return (
    <AppLayout>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="max-w-4xl mx-auto pt-10">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end mb-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center overflow-hidden">
              {displayedAvatarUrl ? (
                <img
                  src={displayedAvatarUrl}
                  alt={user?.full_name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : user?.full_name ? (
                <span className="text-4xl font-black text-emerald-500 italic">
                  {user.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              ) : (
                <User size={48} className="text-emerald-500/50" />
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label="Change profile picture"
              className="absolute inset-0 w-32 h-32 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity disabled:cursor-wait"
            >
              {isUploadingAvatar ? (
                <Loader2 size={24} className="text-emerald-400 animate-spin" />
              ) : (
                <Camera size={24} className="text-emerald-400" />
              )}
            </button>

            <div className="absolute -bottom-2 -right-2 bg-black border border-emerald-500/50 p-2 rounded-lg text-emerald-500">
              <Shield size={16} />
            </div>
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 text-emerald-500 text-[10px] font-black tracking-[0.3em] mb-2 uppercase">
              <Activity size={12} className="animate-pulse" />
              Profile_Authorized
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-2 break-words">
              {user?.full_name?.toUpperCase() || "OPERATOR"}
            </h1>
            <p className="text-gray-500 text-xs font-bold flex items-center gap-2">
              {user?.email}
              <span className="w-1 h-1 bg-gray-700 rounded-full" />
              {accessLabel(user?.role)}
            </p>
          </div>

          <Button
            onClick={logout}
            variant="ghost"
            className="mb-2 border-red-500/20 text-red-500 hover:bg-red-500/10"
          >
            <LogOut size={16} className="mr-2" /> TERMINATE_SESSION
          </Button>
        </div>

        {avatarError && (
          <div className="flex items-center justify-between gap-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-8">
            <span>{avatarError}</span>
            <button
              type="button"
              onClick={handleRetryAvatar}
              className="shrink-0 flex items-center gap-1 font-bold hover:text-red-300"
            >
              <RotateCcw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* Editable profile info — bio/department/level all already land on
            PUT /auth/me, this just adds the UI that was missing for them. */}
        <GlassCard className="mb-8 border-emerald-500/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black italic tracking-widest text-emerald-500 uppercase">
              Operator_Profile
            </h2>
            {!isEditingProfile && (
              <button
                onClick={handleStartEditProfile}
                className="flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors uppercase tracking-wider"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500 uppercase tracking-wider">
                  Bio
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all placeholder:text-gray-600"
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">
                    Level
                  </label>
                  <select
                    value={levelInput}
                    onChange={(e) => setLevelInput(e.target.value)}
                    className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all appearance-none"
                  >
                    {LEVELS.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleCancelEditProfile}
                  disabled={isSavingProfile}
                  className="text-xs py-2 px-4"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  isLoading={isSavingProfile}
                  className="text-xs py-2 px-4"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-gray-300 italic">
                {user?.bio || (
                  <span className="text-gray-600">No bio set yet.</span>
                )}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                <span>
                  Department:{" "}
                  <span className="text-gray-300 font-bold">
                    {user?.department || "—"}
                  </span>
                </span>
                <span>
                  Level:{" "}
                  <span className="text-gray-300 font-bold">
                    {user?.level || "—"}
                  </span>
                </span>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => (
            <GlassCard key={stat.label} className="p-4 border-emerald-500/10">
              <div className="flex items-center gap-3 mb-2">
                <stat.icon size={14} className="text-emerald-500" />
                <span className="text-[10px] font-black text-gray-500 tracking-widest">
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-black italic">{stat.value}</div>
            </GlassCard>
          ))}
        </div>

        {/* Loan History */}
        <div className="space-y-6">
          <header className="flex justify-between items-center">
            <h2 className="text-sm font-black italic tracking-widest text-emerald-500 uppercase">
              Deployed_Assets_History
            </h2>
            <div className="h-px flex-1 mx-6 bg-emerald-500/10" />
          </header>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 bg-emerald-500/5 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : sortedLoans.length > 0 ? (
            <div className="space-y-3">
              {sortedLoans.map((loan) => (
                <GlassCard
                  key={loan.id}
                  className="p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-black border border-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={20} className="text-emerald-500/40" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black italic truncate">
                        {loan.hardware?.name ||
                          `NX-${loan.hardware_id.slice(0, 8).toUpperCase()}`}
                      </div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter truncate max-w-xs">
                        {loan.purpose}
                      </div>
                      <div className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                        RETURN_BY:{" "}
                        {new Date(loan.expected_return_date).toLocaleDateString(
                          "en-GB",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {loan.status === "APPROVED" && (
                      <button
                        onClick={() => handleReturnLoan(loan)}
                        className="flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-wider"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Mark Returned
                      </button>
                    )}
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded ${
                        STATUS_CLASSES[loan.status] ??
                        "text-gray-400 bg-gray-500/10"
                      }`}
                    >
                      {loan.status}
                    </span>
                    <ChevronRight
                      size={16}
                      className="text-gray-700 group-hover:text-emerald-500 transition-colors"
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="p-12 border-dashed border-emerald-500/20 text-center">
              <Package size={32} className="mx-auto text-gray-800 mb-4" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                No active deployments found in archive
              </p>
            </GlassCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
