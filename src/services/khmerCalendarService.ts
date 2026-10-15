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
  icon?: string;
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

// Official Public National Holidays of Kingdom of Cambodia for 2026 (Sub-Decree No. 167 OrNKr.BK)
export const CAMBODIA_HOLIDAYS_2026: CambodiaHoliday[] = [
  { dateStr: '2026-01-01', nameEn: "International New Year's Day", nameKh: 'ទិវាបុណ្យចូលឆ្នាំសកល', isNational: true },
  { dateStr: '2026-01-07', nameEn: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍', isNational: true },
  { dateStr: '2026-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', isNational: true },
  { dateStr: '2026-04-14', nameEn: 'Khmer New Year (Moha Sangkranta)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2026-04-15', nameEn: 'Khmer New Year (Virak Wanabat)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2026-04-16', nameEn: 'Khmer New Year (Virak Loeung Sak)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2026-05-01', nameEn: 'International Labour & Visak Bochea', nameKh: 'ទិវាពលកម្មអន្តរជាតិ និង ពិធីបុណ្យវិសាខបូជា', isNational: true },
  { dateStr: '2026-05-05', nameEn: 'Royal Plowing Ceremony Day', nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', isNational: true },
  { dateStr: '2026-05-14', nameEn: "King Norodom Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី', isNational: true },
  { dateStr: '2026-06-18', nameEn: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ', isNational: true },
  { dateStr: '2026-09-24', nameEn: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', isNational: true },
  { dateStr: '2026-10-10', nameEn: 'Pchum Ben Festival (Day 1 - Ben 14)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១ - បិណ្ឌ១៤)', isNational: true },
  { dateStr: '2026-10-11', nameEn: 'Pchum Ben Day (Ben 15)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃភ្ជុំធំ)', isNational: true },
  { dateStr: '2026-10-12', nameEn: 'Pchum Ben Festival (Day 3)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2026-10-15', nameEn: 'Commemoration Day of King-Father', nameKh: 'ទិវាកាន់ទុក្ខព្រះបរមរតនកោដ្ឋ', isNational: true },
  { dateStr: '2026-10-29', nameEn: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', isNational: true },
  { dateStr: '2026-11-09', nameEn: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', isNational: true },
  { dateStr: '2026-11-23', nameEn: 'Water Festival (Boat Racing)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2026-11-24', nameEn: 'Water Festival (Loy Pratip)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក បណ្តែតប្រទីប (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2026-11-25', nameEn: 'Water Festival (Ok Ambok)', nameKh: 'ពិធីសំពះព្រះខែ និងអកអំបុក (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2026-12-29', nameEn: 'Peace Day in Cambodia', nameKh: 'ទិវាសន្តិភាពនៅកម្ពុជា', isNational: true },
];

// Official Public National Holidays of Kingdom of Cambodia for 2025 (Sub-Decree No. 204/24 OrNKr/BK)
export const CAMBODIA_HOLIDAYS_2025: CambodiaHoliday[] = [
  { dateStr: '2025-01-01', nameEn: "International New Year's Day", nameKh: 'ទិវាបុណ្យចូលឆ្នាំសកល', isNational: true },
  { dateStr: '2025-01-07', nameEn: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍', isNational: true },
  { dateStr: '2025-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', isNational: true },
  { dateStr: '2025-04-14', nameEn: 'Khmer New Year (Moha Sangkranta)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2025-04-15', nameEn: 'Khmer New Year (Virak Wanabat)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2025-04-16', nameEn: 'Khmer New Year (Virak Loeung Sak)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2025-05-01', nameEn: 'International Labour Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', isNational: true },
  { dateStr: '2025-05-11', nameEn: 'Visak Bochea Day', nameKh: 'ពិធីបុណ្យវិសាខបូជា', isNational: true },
  { dateStr: '2025-05-14', nameEn: "King Norodom Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី', isNational: true },
  { dateStr: '2025-05-15', nameEn: 'Royal Plowing Ceremony Day', nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', isNational: true },
  { dateStr: '2025-06-18', nameEn: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ', isNational: true },
  { dateStr: '2025-09-21', nameEn: 'Pchum Ben Festival (Day 1 - Ben 14)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2025-09-22', nameEn: 'Pchum Ben Day (Ben 15)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃភ្ជុំធំ)', isNational: true },
  { dateStr: '2025-09-23', nameEn: 'Pchum Ben Festival (Day 3)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2025-09-24', nameEn: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', isNational: true },
  { dateStr: '2025-10-15', nameEn: 'Commemoration Day of King-Father', nameKh: 'ទិវាកាន់ទុក្ខព្រះបរមរតនកោដ្ឋ', isNational: true },
  { dateStr: '2025-10-29', nameEn: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', isNational: true },
  { dateStr: '2025-11-04', nameEn: 'Water Festival (Boat Racing)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2025-11-05', nameEn: 'Water Festival (Loy Pratip)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2025-11-06', nameEn: 'Water Festival (Ok Ambok)', nameKh: 'ពិធីសំពះព្រះខែ និងអកអំបុក (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2025-11-09', nameEn: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', isNational: true },
  { dateStr: '2025-12-29', nameEn: 'Peace Day in Cambodia', nameKh: 'ទិវាសន្តិភាពនៅកម្ពុជា', isNational: true },
];

// Official Public National Holidays of Kingdom of Cambodia for 2024 (Sub-Decree No. 230 OrNKr.BK)
export const CAMBODIA_HOLIDAYS_2024: CambodiaHoliday[] = [
  { dateStr: '2024-01-01', nameEn: "International New Year's Day", nameKh: 'ទិវាបុណ្យចូលឆ្នាំសកល', isNational: true },
  { dateStr: '2024-01-07', nameEn: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍', isNational: true },
  { dateStr: '2024-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', isNational: true },
  { dateStr: '2024-04-13', nameEn: 'Khmer New Year (Day 1)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2024-04-14', nameEn: 'Khmer New Year (Day 2)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2024-04-15', nameEn: 'Khmer New Year (Day 3)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2024-04-16', nameEn: 'Khmer New Year (Day 4)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៤)', isNational: true },
  { dateStr: '2024-05-01', nameEn: 'International Labour Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', isNational: true },
  { dateStr: '2024-05-14', nameEn: "King Norodom Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី', isNational: true },
  { dateStr: '2024-05-22', nameEn: 'Visak Bochea Day', nameKh: 'ពិធីបុណ្យវិសាខបូជា', isNational: true },
  { dateStr: '2024-05-26', nameEn: 'Royal Plowing Ceremony Day', nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', isNational: true },
  { dateStr: '2024-06-18', nameEn: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ', isNational: true },
  { dateStr: '2024-09-24', nameEn: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', isNational: true },
  { dateStr: '2024-10-01', nameEn: 'Pchum Ben Festival (Day 1)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2024-10-02', nameEn: 'Pchum Ben Day (Ben 15)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃភ្ជុំធំ)', isNational: true },
  { dateStr: '2024-10-03', nameEn: 'Pchum Ben Festival (Day 3)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2024-10-15', nameEn: 'Commemoration Day of King-Father', nameKh: 'ទិវាកាន់ទុក្ខព្រះបរមរតនកោដ្ឋ', isNational: true },
  { dateStr: '2024-10-29', nameEn: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', isNational: true },
  { dateStr: '2024-11-09', nameEn: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', isNational: true },
  { dateStr: '2024-11-14', nameEn: 'Water Festival (Boat Racing)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2024-11-15', nameEn: 'Water Festival (Loy Pratip)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2024-11-16', nameEn: 'Water Festival (Ok Ambok)', nameKh: 'ពិធីសំពះព្រះខែ និងអកអំបុក (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2024-12-29', nameEn: 'Peace Day in Cambodia', nameKh: 'ទិវាសន្តិភាពនៅកម្ពុជា', isNational: true },
];

// Projected Public Holidays for 2027
export const CAMBODIA_HOLIDAYS_2027: CambodiaHoliday[] = [
  { dateStr: '2027-01-01', nameEn: "International New Year's Day", nameKh: 'ទិវាបុណ្យចូលឆ្នាំសកល', isNational: true },
  { dateStr: '2027-01-07', nameEn: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍', isNational: true },
  { dateStr: '2027-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', isNational: true },
  { dateStr: '2027-04-14', nameEn: 'Khmer New Year (Moha Sangkranta)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2027-04-15', nameEn: 'Khmer New Year (Virak Wanabat)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2027-04-16', nameEn: 'Khmer New Year (Virak Loeung Sak)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2027-05-01', nameEn: 'International Labour Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', isNational: true },
  { dateStr: '2027-05-14', nameEn: "King Norodom Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី', isNational: true },
  { dateStr: '2027-05-20', nameEn: 'Visak Bochea Day', nameKh: 'ពិធីបុណ្យវិសាខបូជា', isNational: true },
  { dateStr: '2027-05-24', nameEn: 'Royal Plowing Ceremony Day', nameKh: 'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល', isNational: true },
  { dateStr: '2027-06-18', nameEn: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ', isNational: true },
  { dateStr: '2027-09-24', nameEn: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', isNational: true },
  { dateStr: '2027-09-29', nameEn: 'Pchum Ben Festival (Day 1)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2027-09-30', nameEn: 'Pchum Ben Day (Ben 15)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃភ្ជុំធំ)', isNational: true },
  { dateStr: '2027-10-01', nameEn: 'Pchum Ben Festival (Day 3)', nameKh: 'ពិធីបុណ្យភ្ជុំបិណ្ឌ (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2027-10-15', nameEn: 'Commemoration Day of King-Father', nameKh: 'ទិវាកាន់ទុក្ខព្រះបរមរតនកោដ្ឋ', isNational: true },
  { dateStr: '2027-10-29', nameEn: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', isNational: true },
  { dateStr: '2027-11-09', nameEn: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', isNational: true },
  { dateStr: '2027-11-12', nameEn: 'Water Festival (Boat Racing)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក (ថ្ងៃទី១)', isNational: true },
  { dateStr: '2027-11-13', nameEn: 'Water Festival (Loy Pratip)', nameKh: 'ព្រះរាជពិធីបុណ្យអុំទូក (ថ្ងៃទី២)', isNational: true },
  { dateStr: '2027-11-14', nameEn: 'Water Festival (Ok Ambok)', nameKh: 'ពិធីសំពះព្រះខែ និងអកអំបុក (ថ្ងៃទី៣)', isNational: true },
  { dateStr: '2027-12-29', nameEn: 'Peace Day in Cambodia', nameKh: 'ទិវាសន្តិភាពនៅកម្ពុជា', isNational: true },
];

// Comprehensive public holiday array combining all active years
export const CAMBODIA_NATIONAL_HOLIDAYS: CambodiaHoliday[] = [
  ...CAMBODIA_HOLIDAYS_2024,
  ...CAMBODIA_HOLIDAYS_2025,
  ...CAMBODIA_HOLIDAYS_2026,
  ...CAMBODIA_HOLIDAYS_2027,
];

// Helper to retrieve all public holidays for a given year (with dynamic fallback for any other year)
export const getCambodiaHolidaysForYear = (year: number): CambodiaHoliday[] => {
  if (year === 2026) return CAMBODIA_HOLIDAYS_2026;
  if (year === 2025) return CAMBODIA_HOLIDAYS_2025;
  if (year === 2024) return CAMBODIA_HOLIDAYS_2024;
  if (year === 2027) return CAMBODIA_HOLIDAYS_2027;

  // Dynamic generator for fixed solar national holidays
  return [
    { dateStr: `${year}-01-01`, nameEn: "International New Year's Day", nameKh: 'ទិវាបុណ្យចូលឆ្នាំសកល', isNational: true },
    { dateStr: `${year}-01-07`, nameEn: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជំនះលើរបបប្រល័យពូជសាសន៍', isNational: true },
    { dateStr: `${year}-03-08`, nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', isNational: true },
    { dateStr: `${year}-04-14`, nameEn: 'Khmer New Year (Moha Sangkranta)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី១)', isNational: true },
    { dateStr: `${year}-04-15`, nameEn: 'Khmer New Year (Virak Wanabat)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី២)', isNational: true },
    { dateStr: `${year}-04-16`, nameEn: 'Khmer New Year (Virak Loeung Sak)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ (ថ្ងៃទី៣)', isNational: true },
    { dateStr: `${year}-05-01`, nameEn: 'International Labour Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', isNational: true },
    { dateStr: `${year}-05-14`, nameEn: "King Norodom Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះបាទសម្តេចព្រះបរមនាថ នរោត្តម សីហមុនី', isNational: true },
    { dateStr: `${year}-06-18`, nameEn: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចព្រះមហាក្សត្រី នរោត្តម មុនិនាថ សីហនុ', isNational: true },
    { dateStr: `${year}-09-24`, nameEn: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', isNational: true },
    { dateStr: `${year}-10-15`, nameEn: 'Commemoration Day of King-Father', nameKh: 'ទិវាកាន់ទុក្ខព្រះបរមរតនកោដ្ឋ', isNational: true },
    { dateStr: `${year}-10-29`, nameEn: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', isNational: true },
    { dateStr: `${year}-11-09`, nameEn: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', isNational: true },
    { dateStr: `${year}-12-29`, nameEn: 'Peace Day in Cambodia', nameKh: 'ទិវាសន្តិភាពនៅកម្ពុជា', isNational: true },
  ];
};

// International / World Celebrated Appreciation Days (Vector icons exclusively, no emojis)
export const WORLD_CELEBRATION_DAYS: WorldDay[] = [
  // 2026
  { dateStr: '2026-02-14', nameEn: "Valentine's Day", nameKh: 'ទិវានៃក្ដីស្រឡាញ់', icon: 'heart', category: 'LOVE' },
  { dateStr: '2026-02-16', nameEn: 'Chinese New Year Eve', nameKh: 'ថ្ងៃសែនចូលឆ្នាំចិន', icon: 'sparkles', category: 'CULTURE' },
  { dateStr: '2026-02-17', nameEn: 'Chinese New Year (Spring Festival)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំចិន', icon: 'flame', category: 'CULTURE' },
  { dateStr: '2026-02-18', nameEn: 'Chinese New Year (Day 2)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំចិន (ថ្ងៃទី២)', icon: 'sparkles', category: 'CULTURE' },
  { dateStr: '2026-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', icon: 'award', category: 'FAMILY' },
  { dateStr: '2026-04-05', nameEn: 'Easter Sunday', nameKh: 'ពិធីបុណ្យអ៊ីស្ទ័រ (Easter)', icon: 'sun', category: 'CULTURE' },
  { dateStr: '2026-04-22', nameEn: 'Earth Day', nameKh: 'ទិវាភពផែនដី', icon: 'globe', category: 'CULTURE' },
  { dateStr: '2026-05-10', nameEn: "Mother's Day", nameKh: 'ទិវាអ្នកម្តាយ', icon: 'heart', category: 'FAMILY' },
  { dateStr: '2026-06-01', nameEn: "International Children's Day", nameKh: 'ទិវាកុមារអន្តរជាតិ', icon: 'users', category: 'FAMILY' },
  { dateStr: '2026-06-21', nameEn: "Father's Day", nameKh: 'ទិវាអ្នកឪពុក', icon: 'user', category: 'FAMILY' },
  { dateStr: '2026-08-01', nameEn: 'National Girlfriend Day', nameKh: 'ទិវាមិត្តស្រី', icon: 'heart', category: 'LOVE' },
  { dateStr: '2026-08-02', nameEn: 'International Friendship Day', nameKh: 'ទិវាមិត្តភាព', icon: 'users', category: 'FAMILY' },
  { dateStr: '2026-10-03', nameEn: 'National Boyfriend Day', nameKh: 'ទិវាមិត្តប្រុស', icon: 'heart', category: 'LOVE' },
  { dateStr: '2026-10-05', nameEn: "Teachers' Day", nameKh: 'ទិវាគ្រូបង្រៀន', icon: 'book-open', category: 'CULTURE' },
  { dateStr: '2026-10-31', nameEn: 'Halloween', nameKh: 'ពិធីបុណ្យហាឡូហ្វីន (Halloween)', icon: 'moon', category: 'CULTURE' },
  { dateStr: '2026-12-25', nameEn: 'Christmas Day', nameKh: 'បុណ្យណូអែល (Christmas)', icon: 'gift', category: 'CULTURE' },

  // 2025
  { dateStr: '2025-01-28', nameEn: 'Chinese New Year Eve', nameKh: 'ថ្ងៃសែនចូលឆ្នាំចិន', icon: 'sparkles', category: 'CULTURE' },
  { dateStr: '2025-01-29', nameEn: 'Chinese New Year (Spring Festival)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំចិន', icon: 'flame', category: 'CULTURE' },
  { dateStr: '2025-01-30', nameEn: 'Chinese New Year (Day 2)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំចិន (ថ្ងៃទី២)', icon: 'sparkles', category: 'CULTURE' },
  { dateStr: '2025-02-14', nameEn: "Valentine's Day", nameKh: 'ទិវានៃក្ដីស្រឡាញ់', icon: 'heart', category: 'LOVE' },
  { dateStr: '2025-03-08', nameEn: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', icon: 'award', category: 'FAMILY' },
  { dateStr: '2025-04-20', nameEn: 'Easter Sunday', nameKh: 'ពិធីបុណ្យអ៊ីស្ទ័រ (Easter)', icon: 'sun', category: 'CULTURE' },
  { dateStr: '2025-04-22', nameEn: 'Earth Day', nameKh: 'ទិវាភពផែនដី', icon: 'globe', category: 'CULTURE' },
  { dateStr: '2025-05-11', nameEn: "Mother's Day", nameKh: 'ទិវាអ្នកម្តាយ', icon: 'heart', category: 'FAMILY' },
  { dateStr: '2025-06-01', nameEn: "International Children's Day", nameKh: 'ទិវាកុមារអន្តរជាតិ', icon: 'users', category: 'FAMILY' },
  { dateStr: '2025-06-15', nameEn: "Father's Day", nameKh: 'ទិវាអ្នកឪពុក', icon: 'user', category: 'FAMILY' },
  { dateStr: '2025-08-01', nameEn: 'National Girlfriend Day', nameKh: 'ទិវាមិត្តស្រី', icon: 'heart', category: 'LOVE' },
  { dateStr: '2025-08-03', nameEn: 'International Friendship Day', nameKh: 'ទិវាមិត្តភាព', icon: 'users', category: 'FAMILY' },
  { dateStr: '2025-10-03', nameEn: 'National Boyfriend Day', nameKh: 'ទិវាមិត្តប្រុស', icon: 'heart', category: 'LOVE' },
  { dateStr: '2025-10-05', nameEn: "Teachers' Day", nameKh: 'ទិវាគ្រូបង្រៀន', icon: 'book-open', category: 'CULTURE' },
  { dateStr: '2025-10-31', nameEn: 'Halloween', nameKh: 'ពិធីបុណ្យហាឡូហ្វីន (Halloween)', icon: 'moon', category: 'CULTURE' },
  { dateStr: '2025-12-25', nameEn: 'Christmas Day', nameKh: 'បុណ្យណូអែល (Christmas)', icon: 'gift', category: 'CULTURE' },
];

// Pchum Ben 15-Day Seasons (Kan Ben 1 to Kan Ben 14, followed by Ben 15)
export const KAN_BEN_SEASONS: Record<string, string> = {
  // 2026 Pchum Ben Season (Ending Ben 15 on Oct 11, 2026)
  '2026-09-27': 'Kan Ben 1',
  '2026-09-28': 'Kan Ben 2',
  '2026-09-29': 'Kan Ben 3',
  '2026-09-30': 'Kan Ben 4',
  '2026-10-01': 'Kan Ben 5',
  '2026-10-02': 'Kan Ben 6',
  '2026-10-03': 'Kan Ben 7',
  '2026-10-04': 'Kan Ben 8',
  '2026-10-05': 'Kan Ben 9',
  '2026-10-06': 'Kan Ben 10',
  '2026-10-07': 'Kan Ben 11',
  '2026-10-08': 'Kan Ben 12',
  '2026-10-09': 'Kan Ben 13',
  '2026-10-10': 'Kan Ben 14',
  '2026-10-11': 'Ben 15 (Pchum Ben Day)',

  // 2025 Pchum Ben Season (Ending Ben 15 on Sep 22, 2025)
  '2025-09-08': 'Kan Ben 1',
  '2025-09-09': 'Kan Ben 2',
  '2025-09-10': 'Kan Ben 3',
  '2025-09-11': 'Kan Ben 4',
  '2025-09-12': 'Kan Ben 5',
  '2025-09-13': 'Kan Ben 6',
  '2025-09-14': 'Kan Ben 7',
  '2025-09-15': 'Kan Ben 8',
  '2025-09-16': 'Kan Ben 9',
  '2025-09-17': 'Kan Ben 10',
  '2025-09-18': 'Kan Ben 11',
  '2025-09-19': 'Kan Ben 12',
  '2025-09-20': 'Kan Ben 13',
  '2025-09-21': 'Kan Ben 14',
  '2025-09-22': 'Ben 15 (Pchum Ben Day)',

  // 2024 Pchum Ben Season
  '2024-09-18': 'Kan Ben 1',
  '2024-09-19': 'Kan Ben 2',
  '2024-09-20': 'Kan Ben 3',
  '2024-09-21': 'Kan Ben 4',
  '2024-09-22': 'Kan Ben 5',
  '2024-09-23': 'Kan Ben 6',
  '2024-09-24': 'Kan Ben 7',
  '2024-09-25': 'Kan Ben 8',
  '2024-09-26': 'Kan Ben 9',
  '2024-09-27': 'Kan Ben 10',
  '2024-09-28': 'Kan Ben 11',
  '2024-09-29': 'Kan Ben 12',
  '2024-09-30': 'Kan Ben 13',
  '2024-10-01': 'Kan Ben 14',
  '2024-10-02': 'Ben 15 (Pchum Ben Day)',
};

export const KAN_BEN_SEASON_2026 = KAN_BEN_SEASONS;

// Exact Cambodian Chhankitek Buddhist Holy Days (Thngai Seil - 4 per month)
export const EXACT_BUDDHA_DAYS: Record<string, string> = {
  // 2026 Phnom Penh Lunar Calculations
  '2026-01-03': 'Buddhist Holy Day (New Moon)',
  '2026-01-10': 'Buddhist Holy Day (Waxing 8th)',
  '2026-01-19': 'Buddhist Holy Day (Full Moon)',
  '2026-01-26': 'Buddhist Holy Day (Waning 8th)',

  '2026-02-02': 'Buddhist Holy Day (New Moon)',
  '2026-02-09': 'Buddhist Holy Day (Waxing 8th)',
  '2026-02-17': 'Buddhist Holy Day (Full Moon)',
  '2026-02-24': 'Buddhist Holy Day (Waning 8th)',

  '2026-03-03': 'Buddhist Holy Day (New Moon)',
  '2026-03-11': 'Buddhist Holy Day (Waxing 8th)',
  '2026-03-19': 'Buddhist Holy Day (Full Moon)',
  '2026-03-26': 'Buddhist Holy Day (Waning 8th)',

  '2026-04-02': 'Buddhist Holy Day (New Moon)',
  '2026-04-10': 'Buddhist Holy Day (Waxing 8th)',
  '2026-04-17': 'Buddhist Holy Day (Full Moon)',
  '2026-04-24': 'Buddhist Holy Day (Waning 8th)',

  '2026-05-01': 'Buddhist Holy Day (Visak Bochea Full Moon)',
  '2026-05-10': 'Buddhist Holy Day (Waxing 8th)',
  '2026-05-17': 'Buddhist Holy Day (New Moon)',
  '2026-05-23': 'Buddhist Holy Day (Waning 8th)',
  '2026-05-31': 'Buddhist Holy Day (Full Moon)',

  '2026-06-08': 'Buddhist Holy Day (Waning 8th)',
  '2026-06-15': 'Buddhist Holy Day (New Moon)',
  '2026-06-22': 'Buddhist Holy Day (Waxing 8th)',
  '2026-06-30': 'Buddhist Holy Day (Full Moon)',

  '2026-07-08': 'Buddhist Holy Day (Waning 8th)',
  '2026-07-14': 'Buddhist Holy Day (New Moon)',
  '2026-07-21': 'Buddhist Holy Day (Waxing 8th)',
  '2026-07-29': 'Buddhist Holy Day (Full Moon)',

  '2026-08-06': 'Buddhist Holy Day (Waning 8th)',
  '2026-08-13': 'Buddhist Holy Day (New Moon)',
  '2026-08-20': 'Buddhist Holy Day (Waxing 8th)',
  '2026-08-28': 'Buddhist Holy Day (Full Moon)',

  '2026-09-04': 'Buddhist Holy Day (Waning 8th)',
  '2026-09-11': 'Buddhist Holy Day (New Moon)',
  '2026-09-19': 'Buddhist Holy Day (Waxing 8th)',
  '2026-09-26': 'Buddhist Holy Day (Full Moon)',

  '2026-10-03': 'Buddhist Holy Day (Waning 8th)',
  '2026-10-10': 'Buddhist Holy Day (Ben 14)',
  '2026-10-11': 'Buddhist Holy Day (Ben 15 / New Moon)',
  '2026-10-18': 'Buddhist Holy Day (Waxing 8th)',
  '2026-10-26': 'Buddhist Holy Day (Full Moon)',

  '2026-11-02': 'Buddhist Holy Day (Waning 8th)',
  '2026-11-09': 'Buddhist Holy Day (New Moon)',
  '2026-11-17': 'Buddhist Holy Day (Waxing 8th)',
  '2026-11-24': 'Buddhist Holy Day (Full Moon / Water Festival)',

  '2026-12-01': 'Buddhist Holy Day (Waning 8th)',
  '2026-12-09': 'Buddhist Holy Day (New Moon)',
  '2026-12-17': 'Buddhist Holy Day (Waxing 8th)',
  '2026-12-24': 'Buddhist Holy Day (Full Moon)',
  '2026-12-31': 'Buddhist Holy Day (Waning 8th)',

  // 2025 Phnom Penh Lunar Calculations
  '2025-01-06': 'Buddhist Holy Day (Waxing 8th)',
  '2025-01-14': 'Buddhist Holy Day (Full Moon)',
  '2025-01-22': 'Buddhist Holy Day (Waning 8th)',
  '2025-01-29': 'Buddhist Holy Day (New Moon)',

  '2025-02-05': 'Buddhist Holy Day (Waxing 8th)',
  '2025-02-12': 'Buddhist Holy Day (Full Moon)',
  '2025-02-21': 'Buddhist Holy Day (Waning 8th)',
  '2025-02-28': 'Buddhist Holy Day (New Moon)',

  '2025-03-07': 'Buddhist Holy Day (Waxing 8th)',
  '2025-03-14': 'Buddhist Holy Day (Full Moon)',
  '2025-03-22': 'Buddhist Holy Day (Waning 8th)',
  '2025-03-29': 'Buddhist Holy Day (New Moon)',

  '2025-04-05': 'Buddhist Holy Day (Waxing 8th)',
  '2025-04-13': 'Buddhist Holy Day (Full Moon)',
  '2025-04-21': 'Buddhist Holy Day (Waning 8th)',
  '2025-04-27': 'Buddhist Holy Day (New Moon)',

  '2025-05-05': 'Buddhist Holy Day (Waxing 8th)',
  '2025-05-11': 'Buddhist Holy Day (Visak Bochea)',
  '2025-05-12': 'Buddhist Holy Day (Full Moon)',
  '2025-05-20': 'Buddhist Holy Day (Waning 8th)',
  '2025-05-27': 'Buddhist Holy Day (New Moon)',

  '2025-06-03': 'Buddhist Holy Day (Waxing 8th)',
  '2025-06-11': 'Buddhist Holy Day (Full Moon)',
  '2025-06-19': 'Buddhist Holy Day (Waning 8th)',
  '2025-06-25': 'Buddhist Holy Day (New Moon)',

  '2025-07-03': 'Buddhist Holy Day (Waxing 8th)',
  '2025-07-10': 'Buddhist Holy Day (Full Moon)',
  '2025-07-18': 'Buddhist Holy Day (Waning 8th)',
  '2025-07-25': 'Buddhist Holy Day (New Moon)',

  '2025-08-01': 'Buddhist Holy Day (Waxing 8th)',
  '2025-08-09': 'Buddhist Holy Day (Full Moon)',
  '2025-08-16': 'Buddhist Holy Day (Waning 8th)',
  '2025-08-23': 'Buddhist Holy Day (New Moon)',
  '2025-08-31': 'Buddhist Holy Day (Waxing 8th)',

  '2025-09-07': 'Buddhist Holy Day (Full Moon)',
  '2025-09-15': 'Buddhist Holy Day (Waning 8th)',
  '2025-09-21': 'Buddhist Holy Day (Ben 14)',
  '2025-09-22': 'Buddhist Holy Day (Ben 15 / New Moon)',
  '2025-09-30': 'Buddhist Holy Day (Waxing 8th)',

  '2025-10-07': 'Buddhist Holy Day (Full Moon)',
  '2025-10-14': 'Buddhist Holy Day (Waning 8th)',
  '2025-10-21': 'Buddhist Holy Day (New Moon)',
  '2025-10-29': 'Buddhist Holy Day (Waxing 8th)',

  '2025-11-05': 'Buddhist Holy Day (Full Moon / Water Festival)',
  '2025-11-13': 'Buddhist Holy Day (Waning 8th)',
  '2025-11-20': 'Buddhist Holy Day (New Moon)',
  '2025-11-28': 'Buddhist Holy Day (Waxing 8th)',

  '2025-12-05': 'Buddhist Holy Day (Full Moon)',
  '2025-12-12': 'Buddhist Holy Day (Waning 8th)',
  '2025-12-20': 'Buddhist Holy Day (New Moon)',
  '2025-12-28': 'Buddhist Holy Day (Waxing 8th)',
};

export const EXACT_2026_BUDDHA_DAYS = EXACT_BUDDHA_DAYS;

export const getDateDetails = (dateStr: string): DateDetails => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayIndex = d.getUTCDay();
  const dayOfWeekEn = DAYS_OF_WEEK[dayIndex];
  const isWeekend = dayIndex === 0 || dayIndex === 6;

  const monthEn = MONTH_NAMES[month - 1];
  const formattedDateEn = `${dayOfWeekEn}, ${monthEn} ${day}, ${year}`;

  // 1. Check comprehensive holiday list
  let holiday = CAMBODIA_NATIONAL_HOLIDAYS.find(h => h.dateStr === dateStr);
  if (!holiday) {
    const yearHolidays = getCambodiaHolidaysForYear(year);
    holiday = yearHolidays.find(h => h.dateStr === dateStr);
  }

  // 2. Check world celebration day
  const worldDay = WORLD_CELEBRATION_DAYS.find(w => w.dateStr === dateStr);

  // 3. Check Kan Ben season
  const culturalEvent = KAN_BEN_SEASONS[dateStr] || '';

  // 4. Strict Lookup for exact Chhankitek Buddhist Holy Days (4 per month)
  const buddhaDayName = EXACT_BUDDHA_DAYS[dateStr] || '';
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
