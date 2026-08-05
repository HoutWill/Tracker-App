import { QuickPreset } from '../types';

export const QUICK_PRESETS: QuickPreset[] = [
  { id: 'preset-coffee-usd', title: 'Espresso / Coffee', amount: 3.5, currency: 'USD', categoryId: 'cat-coffee', icon: '☕' },
  { id: 'preset-coffee-khr', title: 'Iced Coffee (៛)', amount: 2.5, currency: 'USD', categoryId: 'cat-coffee', icon: '🥤' }, // 10,000 KHR = $2.50
  { id: 'preset-lunch', title: 'Lunch Meal', amount: 12.0, currency: 'USD', categoryId: 'cat-food', icon: '🍱' },
  { id: 'preset-dinner', title: 'Dinner Bowl', amount: 18.5, currency: 'USD', categoryId: 'cat-food', icon: '🍜' },
  { id: 'preset-ride', title: 'Taxi / Ride', amount: 5.0, currency: 'USD', categoryId: 'cat-transport', icon: '🚕' },
  { id: 'preset-groceries', title: 'Supermarket Quick', amount: 35.0, currency: 'USD', categoryId: 'cat-groceries', icon: '🛒' },
];
