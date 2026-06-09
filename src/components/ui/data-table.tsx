"use client";

import * as React from "react";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, SlidersHorizontal, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Table, THead, TBody, TR, TH, TD } from "./table";
import { EmptyState } from "./feedback";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  mono?: boolean;
  sortable?: boolean;
  /** value extractor for sorting/searching when not a plain key */
  accessor?: (row: T) => string | number;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  /** SRS §7.1 list endpoints support page/page_size/sort/filter — represented here client-side */
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
  toolbar?: React.ReactNode;
  filters?: React.ReactNode;
  emptyLabel?: string;
  dense?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search…",
  pageSize = 12,
  onRowClick,
  rowKey,
  toolbar,
  filters,
  emptyLabel = "No records found",
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = React.useState(1);

  const valueOf = (row: T, col: Column<T>) =>
    col.accessor ? col.accessor(row) : row[col.key];

  const filtered = React.useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((c) => {
        const v = valueOf(row, c);
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [data, query, columns]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = valueOf(a, col);
      const bv = valueOf(b, col);
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);

  React.useEffect(() => setPage(1), [query, sort]);

  const toggleSort = (key: string) =>
    setSort((s) =>
      s?.key === key
        ? s.dir === "asc"
          ? { key, dir: "desc" }
          : null
        : { key, dir: "asc" }
    );

  return (
    <div className="flex flex-col">
      {(searchable || toolbar || filters) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            {searchable && (
              <Input
                icon={Search}
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            {filters}
            {filters === undefined && (
              <Button variant="outline" size="sm" icon={SlidersHorizontal}>
                Filters
              </Button>
            )}
            <Button variant="outline" size="sm" icon={Download}>
              Export
            </Button>
            {toolbar}
          </div>
        </div>
      )}

      {pageRows.length === 0 ? (
        <EmptyState title={emptyLabel} className="py-16" />
      ) : (
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              {columns.map((col) => (
                <TH key={col.key} align={col.align} style={{ width: col.width }}>
                  {col.sortable !== false ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      {col.header}
                      {sort?.key === col.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="opacity-30" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TH>
              ))}
            </TR>
          </THead>
          <TBody>
            {pageRows.map((row, i) => (
              <TR
                key={rowKey ? rowKey(row) : i}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <TD
                    key={col.key}
                    align={col.align}
                    mono={col.mono}
                    className={col.className}
                  >
                    {col.cell ? col.cell(row) : String(row[col.key] ?? "—")}
                  </TD>
                ))}
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border text-xs text-muted-foreground">
        <span>
          Showing{" "}
          <span className="font-medium text-foreground tnum">
            {pageRows.length === 0 ? 0 : (current - 1) * pageSize + 1}–
            {(current - 1) * pageSize + pageRows.length}
          </span>{" "}
          of <span className="font-medium text-foreground tnum">{sorted.length}</span>
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={current <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={15} />
          </Button>
          <span className="px-2 tnum">
            Page {current} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            disabled={current >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </div>
    </div>
  );
}
