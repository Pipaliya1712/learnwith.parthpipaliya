"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";
import { DataTablePagination } from "./data-table-pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type ColumnDef<T> = {
  key: string;
  header: string;
  sortable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterOptions?: { label: string; value: string }[];
  cell: (row: T) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  total: number;
  pageSize: number;
  currentPage: number;
}

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function DataTable<T>({
  columns,
  data,
  total,
  pageSize,
  currentPage,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debounced searching
  const [searchValues, setSearchValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    columns.forEach((col) => {
      if (col.searchable || col.filterOptions) {
        initial[col.key] = searchParams.get(`q_${col.key}`) || "";
      }
    });
    return initial;
  });

  const debouncedSearchValues = useDebounce(searchValues, 1500);

  // Apply search when debounced values change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    let hasChanges = false;

    Object.entries(debouncedSearchValues).forEach(([key, val]) => {
      const currentParam = params.get(`q_${key}`) || "";
      if (currentParam !== val) {
        if (val) {
          params.set(`q_${key}`, val);
        } else {
          params.delete(`q_${key}`);
        }
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // Reset to page 1 on new search
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedSearchValues, pathname, router, searchParams]);

  const handleSort = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sort_by");
    const currentDesc = params.get("sort_desc") === "true";

    if (currentSort === key) {
      if (currentDesc) {
        // Toggle to ascending
        params.set("sort_desc", "false");
      } else {
        // Remove sort
        params.delete("sort_by");
        params.delete("sort_desc");
      }
    } else {
      // Set new sort descending
      params.set("sort_by", key);
      params.set("sort_desc", "true");
    }

    params.set("page", "1"); // Reset pagination
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (key: string, value: string) => {
    setSearchValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      <div className="rounded-md border bg-card overflow-auto max-h-[calc(100vh-220px)] relative shadow-sm">
        <Table className="relative w-full">
          <TableHeader className="sticky top-0 z-10 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => {
                const isSorted = searchParams.get("sort_by") === col.key;
                const isDesc = searchParams.get("sort_desc") === "true";

                return (
                  <TableHead key={col.key} className="py-4">
                    <div className="flex flex-col gap-2">
                      <div
                        className={`flex items-center gap-1 font-medium ${
                          col.sortable ? "cursor-pointer select-none hover:text-foreground" : ""
                        }`}
                        onClick={() => col.sortable && handleSort(col.key)}
                      >
                        {col.header}
                        {col.sortable && (
                          <span className="ml-1 text-muted-foreground">
                            {isSorted ? (
                              isDesc ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronUp className="h-4 w-4" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 opacity-50" />
                            )}
                          </span>
                        )}
                      </div>
                      {col.searchable && !col.filterOptions && (
                        <Input
                          placeholder={col.searchPlaceholder || `Search ${col.header}...`}
                          value={searchValues[col.key] || ""}
                          onChange={(e) => handleSearchChange(col.key, e.target.value)}
                          className="h-8 text-xs font-normal"
                        />
                      )}
                      {col.filterOptions && (
                        <Select
                          value={searchValues[col.key] || "all"}
                          onValueChange={(val) => handleSearchChange(col.key, val === "all" || !val ? "" : val)}
                        >
                          <SelectTrigger className="h-8 text-xs font-normal">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {col.filterOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, i) => (
                <TableRow 
                  key={i}
                  className={`transition-colors hover:bg-primary/5 dark:hover:bg-primary/10 ${
                    i % 2 === 0 ? "bg-background" : "bg-muted/30"
                  }`}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3">
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
      />
    </div>
  );
}
