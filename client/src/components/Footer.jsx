import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#F5F2EA] border-t border-[#E2E7E3] py-12 px-4 sm:px-6 lg:px-8 text-[#1F2421]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand Column */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#16382B] text-white flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-editorial text-xl font-bold text-[#16382B] tracking-tight block">
              SilverHands
            </span>
            <p className="text-xs text-slate-500 font-medium">
              Empowering experience. Growing opportunity.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-[#16382B] transition-colors">
            Home
          </Link>
          <Link to="/#explore" className="hover:text-[#16382B] transition-colors">
            Explore
          </Link>
          <Link to="/#how-it-works" className="hover:text-[#16382B] transition-colors">
            How It Works
          </Link>
          <a href="mailto:support@silverhands.in" className="hover:text-[#16382B] transition-colors">
            Contact
          </a>
        </div>

        {/* Copyright */}
        <div className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} SilverHands. Built with purpose.
        </div>

      </div>
    </footer>
  );
}
