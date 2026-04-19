import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Send, Loader, Brain, Sparkles, Minimize2, Maximize2, Trash2, ExternalLink } from 'lucide-react';
import { tolzyAI, ChatMessage } from '../../services/tolzy-ai.service';
import { chatHistoryService } from '../../services/chat-history.service';
import { useAuth } from '../../context/AuthContext';
import ToolCard from '../Copilot/ToolCard';
import SmartCourseCard from '../learn/SmartCourseCard';
import { useRouter } from 'next/router'; // Assuming you might need it for navigation if not using Link internally

const TolzyAIChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const [aiModel, setAiModel] = useState<'v1' | 'v2'>('v2');
  const thinkingStartTimeRef = useRef<number | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // إخفاء رسالة الترحيب بعد 10 ثواني أو عند فتح الشات
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeTooltip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowWelcomeTooltip(false);
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history from Firebase when user is authenticated
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user) {
        // إذا لم يكن المستخدم مسجل الدخول، استخدم localStorage كبديل
        try {
          const savedHistory = localStorage.getItem('tolzy_ai_chat_history');
          if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            const messagesWithDates = parsedHistory.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setMessages(messagesWithDates);
            console.log('✅ تم تحميل المحادثات من localStorage (غير مسجل الدخول)');
          }
        } catch (error) {
          console.error('❌ خطأ في تحميل المحادثات من localStorage:', error);
        }
        return;
      }

      // تحميل المحادثات من Firebase للمستخدم المسجل
      try {
        const firebaseMessages = await chatHistoryService.getMessages(user.uid);
        if (firebaseMessages.length > 0) {
          setMessages(firebaseMessages);
        }
      } catch (error) {
        console.error('❌ خطأ في تحميل المحادثات من Firebase:', error);
      }
    };

    loadChatHistory();
  }, [user]);

  // Save chat history to Firebase or localStorage
  useEffect(() => {
    if (messages.length === 0) return;

    const saveMessages = async () => {
      if (user) {
        // حفظ في Firebase للمستخدمين المسجلين
        // لا نحفظ كل مرة، فقط عند إضافة رسالة جديدة
        // سيتم الحفظ في handleSendMessage
      } else {
        // حفظ في localStorage للمستخدمين غير المسجلين
        try {
          localStorage.setItem('tolzy_ai_chat_history', JSON.stringify(messages));
          console.log('💾 تم حفظ المحادثة في localStorage');
        } catch (error) {
          console.error('❌ خطأ في حفظ المحادثات:', error);
        }
      }
    };

    saveMessages();
  }, [messages, user]);

  // Initialize Tolzy AI when chat opens (only if no history)
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      await tolzyAI.initialize();

      // تحديث قاعدة بيانات الأدوات عند فتح الشات
      const updateInfo = tolzyAI.getLastUpdateInfo();
      console.log(`📊 Tolzy AI: ${updateInfo.toolsCount} أداة متاحة`);
      if (updateInfo.lastUpdate) {
        console.log(`🕒 آخر تحديث: ${updateInfo.lastUpdate.toLocaleString('ar-EG')}`);
      }

      // Welcome message
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `مرحباً! 👋 أنا **Tolzy AI**، مساعدك الذكي في عالم أدوات الذكاء الاصطناعي.

🎯 **كيف يمكنني مساعدتك؟**

يمكنني:
✨ اقتراح أفضل الأدوات لاحتياجاتك
🔍 البحث عن أدوات محددة
💡 شرح مميزات أي أداة
⚖️ المقارنة بين الأدوات المختلفة

**جرّب سؤالي:**
- "ما هي أفضل أداة لكتابة المحتوى؟"
- "أريد أداة مجانية للتصميم"
- "أدوات لتحسين الإنتاجية"

📊 لدي معلومات عن **${updateInfo.toolsCount}** أداة محدثة!`,
        timestamp: new Date()
      };

      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // حفظ رسالة المستخدم في Firebase
    if (user) {
      try {
        await chatHistoryService.saveMessage(user.uid, userMessage);
      } catch (error) {
        console.error('خطأ في حفظ رسالة المستخدم:', error);
      }
    }

    try {
      // Create empty AI message with thoughts array
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: '',
        thoughts: [],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      const messageIndex = messages.length + 1;

      thinkingStartTimeRef.current = Date.now();
      const stream = tolzyAI.streamChat(inputMessage, messages, aiModel);
      
      // --- Typewriter Effect Setup ---
      // charQueue holds characters waiting to be displayed one-by-one
      const typewriterState = { queue: '', finalContent: '', done: false, thinkingTime: 0 };
      let currentThoughts: string[] = [];
      let typedSoFar = '';
      let thinkingRecorded = false;

      const typewriterInterval = setInterval(() => {
        if (typewriterState.queue.length > 0) {
          // Display next character
          const nextChar = typewriterState.queue[0];
          typewriterState.queue = typewriterState.queue.slice(1);
          typedSoFar += nextChar;
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[messageIndex]) {
              newMessages[messageIndex] = {
                ...newMessages[messageIndex],
                content: typedSoFar,
                thinkingTime: typewriterState.thinkingTime > 0 ? typewriterState.thinkingTime : undefined
              };
            }
            return newMessages;
          });
          // Auto-scroll if near bottom
          const chatContainer = messagesEndRef.current?.parentElement;
          if (chatContainer) {
            const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 150;
            if (isNearBottom) scrollToBottom();
          }
        } else if (typewriterState.done) {
          // Stream finished, flush any remaining chars instantly then stop
          clearInterval(typewriterInterval);
          if (typedSoFar !== typewriterState.finalContent) {
            setMessages(prev => {
              const newMessages = [...prev];
              if (newMessages[messageIndex]) {
                newMessages[messageIndex] = { ...newMessages[messageIndex], content: typewriterState.finalContent };
              }
              return newMessages;
            });
            typedSoFar = typewriterState.finalContent;
          }
        }
      }, 18); // ~18ms per char ≈ 55 chars/sec

      for await (const chunk of stream) {
        if (chunk.thought) {
          currentThoughts = [chunk.thought];
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[messageIndex]) {
              newMessages[messageIndex] = { ...newMessages[messageIndex], thoughts: [...currentThoughts] };
            }
            return newMessages;
          });
        }

        if (chunk.content !== undefined && chunk.content !== '') {
          // Record thinking duration on first content chunk
          if (!thinkingRecorded && thinkingStartTimeRef.current) {
            typewriterState.thinkingTime = (Date.now() - thinkingStartTimeRef.current) / 1000;
            thinkingRecorded = true;
            setExpandedThoughts(prev => ({ ...prev, [messageIndex]: false }));
          }
          // Append only the NEW characters to the queue
          const newChars = chunk.content.slice(typedSoFar.length + typewriterState.queue.length);
          typewriterState.queue += newChars;
          typewriterState.finalContent = chunk.content;
        }
      }

      // Signal stream is done; interval will flush and stop
      typewriterState.done = true;

      // Save final response
      if (user) {
        try {
          // Wait a bit for typewriter to finish flushing before saving
          await new Promise(r => setTimeout(r, 500));
          await chatHistoryService.saveMessage(user.uid, {
            ...aiMessage,
            content: typewriterState.finalContent,
            thoughts: currentThoughts
          });
        } catch (error) {
          console.error('Error saving to Firebase:', error);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'عذراً، حدث خطأ.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ... (renderMessageContent removed)

  const handleClearHistory = async () => {
    if (!window.confirm('هل أنت متأكد من حذف جميع المحادثات؟')) return;

    try {
      if (user) {
        // حذف من Firebase
        await chatHistoryService.clearMessages(user.uid);
      } else {
        // حذف من localStorage
        localStorage.removeItem('tolzy_ai_chat_history');
      }

      setMessages([]);
      console.log('🗑️ تم مسح المحادثات');

      // Re-initialize with welcome message
      initializeChat();
    } catch (error) {
      console.error('خطأ في مسح المحادثات:', error);
      alert('حدث خطأ أثناء مسح المحادثات');
    }
  };

  if (!isOpen) {
    return (
      <>
        {/* Welcome Tooltip */}
        {showWelcomeTooltip && (
          <div className="fixed hidden sm:block bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 animate-fade-in">
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setShowWelcomeTooltip(false)}
                className="absolute -top-2 -left-2 w-6 h-6 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10"
                aria-label="Close welcome message"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Welcome Card */}
              <div className="relative bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border-2 border-blue-200 dark:border-blue-800 p-5 max-w-xs sm:max-w-sm overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-2xl animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-indigo-400 to-pink-400 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative">
                  {/* Header with Icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                        Tolzy AI
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">مساعدك الشخصي</p>
                    </div>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-right">
                    مرحباً بك! معك <span className="font-bold text-blue-600 dark:text-blue-400">Tolzy AI</span> مساعدك الشخصي في هذا العالم 🌟
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      <span>اكتشف أفضل الأدوات</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <span>احصل على توصيات ذكية</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      <span>إجابات فورية على أسئلتك</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>ابدأ المحادثة</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                {/* Arrow pointing to chat button */}
                <div className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 border-r-2 border-b-2 border-blue-200 dark:border-blue-800 transform rotate-45"></div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Button with Label */}
        <div className="fixed hidden sm:flex bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 items-center gap-3">
          {/* Desktop: Label Strip */}
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-in-right">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Tolzy AI</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">مساعدك الشخصي</span>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          {/* Chat Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 group"
            aria-label="Open Tolzy AI Chat"
          >
            <div className="relative">
              <Brain className="h-6 w-6" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
          </button>
        </div>
      </>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${isMinimized
        ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-72 sm:w-80 h-16'
        : 'inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] sm:max-h-[80vh]'
        }`}
    >
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-base sm:text-lg flex items-center gap-1">
                Tolzy AI
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs hidden sm:block">مساعدك الشخصي</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Model Selector */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg mr-2">
              <button 
                onClick={() => setAiModel('v1')}
                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-1 rounded-md transition-all ${aiModel === 'v1' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold text-blue-600' : 'text-gray-500'}`}
              >
                Copilot V1
              </button>
              <button 
                onClick={() => setAiModel('v2')}
                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-1 rounded-md transition-all ${aiModel === 'v2' ? 'bg-white dark:bg-gray-600 shadow-sm font-bold text-blue-600' : 'text-gray-500'}`}
              >
                V2 (Thinking)
              </button>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-colors"
              aria-label="Clear chat history"
              title="مسح المحادثات"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-colors hidden sm:block"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 p-1.5 sm:p-2 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              {isInitializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">جاري التحميل...</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                          }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <Brain className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Tolzy AI</span>
                          </div>
                        )}

                        <div className="text-xs sm:text-sm leading-relaxed" dir="rtl">
                          {message.role === 'assistant' && (message.thoughts && message.thoughts.length > 0) && (
                            <div className="w-full mb-3 animate-in fade-in slide-in-from-top-2 duration-500">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles size={14} className="text-blue-500 animate-pulse" />
                                  <button 
                                      onClick={() => setExpandedThoughts(prev => ({ ...prev, [index]: !prev[index] }))}
                                      className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors bg-blue-50/50 dark:bg-gray-800/50 px-2.5 py-1 rounded-full border border-blue-100/50 dark:border-gray-700/50 shadow-sm"
                                  >
                                      <span>عرض طريقة التفكير</span>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${expandedThoughts[index] ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                                  </button>
                                </div>
                                {message.thinkingTime !== undefined && (
                                   <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
                                       {message.thinkingTime}s
                                   </span>
                                )}
                              </div>
                              <AnimatePresence>
                                {expandedThoughts[index] && (
                                  <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                  >
                                      <div className="mr-2 pl-3 border-l-2 border-blue-200 dark:border-blue-900/50 py-1.5 text-[12px] font-medium text-gray-600 dark:text-gray-400 italic whitespace-pre-wrap leading-relaxed">
                                          {message.thoughts.join('\n') || "جاري التفكير وجمع المعلومات..."}
                                      </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                          <ReactMarkdown
                            components={{
                              a: ({ node, ...props }) => {
                                const href = props.href || '';
                                const isInternal = href.startsWith('/') || href.includes('tolzy.me');
                                const isToolLink = href.includes('/tools/');
                                const content = String(props.children);
                                const isUrlText = content.startsWith('http') || content.startsWith('www');

                                // Unified label for all raw URLs as requested
                                const label = isUrlText ? '🔗 عرض الأداة' : props.children;
                                const buttonClass = "inline-flex items-center gap-2 px-3 py-1.5 my-1 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-700 transition-all border border-blue-100 dark:border-slate-700 no-underline shadow-sm group";
                                const linkClass = "inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium break-all";

                                if (isToolLink) {
                                  return (
                                    <Link
                                      href={href}
                                      className={isUrlText ? buttonClass : linkClass}
                                      onClick={() => setIsOpen(false)}
                                    >
                                      <span className={isUrlText ? "font-medium text-xs sm:text-sm" : ""}>{label}</span>
                                      <ExternalLink className={`w-3 h-3 flex-shrink-0 ${isUrlText ? "opacity-70 group-hover:opacity-100" : ""}`} />
                                    </Link>
                                  );
                                }

                                return (
                                  <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={isUrlText ? buttonClass : linkClass}
                                  >
                                    <span className={isUrlText ? "font-medium text-xs sm:text-sm" : ""}>{label}</span>
                                    <ExternalLink className={`w-3 h-3 flex-shrink-0 ${isUrlText ? "opacity-70 group-hover:opacity-100" : ""}`} />
                                  </a>
                                );
                              },
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-outside mr-4 mb-2 space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-outside mr-4 mb-2 space-y-1" {...props} />,
                              li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                              code: ({ node, className, children, ...props }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const lang = match ? match[1] : '';
                                const content = String(children);
                                
                                if (lang === 'tool' || lang === 'course') {
                                  try {
                                    // Robust key-value parsing for partial streaming content
                                    const lines = content.split('\n');
                                    const data: any = {};
                                    lines.forEach(line => {
                                      const [key, ...valParts] = line.split(':');
                                      if (key && valParts.length > 0) {
                                        data[key.trim().toLowerCase()] = valParts.join(':').trim();
                                      }
                                    });

                                    if (lang === 'tool' && (data.name || data.description)) {
                                      return (
                                        <div className="my-4 transition-all duration-500 overflow-hidden">
                                          <ToolCard 
                                            name={data.name || 'جاري التحميل...'} 
                                            description={data.description || '...'} 
                                            category={data.category}
                                            link={data.link}
                                            image={data.image}
                                            reason={data.reason}
                                          />
                                        </div>
                                      );
                                    }

                                    if (lang === 'course' && (data.title || data.description)) {
                                      // Render a simpler version of Course Card for the chat context if needed, 
                                      // but using SmartCourseCard with dummy click for now.
                                      return (
                                        <div className="my-4 max-w-sm transition-all duration-500 overflow-hidden">
                                          <SmartCourseCard 
                                            course={{
                                              id: data.link || 'tmp',
                                              title: data.title || 'جاري التحميل...',
                                              description: data.description || '...',
                                              thumbnail: data.image || '',
                                              platform: data.platform || 'Tolzy',
                                              rating: 5,
                                              studentsCount: 100,
                                              price: 'free',
                                              level: 'beginner',
                                              category: data.category || 'General',
                                              instructor: 'Tolzy AI',
                                              lessons: [],
                                              isPublished: true,
                                              createdAt: new Date().toISOString(),
                                              updatedAt: new Date().toISOString()
                                            }}
                                            onClick={() => data.link && window.open(data.link, '_blank')}
                                          />
                                        </div>
                                      );
                                    }
                                  } catch (e) {
                                    console.error('Safe parse error:', e);
                                  }
                                }

                                const isInline = !match && !content.includes('\n');
                                return isInline ? (
                                  <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-red-500 font-mono text-xs" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <div className="relative my-2 rounded-lg overflow-hidden bg-gray-900 text-gray-100 p-3 text-xs font-mono" dir="ltr">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </div>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        <div className={`text-xs mt-2 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                          {message.timestamp.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center gap-2">
                          <Loader className="h-4 w-4 animate-spin text-blue-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">جاري الكتابة...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Quick Suggestions */}
            <AnimatePresence>
              {messages.length === 1 && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-3 sm:px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2.5 text-right">💡 اقتراحات سريعة:</p>
                  <div className="flex flex-wrap gap-2">
                    {tolzyAI.getQuickSuggestions().slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickSuggestion(suggestion)}
                        className="text-xs px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 sm:p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 px-3 py-2.5 sm:px-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:bg-gray-700 dark:text-white text-right transition-all"
                  disabled={isLoading}
                  dir="rtl"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-md hover:shadow-lg disabled:shadow-none"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2.5 text-center flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>مدعوم بـ OpenAI - ChatGPT</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TolzyAIChat;
