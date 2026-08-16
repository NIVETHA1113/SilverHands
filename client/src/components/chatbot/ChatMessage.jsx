import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Star, ArrowRight, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';

export default function ChatMessage({ message, onCloseModal }) {
  const isUser = message.sender === 'user';
  const navigate = useNavigate();

  const handleNavigate = (route) => {
    if (onCloseModal) onCloseModal();
    navigate(route);
  };

  return (
    <div className={`flex gap-3 text-xs ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
        isUser ? 'bg-[#16382B] text-white border-[#16382B]' : 'bg-[#E6ECE7] text-[#16382B] border-[#D2DDD5]'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#16382B]" />}
      </div>

      {/* Message Content Container */}
      <div className={`space-y-3 max-w-[85%] ${isUser ? 'text-right' : 'text-left'}`}>
        
        {/* Main Text Bubble */}
        <div className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block shadow-2xs ${
          isUser
            ? 'bg-[#16382B] text-white font-medium rounded-tr-none'
            : 'bg-white text-slate-800 border border-[#E2E7E3] rounded-tl-none font-normal'
        }`}>
          {message.text}
        </div>

        {/* STRUCTURED RESULT CARDS (Assistant Only) */}
        {!isUser && message.results && message.results.length > 0 && (
          <div className="space-y-2 pt-1">
            
            {/* MATCH RESULTS */}
            {message.resultType === 'MATCH_RESULTS' && (
              <div className="space-y-2">
                {message.results.map((match, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#E2E7E3] space-y-2 text-left shadow-2xs">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={match.profileImage || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150'}
                          alt={match.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <span className="font-bold text-[#16382B] text-xs block">{match.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#16382B]" /> {match.city}
                          </span>
                        </div>
                      </div>

                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold py-0.5 px-2 rounded-full">
                        {match.matchScore}% Match
                      </span>
                    </div>

                    {/* Reasons */}
                    {match.reasons && match.reasons.length > 0 && (
                      <div className="bg-[#FBF9F4] p-2 rounded-xl text-[10px] text-slate-600 space-y-0.5 border border-[#E2E7E3]">
                        <span className="font-bold text-[#16382B] block">Why recommended:</span>
                        {match.reasons.slice(0, 2).map((r, i) => (
                          <p key={i} className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">{r}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => handleNavigate(`/providers/${match.id}`)}
                      className="btn-secondary text-[11px] py-1.5 px-3 w-full flex items-center justify-center gap-1 bg-white"
                    >
                      <span>View Provider Profile</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* SERVICE RESULTS */}
            {message.resultType === 'SERVICE_RESULTS' && (
              <div className="space-y-2">
                {message.results.map((service, idx) => (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-[#E2E7E3] space-y-2 text-left shadow-2xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="badge-sage text-[10px] mb-0.5">{service.category}</span>
                        <h4 className="font-editorial text-sm font-bold text-[#16382B]">{service.title}</h4>
                      </div>
                      <span className="font-editorial text-sm font-bold text-[#16382B] shrink-0">₹{service.price}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic line-clamp-1">
                      "{service.description}"
                    </p>

                    <div className="flex justify-between items-center pt-1 border-t border-[#E2E7E3]">
                      <span className="text-[10px] text-slate-500 font-semibold">📍 {service.city} • {service.providerName}</span>
                      <button
                        onClick={() => handleNavigate(`/services/${service.id}`)}
                        className="btn-primary text-[10px] py-1 px-2.5"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PRODUCT RESULTS */}
            {message.resultType === 'PRODUCT_RESULTS' && (
              <div className="space-y-2">
                {message.results.map((product, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-2xl border border-[#E2E7E3] space-y-2 text-left shadow-2xs">
                    <div className="flex gap-2.5 items-center">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200'}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="badge-terracotta text-[9px] mb-0.5">{product.category}</span>
                        <h4 className="font-editorial text-xs font-bold text-[#16382B] truncate">{product.name}</h4>
                        <span className="font-bold text-xs text-[#16382B]">₹{product.price} / {product.unit}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-[#E2E7E3]">
                      <span className="text-[10px] text-slate-500">📍 {product.city}</span>
                      <button
                        onClick={() => handleNavigate(`/products/${product.id}`)}
                        className="btn-primary text-[10px] py-1 px-2.5 bg-[#C86D51] hover:bg-[#b55e43]"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* DIRECT NAVIGATION BUTTON */}
        {!isUser && message.action && message.action.type === 'NAVIGATE' && (
          <div className="pt-1 text-left">
            <button
              onClick={() => handleNavigate(message.action.route)}
              className="btn-primary text-xs py-2 px-4 shadow-xs flex items-center gap-1.5"
            >
              <span>{message.action.label || 'View Page'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
