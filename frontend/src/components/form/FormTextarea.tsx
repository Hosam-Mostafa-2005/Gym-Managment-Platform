import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormTextareaProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export default function FormTextarea<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  rows = 4,
  disabled = false,
  className,
}: FormTextareaProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <Label htmlFor={String(name)}>{label}</Label>

          <Textarea
            id={String(name)}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
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
