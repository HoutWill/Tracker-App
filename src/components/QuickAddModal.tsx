import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { parseNaturalLanguageExpense } from '../services/nlpParser';
import { QUICK_PRESETS } from '../constants/presets';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { CategoryBadge } from './CategoryBadge';
import { PaymentMethod, CurrencyCode } from '../types';
import { formatCurrency } from '../services/storageService';
import { PlusIcon } from './SvgIcons';

export const QuickAddModal: React.FC = () => {
  const { theme } = useTheme();
  const { isQuickAddOpen, setIsQuickAddOpen, addExpense, currency, categories } = useExpenses();

  const [nlText, setNlText] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [notes, setNotes] = useState('');
  const [useNLMode, setUseNLMode] = useState(true);

  useEffect(() => {
    if (isQuickAddOpen) {
      setSelectedCurrency(currency);
    }
  }, [isQuickAddOpen, currency]);

  // Real-time live natural language parse preview
  const parsedPreview = nlText ? parseNaturalLanguageExpense(nlText) : null;

  const handleSaveExpense = async () => {
    if (useNLMode && parsedPreview) {
      await addExpense({
        title: parsedPreview.title,
        amount: parsedPreview.amountUSD,
        currency: parsedPreview.currency,
        amountOriginal: parsedPreview.amountOriginal,
        categoryId: parsedPreview.categoryId,
        categoryName: parsedPreview.categoryName,
        categoryIcon: parsedPreview.categoryIcon,
        categoryColor: parsedPreview.categoryColor,
        date: parsedPreview.date,
        paymentMethod: parsedPreview.paymentMethod,
        notes: notes || parsedPreview.notes,
      });
    } else {
      const numVal = parseFloat(amountInput) || 0;
      if (!manualTitle || numVal <= 0) return;

      let usdValue = numVal;
      let original: number | undefined = undefined;
      if (selectedCurrency === 'KHR') {
        original = numVal;
        usdValue = Number((numVal / 4000).toFixed(2));
      }

      await addExpense({
        title: manualTitle,
        amount: usdValue,
        currency: selectedCurrency,
        amountOriginal: original,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        categoryColor: selectedCategory.color,
        date: new Date().toISOString().split('T')[0],
        paymentMethod,
        notes,
      });
    }

    // Reset & Close
    setNlText('');
    setManualTitle('');
    setAmountInput('');
    setNotes('');
    setIsQuickAddOpen(false);
  };

  const handleApplyPreset = async (preset: typeof QUICK_PRESETS[0]) => {
    const cat = categories.find(c => c.id === preset.categoryId) || DEFAULT_CATEGORIES[0];
    await addExpense({
      title: preset.title,
      amount: preset.amount,
      currency: preset.currency,
      categoryId: cat.id,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      categoryColor: cat.color,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Credit Card',
      notes: 'Quick preset tap',
    });
    setIsQuickAddOpen(false);
  };

  return (
    <Modal visible={isQuickAddOpen} animationType="slide" transparent onRequestClose={() => setIsQuickAddOpen(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Header Bar */}
          <View style={styles.topRow}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>⚡ Quick Add Expense</Text>
            <TouchableOpacity onPress={() => setIsQuickAddOpen(false)}>
              <Text style={[styles.closeBtn, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 1-Tap Presets Bar */}
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>1-Tap Presets:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
            {QUICK_PRESETS.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={[styles.presetChip, { backgroundColor: theme.bgMain, borderColor: theme.border }]}
                onPress={() => handleApplyPreset(preset)}
              >
                <Text style={styles.presetIcon}>{preset.icon}</Text>
                <Text style={[styles.presetTitle, { color: theme.textPrimary }]}>{preset.title}</Text>
                <Text style={[styles.presetAmount, { color: theme.accent }]}>
                  {formatCurrency(preset.amount, preset.currency)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Mode Switcher Tabs */}
          <View style={[styles.modeTabs, { backgroundColor: theme.bgMain }]}>
            <TouchableOpacity
              style={[styles.modeTab, useNLMode ? { backgroundColor: theme.bgCard } : null]}
              onPress={() => setUseNLMode(true)}
            >
              <Text style={[styles.modeTabText, { color: useNLMode ? theme.accent : theme.textMuted }]}>
                ✨ AI Natural Language
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, !useNLMode ? { backgroundColor: theme.bgCard } : null]}
              onPress={() => setUseNLMode(false)}
            >
              <Text style={[styles.modeTabText, { color: !useNLMode ? theme.accent : theme.textMuted }]}>
                📝 Form Input
              </Text>
            </TouchableOpacity>
          </View>

          {useNLMode ? (
            <View>
              {/* Natural Language Text Box */}
              <TextInput
                style={[styles.nlInput, { backgroundColor: theme.bgMain, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder='Try typing: "Spent $18.50 on sushi lunch" or "20000 riel for coffee yesterday"'
                placeholderTextColor={theme.textMuted}
                value={nlText}
                onChangeText={setNlText}
                multiline
                numberOfLines={3}
                autoFocus
              />

              {/* Parsed Live Preview Card */}
              {parsedPreview && (
                <View style={[styles.previewCard, { backgroundColor: theme.isDark ? '#1C2936' : '#EAF5FB', borderColor: theme.accent }]}>
                  <Text style={[styles.previewLabel, { color: theme.accent }]}>Live Parsed Preview:</Text>
                  <View style={styles.previewRow}>
                    <Text style={[styles.previewTitle, { color: theme.textPrimary }]}>{parsedPreview.title}</Text>
                    <Text style={[styles.previewPrice, { color: theme.textPrimary }]}>
                      {formatCurrency(parsedPreview.amountUSD, parsedPreview.currency)}
                    </Text>
                  </View>
                  <View style={styles.previewProps}>
                    <CategoryBadge name={parsedPreview.categoryName} icon={parsedPreview.categoryIcon} color={parsedPreview.categoryColor} size="sm" />
                    <Text style={[styles.previewMeta, { color: theme.textSecondary }]}>
                      📅 {parsedPreview.date} • 💳 {parsedPreview.paymentMethod}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <ScrollView style={styles.formScroll}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.bgMain, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Expense item (e.g. Dinner)"
                placeholderTextColor={theme.textMuted}
                value={manualTitle}
                onChangeText={setManualTitle}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Amount</Text>
              <View style={styles.amountRow}>
                <TextInput
                  style={[styles.formInput, { flex: 1, backgroundColor: theme.bgMain, color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="0.00"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={amountInput}
                  onChangeText={setAmountInput}
                />
                <TouchableOpacity
                  style={[styles.currBtn, { backgroundColor: theme.bgMain, borderColor: theme.border }]}
                  onPress={() => setSelectedCurrency(selectedCurrency === 'USD' ? 'KHR' : 'USD')}
                >
                  <Text style={[styles.currBtnText, { color: theme.textPrimary }]}>{selectedCurrency}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map(cat => {
                  const isSel = selectedCategory.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catChip, isSel && { borderColor: theme.accent, borderWidth: 1.5 }]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </ScrollView>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: theme.accent }]}
            onPress={handleSaveExpense}
            activeOpacity={0.8}
          >
            <PlusIcon size={18} color="#FFF" />
            <Text style={styles.submitBtnText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    padding: 16,
    maxHeight: '90%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    fontSize: 20,
    fontWeight: '700',
    padding: 4,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  presetScroll: {
    marginBottom: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  presetIcon: {
    fontSize: 14,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  presetAmount: {
    fontSize: 12,
    fontWeight: '800',
  },
  modeTabs: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 3,
    marginBottom: 12,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nlInput: {
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  previewCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  previewProps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewMeta: {
    fontSize: 11,
  },
  formScroll: {
    maxHeight: 220,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 6,
  },
  formInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
  },
  amountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  currBtn: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  catScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  catChip: {
    marginRight: 6,
    borderRadius: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
