import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExpenseItem, CurrencyCode } from '../types';
import { StorageService, formatCurrency } from './storageService';
import { parseNaturalLanguageExpense } from './nlpParser';

export interface AiResponse {
  replyText: string;
  action?: {
    type: 'ADD_EXPENSE' | 'FILTER_VIEW' | 'QUERY_RESULT';
    expenseData?: any;
  };
}

export const processAiQuery = async (
  userMessage: string,
  expenses: ExpenseItem[],
  activeCurrency: CurrencyCode
): Promise<AiResponse> => {
  const deepSeekKey = await StorageService.getDeepSeekApiKey();
  const geminiKey = await StorageService.getGeminiApiKey();
  const lowerMsg = userMessage.toLowerCase().trim();

  const summaryContext = expenses.map(e => `${e.date}: ${e.title} - $${e.amount} (${e.categoryName})`).join('\n');

  // -------------------------------------------------------------
  // 1. Try DeepSeek AI API (Recommended - Powerful LLM Engine)
  // -------------------------------------------------------------
  if (deepSeekKey) {
    try {
      const systemPrompt = `You are a helpful Notion-style personal Expense AI Assistant powered by DeepSeek.
User active currency view: ${activeCurrency}.
Here is the user's recent expense log:
${summaryContext || 'No expenses logged yet.'}

Instructions:
1. If the user wants to log an expense (e.g. "Add $15 for sushi lunch"), reply concisely confirming the details.
2. If the user asks a question about spending (e.g. "How much did I spend on food?"), calculate accurately from the provided log data and respond clearly.
3. Keep responses concise, helpful, and friendly with emojis.`;

      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepSeekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const textResponse = data.choices?.[0]?.message?.content;

        if (textResponse) {
          // Check if user intends to log an expense
          if (/add|spent|log|bought|paid/i.test(userMessage)) {
            const parsed = parseNaturalLanguageExpense(userMessage);
            if (parsed.amountUSD > 0) {
              return {
                replyText: textResponse,
                action: {
                  type: 'ADD_EXPENSE',
                  expenseData: parsed,
                },
              };
            }
          }
          return { replyText: textResponse };
        }
      }
    } catch (e) {
      console.warn('DeepSeek API request error, falling back:', e);
    }
  }

  // -------------------------------------------------------------
  // 2. Try Google Gemini API (Fallback Online LLM Engine)
  // -------------------------------------------------------------
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a helpful Notion-style personal Expense AI Assistant.
User currency view: ${activeCurrency}.
Here is the user's recent expense log:
${summaryContext}

User Query: "${userMessage}"`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();

      if (/add|spent|log|bought|paid/i.test(userMessage)) {
        const parsed = parseNaturalLanguageExpense(userMessage);
        if (parsed.amountUSD > 0) {
          return {
            replyText: textResponse || `Logged **${parsed.title}** for **${formatCurrency(parsed.amountUSD, activeCurrency)}**.`,
            action: {
              type: 'ADD_EXPENSE',
              expenseData: parsed,
            },
          };
        }
      }

      if (textResponse) return { replyText: textResponse };
    } catch (e) {
      console.warn('Gemini API request error, falling back:', e);
    }
  }

  // -------------------------------------------------------------
  // 3. Offline Smart Engine (Zero Network Latency Fallback)
  // -------------------------------------------------------------
  if (/add|spent|log|bought|paid/i.test(lowerMsg) || /\d+/.test(lowerMsg)) {
    const parsed = parseNaturalLanguageExpense(userMessage);
    if (parsed.amountUSD > 0) {
      return {
        replyText: `Got it! Logged **${parsed.title}** for **${formatCurrency(parsed.amountUSD, activeCurrency)}** (${parsed.categoryName} ${parsed.categoryIcon}) on **${parsed.date}**.`,
        action: {
          type: 'ADD_EXPENSE',
          expenseData: parsed,
        },
      };
    }
  }

  if (/how much|total|spending|spent|summary|balance/i.test(lowerMsg)) {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    if (/food|lunch|dinner|restaurant|coffee/i.test(lowerMsg)) {
      const foodItems = expenses.filter(e => /food|coffee/i.test(e.categoryName) || /food|coffee/i.test(e.categoryId));
      const foodTotalUSD = foodItems.reduce((acc, curr) => acc + curr.amount, 0);
      return {
        replyText: `🍔 You have spent **${formatCurrency(foodTotalUSD, activeCurrency)}** on **Food & Drinks** across ${foodItems.length} entries.`,
      };
    }

    const totalUSD = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    return {
      replyText: `📊 Total logged balance is **${formatCurrency(totalUSD, activeCurrency)}** across **${expenses.length}** transactions.`,
    };
  }

  return {
    replyText: `👋 Hello! I'm your **Expense AI Assistant** powered by DeepSeek.\n\nYou can ask me:\n- *"Add $15 for sushi lunch"*\n- *"Spent 20,000 riel on iced coffee"*\n- *"How much did I spend on food?"*`,
  };
};
