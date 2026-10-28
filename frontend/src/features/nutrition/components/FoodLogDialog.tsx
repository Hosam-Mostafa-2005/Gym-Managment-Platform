// src/features/nutrition/components/FoodLogDialog.tsx
import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Check,
  X,
  Flame,
  ShieldAlert,
  Sparkles,
  Loader2,
  Tag,
} from "lucide-react";
import {
  useSearchFoods,
  useFoodCategories,
  useLogFood,
} from "../hooks/useNutrition";
import type { MealType, FoodItem } from "../types/nutrition.types";
import { CreateCustomFoodDialog } from "./CreateCustomFoodDialog";
import { Button } from "@/components/ui/button";

interface FoodLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  defaultDate?: string;
}

const MEAL_TYPE_OPTIONS: Array<{ value: MealType; label: string }> = [
  { value: "BREAKFAST", label: "Breakfast" },
  { value: "MORNING_SNACK", label: "Morning Snack" },
  { value: "LUNCH", label: "Lunch" },
  { value: "AFTERNOON_SNACK", label: "Afternoon Snack" },
  { value: "DINNER", label: "Dinner" },
  { value: "EVENING_SNACK", label: "Evening Snack" },
  { value: "PRE_WORKOUT", label: "Pre-Workout" },
  { value: "POST_WORKOUT", label: "Post-Workout" },
];

