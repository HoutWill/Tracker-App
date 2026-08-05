import React from 'react';
import {
  Utensils,
  Coffee,
  ShoppingCart,
  Car,
  Zap,
  ShoppingBag,
  Film,
  Cpu,
  Activity,
  Wallet,
  Receipt,
  PiggyBank,
  TrendingUp,
  Tag,
} from 'lucide-react';

interface Props {
  icon: string;
  size?: number;
  color?: string;
  className?: string;
}

export const CategoryIconRenderer: React.FC<Props> = ({ icon, size = 16, color = 'currentColor', className = '' }) => {
  const props = { size, color, className };

  switch (icon) {
    case 'fast-food-outline':
    case 'restaurant-outline':
    case 'utensils':
      return <Utensils {...props} />;
    case 'cafe-outline':
    case 'coffee':
    case 'nutrition-outline':
      return <Coffee {...props} />;
    case 'cart-outline':
    case 'shopping-cart':
      return <ShoppingCart {...props} />;
    case 'car-outline':
    case 'bonfire-outline':
    case 'car':
      return <Car {...props} />;
    case 'flash-outline':
    case 'zap':
      return <Zap {...props} />;
    case 'bag-handle-outline':
    case 'shopping-bag':
      return <ShoppingBag {...props} />;
    case 'film-outline':
    case 'film':
      return <Film {...props} />;
    case 'hardware-chip-outline':
    case 'cpu':
      return <Cpu {...props} />;
    case 'fitness-outline':
    case 'activity':
      return <Activity {...props} />;
    case 'wallet-outline':
    case 'wallet':
      return <Wallet {...props} />;
    case 'piggy-bank':
    case 'saving':
      return <PiggyBank {...props} />;
    case 'trending-up':
    case 'trade':
      return <TrendingUp {...props} />;
    case 'receipt-outline':
      return <Receipt {...props} />;
    default:
      return <Tag {...props} />;
  }
};
