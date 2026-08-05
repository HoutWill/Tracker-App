import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { processAiQuery } from '../services/aiAgentService';
import { AiChatMessage } from '../types';
import { AiSparkleIcon } from './SvgIcons';

export const AiChatModal: React.FC = () => {
  const { theme } = useTheme();
  const { isAiChatOpen, setIsAiChatOpen, expenses, currency, addExpense } = useExpenses();

  const [inputMsg, setInputMsg] = useState('');
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'agent',
      text: "👋 Hi! I'm your **Expense AI Assistant**.\nAsk me to log expenses or query your spending analytics!",
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isAiChatOpen) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [isAiChatOpen, messages]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMsg;
    if (!textToSend.trim()) return;

    const userMsgObj: AiChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => (Array.isArray(prev) ? [...prev, userMsgObj] : [userMsgObj]));
    if (!customText) setInputMsg('');
    setIsTyping(true);

    // Call AI Agent Service
    const aiRes = await processAiQuery(textToSend, expenses, currency);

    // If AI wants to execute an action (e.g. log expense)
    if (aiRes.action && aiRes.action.type === 'ADD_EXPENSE') {
      const data = aiRes.action.expenseData;
      await addExpense({
        title: data.title,
        amount: data.amountUSD,
        currency: data.currency,
        amountOriginal: data.amountOriginal,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categoryIcon: data.categoryIcon,
        categoryColor: data.categoryColor,
        date: data.date,
        paymentMethod: data.paymentMethod,
        notes: data.notes || 'Logged via AI Chat Assistant',
      });
    }

    const agentMsgObj: AiChatMessage = {
      id: 'msg-' + (Date.now() + 1),
      sender: 'agent',
      text: aiRes.replyText,
      timestamp: Date.now(),
      actionTaken: aiRes.action,
    };

    setMessages(prev => (Array.isArray(prev) ? [...prev, agentMsgObj] : [agentMsgObj]));
    setIsTyping(false);
  };

  return (
    <Modal visible={isAiChatOpen} animationType="slide" transparent onRequestClose={() => setIsAiChatOpen(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: theme.bgCard, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.topRow}>
            <View style={styles.headTitleRow}>
              <AiSparkleIcon size={20} color="#D2A8FF" />
              <Text style={[styles.headTitle, { color: theme.textPrimary }]}>Expense AI Assistant</Text>
            </View>
            <TouchableOpacity onPress={() => setIsAiChatOpen(false)}>
              <Text style={[styles.closeBtn, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Prompt Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {[
              'Spent $15 on lunch',
              '20000 riel for iced coffee',
              'How much on food this month?',
              'Show total spent',
            ].map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.chip, { backgroundColor: theme.bgMain, borderColor: theme.border }]}
                onPress={() => handleSend(chip)}
              >
                <Text style={[styles.chipText, { color: theme.accent }]}>✨ {chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Chat Messages Log */}
          <ScrollView ref={scrollRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesList}>
            {messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.msgBubble,
                    isUser
                      ? [styles.userBubble, { backgroundColor: theme.accent }]
                      : [styles.agentBubble, { backgroundColor: theme.bgMain, borderColor: theme.border }],
                  ]}
                >
                  <Text style={[styles.msgText, { color: isUser ? '#FFF' : theme.textPrimary }]}>
                    {msg.text}
                  </Text>
                  {msg.actionTaken?.type === 'ADD_EXPENSE' && (
                    <View style={styles.actionTag}>
                      <Text style={styles.actionTagText}>✓ Logged to Database</Text>
                    </View>
                  )}
                </View>
              );
            })}

            {isTyping && (
              <View style={[styles.agentBubble, styles.msgBubble, { backgroundColor: theme.bgMain, borderColor: theme.border }]}>
                <ActivityIndicator size="small" color={theme.accent} />
              </View>
            )}
          </ScrollView>

          {/* Input Row */}
          <View style={[styles.inputRow, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: theme.bgMain, color: theme.textPrimary }]}
              placeholder="Ask AI or log an expense..."
              placeholderTextColor={theme.textMuted}
              value={inputMsg}
              onChangeText={setInputMsg}
              onSubmitEditing={() => handleSend()}
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: theme.accent }]}
              onPress={() => handleSend()}
            >
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    fontSize: 20,
    fontWeight: '700',
  },
  chipsScroll: {
    maxHeight: 34,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 10,
  },
  messagesList: {
    gap: 8,
    paddingVertical: 4,
  },
  msgBubble: {
    maxWidth: '85%',
    padding: 10,
    borderRadius: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2,
  },
  agentBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionTag: {
    backgroundColor: 'rgba(46, 170, 220, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  actionTagText: {
    color: '#2EAADC',
    fontSize: 10,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendBtn: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
