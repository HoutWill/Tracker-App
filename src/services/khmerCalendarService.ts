export interface CambodiaHoliday {
  dateStr: string; // YYYY-MM-DD
  nameEn: string;
  nameKh?: string;
  isNational: boolean;
  isCulturalSeason?: boolean;
}

export interface WorldDay {
  dateStr: string;
  nameEn: string;
  nameKh: string;
  emoji?: string;
  category: 'LOVE' | 'FAMILY' | 'CULTURE';
}

export interface DateDetails {
  dayOfWeekEn: string;
  formattedDateEn: string;
  holiday?: CambodiaHoliday;
  culturalEvent?: string;
  worldDay?: WorldDay;
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
export const CAMBODIA_NATIONAL_HOLIDAYS: CambodiaHoliday[] = [
  { dateStr: '2026-01-01', nameEn: "International New Year's Day", nameKh: 'ទិវាបុណ្យចូលឆ្នាំសកល', isNational: true },
  { dateStr: '2026-01-07', nameEn: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍', isNational: true },
  { dateStr: '2026-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', isNational: true },
  { dateStr: '2026-04-13', nameEn: 'Khmer New Year (Moha Sangkranta)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2026-04-14', nameEn: 'Khmer New Year (Virak Wanabat)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2026-04-15', nameEn: 'Khmer New Year (Virak Loeung Sak)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2026-04-16', nameEn: 'Khmer New Year (Day 4)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៤)', isNational: true },
  { dateStr: '2026-05-01', nameEn: 'International Labour Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', isNational: true },
  { dateStr: '2026-05-14', nameEn: "King Norodom Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចំរើនព្រះជន្មព្រះករុណា ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី', isNational: true },
  { dateStr: '2026-05-22', nameEn: 'Visak Bochea Day', nameKh: 'ពិធីបុណ្យវិសាខបូជា', isNational: true },
  { dateStr: '2026-05-26', nameEn: 'Royal Plowing Ceremony Day', nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', isNational: true },
  { dateStr: '2026-06-18', nameEn: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចំរើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ', isNational: true },
  { dateStr: '2026-09-24', nameEn: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', isNational: true },
  { dateStr: '2026-10-01', nameEn: 'Ben 15 - Pchum Ben Day', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃភ្ជុំធំ)', isNational: true },
  { dateStr: '2026-10-02', nameEn: 'Pchum Ben Holiday', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ', isNational: true },
  { dateStr: '2026-10-03', nameEn: 'Pchum Ben Holiday', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ', isNational: true },
  { dateStr: '2026-10-15', nameEn: 'Commemoration Day of King-Father', nameKh: 'ទិវាកាន់ទុក្ខព្រះបរមរតនកោដ្ឋ', isNational: true },
  { dateStr: '2026-10-29', nameEn: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', isNational: true },
  { dateStr: '2026-11-09', nameEn: 'Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', isNational: true },
  { dateStr: '2026-11-23', nameEn: 'Water Festival (Boat Racing)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប', isNational: true },
  { dateStr: '2026-11-24', nameEn: 'Water Festival (Loy Pratip)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក', isNational: true },
  { dateStr: '2026-11-25', nameEn: 'Water Festival (Ok Ambok)', nameKh: 'ពិធីសំពះព្រះខែ អកអំបុក', isNational: true },
];

// International / World Celebrated Appreciation Days
export const WORLD_CELEBRATION_DAYS: WorldDay[] = [
  { dateStr: '2026-02-14', nameEn: "Valentine's Day", nameKh: 'ទិវានៃក្ដីស្រឡាញ់', emoji: '💖', category: 'LOVE' },
  { dateStr: '2026-02-16', nameEn: 'Chinese New Year Eve', nameKh: 'ថ្ងៃសែនចូលឆ្នាំចិន', emoji: '🧧', category: 'CULTURE' },
  { dateStr: '2026-02-17', nameEn: 'Chinese New Year (Spring Festival)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំចិន', emoji: '🐉', category: 'CULTURE' },
  { dateStr: '2026-02-18', nameEn: 'Chinese New Year (Day 2)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំចិន (ថ្ងៃទី២)', emoji: '🏮', category: 'CULTURE' },
  { dateStr: '2026-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', emoji: '🌸', category: 'FAMILY' },
  { dateStr: '2026-04-05', nameEn: 'Easter Sunday', nameKh: 'ពិធីបុណ្យអ៊ីស្ទ័រ (Easter)', emoji: '🐣', category: 'CULTURE' },
  { dateStr: '2026-04-22', nameEn: 'Earth Day', nameKh: 'ទិវាភពផែនដី', emoji: '🌍', category: 'CULTURE' },
  { dateStr: '2026-05-10', nameEn: "Mother's Day", nameKh: 'ទិវាអ្នកម្តាយ', emoji: '💐', category: 'FAMILY' },
  { dateStr: '2026-06-01', nameEn: "International Children's Day", nameKh: 'ទិវាកុមារអន្តរជាតិ', emoji: '🎈', category: 'FAMILY' },
  { dateStr: '2026-06-21', nameEn: "Father's Day", nameKh: 'ទិវាអ្នកឪពុក', emoji: '👨', category: 'FAMILY' },
  { dateStr: '2026-08-01', nameEn: 'National Girlfriend Day', nameKh: 'ទិវាមិត្តស្រី', emoji: '💖', category: 'LOVE' },
  { dateStr: '2026-08-02', nameEn: 'International Friendship Day', nameKh: 'ទិវាមិត្តភាព', emoji: '🤝', category: 'FAMILY' },
  { dateStr: '2026-10-03', nameEn: 'National Boyfriend Day', nameKh: 'ទិវាមិត្តប្រុស', emoji: '💙', category: 'LOVE' },
  { dateStr: '2026-10-05', nameEn: "Teachers' Day", nameKh: 'ទិវាគ្រូបង្រៀន', emoji: '🎓', category: 'CULTURE' },
  { dateStr: '2026-10-31', nameEn: 'Halloween', nameKh: 'ពិធីបុណ្យហាឡូហ្វីន (Halloween)', emoji: '🎃', category: 'CULTURE' },
  { dateStr: '2026-12-25', nameEn: 'Christmas Day', nameKh: 'បុណ្យណូអែល (Christmas)', emoji: '🎄', category: 'CULTURE' },
];

// Pchum Ben 15-Day Season (Kan Ben 1 to Kan Ben 14)
export const KAN_BEN_SEASON_2026: Record<string, string> = {
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
export const EXACT_2026_BUDDHA_DAYS: Record<string, string> = {
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
  const worldDay = WORLD_CELEBRATION_DAYS.find(w => w.dateStr === dateStr);
  const culturalEvent = KAN_BEN_SEASON_2026[dateStr] || '';

  // Strict Lookup for exact Chhankitek Buddhist Holy Days (4 per month)
  const buddhaDayName = EXACT_2026_BUDDHA_DAYS[dateStr] || '';
  const isBuddhaDay = !!buddhaDayName;
  const isImportantDay = !!holiday || isBuddhaDay || !!culturalEvent || !!worldDay;

  return {
    dayOfWeekEn,
    formattedDateEn,
    holiday,
    culturalEvent,
    worldDay,
    isWeekend,
    isBuddhaDay,
    buddhaDayName,
    isImportantDay,
  };
};
