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
  Laptop,
  Smartphone,
  Home,
  Plane,
  Gift,
  Briefcase,
  Heart,
  BookOpen,
  Music,
  Gamepad2,
  Dumbbell,
  Scissors,
  ShieldCheck,
  Lock,
  Target,
  Coins,
  DollarSign,
  CreditCard,
  Sparkles,
  Globe,
  Wifi,
  Camera,
  Tv,
  Flame,
  Building,
  GraduationCap,
  Shirt,
  Bus,
  Users,
  PartyPopper,
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
    case 'food':
      return <Utensils {...props} />;
    case 'cafe-outline':
    case 'coffee':
    case 'drink':
      return <Coffee {...props} />;
    case 'cart-outline':
    case 'shopping-cart':
    case 'groceries':
      return <ShoppingCart {...props} />;
    case 'car-outline':
    case 'bonfire-outline':
    case 'car':
    case 'transport':
      return <Car {...props} />;
    case 'bus':
      return <Bus {...props} />;
    case 'plane':
    case 'travel':
      return <Plane {...props} />;
    case 'users':
    case 'team':
    case 'teamwork':
      return <Users {...props} />;
    case 'party-popper':
    case 'party':
      return <PartyPopper {...props} />;
    case 'flash-outline':
    case 'zap':
    case 'electricity':
    case 'bills':
      return <Zap {...props} />;
    case 'bag-handle-outline':
    case 'shopping-bag':
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'shirt':
    case 'apparel':
      return <Shirt {...props} />;
    case 'film-outline':
    case 'film':
    case 'entertainment':
    case 'cinema':
      return <Film {...props} />;
    case 'tv':
    case 'subscriptions':
      return <Tv {...props} />;
    case 'gamepad2':
    case 'game-controller':
    case 'gaming':
    case 'fun':
      return <Gamepad2 {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'hardware-chip-outline':
    case 'cpu':
    case 'tech':
      return <Cpu {...props} />;
    case 'laptop':
      return <Laptop {...props} />;
    case 'smartphone':
    case 'phone':
      return <Smartphone {...props} />;
    case 'fitness-outline':
    case 'activity':
    case 'health':
      return <Activity {...props} />;
    case 'dumbbell':
    case 'gym':
      return <Dumbbell {...props} />;
    case 'heart':
      return <Heart {...props} />;
    case 'wallet-outline':
    case 'wallet':
      return <Wallet {...props} />;
    case 'piggy-bank':
    case 'saving':
    case 'vault':
      return <PiggyBank {...props} />;
    case 'trending-up':
    case 'trade':
    case 'stocks':
    case 'investment':
      return <TrendingUp {...props} />;
    case 'receipt-outline':
    case 'receipt':
      return <Receipt {...props} />;
    case 'home':
    case 'house':
    case 'rent':
      return <Home {...props} />;
    case 'gadget':
      return <Laptop {...props} />;
    case 'building':
      return <Building {...props} />;
    case 'gift':
      return <Gift {...props} />;
    case 'briefcase':
    case 'salary':
    case 'income':
      return <Briefcase {...props} />;
    case 'book-open':
    case 'education':
      return <BookOpen {...props} />;
    case 'graduation-cap':
      return <GraduationCap {...props} />;
    case 'scissors':
    case 'beauty':
      return <Scissors {...props} />;
    case 'shield-checkmark':
    case 'shield-check':
    case 'insurance':
    case 'emergency':
      return <ShieldCheck {...props} />;
    case 'lock-closed':
    case 'lock':
      return <Lock {...props} />;
    case 'target':
    case 'goal':
      return <Target {...props} />;
    case 'coins':
    case 'gold':
      return <Coins {...props} />;
    case 'card':
    case 'credit-card':
      return <CreditCard {...props} />;
    case 'sparkles':
    case 'crypto':
      return <Sparkles {...props} />;
    case 'globe':
      return <Globe {...props} />;
    case 'wifi':
    case 'internet':
      return <Wifi {...props} />;
    case 'camera':
      return <Camera {...props} />;
    case 'flame':
      return <Flame {...props} />;
    default:
      return <Tag {...props} />;
  }
};
