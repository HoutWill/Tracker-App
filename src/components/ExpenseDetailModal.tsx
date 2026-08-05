import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { CategoryBadge } from './CategoryBadge';
import { formatCurrency } from '../services/storageService';

export const ExpenseDetailModal: React.FC = () => {
  const { theme } = useTheme();
  const { selectedExpenseForEdit, setSelectedExpenseForEdit, updateExpense, deleteExpense, currency } = useExpenses();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedExpenseForEdit) {
      setTitle(selectedExpenseForEdit.title);
      setAmount(selectedExpenseForEdit.amount.toString());
      setNotes(selectedExpenseForEdit.notes || '');
    }
  }, [selectedExpenseForEdit]);

  if (!selectedExpenseForEdit) return null;

  const handleUpdate = async () => {
    const num = parseFloat(amount);
    if (!title || isNaN(num) || num <= 0) return;

    await updateExpense(selectedExpenseForEdit.id, {
      title,
      amount: num,
      notes,
    });
    setSelectedExpenseForEdit(null);
  };

  const handleDelete = async () => {
    await deleteExpense(selectedExpenseForEdit.id);
    setSelectedExpenseForEdit(null);
  };

  return (
    <Modal
      visible={!!selectedExpenseForEdit}
      animationType="fade"
      transparent
      onRequestClose={() => setSelectedExpenseForEdit(null)}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.topRow}>
            <Text style={styles.emojiHead}>{selectedExpenseForEdit.categoryIcon}</Text>
            <TouchableOpacity onPress={() => setSelectedExpenseForEdit(null)}>
              <Text style={[styles.closeBtn, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notion Page Details</Text>

          {/* Property Rows */}
          <View style={styles.propGrid}>
            <View style={styles.propRow}>
              <Text style={[styles.propName, { color: theme.textSecondary }]}>Title</Text>
              <TextInput
                style={[styles.propValInput, { color: theme.textPrimary, borderColor: theme.border }]}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.propRow}>
              <Text style={[styles.propName, { color: theme.textSecondary }]}>Amount (USD)</Text>
              <TextInput
                style={[styles.propValInput, { color: theme.textPrimary, borderColor: theme.border }]}
                value={amount}
                keyboardType="numeric"
                onChangeText={setAmount}
              />
            </View>

            <View style={styles.propRow}>
              <Text style={[styles.propName, { color: theme.textSecondary }]}>Category</Text>
              <CategoryBadge
                name={selectedExpenseForEdit.categoryName}
                icon={selectedExpenseForEdit.categoryIcon}
                color={selectedExpenseForEdit.categoryColor}
              />
            </View>

            <View style={styles.propRow}>
              <Text style={[styles.propName, { color: theme.textSecondary }]}>Date</Text>
              <Text style={[styles.propText, { color: theme.textPrimary }]}>{selectedExpenseForEdit.date}</Text>
            </View>

            <View style={styles.propRow}>
              <Text style={[styles.propName, { color: theme.textSecondary }]}>Payment</Text>
              <Text style={[styles.propText, { color: theme.textPrimary }]}>{selectedExpenseForEdit.paymentMethod}</Text>
            </View>

            <View style={styles.propRow}>
              <Text style={[styles.propName, { color: theme.textSecondary }]}>Notes</Text>
              <TextInput
                style={[styles.propValInput, { color: theme.textPrimary, borderColor: theme.border, height: 50 }]}
                value={notes}
                multiline
                onChangeText={setNotes}
                placeholder="Add notes..."
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: '#492926' }]} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>Delete Block</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleUpdate}>
              <Text style={styles.saveBtnText}>Save Property Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emojiHead: {
    fontSize: 32,
  },
  closeBtn: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginVertical: 10,
  },
  propGrid: {
    gap: 10,
    marginBottom: 16,
  },
  propRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propName: {
    fontSize: 12,
    fontWeight: '600',
    width: 90,
  },
  propValInput: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  propText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FF7B72',
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
