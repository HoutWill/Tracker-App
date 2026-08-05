export interface CambodiaHoliday {
  dateStr: string; // YYYY-MM-DD
  nameEn: string;
  isNational: boolean;
  isCulturalSeason?: boolean;
}

export interface DateDetails {
  dayOfWeekEn: string;
  formattedDateEn: string;
  holiday?: CambodiaHoliday;
  culturalEvent?: string;
  isWeekend: boolean;
  isBuddhaDay: boolean;
  buddhaDayName?: string;
  isImportantDay: boolean;
}

const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Official Public National Holidays of Kingdom of Cambodia (Days Off)
const CAMBODIA_NATIONAL_HOLIDAYS: CambodiaHoliday[] = [
  { dateStr: '2026-01-01', nameEn: "International New Year's Day", isNational: true },
  { dateStr: '2026-01-07', nameEn: 'Victory over Genocide Day', isNational: true },
  { dateStr: '2026-03-08', nameEn: "International Women's Day", isNational: true },
  { dateStr: '2026-04-13', nameEn: 'Khmer New Year (Moha Sangkranta)', isNational: true },
  { dateStr: '2026-04-14', nameEn: 'Khmer New Year (Virak Wanabat)', isNational: true },
  { dateStr: '2026-04-15', nameEn: 'Khmer New Year (Virak Loeung Sak)', isNational: true },
  { dateStr: '2026-04-16', nameEn: 'Khmer New Year (Day 4)', isNational: true },
  { dateStr: '2026-05-01', nameEn: 'International Labour Day', isNational: true },
  { dateStr: '2026-05-14', nameEn: "King Norodom Sihamoni's Birthday", isNational: true },
  { dateStr: '2026-05-22', nameEn: 'Visak Bochea Day', isNational: true },
  { dateStr: '2026-05-26', nameEn: 'Royal Plowing Ceremony Day', isNational: true },
  { dateStr: '2026-06-18', nameEn: "Queen Mother's Birthday", isNational: true },
  { dateStr: '2026-09-24', nameEn: 'Constitutional Day', isNational: true },
  { dateStr: '2026-10-01', nameEn: 'Ben 15 - Pchum Ben Day', isNational: true },
  { dateStr: '2026-10-02', nameEn: 'Pchum Ben Holiday', isNational: true },
  { dateStr: '2026-10-03', nameEn: 'Pchum Ben Holiday', isNational: true },
  { dateStr: '2026-10-15', nameEn: 'Commemoration Day of King-Father', isNational: true },
  { dateStr: '2026-10-29', nameEn: "King's Coronation Day", isNational: true },
  { dateStr: '2026-11-09', nameEn: 'Independence Day', isNational: true },
  { dateStr: '2026-11-23', nameEn: 'Water Festival (Boat Racing)', isNational: true },
  { dateStr: '2026-11-24', nameEn: 'Water Festival (Loy Pratip)', isNational: true },
  { dateStr: '2026-11-25', nameEn: 'Water Festival (Ok Ambok)', isNational: true },
];

// Pchum Ben 15-Day Season (Kan Ben 1 to Kan Ben 14)
const KAN_BEN_SEASON_2026: Record<string, string> = {
  '2026-09-17': 'Kan Ben 1',
  '2026-09-18': 'Kan Ben 2',
  '2026-09-19': 'Kan Ben 3',
  '2026-09-20': 'Kan Ben 4',
  '2026-09-21': 'Kan Ben 5',
  '2026-09-22': 'Kan Ben 6',
  '2026-09-23': 'Kan Ben 7',
  '2026-09-24': 'Kan Ben 8',
  '2026-09-25': 'Kan Ben 9',
  '2026-09-26': 'Kan Ben 10',
  '2026-09-27': 'Kan Ben 11',
  '2026-09-28': 'Kan Ben 12',
  '2026-09-29': 'Kan Ben 13',
  '2026-09-30': 'Kan Ben 14',
  '2026-10-01': 'Ben 15 (Pchum Ben Day)',
};

