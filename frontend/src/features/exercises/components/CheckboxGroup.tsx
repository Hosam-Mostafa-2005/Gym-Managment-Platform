import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxGroupProps {
  title: string;
  description?: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

const CheckboxGroup = ({
  title,
  description,
  options,
  value,
  onChange,
  error,
}: CheckboxGroupProps) => {
  const toggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-4 sm:p-6 shadow-sm">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
          {title}
        </h3>

        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Responsive Grid: 1 col on narrow screens, 2 cols on mobile/tablet, 3 cols on desktop */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {options.map((option) => {
          const isSelected = value.includes(option);
          return (
            <div
              key={option}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => toggleOption(option)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggleOption(option);
                }
              }}
              className={cn(
                "group flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border p-3 sm:p-3.5 transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-[0.99]",
                isSelected
                  ? "border-[#5BE584] bg-[#5BE584]/10 text-white font-medium ring-1 ring-[#5BE584]/40 shadow-xs"
                  : "border-border bg-background/60 hover:border-primary/40 hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
                  isSelected
                    ? "border-[#5BE584] bg-[#5BE584] text-[#090B0F]"
                    : "border-input bg-background/40 group-hover:border-primary/50"
                )}
              >
                {isSelected && <CheckIcon className="size-3.5 stroke-[3]" />}
              </div>

              <span className="text-xs sm:text-sm font-medium leading-tight">
                {option}
              </span>
            </div>
          );
        })}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </section>
  );
};

export default CheckboxGroup;