export const FoodLogDialog: React.FC<FoodLogDialogProps> = ({
  isOpen,
  onClose,
  defaultMealType = "BREAKFAST",
  defaultDate,
}) => {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);

  // Sync defaultMealType when opened
  React.useEffect(() => {
    if (isOpen) {
      setMealType(defaultMealType);
      setSelectedFood(null);
      setErrorMsg(null);
      setNotes("");
    }
  }, [isOpen, defaultMealType]);

  const { data: categories = [] } = useFoodCategories();
  const { data: searchResult, isLoading: isSearching } = useSearchFoods({
    search: searchQuery,
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    limit: 40,
  });

  const { mutate: logFoodMutation, isPending: isLogging } = useLogFood();

  // Handle food selection
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    const defSize = food.servingSize || 100;
    setQuantity(defSize);
    setErrorMsg(null);
  };

  // Live nutrient calculations based on quantity
  const liveNutrients = useMemo(() => {
    if (!selectedFood || quantity <= 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    const factor = quantity / (selectedFood.servingSize || 100);
    return {
      calories: Math.round(selectedFood.calories * factor),
      protein: Number((selectedFood.protein * factor).toFixed(1)),
      carbs: Number((selectedFood.carbs * factor).toFixed(1)),
      fat: Number((selectedFood.fat * factor).toFixed(1)),
    };
  }, [selectedFood, quantity]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) {
      setErrorMsg("Please select a food item to log.");
      return;
    }
    if (!quantity || quantity <= 0) {
      setErrorMsg("Please enter a valid quantity greater than 0.");
      return;
    }

    const targetDate = defaultDate || new Date().toISOString().split("T")[0];

    logFoodMutation(
      {
        foodId: selectedFood.id,
        date: targetDate,
        mealType,
        quantity,
        unit: selectedFood.servingUnit,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          setErrorMsg(
            err.response?.data?.message || err.message || "Failed to log food.",
          );
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl border border-zinc-800 bg-[#0D1014] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-[#101418]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584] border border-[#5BE584]/20">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  Log Food Intake
                </h2>
                <p className="text-xs text-zinc-400">
                  Search food database or log your custom home recipes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={handleSave}
            className="flex-1 overflow-y-auto p-6 space-y-5"
          >
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Meal Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Meal Assignment
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MEAL_TYPE_OPTIONS.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setMealType(opt.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium border text-center transition-all ${
                      mealType === opt.value
                        ? "bg-[#5BE584]/20 text-[#5BE584] border-[#5BE584]/50 shadow-sm"
                        : "bg-[#161B22] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Search and Filters Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Search Foods
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreateCustomOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#5BE584]/30 bg-[#16291D]/50 px-2.5 py-1 text-xs font-semibold text-[#5BE584] hover:bg-[#5BE584]/20 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>+ Add Custom Food</span>
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chicken, oats, rice, eggs, custom recipes..."
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584] transition-all"
                />
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("ALL")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedCategory === "ALL"
                      ? "bg-[#5BE584] text-zinc-950 font-semibold"
                      : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? "bg-[#5BE584] text-zinc-950 font-semibold"
                        : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            <div className="rounded-xl border border-zinc-800/80 bg-[#101418] max-h-48 overflow-y-auto divide-y divide-zinc-800/60">
              {isSearching ? (
                <div className="flex items-center justify-center p-6 text-zinc-500 text-sm gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#5BE584]" />
                  <span>Searching foods...</span>
                </div>
              ) : searchResult && searchResult.foods.length > 0 ? (
                searchResult.foods.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <button
                      type="button"
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between hover:bg-zinc-800/40 transition-colors ${
                        isSelected
                          ? "bg-[#5BE584]/10 border-l-4 border-l-[#5BE584]"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-100">
                            {food.name}
                          </span>
                          {food.isCustom && (
                            <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-400">
                              My Food
                            </span>
                          )}
                          {isSelected && (
                            <Check className="h-4 w-4 text-[#5BE584]" />
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {food.servingSize} {food.servingUnit} • {food.category}
                          {food.nameAr && ` • ${food.nameAr}`}
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="font-semibold text-zinc-200">
                          {food.calories} kcal
                        </div>
                        <div className="text-zinc-400">
                          P: {food.protein}g • C: {food.carbs}g • F: {food.fat}g
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-zinc-500 space-y-2">
                  <p>No foods found matching &ldquo;{searchQuery}&rdquo;.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateCustomOpen(true)}
                    className="border-[#5BE584]/30 text-[#5BE584] hover:bg-[#5BE584]/10 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create Custom Food Item
                  </Button>
                </div>
              )}
            </div>

            {/* Selected Food & Quantity Controls */}
            {selectedFood && (
              <div className="rounded-2xl border border-[#5BE584]/30 bg-[#101418] p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#5BE584]">
                      Selected Item
                    </span>
                    <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                      {selectedFood.name}
                      {selectedFood.isCustom && (
                        <span className="rounded bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                          Personal Custom
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Baseline: {selectedFood.servingSize}{" "}
                      {selectedFood.servingUnit} ({selectedFood.calories} kcal)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFood(null)}
                    className="text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Change
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Intake Amount ({selectedFood.servingUnit})
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={quantity || ""}
                        onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                        className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-sm text-zinc-100 font-mono font-semibold focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                      />
                      <span className="text-xs font-medium text-zinc-400 shrink-0">
                        {selectedFood.servingUnit}
                      </span>
                    </div>
                  </div>

                  {/* Notes Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Cooked with olive oil spray"
                      className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
                    />
                  </div>
                </div>

                {/* Live Computed Nutrient Chips */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-800/60">
                  <div className="rounded-lg bg-[#161B22] p-2 text-center">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                      Calories
                    </span>
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      {liveNutrients.calories} kcal
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#161B22] p-2 text-center">
                    <span className="text-[10px] text-[#5BE584] uppercase tracking-wider block">
                      Protein
                    </span>
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      {liveNutrients.protein}g
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#161B22] p-2 text-center">
                    <span className="text-[10px] text-sky-400 uppercase tracking-wider block">
                      Carbs
                    </span>
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      {liveNutrients.carbs}g
                    </span>
                  </div>
                  <div className="rounded-lg bg-[#161B22] p-2 text-center">
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider block">
                      Fat
                    </span>
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      {liveNutrients.fat}g
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLogging || !selectedFood || quantity <= 0}
                className="flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2 text-sm font-semibold text-zinc-950 hover:bg-[#4dd374] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#5BE584]/10"
              >
                {isLogging ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Food Log</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <CreateCustomFoodDialog
        isOpen={isCreateCustomOpen}
        onClose={() => setIsCreateCustomOpen(false)}
        onFoodCreated={(newFood) => handleSelectFood(newFood)}
      />
    </>
  );
};

export default FoodLogDialog;
