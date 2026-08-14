import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, CheckCircle2, ArrowRight, ShieldCheck, MapPin, Users, BookOpen, Utensils, Scissors, Sprout, Gift } from 'lucide-react';


export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FBF9F4] text-[#1F2421]">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#E2E7E3]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-[#E6ECE7] text-[#16382B] border border-[#D2DDD5] px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
              AI-powered livelihood platform
            </div>

            {/* Editorial Headline */}
            <h1 className="font-editorial text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#16382B] leading-[1.1]">
              Your skills have <span className="text-[#C86D51]">value.</span><br />
              Let the world discover them.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl">
              SilverHands helps senior citizens and homemakers turn their experience, skills and traditional knowledge into meaningful livelihood opportunities.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register?role=provider')}
                className="btn-primary text-base py-3.5 px-7 rounded-xl shadow-md"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/register?role=customer')}
                className="btn-secondary text-base py-3.5 px-7 rounded-xl"
              >
                Find a Service
              </button>
            </div>

            {/* Minimal Value Props */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E2E7E3]/80 max-w-xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#16382B] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#16382B]">For Everyone</p>
                  <p className="text-[11px] text-slate-500">Simple & accessible</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#16382B] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#16382B]">Local Opportunities</p>
                  <p className="text-[11px] text-slate-500">Connect nearby</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16382B] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#16382B]">AI Powered</p>
                  <p className="text-[11px] text-slate-500">Smart matching</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Graphic - Visual Skill Orbit */}
          <div className="lg:col-span-5 relative flex justify-center py-6">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-[#E6ECE7]/60 flex items-center justify-center border border-[#D2DDD5]/60 shadow-inner">
              
              {/* Inner Circle */}
              <div className="w-44 h-44 rounded-full bg-[#16382B] text-white flex flex-col items-center justify-center p-4 shadow-lg text-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="font-editorial text-lg font-bold">SilverHands</span>
              </div>

              {/* Floating Skill Pill 1 */}
              <div className="absolute -top-2 -right-4 bg-white border border-[#E2E7E3] rounded-2xl p-3 shadow-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FDF0EC] text-[#C86D51] flex items-center justify-center text-sm font-bold">
                  🧵
                </div>
                <div>
                  <p className="text-xs font-bold text-[#16382B]">Tailoring</p>
                  <p className="text-[10px] text-slate-500">25+ years experience</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#16382B] ml-1" />
              </div>

              {/* Floating Skill Pill 2 */}
              <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 bg-white border border-[#E2E7E3] rounded-2xl p-3 shadow-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center text-sm font-bold">
                  🍱
                </div>
                <div>
                  <p className="text-xs font-bold text-[#16382B]">Homemade Food</p>
                  <p className="text-[10px] text-slate-500">Traditional recipes</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#16382B] ml-1" />
              </div>

              {/* Floating Skill Pill 3 */}
              <div className="absolute -bottom-2 left-4 bg-white border border-[#E2E7E3] rounded-2xl p-3 shadow-md flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center text-sm font-bold">
                  📚
                </div>
                <div>
                  <p className="text-xs font-bold text-[#16382B]">Teaching</p>
                  <p className="text-[10px] text-slate-500">Experienced mentor</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-[#16382B] ml-1" />
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-[#C86D51] tracking-widest uppercase block mb-2">
            How SilverHands Works
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[#16382B]">
            Turn experience into opportunity
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Share your skills',
              desc: 'Tell us naturally about your experience, skills and what you love doing.'
            },
            {
              step: '02',
              title: 'AI understands you',
              desc: 'Our AI identifies your skills and creates a simple professional profile.'
            },
            {
              step: '03',
              title: 'Find the right people',
              desc: 'It connects your skills with customers who are looking for exactly what you offer.'
            },
            {
              step: '04',
              title: 'Create opportunity',
              desc: 'Get discovered locally, connect with customers and earn from your skills.'
            }
          ].map((item, idx) => (
            <div key={idx} className="card-editorial bg-white p-7 rounded-2xl border border-[#E2E7E3] space-y-3">
              <span className="text-xs font-bold text-[#C86D51] uppercase tracking-wider block">
                {item.step}
              </span>
              <h3 className="font-editorial text-xl font-bold text-[#16382B]">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPLORE CATEGORIES */}
      <section id="explore" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-[#E2E7E3]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-[#C86D51] tracking-widest uppercase block mb-1">
              Traditional Knowledge & Skill Marketplace
            </span>
            <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
              Popular Local Services & Offerings
            </h2>
          </div>
          <button
            onClick={() => navigate('/register?role=customer')}
            className="text-sm font-bold text-[#16382B] hover:text-[#C86D51] transition-colors flex items-center gap-1"
          >
            Explore All Services →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Utensils, label: 'Traditional Cooking', desc: 'Home meals & classes' },
            { icon: Scissors, label: 'Custom Tailoring', desc: 'Blouse & churidar' },
            { icon: BookOpen, label: 'Home Tuition', desc: 'Languages & math' },
            { icon: Sprout, label: 'Gardening Help', desc: 'Organic plant care' },
            { icon: Gift, label: 'Homemade Snacks', desc: 'Pickles & sweets' },
            { icon: Sparkles, label: 'Handmade Crafts', desc: 'Knitting & artwork' }
          ].map((cat, i) => (
            <div
              key={i}
              onClick={() => navigate('/register?role=customer')}
              className="bg-white p-5 rounded-2xl border border-[#E2E7E3] hover:border-[#16382B]/40 cursor-pointer text-center transition-all hover:-translate-y-0.5"
            >
              <cat.icon className="w-6 h-6 text-[#16382B] mx-auto mb-3" />
              <h4 className="font-bold text-[#16382B] text-sm mb-1">{cat.label}</h4>
              <p className="text-[11px] text-slate-500">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE CTA BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-[#E6ECE7] border border-[#D0DDD4] rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-[#C86D51] tracking-widest uppercase block">
              Every skill has a story
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
              Ready to share yours?
            </h2>
            <p className="text-slate-700 text-base">
              Whether you teach, cook, stitch, create or guide — SilverHands helps your experience reach the people who need it.
            </p>
          </div>

          <button
            onClick={() => navigate('/register?role=provider')}
            className="btn-primary text-base py-3.5 px-8 rounded-xl shrink-0 shadow-sm"
          >
            <span>Start Your Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
