import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;

  name: FieldPath<T>;

  label: string;

  placeholder?: string;

  type?: React.HTMLInputTypeAttribute;

  disabled?: boolean;

  className?: string;
}

export default function FormInput<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
  disabled = false,
  className,
}: FormInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <Label htmlFor={name}>{label}</Label>

          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
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
