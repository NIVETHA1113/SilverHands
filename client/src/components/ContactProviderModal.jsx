import React, { useState } from 'react';
import { X, Send, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { messageAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ContactProviderModal({ provider, onClose }) {
  const { isAuthenticated, user } = useAuth();

  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!provider) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in as a customer to send a message.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setSending(true);
    setError('');
    try {
      const providerId = provider._id || provider.id;
      const res = await messageAPI.send({
        receiverId: providerId,
        message: message.trim()
      });
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        setError(res.data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('[Send Message Error]:', err.message);
      setError(err.message || 'Could not send message. Please check your connection.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-[#E2E7E3] shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <img
            src={provider.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
            alt={provider.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#16382B]"
          />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C86D51]">Contact Provider</span>
            <h3 className="font-editorial text-2xl font-bold text-[#16382B] leading-snug">
              Message {provider.name}
            </h3>
            <p className="text-xs text-slate-500">
              📍 {provider.location?.city || 'Chennai'}
            </p>
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-editorial text-xl font-bold text-emerald-900">Message Sent Successfully!</h4>
            <p className="text-xs text-emerald-800">
              {provider.name} will receive your message in their SilverHands portal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#16382B]">Your Message</label>
              <textarea
                rows={4}
                required
                placeholder={`Hi ${provider.name}, I would like to inquire about your services...`}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError('');
                }}
                className="input-editorial text-xs resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 shadow-xs"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary py-3 px-5 text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
