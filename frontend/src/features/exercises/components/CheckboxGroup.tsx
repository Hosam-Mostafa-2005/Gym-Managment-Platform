import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
    <section className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-lg font-semibold">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <Label
            key={option}
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              border-border
              bg-background
              p-4
              transition-all
              hover:border-primary/40
              hover:bg-accent
            "
          >
            <Checkbox
              checked={value.includes(option)}
              onCheckedChange={() => toggleOption(option)}
            />

            <span>{option}</span>
          </Label>
        ))}
      </div>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </section>
  );
};

export default CheckboxGroup;
