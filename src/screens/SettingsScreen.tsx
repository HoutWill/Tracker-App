import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { StorageService } from '../services/storageService';
import { BackTapIcon } from '../components/SvgIcons';

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { currency, setCurrency, clearAllData, reloadExpenses } = useExpenses();

  const [geminiKey, setGeminiKey] = useState('');
  const [deepSeekKey, setDeepSeekKey] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [deepSeekSaveStatus, setDeepSeekSaveStatus] = useState('');

  useEffect(() => {
    StorageService.getGeminiApiKey().then(setGeminiKey);
    StorageService.getDeepSeekApiKey().then(setDeepSeekKey);
  }, []);

  const handleSaveGeminiKey = async () => {
    await StorageService.saveGeminiApiKey(geminiKey);
    setSaveStatus('✓ Gemini Key Saved!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleSaveDeepSeekKey = async () => {
    await StorageService.saveDeepSeekApiKey(deepSeekKey);
    setDeepSeekSaveStatus('✓ DeepSeek Key Saved!');
    setTimeout(() => setDeepSeekSaveStatus(''), 3000);
  };

  const handleResetData = async () => {
    await clearAllData();
    Alert.alert('Reset Complete', 'Database cleared and reset with sample data.');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bgMain }]}>
      <View style={styles.headerBox}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>⚙️ App Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Configure Currency, Theme, DeepSeek / Gemini AI Keys, and Back-Tap Shortcuts
        </Text>
      </View>

      {/* Section 1: Appearance & Currency */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>🎨 Appearance & Currency</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Notion Theme</Text>
          <TouchableOpacity
            style={[styles.btnPill, { backgroundColor: theme.bgMain, borderColor: theme.border }]}
            onPress={toggleTheme}
          >
            <Text style={[styles.btnPillText, { color: theme.textPrimary }]}>
              {isDark ? '🌙 Obsidian Dark' : '☀️ Paper Light'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.label, { color: theme.textPrimary }]}>Primary Currency</Text>
          <TouchableOpacity
            style={[styles.btnPill, { backgroundColor: theme.bgMain, borderColor: theme.border }]}
            onPress={() => setCurrency(currency === 'USD' ? 'KHR' : 'USD')}
          >
            <Text style={[styles.btnPillText, { color: theme.accent }]}>
              {currency === 'USD' ? '🇺🇸 USD ($)' : '🇰🇭 Riel (៛ KHR)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Section 2: DeepSeek AI Key Setup */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>🐳 DeepSeek AI Key (Active Engine)</Text>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Your DeepSeek API Key powers the conversational AI Agent with high-speed natural language parsing and financial analysis!
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.bgMain, color: theme.textPrimary, borderColor: theme.border }]}
          placeholder="sk-e31a4ca..."
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          value={deepSeekKey}
          onChangeText={setDeepSeekKey}
        />

        <View style={styles.keyActionRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSaveDeepSeekKey}>
            <Text style={styles.saveBtnText}>Save DeepSeek Key</Text>
          </TouchableOpacity>
          {deepSeekSaveStatus ? <Text style={[styles.statusText, { color: '#7EE787' }]}>{deepSeekSaveStatus}</Text> : null}
        </View>
      </View>

      {/* Section 3: Google Gemini AI Key Setup */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>🤖 Google Gemini AI Key (Fallback Engine)</Text>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Optional fallback engine if you also want Google Gemini API support.
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.bgMain, color: theme.textPrimary, borderColor: theme.border }]}
          placeholder="AIzaSy..."
          placeholderTextColor={theme.textMuted}
          secureTextEntry
          value={geminiKey}
          onChangeText={setGeminiKey}
        />

        <View style={styles.keyActionRow}>
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.accent }]} onPress={handleSaveGeminiKey}>
            <Text style={styles.saveBtnText}>Save Gemini Key</Text>
          </TouchableOpacity>
          {saveStatus ? <Text style={[styles.statusText, { color: '#7EE787' }]}>{saveStatus}</Text> : null}
        </View>
      </View>

      {/* Section 3: Back-Tap & Gesture Shortcut Guide */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <View style={styles.titleWithIcon}>
          <BackTapIcon size={20} color={theme.accent} />
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>📱 Back Tap / Gesture Shortcut</Text>
        </View>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          You can double-tap or triple-tap the back of your phone to open Quick Add instantly from anywhere!
        </Text>

        <View style={[styles.stepBox, { backgroundColor: theme.bgMain }]}>
          <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>iOS Setup (Back Tap):</Text>
          <Text style={[styles.stepText, { color: theme.textSecondary }]}>
            1. Open iOS Settings ➔ Accessibility ➔ Touch ➔ Back Tap.{'\n'}
            2. Choose "Double Tap" or "Triple Tap".{'\n'}
            3. Select "Shortcuts" and create a shortcut opening URI: <Text style={{ color: theme.accent, fontWeight: '700' }}>expensetracker://quick-add</Text>
          </Text>
        </View>
      </View>

      {/* Section 4: Data Maintenance */}
      <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>💾 Data Management</Text>

        <TouchableOpacity style={[styles.dangerBtn, { backgroundColor: '#492926' }]} onPress={handleResetData}>
          <Text style={styles.dangerBtnText}>Reset Database & Restore Samples</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  btnPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  btnPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  keyActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  saveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepText: {
    fontSize: 11,
    lineHeight: 16,
  },
  dangerBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerBtnText: {
    color: '#FF7B72',
    fontSize: 12,
    fontWeight: '800',
  },
});
