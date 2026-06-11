import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function LWTableSkeleton({
  rows = 5,
  columns = 5,
  headers,
  className,
}: {
  rows?: number;
  columns?: number;
  headers?: string[];
  className?: string;
}) {
  const columnCount = headers?.length || columns;

  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {Array.from({ length: columnCount }).map((_, i) => (
              <TableHead key={i}>
                {headers?.[i] ? (
                  <span className="opacity-0">{headers[i]}</span>
                ) : (
                  <Skeleton className="h-4 w-20" />
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {Array.from({ length: columnCount }).map((_, colIdx) => (
                <TableCell key={colIdx}>
                  <Skeleton
                    className={cn(
                      "h-4",
                      colIdx === 0 ? "w-32" : colIdx === columnCount - 1 ? "w-16" : "w-24"
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { LWTableSkeleton };
