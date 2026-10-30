import type {
  UseFormRegister,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  FieldValues,
  ArrayPath,
  Path,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface DynamicInputListProps<T extends FieldValues> {
  title: string;
  description?: string;
  fields: FieldArrayWithId<T, ArrayPath<T>, "id">[];
  register: UseFormRegister<T>;
  name: ArrayPath<T>;
  append: UseFieldArrayAppend<T, ArrayPath<T>>;
  remove: UseFieldArrayRemove;
  error?: string;
  addButtonLabel?: string;
  placeholder?: string;
}

const DynamicInputList = <T extends FieldValues>({
  title,
  description,
  fields,
  register,
  name,
  append,
  remove,
  error,
  addButtonLabel,
  placeholder,
}: DynamicInputListProps<T>) => {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ value: "" } as unknown as Parameters<typeof append>[0])
          }
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>{addButtonLabel || `Add ${title.slice(0, -1)}`}</span>
        </Button>
      </div>

      <div className="space-y-3 pt-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
              {index + 1}
            </span>

            <Input
              placeholder={
                placeholder || `Enter ${title.toLowerCase()} step...`
              }
              {...register(`${name}.${index}.value` as Path<T>)}
              className="bg-background"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length === 1 && index === 0}
              className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-destructive">{error}</p>
      )}
    </div>
  );
};

export default DynamicInputList;