// Exact Cambodian Chhankitek Buddhist Holy Days (Uposatha - 4 per month)
const EXACT_2026_BUDDHA_DAYS: Record<string, string> = {
  // January 2026
  '2026-01-06': 'Buddhist Holy Day (Waning 8th)',
  '2026-01-13': 'Buddhist Holy Day (New Moon)',
  '2026-01-21': 'Buddhist Holy Day (Waxing 8th)',
  '2026-01-28': 'Buddhist Holy Day (Full Moon)',
  // February 2026
  '2026-02-05': 'Buddhist Holy Day (Waning 8th)',
  '2026-02-12': 'Buddhist Holy Day (New Moon)',
  '2026-02-20': 'Buddhist Holy Day (Waxing 8th)',
  '2026-02-27': 'Buddhist Holy Day (Full Moon)',
  // March 2026
  '2026-03-07': 'Buddhist Holy Day (Waning 8th)',
  '2026-03-14': 'Buddhist Holy Day (New Moon)',
  '2026-03-22': 'Buddhist Holy Day (Waxing 8th)',
  '2026-03-29': 'Buddhist Holy Day (Full Moon)',
  // April 2026
  '2026-04-05': 'Buddhist Holy Day (Waning 8th)',
  '2026-04-12': 'Buddhist Holy Day (New Moon)',
  '2026-04-20': 'Buddhist Holy Day (Waxing 8th)',
  '2026-04-27': 'Buddhist Holy Day (Full Moon)',
  // May 2026
  '2026-05-05': 'Buddhist Holy Day (Waning 8th)',
  '2026-05-12': 'Buddhist Holy Day (New Moon)',
  '2026-05-20': 'Buddhist Holy Day (Waxing 8th)',
  '2026-05-27': 'Buddhist Holy Day (Full Moon)',
  // June 2026
  '2026-06-04': 'Buddhist Holy Day (Waning 8th)',
  '2026-06-11': 'Buddhist Holy Day (New Moon)',
  '2026-06-19': 'Buddhist Holy Day (Waxing 8th)',
  '2026-06-26': 'Buddhist Holy Day (Full Moon)',
  // July 2026
  '2026-07-04': 'Buddhist Holy Day (Waning 8th)',
  '2026-07-11': 'Buddhist Holy Day (New Moon)',
  '2026-07-19': 'Buddhist Holy Day (Waxing 8th)',
  '2026-07-26': 'Buddhist Holy Day (Full Moon)',
  // August 2026 (User Confirmed Exact Dates: 6, 13, 21, 28)
  '2026-08-06': 'Buddhist Holy Day (Waning 8th)',
  '2026-08-13': 'Buddhist Holy Day (New Moon)',
  '2026-08-21': 'Buddhist Holy Day (Waxing 8th)',
  '2026-08-28': 'Buddhist Holy Day (Full Moon)',
  // September 2026
  '2026-09-04': 'Buddhist Holy Day (Waning 8th)',
  '2026-09-11': 'Buddhist Holy Day (New Moon)',
  '2026-09-19': 'Buddhist Holy Day (Waxing 8th)',
  '2026-09-26': 'Buddhist Holy Day (Full Moon)',
  // October 2026
  '2026-10-04': 'Buddhist Holy Day (Waning 8th)',
  '2026-10-11': 'Buddhist Holy Day (New Moon)',
  '2026-10-19': 'Buddhist Holy Day (Waxing 8th)',
  '2026-10-26': 'Buddhist Holy Day (Full Moon)',
  // November 2026
  '2026-11-03': 'Buddhist Holy Day (Waning 8th)',
  '2026-11-10': 'Buddhist Holy Day (New Moon)',
  '2026-11-18': 'Buddhist Holy Day (Waxing 8th)',
  '2026-11-25': 'Buddhist Holy Day (Full Moon)',
  // December 2026
  '2026-12-03': 'Buddhist Holy Day (Waning 8th)',
  '2026-12-10': 'Buddhist Holy Day (New Moon)',
  '2026-12-18': 'Buddhist Holy Day (Waxing 8th)',
  '2026-12-25': 'Buddhist Holy Day (Full Moon)',
};

export const getDateDetails = (dateStr: string): DateDetails => {
  const d = new Date(dateStr + 'T00:00:00');
  const dayIndex = d.getDay();
  const dayOfWeekEn = DAYS_OF_WEEK[dayIndex];
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  const monthEn = MONTH_NAMES[d.getMonth()];
  const formattedDateEn = `${dayOfWeekEn}, ${monthEn} ${d.getDate()}, ${d.getFullYear()}`;

  const holiday = CAMBODIA_NATIONAL_HOLIDAYS.find(h => h.dateStr === dateStr);
  const culturalEvent = KAN_BEN_SEASON_2026[dateStr] || '';

  // Strict Lookup for exact Chhankitek Buddhist Holy Days (4 per month)
  const buddhaDayName = EXACT_2026_BUDDHA_DAYS[dateStr] || '';
  const isBuddhaDay = !!buddhaDayName;
  const isImportantDay = !!holiday || isBuddhaDay || !!culturalEvent;

  return {
    dayOfWeekEn,
    formattedDateEn,
    holiday,
    culturalEvent,
    isWeekend,
    isBuddhaDay,
    buddhaDayName,
    isImportantDay,
  };
};
