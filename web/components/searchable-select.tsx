"use client";

import { Combobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";

interface SearchableSelectProps {
  items: string[];
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * A single-select dropdown you can type into to filter — instead of scrolling
 * a long native <select>. Wraps Base UI's Combobox and matches the app's
 * Input / Select styling.
 */
export function SearchableSelect({
  items,
  value,
  onValueChange,
  id,
  name,
  placeholder = "Search…",
  emptyText = "No matches found",
  disabled,
  required,
}: SearchableSelectProps) {
  return (
    <Combobox.Root
      items={items}
      value={value || null}
      onValueChange={(v) => onValueChange((v as string) ?? "")}
      disabled={disabled}
      name={name}
      required={required}
    >
      <Combobox.InputGroup className="relative">
        <Combobox.Input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border border-input bg-transparent pl-3 pr-16 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
        />
        <div className="absolute inset-y-0 right-1.5 flex items-center gap-0.5 text-muted-foreground">
          {value && (
            <Combobox.Clear
              aria-label="Clear selection"
              className="grid size-7 place-items-center rounded-md transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </Combobox.Clear>
          )}
          <Combobox.Trigger
            aria-label="Open list"
            className="grid size-7 place-items-center rounded-md transition-colors hover:text-foreground"
          >
            <ChevronDown className="size-4" />
          </Combobox.Trigger>
        </div>
      </Combobox.InputGroup>

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="isolate z-50">
          <Combobox.Popup className="max-h-[min(20rem,var(--available-height))] w-(--anchor-width) origin-(--transform-origin) overflow-y-auto overscroll-contain rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Combobox.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </Combobox.Empty>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item
                  key={item}
                  value={item}
                  className="relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="truncate">{item}</span>
                  <Combobox.ItemIndicator className="absolute right-2 flex items-center">
                    <Check className="size-4" />
                  </Combobox.ItemIndicator>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
