"use client";

import React, { useState, useMemo } from "react";
import { 
  eachDayOfInterval, 
  format, 
  startOfYear, 
  endOfYear, 
  getDay, 
  getYear, 
  parseISO, 
  isSameDay, 
  startOfWeek, 
  endOfWeek
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

type ChallengeData = {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
};

interface ContributionGraphProps {
  challenges: ChallengeData[];
}

export function ContributionGraph({ challenges }: ContributionGraphProps) {
  // Determine available years from data
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    const currentYear = new Date().getFullYear();
    years.add(currentYear); // Always include current year
    
    challenges.forEach(c => {
      if (c.created_at) years.add(getYear(parseISO(c.created_at)));
      if (c.updated_at) years.add(getYear(parseISO(c.updated_at)));
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [challenges]);

  const [selectedYear, setSelectedYear] = useState<number | "last_year">("last_year");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateType, setDateType] = useState<"created_at" | "updated_at">("created_at");

  // Force 'created_at' if status is 'in_progress' because in_progress has no submit date
  const activeDateType = selectedStatus === "in_progress" ? "created_at" : dateType;

  // Filter data
  const filteredData = useMemo(() => {
    return challenges.filter(c => {
      // Status filter
      if (selectedStatus !== "all" && c.status !== selectedStatus) return false;
      
      // Date filter
      const targetDateStr = activeDateType === "created_at" ? c.created_at : c.updated_at;
      if (!targetDateStr) return false;
      
      const itemDate = parseISO(targetDateStr);
      
      if (selectedYear === "last_year") {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        oneYearAgo.setHours(0, 0, 0, 0);
        today.setHours(23, 59, 59, 999);
        return itemDate >= oneYearAgo && itemDate <= today;
      } else {
        return getYear(itemDate) === selectedYear;
      }
    });
  }, [challenges, selectedStatus, activeDateType, selectedYear]);

  // Aggregate counts by date string (yyyy-MM-dd)
  const countsByDate = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(c => {
      const targetDateStr = activeDateType === "created_at" ? c.created_at : c.updated_at;
      if (targetDateStr) {
        const dateKey = format(parseISO(targetDateStr), "yyyy-MM-dd");
        counts[dateKey] = (counts[dateKey] || 0) + 1;
      }
    });
    return counts;
  }, [filteredData, activeDateType]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    if (selectedYear === "last_year") {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      startDate = startOfWeek(oneYearAgo, { weekStartsOn: 0 });
      endDate = endOfWeek(today, { weekStartsOn: 0 });
    } else {
      const firstDayOfYear = startOfYear(new Date(selectedYear, 0, 1));
      const lastDayOfYear = endOfYear(new Date(selectedYear, 0, 1));
      
      startDate = startOfWeek(firstDayOfYear, { weekStartsOn: 0 });
      endDate = endOfWeek(lastDayOfYear, { weekStartsOn: 0 });
    }

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [selectedYear]);

  // Organize into weeks (columns)
  const weeks = useMemo(() => {
    const weeksArr: Date[][] = [];
    let currentWeek: Date[] = [];
    
    calendarDays.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    });
    return weeksArr;
  }, [calendarDays]);

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800";
    if (count === 1) return "bg-green-300 dark:bg-green-900";
    if (count === 2) return "bg-green-400 dark:bg-green-700";
    if (count === 3) return "bg-green-500 dark:bg-green-500";
    return "bg-green-600 dark:bg-green-400"; // 4 or more
  };

  const totalContributions = filteredData.length;

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          {totalContributions} contributions
        </CardTitle>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={(v) => v && setSelectedStatus(v)}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="All Statuses">
                {{
                  all: "All Statuses",
                  in_progress: "In Progress",
                  submitted: "Submitted",
                  approved: "Approved",
                  rejected: "Rejected"
                }[selectedStatus] || "All Statuses"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Type Toggle (Hide if In Progress) */}
          {selectedStatus !== "in_progress" && (
            <div className="flex bg-muted p-1 rounded-md">
              <button 
                onClick={() => setDateType("created_at")}
                className={`px-3 py-1 text-xs rounded-sm transition-colors ${activeDateType === "created_at" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                Claimed
              </button>
              <button 
                onClick={() => setDateType("updated_at")}
                className={`px-3 py-1 text-xs rounded-sm transition-colors ${activeDateType === "updated_at" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"}`}
              >
                Submitted
              </button>
            </div>
          )}

          {/* Year Filter */}
          <Select value={selectedYear.toString()} onValueChange={(v) => v && setSelectedYear(v === "last_year" ? "last_year" : parseInt(v))}>
            <SelectTrigger className="w-[110px] h-9">
              <SelectValue placeholder="Year">
                {selectedYear === "last_year" ? "Past Year" : selectedYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_year">Past Year</SelectItem>
              {availableYears.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="w-full flex items-end pt-5 pb-4">
          {/* Day Labels (Sun, Mon, Tue...) */}
          <div className="flex flex-col justify-between pr-2 text-xs text-muted-foreground h-full" style={{ height: "calc(100% - 1.25rem)" }}>
            <div className="h-3 leading-3 flex items-center">Sun</div>
            <div className="h-3 leading-3 opacity-0">Mon</div>
            <div className="h-3 leading-3 flex items-center">Tue</div>
            <div className="h-3 leading-3 opacity-0">Wed</div>
            <div className="h-3 leading-3 flex items-center">Thu</div>
            <div className="h-3 leading-3 opacity-0">Fri</div>
            <div className="h-3 leading-3 flex items-center">Sat</div>
          </div>

          {/* Grid Container */}
          <div className="flex-1 min-w-0">
            <div 
              className="grid w-full"
              style={{ 
                gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                gap: "max(1px, 0.2vw)"
              }}
            >
              {weeks.map((week, weekIndex) => {
                // Determine if this week starts a new month based on the end of the week 
                // (prevents 'Dec' and 'Jan' overlapping when a year starts mid-week)
                const currentMonthDate = week[week.length - 1];
                const currentMonth = currentMonthDate.getMonth();
                const prevMonthDate = weekIndex > 0 ? weeks[weekIndex - 1][weeks[weekIndex - 1].length - 1] : null;
                const prevMonth = prevMonthDate ? prevMonthDate.getMonth() : -1;
                
                const isNewMonth = weekIndex === 0 || currentMonth !== prevMonth;
                // Hide month label if it's too close to the right edge (last 4 weeks) to prevent cutting off
                const showMonthLabel = isNewMonth && weekIndex < weeks.length - 4;
                
                return (
                  <div key={weekIndex} className="relative flex flex-col w-full" style={{ gap: "max(1px, 0.2vw)" }}>
                    {/* Month Label */}
                    <div className="h-5 relative w-full">
                      {showMonthLabel && (
                        <span className="absolute left-0 bottom-1 text-xs text-muted-foreground whitespace-nowrap">
                          {format(currentMonthDate, 'MMM')}
                        </span>
                      )}
                    </div>
                    
                    {/* Days */}
                    {week.map((day, dayIndex) => {
                      const dateKey = format(day, "yyyy-MM-dd");
                      const count = countsByDate[dateKey] || 0;
                      
                      // Fade out days that don't belong to the selected range
                      let isOutsideRange = false;
                      if (selectedYear === "last_year") {
                        const today = new Date();
                        const oneYearAgo = new Date();
                        oneYearAgo.setFullYear(today.getFullYear() - 1);
                        oneYearAgo.setHours(0, 0, 0, 0);
                        today.setHours(23, 59, 59, 999);
                        isOutsideRange = day < oneYearAgo || day > today;
                      } else {
                        isOutsideRange = day.getFullYear() !== selectedYear;
                      }
                      
                      return (
                        <div
                          key={dayIndex}
                          title={`${count} contributions on ${format(day, 'MMM d, yyyy')}`}
                          className={`aspect-square w-full rounded-[1px] sm:rounded-sm transition-colors ${getColorClass(count)} ${isOutsideRange ? 'opacity-20' : 'opacity-100 hover:ring-1 hover:ring-ring'}`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
          <div></div>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div title="0 contributions" className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
            <div title="1 contribution" className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-900" />
            <div title="2 contributions" className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div title="3 contributions" className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" />
            <div title="4 or more contributions" className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-400" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
