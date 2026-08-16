import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import ChatMessage from './ChatMessage';
import ChatbotInput from './ChatbotInput';

const DEFAULT_SUGGESTIONS = [
  'Find a math tutor in Chennai',
  'I need traditional blouse stitching',
  'Show me homemade pickles',
  'How does matching work?'
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm your SilverHands Assistant. How can I help you find services, products, or providers today?",
      suggestions: DEFAULT_SUGGESTIONS
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (userText) => {
    if (!userText || loading) return;

    // Add user message to state
    const userMsg = { sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.post('/chatbot/message', { message: userText });
      if (res.data.success) {
        const botMsg = {
          sender: 'bot',
          text: res.data.text,
          intent: res.data.intent,
          resultType: res.data.resultType,
          results: res.data.results || [],
          action: res.data.action || null,
          suggestions: res.data.suggestions || []
        };
        setMessages(prev => [...prev, botMsg]);
        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setSuggestions(res.data.suggestions);
        }
      }
    } catch (err) {
      console.error('[Chatbot API Error]:', err.message);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "I'm having trouble connecting right now. Please try again or explore our marketplace directly.",
          suggestions: DEFAULT_SUGGESTIONS
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      
      {/* FLOATING TOGGLE BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#16382B] hover:bg-[#10291f] text-white py-3.5 px-4 rounded-full shadow-lg flex items-center gap-2.5 transition-all transform hover:scale-105 border border-emerald-800 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-800/60 flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
        </button>
      )}

      {/* CHATBOT MODAL CONTAINER */}
      {isOpen && (
        <div className="w-[92vw] sm:w-[380px] h-[520px] bg-[#FBF9F4] rounded-3xl border border-[#E2E7E3] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* HEADER */}
          <div className="bg-[#16382B] text-white p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-900/80 border border-emerald-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-editorial text-lg font-bold">SilverHands Assistant</h3>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-[10px] text-emerald-200/80 font-medium">AI Discovery & Match Guide</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MESSAGES LOG AREA */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} onCloseModal={() => setIsOpen(false)} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2 italic">
                <div className="w-4 h-4 border-2 border-[#16382B] border-t-transparent rounded-full animate-spin" />
                <span>Searching SilverHands database...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* SUGGESTED PROMPT PILLS */}
          {suggestions && suggestions.length > 0 && !loading && (
            <div className="px-3 py-2 bg-white/60 border-t border-[#E2E7E3] flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="py-1 px-2.5 rounded-full bg-white border border-[#D2DDD5] text-[10px] font-bold text-[#16382B] hover:bg-[#E6ECE7] whitespace-nowrap transition-all cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* INPUT BAR */}
          <ChatbotInput onSendMessage={handleSendMessage} disabled={loading} />

        </div>
      )}

    </div>
  );
}
