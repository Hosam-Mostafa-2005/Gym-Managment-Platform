import React, { useState } from "react";
import { Plus, X, Loader2, Sparkles, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createCustomFood } from "../api/nutrition.api";
import type { FoodItem, CreateCustomFoodPayload } from "../types/nutrition.types";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateCustomFoodDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFoodCreated?: (food: FoodItem) => void;
}

const CATEGORY_OPTIONS = [
  "Protein",
  "Carbohydrates",
  "Fats & Oils",
  "Dairy & Eggs",
  "Vegetables & Fruits",
  "Snacks & Sweets",
  "Beverages",
  "Supplements",
  "Prepared Meals",
];

export const CreateCustomFoodDialog: React.FC<CreateCustomFoodDialogProps> = ({
  isOpen,
  onClose,
  onFoodCreated,
}) => {
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState("Protein");
  const [servingSize, setServingSize] = useState<number>(100);
  const [servingUnit, setServingUnit] = useState("g");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fat, setFat] = useState<number>(0);
  const [fiber, setFiber] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const resetForm = () => {
    setName("");
    setNameAr("");
    setCategory("Protein");
    setServingSize(100);
    setServingUnit("g");
    setCalories(0);
    setProtein(0);
    setCarbs(0);
    setFat(0);
    setFiber(0);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a food name.");
      return;
    }
    if (servingSize <= 0) {
      setErrorMsg("Serving size must be greater than zero.");
      return;
    }
    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0 || fiber < 0) {
      setErrorMsg("Nutritional values cannot be negative numbers.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload: CreateCustomFoodPayload = {
        name: name.trim(),
        nameAr: nameAr.trim() || undefined,
        category,
        servingSize,
        servingUnit: servingUnit.trim() || "g",
        calories,
        protein,
        carbs,
        fat,
        fiber,
      };

      const created = await createCustomFood(payload);

      // Invalidate food searches
      await queryClient.invalidateQueries({ queryKey: ["foods"] });
      await queryClient.invalidateQueries({ queryKey: ["custom-foods"] });

      toast.success(`"${created.name}" created and saved to your personal foods!`);
      resetForm();
      if (onFoodCreated) {
        onFoodCreated(created);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || "Failed to create custom food item.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-[#1E2329] bg-[#0D1014] text-[#F3F4F6] sm:max-w-md p-6 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-[#5BE584]">
            <Sparkles className="h-5 w-5" />
            <DialogTitle className="text-lg font-bold text-white">
              Create Personal Food
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#9CA3AF]">
            Add a custom recipe, home-cooked meal, or supplement to your personal diary library.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Food Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white">Food / Recipe Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Homemade Overnight Protein Oats"
              className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-3 py-2 text-xs text-white placeholder-[#6B7280] focus:border-[#5BE584] focus:outline-none"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-3 py-2 text-xs text-white focus:border-[#5BE584] focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Serving Size & Serving Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Serving Size *</label>
              <input
                type="number"
                min={1}
                required
                value={servingSize}
                onChange={(e) => setServingSize(Number(e.target.value))}
                className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-3 py-2 text-xs text-white focus:border-[#5BE584] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white">Serving Unit *</label>
              <input
                type="text"
                required
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                placeholder="e.g. g, ml, scoop, bowl"
                className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-3 py-2 text-xs text-white focus:border-[#5BE584] focus:outline-none"
              />
            </div>
          </div>

          {/* Core Macros Grid */}
          <div className="rounded-xl border border-white/5 bg-[#101418] p-3 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Per Serving Nutrition
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">Calories (kcal)</label>
                <input
                  type="number"
                  min={0}
                  value={calories}
                  onChange={(e) => setCalories(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-[#5BE584] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#5BE584]">Protein (g)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-[#5BE584] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-sky-400">Carbs (g)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-[#5BE584] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-amber-400">Fat (g)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#2A3039] bg-[#141920] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-[#5BE584] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Dietary Fiber (g)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={fiber}
                onChange={(e) => setFiber(Number(e.target.value))}
                className="w-full sm:w-1/2 rounded-lg border border-[#2A3039] bg-[#141920] px-2.5 py-1.5 text-xs font-semibold text-white focus:border-[#5BE584] focus:outline-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs text-[#9CA3AF] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#5BE584] hover:bg-[#49D472] text-[#090B0F] font-bold text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving Food...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Save Custom Food
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomFoodDialog;
