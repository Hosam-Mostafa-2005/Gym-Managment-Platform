import { useEffect, useState } from "react";
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

function InnerNumberInput({
  id,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  hasError,
  min,
  max,
  step,
  name,
  inputRef,
}: {
  id: string;
  value: number | undefined | null;
  onChange: (val: number | undefined) => void;
  onBlur: () => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  min?: number;
  max?: number;
  step?: number;
  name?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  const [localValue, setLocalValue] = useState<string>(() =>
    value !== undefined && value !== null ? String(value) : "",
  );

  useEffect(() => {
    const numericLocal =
      localValue.trim() === "" ? undefined : Number(localValue);
    if (value !== numericLocal) {
      setLocalValue(value !== undefined && value !== null ? String(value) : "");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocalValue(raw);

    if (raw.trim() === "") {
      onChange(undefined);
      return;
    }

    if (!raw.endsWith(".") && !raw.endsWith(",")) {
      const parsed = Number(raw);
      if (!isNaN(parsed)) {
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    if (localValue.trim() === "") {
      onChange(undefined);
    } else {
      const parsed = Number(localValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
        setLocalValue(String(parsed));
      } else {
        onChange(undefined);
        setLocalValue("");
      }
    }
    onBlur();
  };

  return (
    <Input
      id={id}
      type="number"
      inputMode="decimal"
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={hasError}
      min={min}
      max={max}
      step={step}
      value={localValue}
      onBlur={handleBlur}
      onChange={handleChange}
      name={name}
      ref={inputRef}
    />
  );
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
        <div className={`space-y-2 ${className ?? ""}`}>
          <Label htmlFor={String(name)}>{label}</Label>

          <InnerNumberInput
            id={String(name)}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            disabled={disabled}
            hasError={!!fieldState.error}
            min={min}
            max={max}
            step={step}
            name={field.name}
            inputRef={field.ref}
          />

          {fieldState.error && (
            <p className="text-xs font-medium text-[#EF4444]">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
