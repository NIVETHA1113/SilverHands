import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#F5F2EA] border-t border-[#E2E7E3] py-8 px-4 sm:px-6 lg:px-8 text-[#1F2421]">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#16382B] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="font-editorial text-lg font-bold text-[#16382B] block leading-none">
              SilverHands
            </span>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Empowering experience. Growing opportunity.
            </p>
          </div>
        </div>

        {/* Minimal Informational Links */}
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <Link to="/" className="hover:text-[#16382B] transition-colors">
            About
          </Link>
          <a href="mailto:support@silverhands.in" className="hover:text-[#16382B] transition-colors">
            Contact
          </a>
          <span className="hover:text-[#16382B] cursor-pointer">
            Privacy Policy
          </span>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} SilverHands. AI-Powered Digital Livelihood Platform.
        </div>

      </div>
    </footer>
  );
}
