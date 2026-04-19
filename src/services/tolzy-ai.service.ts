// API Base URL - always use relative path since we use Next.js API routes
const getApiBase = () => '';


export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string | string[];
  pricing: string;
  features: string[];
  tags: string[];
  url: string; // الرابط الخارجي للأداة
  link?: string; // الرابط الداخلي في الموقع (من Firestore)
  rating: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  thoughts?: string[]; // New: list of thinking steps
  thinkingTime?: number; // Time in seconds
}

class TolzyAIService {
  private tools: Tool[] = [];
  private isInitialized = false;
  private lastUpdate: Date | null = null;


  /**
   * تهيئة Tolzy AI وتحميل جميع الأدوات من Firebase
   */
  /**
   * تهيئة Tolzy AI
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🤖 Initializing Tolzy AI (Client)...');
      // No longer fetch all tools to save bandwidth/reads. 
      // Tools will be handled by the backend RAG system.
      // await this.refreshTools(); 
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error initializing Tolzy AI:', error);
      throw error;
    }
  }

  /**
   * تحديث قاعدة بيانات الأدوات من Firebase
   * @deprecated Used backend RAG instead
   */
  async refreshTools(): Promise<void> {
    // Disabled to prevent high read usage
    console.log('🔄 Tool refresh skipped (Using Server-Side RAG).');
    this.tools = [];
    this.lastUpdate = new Date();
  }

  /**
   * نظام Tolzy AI مع Google Gemini via Backend API (Streaming)
   */
  async *streamChat(userMessage: string, conversationHistory: ChatMessage[] = [], model: 'v1' | 'v2' = 'v2'): AsyncGenerator<{ content: string, thought?: string }> {
    try {
      const isThinkingModel = model === 'v2';
      const response = await fetch(`${getApiBase()}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory,
          stream: true,
          thinking: isThinkingModel
        })
      });

      if (!response.ok) {
        throw new Error('Backend API error');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let fullStreamBuffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(line.substring(6));
              const content = parsed.choices[0]?.delta?.content;
              
              if (content) {
                fullStreamBuffer += content;

                if (!isThinkingModel) {
                   // Standard streaming for V1
                   yield { content: fullStreamBuffer };
                } else {
                   // Advanced JSON parsing for V2 (Thinker)
                   // The stream is building: { "thinking_process": "...", "final_answer": "..." }
                   let extractedThought = "";
                   let extractedAnswer = "";
                   
                   const thinkStartIdx = fullStreamBuffer.indexOf('<think>');
                   const thinkEndIdx = fullStreamBuffer.indexOf('</think>');
                   
                   if (thinkStartIdx !== -1) {
                       if (thinkEndIdx !== -1) {
                           extractedThought = fullStreamBuffer.substring(thinkStartIdx + 7, thinkEndIdx).trim();
                           extractedAnswer = fullStreamBuffer.substring(thinkEndIdx + 8).trim();
                       } else {
                           extractedThought = fullStreamBuffer.substring(thinkStartIdx + 7).trim();
                           extractedAnswer = '';
                       }
                   } else {
                       extractedAnswer = fullStreamBuffer;
                   }

                   yield { 
                     content: extractedAnswer, 
                     thought: extractedThought || undefined 
                   };
                }
              }
            } catch (e) {
              // Ignore parse errors for specific chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming Chat Error:', error);
      yield { content: "عذراً، أواجه مشكلة في الاتصال بالخادم حالياً. يرجى المحاولة لاحقاً." };
    }
  }

  /**
   * نظام Tolzy AI مع Google Gemini via Backend API (Legacy non-streaming)
   * @deprecated Use streamChat for better UX
   */
  async chat(userMessage: string, conversationHistory: ChatMessage[] = []): Promise<string> {
    try {
      const response = await fetch(`${getApiBase()}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Backend API error');
      }

      const data = await response.json();
      return data.answer || "عذراً، لم أتمكن من الحصول على إجابة.";
    } catch (error) {
      console.error('Chat Error:', error);
      return "عذراً، أواجه مشكلة في الاتصال بالخادم حالياً. يرجى المحاولة لاحقاً.";
    }
  }





  /**
   * الحصول على اقتراحات سريعة
   */
  getQuickSuggestions(): string[] {
    return [
      'ما هي أفضل أداة لكتابة المحتوى؟',
      'أريد أداة لتصميم الصور بالذكاء الاصطناعي',
      'ما هي الأدوات المجانية المتاحة؟',
      'أحتاج أداة للبرمجة والكود',
      'أدوات لتحسين الإنتاجية',
      'أفضل أدوات الفيديو والمونتاج'
    ];
  }

  /**
   * الحصول على إحصائيات
   */
  getStats() {
    return {
      totalTools: this.tools.length,
      categories: [...new Set(this.tools.flatMap(t =>
        Array.isArray(t.category) ? t.category : [t.category]
      ))].length,
      freeTools: this.tools.filter(t => t.pricing === 'Free').length,
      averageRating: (this.tools.reduce((sum, t) => sum + t.rating, 0) / this.tools.length).toFixed(1)
    };
  }

  /**
   * الحصول على معلومات آخر تحديث
   */
  getLastUpdateInfo(): { lastUpdate: Date | null; toolsCount: number; isInitialized: boolean } {
    return {
      lastUpdate: this.lastUpdate,
      toolsCount: this.tools.length,
      isInitialized: this.isInitialized
    };
  }

  /**
   * إجبار تحديث قاعدة البيانات
   */
  async forceRefresh(): Promise<void> {
    await this.refreshTools();
  }

  /**
   * تحليل محتوى الكورس لاستخراج المعلومات
   */
  async analyzeCourseContent(_title: string, _description: string): Promise<{ isFree: boolean, platform: string, language: string, hasCertificate: boolean }> {
    console.warn('⚠️ AI Analysis is temporarily disabled.');
    return { isFree: false, platform: 'Unknown', language: 'English', hasCertificate: false };
  }
}

// تصدير instance واحد فقط (Singleton)
export const tolzyAI = new TolzyAIService();
