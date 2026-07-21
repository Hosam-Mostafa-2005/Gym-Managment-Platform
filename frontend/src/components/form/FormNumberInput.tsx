import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormNumberInputProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function FormNumberInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled = false,
  className,
  min,
  max,
  step = 1,
}: FormNumberInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <Label htmlFor={String(name)}>{label}</Label>

          <Input
            id={String(name)}
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            value={field.value ?? ""}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
            onChange={(e) => {
              const value = e.target.value;

              field.onChange(value === "" ? undefined : Number(value));
            }}
          />

          {fieldState.error && (
            <p className="mt-1 text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
