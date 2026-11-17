export interface ActivePeriodKey {
  year: number;
  semester: 1 | 2;
}

/**
 * Southern academic year: semester 1 = Mar-Jul, semester 2 = Aug-Dec.
 * January-February fall back to the previous year's semester 2.
 */
export function getActivePeriodKey(now: Date = new Date()): ActivePeriodKey {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const semester: 1 | 2 = currentMonth >= 3 && currentMonth <= 7 ? 1 : 2;
  const year = semester === 1 || currentMonth >= 8 ? currentYear : currentYear - 1;

  return { year, semester };
}