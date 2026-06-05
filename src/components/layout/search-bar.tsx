"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  clearButtonClassName?: string;
  shortcut?: string;
}

export function SearchBar({
  placeholder = "Search...",
  value: controlledValue,
  defaultValue = "",
  onChange,
  debounceMs = 0,
  className,
  inputClassName,
  iconClassName,
  clearButtonClassName,
  shortcut,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const debouncedChange = useCallback(
    (val: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onChange?.(val);
      }, debounceMs);
    },
    [onChange, debounceMs]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (debounceMs > 0) {
      debouncedChange(newValue);
    } else {
      onChange?.(newValue);
    }
  };

  const handleClear = () => {
    setInternalValue("");
    onChange?.("");
  };

  return (
    <div className={cn("relative", className)}>
      <Search
        className={cn(
          "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
          iconClassName
        )}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={cn("h-10 rounded-xl bg-card/70 pl-8 pr-8 shadow-sm", inputClassName)}
      />
      {shortcut && value.length === 0 && (
        <span className="pointer-events-none absolute right-7 top-1/2 hidden -translate-y-1/2 items-center rounded-lg border border-border/40 bg-muted/50 px-2 py-1 text-xs font-semibold text-muted-foreground sm:inline-flex">
          {shortcut}
        </span>
      )}
      {value.length > 0 && (
        <Button
          variant="ghost"
          size="icon-xs"
          className={cn("absolute right-1.5 top-1/2 -translate-y-1/2", clearButtonClassName)}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
