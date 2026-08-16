import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatbotInput({ onSendMessage, disabled }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-[#E2E7E3] flex items-center gap-2">
      <input
        type="text"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="flex-1 input-editorial text-xs py-2.5 px-3.5 focus:ring-1 focus:ring-[#16382B]"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        className="w-10 h-10 rounded-xl bg-[#16382B] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#10291f] transition-all cursor-pointer shadow-xs shrink-0"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}
