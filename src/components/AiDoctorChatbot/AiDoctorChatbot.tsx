import React, { useState, useRef, useEffect } from 'react';
import styles from './AiDoctorChatbot.module.css';
import { Send, X, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import mascotImg from '../../assets/ai_doctor_mascot.png';
import avatarImg from '../../assets/ai_doctor_avatar.png';
import chatService, { ChatMessage } from '../../services/chatService';

interface ExtendedChatMessage extends ChatMessage {
  id: string;
  timestamp: string;
  disclaimer?: string;
}

const DEFAULT_SUGGESTIONS = [
  'What are normal blood pressure ranges?',
  'Explain stages of hypertension & lifestyle tips',
  'Common signs of iron deficiency anemia',
  'What are standard clinical vital signs?',
];

export const AiDoctorChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
    }
  }, [isOpen, messages, isTyping]);

  // Handle send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ExtendedChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Build history payload
      const historyPayload: ChatMessage[] = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatService.sendMessage(text, historyPayload);

      const botMsg: ExtendedChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        disclaimer: response.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg: ExtendedChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          "I'm currently unable to reach the clinical AI service. Please make sure the backend server is running, or consult an attending physician for immediate questions.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([]);
  };

  const formatBotText = (text: string) => {
    // Parse simple markdown: paragraphs and bold asterisks
    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      // Check for bullet lists
      if (para.includes('\n* ') || para.startsWith('* ')) {
        const lines = para.split('\n').filter(Boolean);
        return (
          <ul key={pIdx}>
            {lines.map((line, lIdx) => {
              const cleanLine = line.replace(/^\*\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
              return (
                <li
                  key={lIdx}
                  dangerouslySetInnerHTML={{ __html: cleanLine }}
                />
              );
            })}
          </ul>
        );
      }

      const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return (
        <p
          key={pIdx}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Mascot Button */}
      {!isOpen && (
        <div className={styles.floatingTrigger}>
          <div
            className={styles.botButton}
            onClick={() => setIsOpen(true)}
            title="Chat with AI Medical Assistant"
            role="button"
            tabIndex={0}
            aria-label="Open AI Doctor Chatbot"
          >
            <img
              src={mascotImg}
              alt="AI Doctor Mascot"
              className={styles.mascotImage}
            />
            <div className={styles.hoverShadow} />
            <span className={styles.statusDot} />
          </div>
        </div>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatarContainer}>
                <img
                  src={avatarImg}
                  alt="Dr. MediBot"
                  className={styles.headerAvatar}
                />
                <span className={styles.headerAvatarDot} />
              </div>
              <div className={styles.headerInfo}>
                <h3>Dr. MediBot</h3>
                <p>
                  <Sparkles size={11} color="#67e8f9" />
                  AI Medical Assistant • Online
                </p>
              </div>
            </div>

            <div className={styles.headerActions}>
              {messages.length > 0 && (
                <button
                  type="button"
                  className={styles.headerActionBtn}
                  onClick={handleClearHistory}
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw size={14} />
                </button>
              )}
              <button
                type="button"
                className={styles.headerActionBtn}
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          <div className={styles.chatBody}>
            {messages.length === 0 && (
              <div className={styles.welcomeCard}>
                <img
                  src={mascotImg}
                  alt="Dr. MediBot Mascot"
                  className={styles.welcomeMascot}
                />
                <h4 className={styles.welcomeTitle}>Welcome to MediBot AI</h4>
                <p className={styles.welcomeDesc}>
                  I'm your intelligent clinical assistant. Ask me questions regarding vital indicators,
                  clinical concepts, diagnoses, or healthcare guidance.
                </p>

                <div className={styles.suggestionGrid}>
                  {DEFAULT_SUGGESTIONS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={styles.suggestionChip}
                      onClick={() => handleSendMessage(item)}
                    >
                      <Sparkles size={12} color="var(--color-primary)" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`${styles.messageRow} ${
                  msg.role === 'user' ? styles.userRow : styles.botRow
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.botAvatar}>
                    <img src={avatarImg} alt="Dr. MediBot" />
                  </div>
                )}
                <div
                  className={`${styles.messageBubble} ${
                    msg.role === 'user' ? styles.userBubble : styles.botBubble
                  }`}
                >
                  {msg.role === 'user' ? (
                    <div>{msg.content}</div>
                  ) : (
                    <div>{formatBotText(msg.content)}</div>
                  )}

                  {msg.disclaimer && (
                    <div className={styles.disclaimerNotice}>
                      <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {msg.disclaimer}
                    </div>
                  )}

                  <span className={styles.messageTime}>{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className={`${styles.messageRow} ${styles.botRow}`}>
                <div className={styles.botAvatar}>
                  <img src={avatarImg} alt="Dr. MediBot" />
                </div>
                <div className={styles.typingIndicator}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chat Footer */}
          <div className={styles.chatFooter}>
            <form
              className={styles.inputForm}
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className={styles.chatInput}
                placeholder="Ask Dr. MediBot about health, vitals..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isTyping}
              />
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!inputMessage.trim() || isTyping}
                title="Send message"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
            <p className={styles.footerDisclaimer}>
              AI Medical Assistant for educational guidance. Consult a doctor for diagnosis.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AiDoctorChatbot;
