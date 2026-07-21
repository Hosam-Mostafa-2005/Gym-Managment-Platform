import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FormCheckboxProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  disabled?: boolean;
  className?: string;
}

export default function FormCheckbox<T extends FieldValues>({
  control,
  name,
  label,
  disabled = false,
  className,
}: FormCheckboxProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <div className="flex items-center space-x-2">
            <Checkbox
              id={String(name)}
              checked={field.value}
              disabled={disabled}
              onCheckedChange={field.onChange}
            />

            <Label htmlFor={String(name)}>{label}</Label>
          </div>

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
