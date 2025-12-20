import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardSkeleton() {
  // Simulate 2-3 divisions with varying participant counts
  const divisions = [
    { rows: 5 },
    { rows: 7 },
    { rows: 4 }
  ];

  // Simulate 5 events
  const eventCount = 5;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="w-[60px] p-4"></th>
              <th className="min-w-[180px] text-left p-4">
                <Skeleton className="h-4 w-24" />
              </th>
              {Array.from({ length: eventCount }).map((_, i) => (
                <th key={i} className="text-center p-4">
                  <Skeleton className="h-3 w-16 mx-auto" />
                </th>
              ))}
              <th className="text-right p-4 pr-6">
                <Skeleton className="h-4 w-12 ml-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {divisions.map((division, divIdx) => (
              <React.Fragment key={divIdx}>
                {/* Division Header */}
                <tr className="border-b">
                  <td colSpan={eventCount + 3} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </td>
                </tr>

                {/* Participant Rows */}
                {Array.from({ length: division.rows }).map((_, rowIdx) => (
                  <tr key={rowIdx} className="border-b last:border-0">
                    <td className="text-center p-4">
                      <Skeleton className="h-4 w-4 mx-auto" />
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </td>
                    {Array.from({ length: eventCount }).map((_, scoreIdx) => (
                      <td key={scoreIdx} className="text-center p-4">
                        <Skeleton className="h-4 w-8 mx-auto" />
                      </td>
                    ))}
                    <td className="text-right p-4">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-3.5 w-3.5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
