import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Share2,
  Download,
  Dumbbell,
  Clock,
  Flame,
  User,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  ArrowRight,
  LogIn,
  UserPlus,
  AlertCircle,
  Search,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getWorkoutSharePreview,
  importSharedWorkout,
  type WorkoutSharePreviewData,
} from "../api/workoutShare.api";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { toast } from "sonner";
import ExerciseImage from "@/features/exercises/components/ExerciseImage";

export default function WorkoutSharePreviewPage() {
  const { shareIdentifier } = useParams<{ shareIdentifier: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  const [codeQuery, setCodeQuery] = useState(shareIdentifier || "");
  const [activeCode, setActiveCode] = useState(shareIdentifier || "");
  const [data, setData] = useState<WorkoutSharePreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareIdentifier) {
      setActiveCode(shareIdentifier);
      setCodeQuery(shareIdentifier);
    }
  }, [shareIdentifier]);

  useEffect(() => {
    if (!activeCode) return;

    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getWorkoutSharePreview(activeCode);
        setData(result);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            "Shared workout routine not found or link has expired.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [activeCode]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeQuery.trim()) return;
    setActiveCode(codeQuery.trim());
    navigate(`/share/workout/${encodeURIComponent(codeQuery.trim())}`, {
      replace: true,
    });
  };

  const handleImport = async () => {
    if (!activeCode) return;
    try {
      setIsImporting(true);
      const imported = await importSharedWorkout(activeCode);
      toast.success("Workout routine successfully imported to your library!");
      navigate(`/workouts/${imported.id || imported._id}`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to import workout routine.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  const currentPathWithCode = activeCode
    ? `/share/workout/${encodeURIComponent(activeCode)}`
    : location.pathname;

  return (
    <div className="min-h-screen bg-[#090B0F] text-[#F3F4F6] selection:bg-[#5BE584]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white">
              STREN<span className="text-[#5BE584]">.</span>
            </span>
            <span className="text-xs uppercase tracking-wider text-[#9CA3AF] border-l border-white/10 pl-2">
              Routine Sharing
            </span>
          </Link>

          {currentUser ? (
            <Link
              to="/workouts"
              className="text-xs text-[#9CA3AF] hover:text-white transition-colors"
            >
              Back to My Workouts
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to={`/login?redirect=${encodeURIComponent(currentPathWithCode)}`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "text-xs text-[#9CA3AF] hover:text-white",
                })}
              >
                Log In
              </Link>
              <Link
                to={`/register?redirect=${encodeURIComponent(currentPathWithCode)}`}
                className={buttonVariants({
                  size: "sm",
                  className: "bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] font-semibold text-xs",
                })}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Search by Code Bar if no active code or on error */}
        {(!activeCode || error) && (
          <Card className="border-[#1E2329] bg-[#0D1014] p-6 shadow-xl">
            <form onSubmit={handleManualSearch} className="space-y-3">
              <label className="text-sm font-semibold text-white block">
                Enter a 8-Character Workout Share Code
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={codeQuery}
                    onChange={(e) => setCodeQuery(e.target.value.toUpperCase())}
                    placeholder="e.g. STR-A9F3E"
                    className="w-full rounded-lg border border-[#2A3039] bg-[#090B0F] px-4 py-2.5 font-mono text-sm tracking-wider text-[#5BE584] placeholder:text-[#4B5563] focus:border-[#5BE584] focus:outline-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] font-bold"
                >
                  <Search className="h-4 w-4 mr-1.5" />
                  Preview Routine
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-[#9CA3AF]">
            <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
            <p className="text-sm font-medium">Resolving shared workout prescription...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Routine Unavailable</h3>
            <p className="text-xs text-[#9CA3AF] max-w-md mx-auto">{error}</p>
          </div>
        )}

        {/* Routine Preview Content */}
        {data && !isLoading && !error && (
          <div className="space-y-6">
            {/* Header Hero Card */}
            <div className="relative overflow-hidden rounded-2xl border border-[#1E2329] bg-[#0D1014] p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                <Dumbbell className="h-48 w-48 text-[#5BE584]" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#5BE584]/10 border border-[#5BE584]/30 px-2.5 py-1 font-mono text-xs font-bold text-[#5BE584]">
                    <Share2 className="h-3 w-3" /> CODE: {data.shareCode}
                  </span>
                  <Badge variant="outline" className="border-white/10 text-white capitalize">
                    {data.workout.category}
                  </Badge>
                  <Badge variant="outline" className="border-white/10 text-[#9CA3AF] capitalize">
                    {data.workout.difficulty}
                  </Badge>
                </div>

                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {data.workout.title}
                  </h1>
                  {data.workout.description && (
                    <p className="text-sm text-[#9CA3AF] mt-2 max-w-2xl leading-relaxed">
                      {data.workout.description}
                    </p>
                  )}
                </div>

                {/* Metrics Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-xl border border-white/5 bg-[#141920] p-3">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">
                      Creator
                    </span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1 mt-0.5">
                      <User className="h-3.5 w-3.5 text-[#5BE584]" />
                      {data.workout.creatorName}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#141920] p-3">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">
                      Duration
                    </span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1 mt-0.5">
                      <Clock className="h-3.5 w-3.5 text-[#5BE584]" />
                      {data.workout.estimatedDuration} mins
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#141920] p-3">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">
                      Movements
                    </span>
                    <span className="text-sm font-semibold text-white flex items-center gap-1 mt-0.5">
                      <Dumbbell className="h-3.5 w-3.5 text-[#5BE584]" />
                      {data.workout.exerciseCount} exercises
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#141920] p-3">
                    <span className="text-[10px] text-[#6B7280] uppercase tracking-wider block">
                      Rest Defaults
                    </span>
                    <span className="text-xs font-semibold text-white flex items-center gap-1 mt-0.5">
                      {data.workout.defaultRestLarge}s / {data.workout.defaultRestSmall}s
                    </span>
                  </div>
                </div>

                {/* Import / Call to Action Bar */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                    <ShieldCheck className="h-4 w-4 text-[#5BE584]" />
                    <span>Safe import: creates a private copy in your routine catalog.</span>
                  </div>

                  {currentUser ? (
                    <Button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="w-full sm:w-auto bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] font-bold px-6 py-2 shadow-lg shadow-[#5BE584]/10"
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Import to My Workouts
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        to={`/register?redirect=${encodeURIComponent(currentPathWithCode)}`}
                        className={buttonVariants({
                          className: "flex-1 sm:flex-none bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] font-bold text-xs",
                        })}
                      >
                        <UserPlus className="h-4 w-4 mr-1.5" />
                        Register to Import
                      </Link>
                      <Link
                        to={`/login?redirect=${encodeURIComponent(currentPathWithCode)}`}
                        className={buttonVariants({
                          variant: "outline",
                          className: "flex-1 sm:flex-none border-[#2A3039] bg-[#141920] hover:bg-[#1E2329] text-white text-xs",
                        })}
                      >
                        <LogIn className="h-4 w-4 mr-1.5" />
                        Log In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Exercise Sequence List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Exercise Sequence</span>
                <span className="text-xs font-normal text-[#9CA3AF]">
                  ({data.workout.exercises.length} prescribed movements)
                </span>
              </h2>

              <div className="space-y-3">
                {data.workout.exercises.map((item) => (
                  <Card
                    key={item.order}
                    className="border-[#1E2329] bg-[#0D1014] p-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Exercise Header & Badges */}
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5BE584]/10 text-xs font-mono font-bold text-[#5BE584] border border-[#5BE584]/20 shrink-0">
                          #{item.order}
                        </span>

                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">
                            {item.exercise.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.exercise.primaryMuscles.map((m) => (
                              <span
                                key={m}
                                className="rounded bg-[#5BE584]/10 px-2 py-0.5 text-[10px] font-semibold text-[#5BE584]"
                              >
                                {m}
                              </span>
                            ))}
                            {item.exercise.equipment.map((eq) => (
                              <span
                                key={eq}
                                className="rounded bg-[#141920] border border-[#262D36] px-2 py-0.5 text-[10px] text-[#9CA3AF]"
                              >
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Image Thumbnail if available */}
                      {item.exercise.imageUrl && (
                        <div className="shrink-0 hidden sm:block">
                          <ExerciseImage
                            src={item.exercise.imageUrl}
                            alt={item.exercise.name}
                            size="md"
                            fit="contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Prescription Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/5">
                      <div className="rounded-lg bg-[#141920] px-3 py-2">
                        <span className="text-[10px] uppercase text-[#6B7280] block">
                          Sets
                        </span>
                        <span className="font-mono text-sm font-bold text-white">
                          {item.sets}
                        </span>
                      </div>

                      <div className="rounded-lg bg-[#141920] px-3 py-2">
                        <span className="text-[10px] uppercase text-[#6B7280] block">
                          Target Reps
                        </span>
                        <span className="font-mono text-sm font-bold text-white">
                          {item.reps}
                        </span>
                      </div>

                      <div className="rounded-lg bg-[#141920] px-3 py-2">
                        <span className="text-[10px] uppercase text-[#6B7280] block">
                          Rest Duration
                        </span>
                        <span className="font-mono text-sm font-bold text-[#5BE584]">
                          {item.restSeconds}s
                        </span>
                      </div>

                      <div className="rounded-lg bg-[#141920] px-3 py-2">
                        <span className="text-[10px] uppercase text-[#6B7280] block">
                          Target Load / RPE
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#9CA3AF]">
                          {item.targetWeight ? `${item.targetWeight} kg` : "—"}
                          {item.targetRpe ? ` @ RPE ${item.targetRpe}` : ""}
                        </span>
                      </div>
                    </div>

                    {/* Coaching Notes if present */}
                    {item.notes && (
                      <p className="text-xs text-[#9CA3AF] mt-3 bg-[#101418] rounded-md p-2 border border-white/5 italic">
                        &ldquo;{item.notes}&rdquo;
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
