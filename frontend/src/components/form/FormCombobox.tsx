import { Controller } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { EntityCombobox } from "@/components/shared/EntityCombobox";

interface FormComboboxProps<TForm extends FieldValues, TItem> {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label: string;

  items: TItem[];

  getValue: (item: TItem) => string;
  getLabel: (item: TItem) => string;

  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;

  disabled?: boolean;
  className?: string;
}

export default function FormCombobox<TForm extends FieldValues, TItem>({
  control,
  name,
  label,
  items,
  getValue,
  getLabel,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  className,
}: FormComboboxProps<TForm, TItem>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={className}>
          <Label htmlFor={String(name)}>{label}</Label>

          <EntityCombobox
            items={items}
            value={field.value}
            onChange={field.onChange}
            getValue={getValue}
            getLabel={getLabel}
            placeholder={placeholder}
            searchPlaceholder={searchPlaceholder}
            emptyMessage={emptyMessage}
            disabled={disabled}
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
