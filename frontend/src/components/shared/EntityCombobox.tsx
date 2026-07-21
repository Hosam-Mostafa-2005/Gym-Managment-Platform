import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EntityComboboxProps<T> {
  items: T[];

  value?: string;

  onChange: (value: string) => void;

  getValue: (item: T) => string;

  getLabel: (item: T) => string;

  placeholder?: string;

  searchPlaceholder?: string;

  emptyMessage?: string;

  disabled?: boolean;

  className?: string;

  renderItem?: (item: T) => React.ReactNode;
}

export function EntityCombobox<T>({
  items,
  value,
  onChange,
  getValue,
  getLabel,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  disabled = false,
  className,
  renderItem,
}: EntityComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  const selectedItem = items.find((item) => getValue(item) === value);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className="truncate">
            {selectedItem ? getLabel(selectedItem) : placeholder}
          </span>

          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />

          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            <CommandGroup>
              {items.map((item) => {
                const itemValue = getValue(item);

                return (
                  <CommandItem
                    key={itemValue}
                    value={getLabel(item)}
                    onSelect={() => handleSelect(itemValue)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === itemValue ? "opacity-100" : "opacity-0",
                      )}
                    />

                    {renderItem ? renderItem(item) : getLabel(item)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
