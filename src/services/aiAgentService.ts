import { Category } from '../types';

export const parseNaturalLanguageExpense = async (
  prompt: string,
  categories: Category[]
): Promise<{ title: string; amount: number; categoryId?: string; categoryName?: string; categoryIcon?: string; categoryColor?: string }> => {
  // Regex parsing engine fallback
  const amountMatch = prompt.match(/\$?(\d+(\.\d{1,2})?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  const lower = prompt.toLowerCase();
  let selectedCat = categories[0];

  if (lower.includes('coffee') || lower.includes('latte') || lower.includes('tea') || lower.includes('boba') || lower.includes('espresso')) {
    selectedCat = categories.find(c => c.id === 'cat-coffee') || categories[0];
  } else if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('noodle') || lower.includes('burger') || lower.includes('pizza')) {
    selectedCat = categories.find(c => c.id === 'cat-food') || categories[0];
  } else if (lower.includes('grocery') || lower.includes('supermarket') || lower.includes('market') || lower.includes('fruit')) {
    selectedCat = categories.find(c => c.id === 'cat-groceries') || categories[0];
  } else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gas') || lower.includes('fuel') || lower.includes('ride')) {
    selectedCat = categories.find(c => c.id === 'cat-transport') || categories[0];
  } else if (lower.includes('bill') || lower.includes('wifi') || lower.includes('internet') || lower.includes('power')) {
    selectedCat = categories.find(c => c.id === 'cat-bills') || categories[0];
  }

  // Title extraction
  let cleanTitle = prompt
    .replace(/\$?(\d+(\.\d{1,2})?)/g, '')
    .replace(/\b(spent|paid|for|on|yesterday|today)\b/gi, '')
    .trim();

  if (!cleanTitle) {
    cleanTitle = selectedCat.name + ' Expense';
  }

  return {
    title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
    amount,
    categoryId: selectedCat.id,
    categoryName: selectedCat.name,
    categoryIcon: selectedCat.icon,
    categoryColor: selectedCat.color,
  };
};
