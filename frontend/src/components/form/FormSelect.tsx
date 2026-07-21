import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;

  options: Option[];

  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function FormSelect<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  disabled = false,
  className,
}: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <Label htmlFor={String(name)}>{label}</Label>

          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={String(name)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
