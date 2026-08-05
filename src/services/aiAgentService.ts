import { Category, ExpenseItem } from '../types';

export interface AiParsedResult {
  type: 'LOG_TRANSACTION' | 'FINANCIAL_QUERY' | 'FINANCIAL_PLAN';
  itemType?: 'EXPENSE' | 'SAVING';
  title?: string;
  amount?: number;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  responseText: string;
}

// Strict Security & Privacy Firewall: Redacts and blocks any secret tokens, keys, or IDs
const sanitizeResponseText = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '[PROTECTED]')
    .replace(/guest[_-]?device[_-]?id/gi, '[PROTECTED]')
    .replace(/guest_[a-zA-Z0-9_-]+/gi, '[PROTECTED]')
    .replace(/api[_-]?key[a-zA-Z0-9_=-]*/gi, '[PROTECTED]')
    .replace(/sk-[a-zA-Z0-9_-]+/gi, '[PROTECTED]')
    .replace(/token[a-zA-Z0-9_=-]*/gi, '[PROTECTED]');
};

export const parseNaturalLanguageExpense = async (
  prompt: string,
  categories: Category[],
  expenses: ExpenseItem[],
  monthlyBudget: number,
  savingGoal: number
): Promise<AiParsedResult> => {
  const lower = prompt.toLowerCase().trim();

  // 0. STRICT SECURITY FIREWALL BLOCK (Refuses access to keys, tokens, or guest data)
  if (
    lower.includes('api key') ||
    lower.includes('apikey') ||
    lower.includes('secret') ||
    lower.includes('token') ||
    lower.includes('password') ||
    lower.includes('guest id') ||
    lower.includes('guest_id') ||
    lower.includes('database path') ||
    lower.includes('system prompt')
  ) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: 'I am unable to share internal security credentials, private keys, or system tokens.',
    };
  }

  const expenseItems = expenses.filter(
    e => e.type === 'EXPENSE' || (!e.type && !e.categoryId.startsWith('cat-saving') && e.categoryId !== 'cat-income')
  );
  const savingItems = expenses.filter(e => e.type === 'SAVING' || e.categoryId.startsWith('cat-saving'));

  const totalExpenseUSD = expenseItems.reduce((sum, e) => sum + e.amount, 0);
  const totalSavingUSD = savingItems.reduce((sum, e) => sum + e.amount, 0);

  const amountMatch = prompt.match(/\$?(\d+(\.\d{1,2})?)/);
  const targetAmount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // 1. NORMAL CASUAL GREETINGS & SMALL TALK
  if (/^(hello|hi|hey|good morning|good evening|greetings|hola|sup)\b/i.test(lower)) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        'Hello! 😊 How are you doing today? What would you like to chat about or work on?'
      ),
    };
  }

  if (/^(thanks|thank you|awesome|great|cool|good job)\b/i.test(lower)) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        'You are very welcome! Feel free to ask me anything else anytime.'
      ),
    };
  }

  if (lower.includes('who are you') || lower.includes('what can you do') || lower === 'help') {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        'I am Agent, your AI assistant! You can chat with me naturally about any topic, ask questions, or ask me to log your expenses and savings.'
      ),
    };
  }

  // 2. TRANSACTION LOGGING INTENT (Explicit amount + action keyword)
  const isTransactionIntent =
    targetAmount > 0 &&
    (lower.includes('spent') ||
      lower.includes('paid') ||
      lower.includes('bought') ||
      lower.includes('save') ||
      lower.includes('saved') ||
      lower.includes('deposit') ||
      lower.includes('coffee') ||
      lower.includes('lunch') ||
      lower.includes('dinner') ||
      lower.includes('uber') ||
      lower.includes('food') ||
      lower.includes('vault'));

  if (isTransactionIntent) {
    const isSavingCommand =
      lower.includes('save') ||
      lower.includes('saved') ||
      lower.includes('deposit') ||
      lower.includes('vault') ||
      lower.includes('emergency') ||
      lower.includes('gold') ||
      lower.includes('stock');

    if (isSavingCommand) {
      const savingCat = categories.find(c => c.type === 'SAVING' || c.id.startsWith('cat-saving')) || categories[0];
      let cleanTitle = prompt
        .replace(/\$?(\d+(\.\d{1,2})?)/g, '')
        .replace(/\b(saved|save|deposit|deposited|in|to|vault|into)\b/gi, '')
        .trim();

      if (!cleanTitle) cleanTitle = 'Vault Deposit';
      const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      return {
        type: 'LOG_TRANSACTION',
        itemType: 'SAVING',
        title: formattedTitle,
        amount: targetAmount,
        categoryId: savingCat.id,
        categoryName: savingCat.name,
        categoryIcon: savingCat.icon,
        categoryColor: savingCat.color,
        responseText: sanitizeResponseText(
          `Awesome work! Recorded +$${targetAmount.toFixed(2)} to Vault (${formattedTitle}). Your total savings is now $${(totalSavingUSD + targetAmount).toFixed(2)}! 🎉`
        ),
      };
    }

    // Expense matching
    let selectedCat = categories[0];
    if (lower.includes('coffee') || lower.includes('latte') || lower.includes('tea') || lower.includes('espresso')) {
      selectedCat = categories.find(c => c.id === 'cat-coffee') || categories[0];
    } else if (
      lower.includes('food') ||
      lower.includes('lunch') ||
      lower.includes('dinner') ||
      lower.includes('noodle') ||
      lower.includes('burger')
    ) {
      selectedCat = categories.find(c => c.id === 'cat-food') || categories[0];
    } else if (lower.includes('grocery') || lower.includes('supermarket') || lower.includes('market')) {
      selectedCat = categories.find(c => c.id === 'cat-groceries') || categories[0];
    } else if (lower.includes('uber') || lower.includes('taxi') || lower.includes('gas') || lower.includes('fuel')) {
      selectedCat = categories.find(c => c.id === 'cat-transport') || categories[0];
    } else if (lower.includes('bill') || lower.includes('wifi') || lower.includes('internet')) {
      selectedCat = categories.find(c => c.id === 'cat-bills') || categories[0];
    }

    let cleanTitle = prompt
      .replace(/\$?(\d+(\.\d{1,2})?)/g, '')
      .replace(/\b(spent|paid|for|on|yesterday|today|bought)\b/gi, '')
      .trim();

    if (!cleanTitle) cleanTitle = selectedCat.name + ' Expense';
    const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    const newExpTotal = totalExpenseUSD + targetAmount;
    const remBudget = Math.max(0, monthlyBudget - newExpTotal);

    return {
      type: 'LOG_TRANSACTION',
      itemType: 'EXPENSE',
      title: formattedTitle,
      amount: targetAmount,
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      categoryIcon: selectedCat.icon,
      categoryColor: selectedCat.color,
      responseText: sanitizeResponseText(
        `Logged -$${targetAmount.toFixed(2)} under ${selectedCat.name} (${formattedTitle}). You have $${remBudget.toFixed(2)} remaining in your monthly budget! 💳`
      ),
    };
  }

  // 3. SMART BUDGET & SAVINGS PLANNING ENGINE
  if (
    lower.includes('plan') ||
    lower.includes('split') ||
    lower.includes('strategy') ||
    lower.includes('rule') ||
    lower.includes('recommend')
  ) {
    if (lower.includes('save') || lower.includes('saving') || lower.includes('vault') || lower.includes('goal')) {
      const goalVal = targetAmount > 0 ? targetAmount : savingGoal || 2000;
      const monthlyDeposit = (goalVal / 6).toFixed(2);
      const weeklyDeposit = (goalVal / 26).toFixed(2);
      const dailyDeposit = (goalVal / 180).toFixed(2);

      return {
        type: 'FINANCIAL_PLAN',
        responseText: sanitizeResponseText(
          `🎯 Smart Savings Plan for $${goalVal}:\n\n` +
            `• Monthly Deposit: $${monthlyDeposit} / mo\n` +
            `• Weekly Deposit: $${weeklyDeposit} / wk\n` +
            `• Daily Deposit: $${dailyDeposit} / day\n\n` +
            `💡 Tip: Automate a $${monthlyDeposit} transfer into your Vault at the start of every month to guarantee hitting your target in 6 months!`
        ),
      };
    }

    // Default 50/30/20 Budget Planning Strategy
    const budgetVal = targetAmount > 0 ? targetAmount : monthlyBudget || 1000;
    const needs = (budgetVal * 0.5).toFixed(2);
    const wants = (budgetVal * 0.3).toFixed(2);
    const savings = (budgetVal * 0.2).toFixed(2);

    return {
      type: 'FINANCIAL_PLAN',
      responseText: sanitizeResponseText(
        `📊 Recommended 50/30/20 Budget Plan for $${budgetVal}:\n\n` +
          `🏠 Needs (50%): $${needs} (Rent, Groceries, Bills, Transport)\n` +
          `☕ Wants (30%): $${wants} (Dining, Coffee, Fun, Shopping)\n` +
          `🔒 Savings (20%): $${savings} (Vault, Emergency & Goal Targets)\n\n` +
          `💡 Current Status: You spent $${totalExpenseUSD.toFixed(2)} and saved $${totalSavingUSD.toFixed(2)} this month.`
      ),
    };
  }

  // 4. FINANCIAL ADVICE & KNOWLEDGE ENGINE
  if (lower.includes('invest') || lower.includes('gold') || lower.includes('stock') || lower.includes('crypto')) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        '💡 **Investment Overview**:\n\n' +
          '• **Emergency Vault First**: Ensure you have 3–6 months of living expenses saved in your Vault before investing.\n' +
          '• **Diversification**: Spread investments across low-risk assets (Gold/High-yield savings) and index funds for long-term growth.'
      ),
    };
  }

  if (lower.includes('tip') || lower.includes('how to save') || lower.includes('cut') || lower.includes('reduce')) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        '💡 **Top 3 Money-Saving Tips**:\n\n' +
          '1. **Pay Yourself First**: Transfer 20% of your income to your Vault on payday.\n' +
          '2. **Audit Subscriptions**: Cancel unused memberships & recurring bills.\n' +
          '3. **The 48-Hour Rule**: Wait 2 days before buying non-essentials over $30 to stop impulse buys.'
      ),
    };
  }

  // 5. MATH & PERCENTAGE CALCULATIONS
  if (lower.includes('percent') || lower.includes('%') || lower.includes('math') || lower.includes('calculate')) {
    if (targetAmount > 0) {
      const pctVal = (targetAmount * 0.15).toFixed(2);
      return {
        type: 'FINANCIAL_QUERY',
        responseText: sanitizeResponseText(
          `🔢 Calculation: 15% of $${targetAmount} is **$${pctVal}**.`
        ),
      };
    }
  }

  // 6. NATURAL CONVERSATIONAL RESPONDER FOR ALL OTHER NORMAL CHAT TOPICS
  if (lower.includes('food') || lower.includes('eat') || lower.includes('dinner') || lower.includes('recipe')) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        'A balanced meal with fresh vegetables, protein (chicken or fish), and brown rice or noodles is always a great choice! What kind of food are you in the mood for?'
      ),
    };
  }

  if (lower.includes('weather') || lower.includes('rain') || lower.includes('sun') || lower.includes('hot')) {
    return {
      type: 'FINANCIAL_QUERY',
      responseText: sanitizeResponseText(
        'Stay hydrated and keep an umbrella handy if you are heading out!'
      ),
    };
  }

  return {
    type: 'FINANCIAL_QUERY',
    responseText: sanitizeResponseText(
      'That is an interesting topic! Tell me more about what you are thinking or ask me anything you would like to know.'
    ),
  };
};
