import React, { useState, useEffect, useRef } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { parseNaturalLanguageExpense } from '../services/aiAgentService';
import { Sparkles, X, Send, Bot, User, Zap, Mic } from 'lucide-react';
import { startVoiceRecognition } from '../services/speechService';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
}

export const AiChatModal: React.FC = () => {
  const {
    isAiChatOpen,
    setIsAiChatOpen,
    addExpense,
    categories,
    expenses,
    monthlyBudget,
    savingGoal,
  } = useExpenses();

  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(true);
    startVoiceRecognition(
      (text) => {
        setPromptText(text);
        setIsListening(false);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );
  };
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'AI',
      text: 'Agent online. How can I help you manage your budget, log expenses, or plan your savings today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to chat bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  return null;

  const handleSendPrompt = async (textToSend?: string) => {
    const query = textToSend || promptText;
    if (!query.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'USER',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setPromptText('');
    setIsProcessing(true);

    try {
      const result = await parseNaturalLanguageExpense(
        query,
        categories,
        expenses,
        monthlyBudget,
        savingGoal
      );

      if (result.type === 'LOG_TRANSACTION' && result.title && result.amount && result.amount > 0) {
        await addExpense({
          title: result.title,
          amount: result.amount,
          currency: 'USD',
          type: result.itemType || 'EXPENSE',
          categoryId: result.categoryId || categories[0].id,
          categoryName: result.categoryName || categories[0].name,
          categoryIcon: result.categoryIcon || categories[0].icon,
          categoryColor: result.categoryColor || categories[0].color,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Cash',
          notes: 'Added via Agent Assistant',
        });
      }

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'AI',
        text: result.responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: 'ai-err-' + Date.now(),
          sender: 'AI',
          text: 'Encountered an issue processing input.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-sheet-overlay" onClick={() => setIsAiChatOpen(false)}>
      <div
        className="modal-sheet-content"
        onClick={e => e.stopPropagation()}
        style={{ height: '560px' }}
      >
        {/* iOS Drag Handle */}
        <div className="modal-sheet-handle" />
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: 'rgba(108, 92, 231, 0.14)',
                border: '1px solid rgba(108, 92, 231, 0.35)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Agent
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsAiChatOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Thread Messages Box */}
        <div
          ref={chatContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingRight: '4px',
          }}
        >
          {messages.map(msg => {
            const isUser = msg.sender === 'USER';
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  gap: '10px',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '9px',
                    backgroundColor: isUser ? 'var(--accent)' : 'rgba(108, 92, 231, 0.15)',
                    color: isUser ? '#FFFFFF' : 'var(--accent)',
                    border: isUser ? 'none' : '1px solid rgba(108, 92, 231, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {isUser ? <User size={15} /> : <Bot size={15} />}
                </div>

                <div
                  style={{
                    maxWidth: '84%',
                    padding: '12px 14px',
                    borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    backgroundColor: isUser ? 'var(--accent)' : 'rgba(255, 255, 255, 0.05)',
                    border: isUser ? 'none' : '1px solid var(--border-glass)',
                    color: isUser ? '#FFFFFF' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line',
                    boxShadow: 'none',
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{msg.text}</div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: isUser ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)',
                      marginTop: '4px',
                      textAlign: isUser ? 'right' : 'left',
                      fontWeight: 600,
                    }}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Animated Typing Indicator state */}
          {isProcessing && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9px',
                  backgroundColor: 'rgba(108, 92, 231, 0.15)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(108, 92, 231, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={15} />
              </div>
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '4px 14px 14px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} className="animate-spin" color="var(--accent)" />
                <span>Agent is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingTop: '4px', paddingBottom: '2px' }}>
          {[
            'Hello Agent',
            'Make a budget plan',
            'Plan $2000 savings goal',
            'Spent $12.50 on lunch',
          ].map(chip => (
            <button
              key={chip}
              className="glass-pill"
              onClick={() => handleSendPrompt(chip)}
              disabled={isProcessing}
              style={{
                fontSize: '11px',
                padding: '6px 10px',
                whiteSpace: 'nowrap',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-glass)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                fontWeight: 600,
              }}
            >
              <Zap size={11} color="var(--accent)" />
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
            placeholder={isListening ? 'Listening... Speak now' : 'Ask anything or log expenses...'}
            disabled={isProcessing}
            style={{
              flex: 1,
              height: '44px',
              padding: '0 14px',
              borderRadius: '12px',
              border: isListening ? '1.5px solid var(--accent)' : '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isProcessing}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)',
              backgroundColor: isListening ? 'var(--accent-danger)' : 'rgba(255, 255, 255, 0.06)',
              color: isListening ? '#FFFFFF' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
            }}
            title="Voice Input"
          >
            <Mic size={18} />
          </button>

          <button
            onClick={() => handleSendPrompt()}
            disabled={isProcessing || !promptText.trim()}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--accent)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing || !promptText.trim() ? 0.5 : 1,
              boxShadow: 'none',
            }}
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
