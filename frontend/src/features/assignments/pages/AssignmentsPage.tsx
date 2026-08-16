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
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Hooks
import { useAssignments } from "@/features/assignments/hooks/useAssignments";
import { useDeleteAssignment } from "@/features/assignments/hooks/useDeleteAssignment";
import { useArchiveAssignment } from "@/features/assignments/hooks/useArchiveAssignment";

// Types
import type {
  Assignment,
  AssignmentStatus,
} from "@/features/assignments/types/assignment.types";

// Shadcn UI & Custom Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus | null>(
    null,
  );
  const [selectedTrainer, setSelectedTrainer] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // 💡 State للتحكم في نافذة التأكيد قبل الحذف
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string;
    memberName: string;
  }>({
    isOpen: false,
    id: "",
    memberName: "",
  });

  // Fetching Data & Mutations (مربوط بالـ Server-Side Pagination)
  const { data, isLoading } = useAssignments(page, limit);
  const { mutate: deleteAssignment, isPending: isDeleting } =
    useDeleteAssignment();

  // 1. استخراج البيانات اللي جاية من السيرفر بأمان
  const rawAssignments: Assignment[] = data?.data?.assignments ?? [];
  const totalItems = data?.results ?? 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  // 2. فلترة سريعة للبحث والمدربين على الداتا المعروضة في الصفحة الحالية
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

  // 3. حساب أرقام العرض (Showing X to Y of Z) بناءً على أرقام السيرفر الحقيقية
  const showingFrom = totalItems > 0 ? (page - 1) * limit + 1 : 0;
  const showingTo = Math.min(page * limit, totalItems);

  // إحصائيات سريعة للكروت العلوية (بناءً على التمارين المعروضة حالياً)
  const stats = data?.stats ?? {
    total: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  };

  // 💡 Handlers الحذف الجديدة (بواسطة الـ Modal)
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

  // const handleArchive = (id: string) => {
  //   archiveAssignment(id);
  // };

  // مساعد النسبة المئوية للتقارب مع التصميم
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
        return "bg-emerald-500";
      case "COMPLETED":
        return "bg-zinc-500";
      case "CANCELLED":
        return "bg-rose-500";
      default:
        return "bg-emerald-500";
    }
  };

  return (
    <section className="space-y-8 animate-in fade-in duration-300 text-foreground">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Workout Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Assign workout routines to members and track their progress over
            time.
          </p>
        </div>

        <Button
          onClick={() => navigate("/assignments/new")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Assignment
        </Button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Assignments
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {isLoading ? "-" : stats.total}
              </h3>
            </div>
            <div className="p-2.5 bg-accent/50 rounded-lg text-muted-foreground">
              <ClipboardList className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Active
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h3 className="text-3xl font-bold">
                  {isLoading ? "-" : stats.active}
                </h3>
                <span className="text-xs font-medium text-emerald-400">
                  ↗ Active
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <PlayCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Completed
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {isLoading ? "-" : stats.completed}
              </h3>
            </div>
            <div className="p-2.5 bg-accent/50 rounded-lg text-muted-foreground">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Cancelled / Stopped
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <h3 className="text-3xl font-bold">
                  {isLoading ? "-" : stats.cancelled}
                </h3>
                <span
                  onClick={() => {
                    setSelectedStatus("CANCELLED");
                    setPage(1);
                  }}
                  className="text-xs font-medium text-rose-400 hover:underline cursor-pointer"
                >
                  Filter
                </span>
              </div>
            </div>
            <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Container */}
      <div className="rounded-xl border border-border/50 bg-card/30 overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-border/60 bg-card/40 pointer-events-none"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </Button>

            <div className="flex gap-1">
              {(["ACTIVE", "COMPLETED", "CANCELLED"] as AssignmentStatus[]).map(
                (status) => (
                  <Badge
                    key={status}
                    variant={
                      selectedStatus === status ? "default" : "secondary"
                    }
                    className="cursor-pointer px-3 py-1.5 font-normal transition-colors text-xs capitalize"
                    onClick={() => {
                      setSelectedStatus(
                        selectedStatus === status ? null : status,
                      );
                      setPage(1); // تصفير رقم الصفحة عند تغيير الفلتر
                    }}
                  >
                    {status.toLowerCase()}
                  </Badge>
                ),
              )}
            </div>

            <select
              value={selectedTrainer}
              onChange={(e) => {
                setSelectedTrainer(e.target.value);
                setPage(1); // تصفير رقم الصفحة عند تغيير المدرب
              }}
              className="h-9 px-3 rounded-md bg-card/40 text-xs font-medium border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
            >
              <option value="ALL">All Trainers</option>
              {Array.from(new Set(rawAssignments.map((a) => a.trainer?.id)))
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
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search member, workout..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1); // تصفير رقم الصفحة عند البحث
              }}
              className="pl-9 h-9 bg-card/40 border-border/60 focus-visible:ring-1 text-xs"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-muted-foreground text-xs font-semibold uppercase tracking-wider bg-muted/20">
                <th className="py-3.5 px-4 md:px-5">Member</th>
                <th className="py-3.5 px-4 md:px-5">Assigned Workout</th>
                <th className="py-3.5 px-4 md:px-5">Trainer</th>
                <th className="py-3.5 px-4 md:px-5">Duration</th>
                <th className="py-3.5 px-4 md:px-5">Progress</th>
                <th className="py-3.5 px-4 md:px-5">Status</th>
                <th className="py-3.5 px-4 md:px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 text-sm">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="py-4 px-4 md:px-5">
                      <div className="h-10 w-36 bg-accent/40 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 md:px-5">
                      <div className="h-6 w-28 bg-accent/40 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 md:px-5">
                      <div className="h-6 w-24 bg-accent/40 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 md:px-5">
                      <div className="h-8 w-28 bg-accent/40 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 md:px-5">
                      <div className="h-4 w-24 bg-accent/40 rounded-lg" />
                    </td>
                    <td className="py-4 px-4 md:px-5">
                      <div className="h-6 w-16 bg-accent/40 rounded-full" />
                    </td>
                    <td className="py-4 px-4 md:px-5 text-right">
                      <div className="h-6 w-6 bg-accent/40 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4">
                        <ClipboardList className="h-6 w-6" />
                      </div>
                      <h2 className="text-base font-semibold">
                        No assignments found
                      </h2>
                      <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                        {searchQuery ||
                        selectedStatus ||
                        selectedTrainer !== "ALL"
                          ? "We couldn't find any assignments matching your current filters."
                          : "You haven't assigned any workouts to members yet."}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-dashed border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
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
                          } else {
                            navigate("/assignments/new");
                          }
                        }}
                      >
                        {searchQuery ||
                        selectedStatus ||
                        selectedTrainer !== "ALL"
                          ? "Clear Filters"
                          : "Create First Assignment"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((item: Assignment) => {
                  const progress = getProgressPercentage(item.status);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-accent/20 transition-colors group"
                    >
                      {/* Member */}
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xs border border-emerald-500/20 shrink-0">
                            {item.member?.name?.slice(0, 2).toUpperCase() ||
                              "MB"}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {item.member?.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.member?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Workout */}
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <Badge
                          variant="secondary"
                          className="bg-accent/50 text-foreground font-normal border border-border/40 text-xs max-w-[220px] truncate"
                        >
                          {item.workout?.title || "General Routine"}
                        </Badge>
                      </td>

                      {/* Trainer */}
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="text-foreground font-medium">
                            {item.trainer?.name}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {new Date(item.startDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" },
                            )}{" "}
                            -{" "}
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
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-accent/60 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(item.status)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-8">
                            {progress}%
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 md:px-5 whitespace-nowrap">
                        <AssignmentStatusBadge status={item.status} />
                      </td>

                      {/* Actions Dropdown */}
                      <td className="py-3.5 px-4 md:px-5 text-right whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent
                            align="end"
                            className="w-44 border-border/60 bg-card/95 backdrop-blur-md shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/assignments/${item.id}`)
                              }
                              className="cursor-pointer text-xs font-medium hover:bg-accent/60"
                            >
                              <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/assignments/${item.id}/edit`)
                              }
                              className="cursor-pointer text-xs font-medium hover:bg-accent/60"
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                              Edit Assignment
                            </DropdownMenuItem>

                            {/* <DropdownMenuItem
                              onClick={() => handleArchive(item.id)}
                              className="cursor-pointer text-xs font-medium hover:bg-accent/60"
                            >
                              <Archive className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                              Archive
                            </DropdownMenuItem> */}

                            <DropdownMenuSeparator className="bg-border/40" />

                            {/* 💡 تم التعديل ليفتح نافذة الحذف بدل window.confirm */}
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteClick(
                                  item.id,
                                  item.member?.name || "this member",
                                )
                              }
                              className="cursor-pointer text-xs font-medium text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5 text-destructive" />
                              Delete
                            </DropdownMenuItem>
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
        <div className="p-4 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            Showing{" "}
            <span className="font-medium text-foreground">{showingFrom}</span>{" "}
            to <span className="font-medium text-foreground">{showingTo}</span>{" "}
            of <span className="font-medium text-foreground">{totalItems}</span>{" "}
            assignments
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1 || isLoading || totalItems === 0}
              className="h-8 w-8 border-border/60 bg-card/40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>

            <span className="px-3 py-1.5 rounded bg-accent/40 text-foreground font-medium border border-border/40">
              Page {page} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
              disabled={page >= totalPages || isLoading || totalItems === 0}
              className="h-8 w-8 border-border/60 bg-card/40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 💡 نافذة التأكيد قبل الحذف (Modal) */}
      <Dialog
        open={deleteModal.isOpen}
        onOpenChange={(open) =>
          !open && setDeleteModal({ isOpen: false, id: "", memberName: "" })
        }
      >
        <DialogContent className="sm:max-w-[425px] border-destructive/30 bg-card/95 backdrop-blur-md text-foreground">
          <DialogHeader className="gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-1">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl text-foreground">
              Delete Assignment?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              You are about to permanently delete the workout routine assigned
              to{" "}
              <span className="font-semibold text-foreground">
                {deleteModal.memberName}
              </span>
              . This action cannot be undone and will remove all logged progress
              for this routine.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() =>
                setDeleteModal({ isOpen: false, id: "", memberName: "" })
              }
              className="border-border/60 hover:bg-accent/50"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium shadow-sm"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              {isDeleting ? "Deleting..." : "Yes, Delete Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
