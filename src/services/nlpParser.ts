import { CurrencyCode, NotionColor, PaymentMethod } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { KHR_PER_USD } from './storageService';

export interface ParsedExpenseInput {
  title: string;
  amountUSD: number;
  currency: CurrencyCode;
  amountOriginal?: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: NotionColor;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  confidence: number;
}

export const parseNaturalLanguageExpense = (input: string): ParsedExpenseInput => {
  const text = input.trim();
  const lower = text.toLowerCase();
  const todayISO = new Date().toISOString().split('T')[0];

  let detectedCurrency: CurrencyCode = 'USD';
  let rawAmount = 0;
  let amountUSD = 0;
  let amountOriginal: number | undefined = undefined;

  // 1. Detect Currency and Amount
  // Check for Riel / KHR first: e.g. "20000 riel", "20000 ៛", "20k riel", "20000 khr"
  const rielMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:k)?\s*(?:riel|៛|khr)/i);
  const usdMatch = lower.match(/(?:\$|usd)?\s*(\d+(?:\.\d+)?)\s*(?:\$|usd|dollars)?/i);

  if (rielMatch) {
    let num = parseFloat(rielMatch[1]);
    if (lower.includes('k riel') || lower.includes('k ៛') || lower.includes('k khr')) {
      num = num * 1000;
    } else if (num < 100 && !lower.includes('k')) {
      // If user typed e.g. 20 riel, probably meant 20,000 riel or $20
      num = num * 1000;
    }
    detectedCurrency = 'KHR';
    amountOriginal = num;
    amountUSD = Number((num / KHR_PER_USD).toFixed(2));
    rawAmount = num;
  } else if (usdMatch) {
    const num = parseFloat(usdMatch[1]);
    if (!isNaN(num)) {
      detectedCurrency = 'USD';
      amountUSD = num;
      rawAmount = num;
    }
  }

  // Fallback number match if no explicit symbol
  if (amountUSD === 0) {
    const generalNumMatch = lower.match(/(\d+(?:\.\d+)?)/);
    if (generalNumMatch) {
      const num = parseFloat(generalNumMatch[1]);
      if (num >= 500) {
        // High number usually means Cambodian Riel
        detectedCurrency = 'KHR';
        amountOriginal = num;
        amountUSD = Number((num / KHR_PER_USD).toFixed(2));
      } else {
        detectedCurrency = 'USD';
        amountUSD = num;
      }
    }
  }

  // 2. Detect Date
  let targetDate = todayISO;
  if (lower.includes('yesterday')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    targetDate = d.toISOString().split('T')[0];
  } else if (lower.includes('last night')) {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    targetDate = d.toISOString().split('T')[0];
  }

  // 3. Detect Category
  let matchedCategory = DEFAULT_CATEGORIES[0]; // Default Food & Dining

  if (/coffee|latte|cappuccino|tea|boba|starbucks|snack|drink|cafe|espresso/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-coffee') || matchedCategory;
  } else if (/grocery|groceries|supermarket|fruit|meat|market|walmart|trader joe/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-groceries') || matchedCategory;
  } else if (/lunch|dinner|breakfast|burger|pizza|sushi|restaurant|food|noodle|soup|rice|eat/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-food') || matchedCategory;
  } else if (/uber|grab|taxi|cab|bus|gas|fuel|transport|parking|train|flight/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-transport') || matchedCategory;
  } else if (/bill|utility|wifi|internet|electric|water|rent|phone|power/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-bills') || matchedCategory;
  } else if (/shirt|clothes|shoes|shopping|amazon|store|mall|jacket/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-shopping') || matchedCategory;
  } else if (/movie|cinema|netflix|game|concert|fun|party|bar|pub/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-entertainment') || matchedCategory;
  } else if (/figma|chatgpt|software|app|laptop|keyboard|tech|domain|hosting/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-tech') || matchedCategory;
  } else if (/gym|fitness|workout|doctor|medicine|health|pharmacy/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-health') || matchedCategory;
  } else if (/salary|income|freelance|client|paycheck|dividend/i.test(lower)) {
    matchedCategory = DEFAULT_CATEGORIES.find(c => c.id === 'cat-income') || matchedCategory;
  }

  // 4. Extract Clean Title
  let cleanTitle = text
    .replace(/(?:\$|usd)?\s*\d+(?:\.\d+)?\s*(?:\$|usd|dollars|riel|៛|khr|k)?/gi, '')
    .replace(/\b(spent|add|bought|paid|for|on|at|today|yesterday|last night)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = matchedCategory.name;
  }

  // Capitalize title
  cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

  // 5. Payment Method heuristic
  let paymentMethod: PaymentMethod = 'Credit Card';
  if (/cash|riel|៛/i.test(lower)) {
    paymentMethod = 'Cash';
  } else if (/bank|transfer|wire/i.test(lower)) {
    paymentMethod = 'Bank Transfer';
  } else if (/apple pay|google pay|mobile pay|aba|pipay/i.test(lower)) {
    paymentMethod = 'Mobile Pay';
  }

  return {
    title: cleanTitle,
    amountUSD: amountUSD || 5.0,
    currency: detectedCurrency,
    amountOriginal,
    categoryId: matchedCategory.id,
    categoryName: matchedCategory.name,
    categoryIcon: matchedCategory.icon,
    categoryColor: matchedCategory.color,
    date: targetDate,
    paymentMethod,
    confidence: amountUSD > 0 ? 0.95 : 0.60,
  };
};
