import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NotionColor } from '../types';
import { NOTION_TAG_COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  color: NotionColor;
  size?: 'sm' | 'md';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ name, icon, color, size = 'md' }) => {
  const { isDark } = useTheme();
  const colorSpec = NOTION_TAG_COLORS[color] || NOTION_TAG_COLORS.gray;

  const bg = isDark ? colorSpec.darkBg : colorSpec.lightBg;
  const textColor = isDark ? colorSpec.darkText : colorSpec.lightText;

  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall ? styles.badgeSm : null]}>
      {icon ? <Text style={[styles.iconText, isSmall ? styles.iconTextSm : null]}>{icon}</Text> : null}
      <Text style={[styles.label, { color: textColor }, isSmall ? styles.labelSm : null]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  iconText: {
    fontSize: 12,
    marginRight: 5,
  },
  iconTextSm: {
    fontSize: 10,
    marginRight: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 10,
  },
});
