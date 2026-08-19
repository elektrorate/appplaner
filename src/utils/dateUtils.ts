export const DAYS_SPANISH_SHORT = ['D', 'L', 'M', 'Mi', 'J', 'V', 'S'];
export const DAYS_SPANISH_FULL = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
export const MONTHS_SPANISH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
export const MONTHS_SPANISH_FULL = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

export function getTodayString(): string {
  const d = new Date();
  return formatToYYYYMMDD(d);
}

export function formatToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseYYYYMMDD(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(dateStr: string, days: number): string {
  const d = parseYYYYMMDD(dateStr);
  d.setDate(d.getDate() + days);
  return formatToYYYYMMDD(d);
}

export function getNextWeekend(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 6 is Saturday
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  return formatToYYYYMMDD(d);
}

export function getNextMonday(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday
  const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilMonday);
  return formatToYYYYMMDD(d);
}

export function formatHeaderDate(dateStr: string): string {
  if (!dateStr) return 'Sin fecha';
  const date = parseYYYYMMDD(dateStr);
  const today = getTodayString();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  const monthShort = MONTHS_SPANISH_SHORT[date.getMonth()];
  const capitalizedMonth = monthShort.charAt(0).toUpperCase() + monthShort.slice(1);
  const dayNum = date.getDate();
  const dayName = DAYS_SPANISH_FULL[date.getDay()];

  if (dateStr === today) {
    return `${capitalizedMonth} ${dayNum} · Hoy · ${dayName}`;
  } else if (dateStr === tomorrow) {
    return `${capitalizedMonth} ${dayNum} · Mañana · ${dayName}`;
  } else if (dateStr === yesterday) {
    return `${capitalizedMonth} ${dayNum} · Ayer · ${dayName}`;
  }

  return `${capitalizedMonth} ${dayNum} · ${dayName}`;
}

export function formatFriendlyDate(dateStr: string): { label: string; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } {
  if (!dateStr) return { label: 'Sin fecha', isOverdue: false, isToday: false, isTomorrow: false };
  const today = getTodayString();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  const date = parseYYYYMMDD(dateStr);
  const monthShort = MONTHS_SPANISH_SHORT[date.getMonth()];
  const dayNum = date.getDate();

  if (dateStr < today) {
    return {
      label: dateStr === yesterday ? 'Ayer' : `${dayNum} ${monthShort}`,
      isOverdue: true,
      isToday: false,
      isTomorrow: false,
    };
  }

  if (dateStr === today) {
    return { label: 'Hoy', isOverdue: false, isToday: true, isTomorrow: false };
  }

  if (dateStr === tomorrow) {
    return { label: 'Mañana', isOverdue: false, isToday: false, isTomorrow: true };
  }

  return { label: `${dayNum} ${monthShort}`, isOverdue: false, isToday: false, isTomorrow: false };
}

export function getMonthDays(year: number, month: number) {
  // month: 0-11
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0 for Sun

  const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
    days.push({
      dateStr: formatToYYYYMMDD(prevDate),
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(year, month, i);
    days.push({
      dateStr: formatToYYYYMMDD(currDate),
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill grid
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextDate = new Date(year, month + 1, i);
    days.push({
      dateStr: formatToYYYYMMDD(nextDate),
      dayNumber: i,
      isCurrentMonth: false,
    });
  }

  return days;
}
