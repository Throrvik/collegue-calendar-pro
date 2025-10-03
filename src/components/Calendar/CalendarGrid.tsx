import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getWeek,
  isSameDay,
  isSameMonth,
  isToday,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { nb } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Grid3X3, Plus } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarAssignment, useCalendarData } from "@/hooks/useCalendarData";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTH_LABELS = [
  "Januar",
  "Februar",
  "Mars",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Desember",
];

type DayCellOptions = {
  compact?: boolean;
  contextMonth: number;
  contextYear: number;
};

const toISODate = (date: Date) => format(date, "yyyy-MM-dd");

const buildMonthMatrix = (targetYear: number, targetMonth: number) => {
  const start = startOfWeek(startOfMonth(new Date(targetYear, targetMonth, 1)), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(new Date(targetYear, targetMonth, 1)), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
};

const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "year">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isMobile = useIsMobile();

  const {
    assignmentsByDate,
    getAssignmentsForDate,
    addCustomShift,
    removeCustomShift,
    ensureYearLoaded,
    specialDates,
  } = useCalendarData();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    ensureYearLoaded(year);
    ensureYearLoaded(year - 1);
    ensureYearLoaded(year + 1);
  }, [ensureYearLoaded, year]);

  const monthMatrix = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const yearMatrix = useMemo(
    () => MONTH_LABELS.map((_, monthIndex) => buildMonthMatrix(year, monthIndex)),
    [year]
  );

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCloseDetails = (open: boolean) => {
    if (!open) {
      setSelectedDate(null);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setView("month");
  };

  const goToPrevious = () => {
    setCurrentDate((prev) => {
      if (view === "year") {
        return new Date(prev.getFullYear() - 1, prev.getMonth(), 1);
      }
      return addMonths(prev, -1);
    });
  };

  const goToNext = () => {
    setCurrentDate((prev) => {
      if (view === "year") {
        return new Date(prev.getFullYear() + 1, prev.getMonth(), 1);
      }
      return addMonths(prev, 1);
    });
  };

  const renderDayCell = (date: Date, options: DayCellOptions) => {
    const { compact = false, contextMonth, contextYear } = options;
    const isoDate = toISODate(date);
    const contextDate = new Date(contextYear, contextMonth, 1);
    const isInContextMonth = isSameMonth(date, contextDate);
    const visibleAssignments = getAssignmentsForDate(isoDate);
    const allAssignments = assignmentsByDate[isoDate] ?? [];
    const hiddenCount = Math.max(allAssignments.length - visibleAssignments.length, 0);
    const specialDay = specialDates[isoDate];
    const hasDeviation = allAssignments.some((assignment) => assignment.deviation);
    const selected = selectedDate ? isSameDay(date, selectedDate) : false;
    const dayLabel = format(date, "d");
    const baseClasses = cn(
      "relative rounded-lg border bg-card text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80",
      compact ? "min-h-[64px] p-1.5" : "min-h-[96px] p-2",
      !isInContextMonth && "bg-muted/30 text-muted-foreground/70",
      isWeekend(date) && "bg-muted/50",
      hasDeviation && "border-destructive",
      isToday(date) && "border-2 border-primary shadow-sm",
      selected && "ring-2 ring-primary"
    );

    return (
      <button
        key={isoDate}
        type="button"
        className={baseClasses}
        onClick={() => handleDaySelect(date)}
        aria-label={`${format(date, "EEEE d. MMMM yyyy", { locale: nb })}`}
      >
        <div className={cn("flex items-center justify-between", compact ? "text-xs" : "text-sm font-medium")}>
          <span>{dayLabel}</span>
          {isToday(date) && (
            <span className="rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary">
              I dag
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {visibleAssignments.slice(0, compact ? 3 : 4).map((assignment) => (
            <span
              key={assignment.id}
              className={cn("relative h-2.5 w-2.5 rounded-full", assignment.colorClass)}
            >
              {assignment.deviation && (
                <span className="absolute inset-0 rounded-full border border-destructive" />
              )}
            </span>
          ))}
          {hiddenCount > 0 && (
            <span className="text-[10px] font-semibold text-muted-foreground">+{hiddenCount}</span>
          )}
        </div>
        {!compact && specialDay && (
          <div
            className={cn(
              "mt-2 text-[10px] font-medium",
              specialDay.type === "holiday" ? "text-destructive" : "text-primary"
            )}
          >
            {specialDay.label}
          </div>
        )}
      </button>
    );
  };

  const selectedIsoDate = selectedDate ? toISODate(selectedDate) : null;
  const allAssignmentsForDay = selectedIsoDate
    ? getAssignmentsForDate(selectedIsoDate, { includeUnselected: true })
    : [];
  const visibleAssignmentsForDay = selectedIsoDate ? getAssignmentsForDate(selectedIsoDate) : [];
  const visibleAssignmentIds = new Set(visibleAssignmentsForDay.map((assignment) => assignment.id));
  const hiddenAssignments = allAssignmentsForDay.filter(
    (assignment) => !visibleAssignmentIds.has(assignment.id)
  );
  const customAssignmentsForDay = allAssignmentsForDay.filter((assignment) => assignment.source === "custom");

  const sortedAssignments = [...allAssignmentsForDay].sort((a, b) => {
    if (a.isOwn !== b.isOwn) {
      return a.isOwn ? -1 : 1;
    }
    if (a.isCloseColleague !== b.isCloseColleague) {
      return a.isCloseColleague ? -1 : 1;
    }
    return a.colleague.firstName.localeCompare(b.colleague.firstName, "nb");
  });

  const detailTitle = selectedDate
    ? `${format(selectedDate, "EEEE", { locale: nb })} ${format(selectedDate, "d. MMMM yyyy", { locale: nb })}`
    : "Ingen dag valgt";
  const detailWeekNumber = selectedDate ? getWeek(selectedDate, { weekStartsOn: 1 }) : null;
  const detailSpecialDay = selectedIsoDate ? specialDates[selectedIsoDate] : undefined;

  const handleAddCustomShift = () => {
    if (!selectedDate) return;
    const isoDate = toISODate(selectedDate);
    const suffix = customAssignmentsForDay.length + 1;
    const label = customAssignmentsForDay.length
      ? `Egendefinert turnus #${suffix}`
      : `Egendefinert turnus ${format(selectedDate, "d. MMM", { locale: nb })}`;

    addCustomShift({
      date: isoDate,
      label,
      shiftType: "custom",
    });
  };

  const detailContent = selectedDate ? (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Uke {detailWeekNumber}</p>
        <h3 className="text-xl font-semibold leading-tight">{detailTitle}</h3>
      </div>
      {detailSpecialDay && (
        <div className="rounded-md bg-muted/60 p-3 text-sm">
          <p className="font-medium">
            {detailSpecialDay.label}
            {detailSpecialDay.type === "holiday" && " · Rød dag"}
          </p>
          {detailSpecialDay.description && (
            <p className="text-muted-foreground">{detailSpecialDay.description}</p>
          )}
        </div>
      )}
      <div className="space-y-3">
        {sortedAssignments.length > 0 ? (
          sortedAssignments.map((assignment: CalendarAssignment) => {
            const isVisible = visibleAssignmentIds.has(assignment.id);
            const deviationSeverity = assignment.deviation?.severity ?? "info";
            const deviationTone =
              deviationSeverity === "critical"
                ? "text-destructive"
                : deviationSeverity === "warning"
                ? "text-amber-600"
                : "text-primary";

            return (
              <div key={assignment.id} className="flex gap-3 rounded-md border border-border/60 p-3">
                <span
                  className={cn("relative mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full", assignment.colorClass)}
                >
                  {assignment.deviation && (
                    <span className="absolute inset-0 rounded-full border border-destructive" />
                  )}
                </span>
                <div className="flex flex-1 flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">
                      {assignment.colleague.firstName}
                      {assignment.isOwn ? " (meg)" : ""}
                    </span>
                    {assignment.isCloseColleague && !assignment.isOwn && (
                      <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                        Nær kollega
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{assignment.pattern}</span>
                  </div>
                  {!isVisible && (
                    <span className="text-xs text-muted-foreground">
                      Skjult i kalendervisning (kollega ikke valgt)
                    </span>
                  )}
                  {assignment.deviation && (
                    <span className={cn("text-xs", deviationTone)}>{assignment.deviation.note}</span>
                  )}
                </div>
                {assignment.source === "custom" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 text-xs"
                    onClick={() => removeCustomShift(assignment.id)}
                  >
                    Fjern
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">Ingen turnuser registrert denne dagen.</p>
        )}
      </div>
      {hiddenAssignments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {hiddenAssignments.length} turnus(er) er skjult fordi kollegaen ikke er valgt i kalenderen.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleAddCustomShift} size="sm" className="gap-2">
          <Plus className="h-4 w-4" /> Legg til egendefinert turnus
        </Button>
        {customAssignmentsForDay.map((assignment) => (
          <Button
            key={assignment.id}
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => removeCustomShift(assignment.id)}
          >
            Fjern «{assignment.label}»
          </Button>
        ))}
      </div>
    </div>
  ) : (
    <p className="text-sm text-muted-foreground">Velg en dag i kalenderen for detaljer.</p>
  );

  return (
    <div className="w-full">
      <Tabs value={view} onValueChange={(v) => setView(v as "month" | "year")} className="w-full">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">
            {view === "month" ? `${MONTH_LABELS[month]} ${year}` : year}
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <TabsList>
              <TabsTrigger value="month" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Måned
              </TabsTrigger>
              <TabsTrigger value="year" className="gap-2">
                <Grid3X3 className="h-4 w-4" />
                År
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                I dag
              </Button>
              <Button variant="outline" size="icon" onClick={goToPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="month" className="mt-0 space-y-2">
          <div className="grid grid-cols-8 gap-2">
            <div className="text-center text-sm font-semibold text-muted-foreground">Uke</div>
            {WEEKDAY_LABELS.map((day, idx) => (
              <div
                key={day}
                className={cn(
                  "text-center text-sm font-semibold text-muted-foreground",
                  idx === 6 && "text-destructive"
                )}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {monthMatrix.map((week, weekIndex) => {
              const weekNumber = getWeek(week[0], { weekStartsOn: 1 });
              return (
                <div key={`week-${weekIndex}`} className="grid grid-cols-8 gap-2">
                  <div className="flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    Uke {weekNumber}
                  </div>
                  {week.map((date) =>
                    renderDayCell(date, { compact: false, contextMonth: month, contextYear: year })
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="year" className="mt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MONTH_LABELS.map((monthLabel, monthIndex) => (
              <Card key={monthLabel} className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{monthLabel}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setCurrentDate(new Date(year, monthIndex, 1));
                      setView("month");
                    }}
                  >
                    Gå til måned
                  </Button>
                </div>
                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAY_LABELS.map((day, idx) => (
                    <div
                      key={`${monthLabel}-${day}`}
                      className={cn(
                        "text-center text-xs font-semibold text-muted-foreground",
                        idx === 6 && "text-destructive"
                      )}
                    >
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {yearMatrix[monthIndex].map((week, weekIndex) => (
                    <div key={`${monthLabel}-week-${weekIndex}`} className="grid grid-cols-7 gap-1">
                      {week.map((date) =>
                        renderDayCell(date, { compact: true, contextMonth: monthIndex, contextYear: year })
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {isMobile ? (
        <Drawer open={!!selectedDate} onOpenChange={handleCloseDetails}>
          <DrawerContent>
            <DrawerHeader className="pb-2">
              <DrawerTitle>{detailTitle}</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4 px-4 pb-6">{detailContent}</div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={!!selectedDate} onOpenChange={handleCloseDetails}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{detailTitle}</DialogTitle>
            </DialogHeader>
            {detailContent}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarGrid;
