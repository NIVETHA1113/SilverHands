import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messageAPI } from '../services/api';
import { MessageSquare, ArrowLeft, Clock, MapPin, CheckCircle2, User } from 'lucide-react';

export default function MessagesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUserId = user?._id || user?.id;

  const loadMessages = async () => {
    try {
      setLoading(true);
      const res = await messageAPI.getMy();
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('[Load Messages Error]:', err.message);
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF9F4] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-[#E6ECE7] text-slate-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-[#C86D51]" />
                <h1 className="font-editorial text-3xl font-bold text-[#16382B]">Messages</h1>
              </div>
              <p className="text-slate-600 text-sm mt-0.5">Your direct platform conversations and inquiries.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-[3px] border-[#16382B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#E2E7E3] text-center space-y-4 shadow-xs">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-editorial text-2xl font-bold text-[#16382B]">No messages yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              When customers or providers message you on SilverHands, your conversations will appear here.
            </p>
            <button onClick={() => navigate('/explore')} className="btn-primary text-sm py-2.5 px-6">
              Explore Marketplace
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isSender = String(msg.senderId?._id || msg.senderId) === String(currentUserId);
              const otherUser = isSender ? msg.receiverId : msg.senderId;

              return (
                <div
                  key={msg._id}
                  className="bg-white p-6 rounded-3xl border border-[#E2E7E3] shadow-xs space-y-3 transition-all hover:border-[#16382B]"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={otherUser?.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                        alt={otherUser?.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E7E3]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#16382B] text-base">{otherUser?.name || 'SilverHands User'}</h4>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {isSender ? 'Sent to' : 'From'} {otherUser?.role === 'provider' ? 'Provider' : 'Customer'}
                          </span>
                        </div>
                        {otherUser?.location?.city && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {otherUser.location.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-xs text-slate-400 font-semibold">
                      {new Date(msg.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-[#E2E7E3]">
                    <p className="text-sm text-slate-700 leading-relaxed italic">
                      "{msg.message}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
