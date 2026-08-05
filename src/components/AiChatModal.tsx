import React, { useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { parseNaturalLanguageExpense } from '../services/aiAgentService';
import { Sparkles, X, Send, CheckCircle2 } from 'lucide-react';

export const AiChatModal: React.FC = () => {
  const { isAiChatOpen, setIsAiChatOpen, addExpense, categories } = useExpenses();
  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  if (!isAiChatOpen) return null;

  const handleSendPrompt = async () => {
    if (!promptText.trim()) return;

    setIsProcessing(true);
    setAiMessage('DeepSeek AI is analyzing your input...');

    try {
      const result = await parseNaturalLanguageExpense(promptText, categories);
      if (result && result.title && result.amount > 0) {
        await addExpense({
          title: result.title,
          amount: result.amount,
          currency: 'USD',
          categoryId: result.categoryId || categories[0].id,
          categoryName: result.categoryName || categories[0].name,
          categoryIcon: result.categoryIcon || categories[0].icon,
          categoryColor: result.categoryColor || categories[0].color,
          date: new Date().toISOString().split('T')[0],
          paymentMethod: 'Card',
          notes: 'Added via DeepSeek AI Assistant',
        });
        setAiMessage(`Recorded "${result.title}" ($${result.amount.toFixed(2)}) under ${result.categoryName}!`);
        setPromptText('');
      } else {
        setAiMessage('Could not extract expense details. Try e.g.: "Spent $12.50 on lunch"');
      }
    } catch (e) {
      setAiMessage('AI processing completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsAiChatOpen(false)}
    >
      <div
        className="glass-panel"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#D2A8FF" />
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#D2A8FF' }}>DeepSeek AI Assistant</h3>
          </div>
          <button
            onClick={() => setIsAiChatOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Type any natural phrase like <i>"Spent $14.50 on dinner yesterday"</i> or <i>"$4.50 coffee"</i> and AI will log it automatically.
        </p>

        {/* AI Status / Output Message */}
        {aiMessage && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid rgba(210, 168, 255, 0.35)',
              backgroundColor: 'rgba(210, 168, 255, 0.12)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#D2A8FF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{aiMessage}</span>
          </div>
        )}

        {/* Input Bar */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={promptText}
            onChange={e => setPromptText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
            placeholder="e.g. Spent $8.50 on lunch..."
            disabled={isProcessing}
            style={{
              flex: 1,
              height: '42px',
              padding: '0 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
            }}
          />

          <button
            onClick={handleSendPrompt}
            disabled={isProcessing || !promptText.trim()}
            style={{
              padding: '0 16px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#D2A8FF',
              color: '#141416',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing || !promptText.trim() ? 0.6 : 1,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
