import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  UserCheck,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Hooks
import { useAssignments } from "@/features/assignments/hooks/useAssignments";
import { useMyAssignments } from "@/features/assignments/hooks/useMyAssignments";
import { useDeleteAssignment } from "@/features/assignments/hooks/useDeleteAssignment";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { ROLES } from "@/constants/roles";

// Types
import type {
  Assignment,
  AssignmentStatus,
} from "@/features/assignments/types/assignment.types";

// Shadcn UI & Custom Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignmentStatusBadge } from "@/features/assignments/components/AssignmentStatusBadge";

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isMember = user?.role === ROLES.MEMBER;
  const canManage = user?.role === ROLES.ADMIN || user?.role === ROLES.TRAINER;

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus | null>(
    null,
  );
  const [selectedTrainer, setSelectedTrainer] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    memberName: string;
  }>({
    isOpen: false,
    id: "",
    memberName: "",
  });

  // Fetching Data & Mutations based on role
  const { data: adminData, isLoading: isAdminLoading } = useAssignments(
    page,
    limit,
    canManage,
  );
  const { data: memberAssignments = [], isLoading: isMemberLoading } =
    useMyAssignments(isMember);
  const { mutate: deleteAssignment, isPending: isDeleting } =
    useDeleteAssignment();

  const isLoading = isUserLoading || (isMember ? isMemberLoading : isAdminLoading);

  // Extracting Data safely
  const rawAssignments: Assignment[] = isMember
    ? memberAssignments
    : (adminData?.data?.assignments ?? []);
  const totalItems = isMember
    ? memberAssignments.length
    : (adminData?.results ?? 0);
  const totalPages = Math.ceil(totalItems / limit) || 1;

  // Client-side filtering on current page
  const filteredAssignments = rawAssignments.filter((item: Assignment) => {
    const matchesSearch =
      item.member?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.member?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.workout?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.trainer?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    const matchesTrainer =
      selectedTrainer === "ALL" || item.trainer?.id === selectedTrainer;

    return matchesSearch && matchesStatus && matchesTrainer;
  });

  // Showing X to Y of Z
  const showingFrom = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const showingTo = Math.min(page * limit, totalItems);

  // Quick stats
  const stats = isMember
    ? {
        total: memberAssignments.length,
        active: memberAssignments.filter((a) => a.status === "ACTIVE").length,
        completed: memberAssignments.filter((a) => a.status === "COMPLETED")
          .length,
        cancelled: memberAssignments.filter((a) => a.status === "CANCELLED")
          .length,
      }
    : (adminData?.stats ?? {
        total: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
      });

  // Handlers
  const handleDeleteClick = (id: string, memberName: string) => {
    setDeleteModal({ isOpen: true, id, memberName });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteAssignment(deleteModal.id, {
        onSuccess: () => {
          setDeleteModal({ isOpen: false, id: "", memberName: "" });
        },
      });
    }
  };

  // UI Helpers
  const getProgressPercentage = (status: AssignmentStatus) => {
    switch (status) {
      case "COMPLETED":
        return 100;
      case "ACTIVE":
        return 65;
      case "CANCELLED":
        return 15;
      default:
        return 0;
    }
  };

  const getProgressBarColor = (status: AssignmentStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-[#5BE584]";
      case "COMPLETED":
        return "bg-[#6B7280]";
      case "CANCELLED":
        return "bg-red-500/80";
      default:
        return "bg-[#5BE584]";
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0D1014] text-[#F3F4F6] font-sans selection:bg-[#5BE584]/30">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(30,35,41,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(30,35,41,0.2)_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(91,229,132,0.02)_0%,_rgba(13,16,20,0)_70%)] blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#1E2329] bg-[#0D1014]/90 backdrop-blur-md pt-8 pb-6 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-[#6B7280] uppercase">
              <span className="text-[#F3F4F6]">Assignments</span>
              <span>/</span>
              <span className="hover:text-[#9CA3AF] cursor-pointer">
                Overview
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-1">
              Workout Assignments
            </h1>
            <p className="text-sm text-[#9CA3AF]">
              {canManage
                ? "Assign workout routines to members and track their progress over time."
                : "View your assigned workout routines and launch training sessions."}
            </p>
          </div>

          {canManage && (
            <button
              onClick={() => navigate("/assignments/new")}
              className="group flex items-center justify-center gap-2 rounded-[14px] bg-[#5BE584] px-5 py-2.5 text-sm font-semibold text-[#090B0F] transition-all hover:bg-[#49D472] focus:outline-none focus:ring-2 focus:ring-[#5BE584] focus:ring-offset-2 focus:ring-offset-[#0D1014]"
            >
              <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
              New Assignment
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-10 pb-32 space-y-10 animate-in fade-in duration-300">
        {/* Stats Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Overview
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Total Assignments
                </p>
                <h3 className="text-2xl font-semibold text-white mt-2">
                  {isLoading ? "-" : stats.total}
                </h3>
              </div>
              <div className="p-2 rounded bg-[#1E2329]/50 text-[#9CA3AF]">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>

            {/* Active */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Active
                </p>
                <div className="flex items-baseline gap-2 mt-2">
                  <h3 className="text-2xl font-semibold text-white">
                    {isLoading ? "-" : stats.active}
                  </h3>
                  <span className="text-[10px] font-medium text-[#5BE584]">
                    ↗ Active
                  </span>
                </div>
              </div>
              <div className="p-2 rounded bg-[#16291D] border border-[#23422E] text-[#5BE584]">
                <PlayCircle className="w-4 h-4" />
              </div>
            </div>

            {/* Completed */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Completed
                </p>
                <h3 className="text-2xl font-semibold text-white mt-2">
                  {isLoading ? "-" : stats.completed}
                </h3>
              </div>
              <div className="p-2 rounded bg-[#1E2329]/50 text-[#9CA3AF]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            {/* Cancelled */}
            <div className="rounded-xl border border-[#1E2329] bg-[#101418] p-5 flex items-start justify-between transition-colors hover:border-[#2A313A]">
              <div>
                <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Cancelled / Stopped
                </p>
                <div className="flex items-baseline gap-3 mt-2">
                  <h3 className="text-2xl font-semibold text-white">
                    {isLoading ? "-" : stats.cancelled}
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedStatus("CANCELLED");
                      setPage(1);
                    }}
                    className="text-[10px] font-medium text-red-400/80 hover:text-red-400 hover:underline transition-colors"
                  >
                    Filter
                  </button>
                </div>
              </div>
              <div className="p-2 rounded bg-red-950/30 border border-red-900/50 text-red-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-gradient-to-r from-[#1E2329] to-transparent" />

        {/* Workspace Area */}
        <section>
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-[11px] font-bold tracking-widest text-[#6B7280] uppercase">
              Assignment Records
            </h2>
          </div>

          <div className="rounded-xl border border-[#1E2329] bg-[#101418]/50 overflow-hidden backdrop-blur-sm">
            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-[#1E2329] flex flex-col md:flex-row items-center justify-between gap-4 bg-[#101418]">
              <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1E2329]/40 border border-[#1E2329] text-xs font-medium text-[#9CA3AF]">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </div>

                <div className="flex gap-1.5">
                  {(
                    ["ACTIVE", "COMPLETED", "CANCELLED"] as AssignmentStatus[]
                  ).map((status) => {
                    const isSelected = selectedStatus === status;
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(isSelected ? null : status);
                          setPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-200 border ${
                          isSelected
                            ? "bg-[#16291D] border-[#23422E] text-[#5BE584]"
                            : "bg-[#101418] border-[#1E2329] text-[#9CA3AF] hover:border-[#6B7280] hover:text-[#F3F4F6]"
                        }`}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>

                <div className="h-6 w-px bg-[#1E2329] mx-1" />

                <div className="relative">
                  <select
                    value={selectedTrainer}
                    onChange={(e) => {
                      setSelectedTrainer(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 pl-3 pr-8 rounded-md bg-[#101418] text-xs font-medium border border-[#1E2329] text-[#F3F4F6] focus:outline-none focus:border-[#5BE584] focus:ring-1 focus:ring-[#5BE584] appearance-none cursor-pointer"
                  >
                    <option value="ALL">All Trainers</option>
                    {Array.from(
                      new Set(rawAssignments.map((a) => a.trainer?.id)),
                    )
                      .filter(Boolean)
                      .map((trainerId) => {
                        const trainerName = rawAssignments.find(
                          (a) => a.trainer?.id === trainerId,
                        )?.trainer?.name;
                        return (
                          <option key={trainerId} value={trainerId}>
                            {trainerName}
                          </option>
                        );
                      })}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7280] pointer-events-none" />
                </div>
              </div>

              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  placeholder="Search member, workout..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 pl-9 pr-4 rounded-md border border-[#1E2329] bg-[#101418] text-xs text-[#F3F4F6] placeholder-[#6B7280] transition-colors focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#1E2329] text-[#6B7280] text-[10px] font-bold uppercase tracking-widest bg-[#101418]">
                    <th className="py-4 px-5">Member</th>
                    <th className="py-4 px-5">Assigned Workout</th>
                    <th className="py-4 px-5">Trainer</th>
                    <th className="py-4 px-5">Duration</th>
                    <th className="py-4 px-5">Progress</th>
                    <th className="py-4 px-5">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2329] text-sm">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        <td className="py-4 px-5">
                          <div className="h-9 w-32 bg-[#1E2329] rounded" />
                        </td>
                        <td className="py-4 px-5">
                          <div className="h-6 w-28 bg-[#1E2329] rounded" />
                        </td>
                        <td className="py-4 px-5">
                          <div className="h-5 w-24 bg-[#1E2329] rounded" />
                        </td>
                        <td className="py-4 px-5">
                          <div className="h-5 w-28 bg-[#1E2329] rounded" />
                        </td>
                        <td className="py-4 px-5">
                          <div className="h-4 w-24 bg-[#1E2329] rounded" />
                        </td>
                        <td className="py-4 px-5">
                          <div className="h-6 w-16 bg-[#1E2329] rounded-full" />
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="h-8 w-8 bg-[#1E2329] rounded ml-auto" />
                        </td>
                      </tr>
                    ))
                  ) : filteredAssignments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-24 text-center bg-[#0D1014]"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291D] text-[#5BE584] border border-[#23422E] mb-4">
                            <ClipboardList className="h-5 w-5" />
                          </div>
                          <h2 className="text-sm font-semibold text-white">
                            No assignments found
                          </h2>
                          <p className="mt-1.5 text-xs text-[#9CA3AF] max-w-xs">
                            {searchQuery ||
                            selectedStatus ||
                            selectedTrainer !== "ALL"
                              ? "We couldn't find any assignments matching your current filters."
                              : "You haven't assigned any workouts to members yet."}
                          </p>
                          {(searchQuery ||
                            selectedStatus ||
                            selectedTrainer !== "ALL" ||
                            canManage) && (
                            <button
                              className="mt-5 rounded-md border border-[#1E2329] px-4 py-2 text-xs font-medium text-[#9CA3AF] transition-colors hover:border-[#6B7280] hover:text-white"
                              onClick={() => {
                                if (
                                  searchQuery ||
                                  selectedStatus ||
                                  selectedTrainer !== "ALL"
                                ) {
                                  setSearchQuery("");
                                  setSelectedStatus(null);
                                  setSelectedTrainer("ALL");
                                  setPage(1);
                                } else if (canManage) {
                                  navigate("/assignments/new");
                                }
                              }}
                            >
                              {searchQuery ||
                              selectedStatus ||
                              selectedTrainer !== "ALL"
                                ? "Clear Filters"
                                : "Create First Assignment"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssignments.map((item: Assignment) => {
                      const progress = getProgressPercentage(item.status);

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#1E2329]/30 transition-colors group"
                        >
                          {/* Member */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded border border-[#23422E] bg-[#16291D] text-[#5BE584] flex items-center justify-center font-bold text-[11px] shrink-0 uppercase">
                                {item.member?.name?.slice(0, 2) ||
                                  user?.name?.slice(0, 2) ||
                                  "MB"}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#F3F4F6]">
                                  {item.member?.name || user?.name || "Member"}
                                </div>
                                <div className="text-[11px] text-[#6B7280]">
                                  {item.member?.email || user?.email || ""}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Workout */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <span className="inline-flex items-center rounded-sm bg-[#1E2329]/60 border border-[#1E2329] px-2 py-1 text-xs font-medium text-[#D1D5DB] max-w-[220px] truncate">
                              {item.workout?.title || "General Routine"}
                            </span>
                          </td>

                          {/* Trainer */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                              <UserCheck className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                              <span>{item.trainer?.name || "Assigned Coach"}</span>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                              <Calendar className="w-3.5 h-3.5 text-[#6B7280] shrink-0" />
                              <span>
                                {new Date(item.startDate).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                                <span className="text-[#6B7280] mx-1">→</span>
                                {new Date(item.endDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-20 bg-[#1E2329] h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(item.status)}`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-medium text-[#6B7280] w-8">
                                {progress}%
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-5 whitespace-nowrap">
                            <AssignmentStatusBadge status={item.status} />
                          </td>

                          {/* Actions Dropdown */}
                          <td className="py-3.5 px-5 text-right whitespace-nowrap">
                            <DropdownMenu>
                              <DropdownMenuTrigger>
                                <button className="h-8 w-8 inline-flex items-center justify-center rounded text-[#6B7280] hover:bg-[#1E2329] hover:text-[#F3F4F6] transition-colors focus:outline-none focus:ring-1 focus:ring-[#5BE584]">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent
                                align="end"
                                className="w-44 border-[#1E2329] bg-[#101418] text-[#F3F4F6] shadow-xl"
                              >
                                {canManage ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/assignments/${item.id}`)
                                      }
                                      className="cursor-pointer text-xs font-medium hover:bg-[#1E2329] focus:bg-[#1E2329] focus:text-white"
                                    >
                                      <Eye className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
                                      View Details
                                    </DropdownMenuItem>

                                    <DropdownMenuItem
                                      onClick={() =>
                                        navigate(`/assignments/${item.id}/edit`)
                                      }
                                      className="cursor-pointer text-xs font-medium hover:bg-[#1E2329] focus:bg-[#1E2329] focus:text-white"
                                    >
                                      <Pencil className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
                                      Edit Assignment
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="bg-[#1E2329]" />

                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteClick(
                                          item.id,
                                          item.member?.name || "this member",
                                        )
                                      }
                                      className="cursor-pointer text-xs font-medium text-red-400 focus:bg-red-950/30 focus:text-red-400"
                                    >
                                      <Trash2 className="mr-2 h-3.5 w-3.5 text-red-400" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    {item.workout?.id && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          navigate(
                                            `/workout-builder/${item.workout.id}`,
                                          )
                                        }
                                        className="cursor-pointer text-xs font-medium hover:bg-[#1E2329] focus:bg-[#1E2329] focus:text-white"
                                      >
                                        <Eye className="mr-2 h-3.5 w-3.5 text-[#9CA3AF]" />
                                        View Routine
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      onClick={() => navigate("/sessions")}
                                      className="cursor-pointer text-xs font-medium text-[#5BE584] hover:bg-[#1E2329] focus:bg-[#1E2329] focus:text-[#5BE584]"
                                    >
                                      <PlayCircle className="mr-2 h-3.5 w-3.5 text-[#5BE584]" />
                                      Go to Sessions
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-[#1E2329] bg-[#101418] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CA3AF]">
              <div>
                Showing{" "}
                <span className="font-medium text-[#F3F4F6]">
                  {showingFrom}
                </span>{" "}
                to{" "}
                <span className="font-medium text-[#F3F4F6]">{showingTo}</span>{" "}
                of{" "}
                <span className="font-medium text-[#F3F4F6]">{totalItems}</span>{" "}
                assignments
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((old) => Math.max(old - 1, 1))}
                  disabled={page === 1 || isLoading || totalItems === 0}
                  className="h-8 w-8 inline-flex items-center justify-center rounded border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white hover:border-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <span className="px-3 py-1.5 rounded bg-[#1E2329]/50 text-[#F3F4F6] font-medium border border-[#1E2329]">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((old) => Math.min(old + 1, totalPages))
                  }
                  disabled={page >= totalPages || isLoading || totalItems === 0}
                  className="h-8 w-8 inline-flex items-center justify-center rounded border border-[#1E2329] bg-[#101418] text-[#9CA3AF] hover:text-white hover:border-[#6B7280] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={deleteModal.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteModal({ isOpen: false, id: "", memberName: "" })
        }
      >
        <DialogContent className="sm:max-w-[425px] border-[#1E2329] bg-[#101418] shadow-2xl p-6">
          <DialogHeader className="gap-2 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-red-950/30 border border-red-900/50 text-red-400 mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              Delete Assignment?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#9CA3AF]">
              You are about to permanently delete the workout routine assigned
              to{" "}
              <span className="font-semibold text-[#F3F4F6]">
                {deleteModal.memberName}
              </span>
              . This action cannot be undone and will remove all logged progress
              for this routine.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3 sm:gap-0 mt-6 border-t border-[#1E2329] pt-4">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() =>
                setDeleteModal({ isOpen: false, id: "", memberName: "" })
              }
              className="rounded-md px-4 py-2 text-sm font-medium text-[#9CA3AF] transition-colors hover:bg-[#1E2329] hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="inline-flex items-center justify-center rounded-md bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#101418] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete Assignment
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ChevronDown icon is needed for the custom select arrow
function ChevronDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
