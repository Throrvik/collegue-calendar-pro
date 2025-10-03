import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getWeek } from "date-fns";

const WEEKDAYS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const MONTHS = [
  "Januar", "Februar", "Mars", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Desember"
];

const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "year">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const previousYear = () => {
    setCurrentDate(new Date(year - 1, month));
  };

  const nextYear = () => {
    setCurrentDate(new Date(year + 1, month));
  };

  const renderMonthDays = (targetYear: number, targetMonth: number, isCompact: boolean = false) => {
    const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
    const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
    const daysInMonth = lastDayOfMonth.getDate();
    
    const previousMonth = new Date(targetYear, targetMonth, 0);
    const daysInPreviousMonth = previousMonth.getDate();

    const weeks: JSX.Element[][] = [];
    let currentWeek: JSX.Element[] = [];
    
    // Vis dager fra forrige måned
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPreviousMonth - i;
      currentWeek.push(
        <Card
          key={`prev-${day}`}
          className={`${isCompact ? 'p-1 min-h-[60px]' : 'p-2 min-h-[80px]'} bg-muted/30 text-muted-foreground`}
        >
          <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
            {day}
          </div>
        </Card>
      );
    }

    // Vis dager fra gjeldende måned
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetYear, targetMonth, day);
      const today = new Date();
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      currentWeek.push(
        <Card
          key={day}
          className={`${isCompact ? 'p-1 min-h-[60px]' : 'p-2 min-h-[80px]'} hover:shadow-md transition-shadow cursor-pointer ${
            isToday ? "border-primary border-2" : ""
          } ${isWeekend ? "bg-muted/50" : ""}`}
        >
          <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium ${isToday ? "text-primary" : ""}`}>
            {day}
          </div>
        </Card>
      );

      // Når vi har fylt en uke (7 dager), legg den til weeks og start en ny uke
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Legg til siste uke hvis den ikke er komplett
    if (currentWeek.length > 0) {
      // Fyll opp med tomme celler hvis nødvendig
      while (currentWeek.length < 7) {
        const nextMonthDay = currentWeek.length - startingDayOfWeek - daysInMonth + 1;
        currentWeek.push(
          <Card
            key={`next-${nextMonthDay}`}
            className={`${isCompact ? 'p-1 min-h-[60px]' : 'p-2 min-h-[80px]'} bg-muted/30 text-muted-foreground`}
          >
            <div className={`${isCompact ? 'text-xs' : 'text-sm'}`}>
              {nextMonthDay}
            </div>
          </Card>
        );
      }
      weeks.push(currentWeek);
    }

    return weeks;
  };

  const renderYearView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MONTHS.map((monthName, monthIndex) => (
          <Card key={monthIndex} className="p-4">
            <h3 className="text-lg font-semibold mb-3 text-center">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((day, idx) => (
                <div
                  key={day}
                  className={`text-center text-xs font-semibold ${idx === 6 ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {day.charAt(0)}
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {renderMonthDays(year, monthIndex, true).map((week, weekIdx) => (
                <div key={weekIdx} className="grid grid-cols-7 gap-1">
                  {week}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs value={view} onValueChange={(v) => setView(v as "month" | "year")} className="w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold">
            {view === "month" ? `${MONTHS[month]} ${year}` : year}
          </h2>
          
          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger value="month" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                Måned
              </TabsTrigger>
              <TabsTrigger value="year" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                År
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={view === "month" ? previousMonth : previousYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={view === "month" ? nextMonth : nextYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="month" className="mt-0">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {WEEKDAYS.map((day, idx) => (
              <div
                key={day}
                className={`text-center text-sm font-semibold p-2 ${idx === 6 ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {renderMonthDays(year, month).map((week, weekIdx) => {
              const weekNumber = getWeek(new Date(year, month, 1 + weekIdx * 7), { weekStartsOn: 1 });
              return (
                <div key={weekIdx} className="flex gap-2 items-center">
                  <div className="text-xs font-semibold text-muted-foreground w-12 text-right">
                    Uke {weekNumber}
                  </div>
                  <div className="grid grid-cols-7 gap-2 flex-1">
                    {week}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="year" className="mt-0">
          {renderYearView()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarGrid;
