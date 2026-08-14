import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, AlertCircle, ArrowRight, Heart } from 'lucide-react';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'customer' ? 'customer' : 'provider';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    city: 'Chennai'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        age: formData.age ? Number(formData.age) : undefined,
        role,
        location: {
          city: formData.city || 'Chennai',
          state: 'Tamil Nadu',
          country: 'India'
        }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FBF9F4]">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-[#E2E7E3] p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-2.5 rounded-full bg-[#E6ECE7] text-[#16382B] mb-2">
            <Heart className="w-5 h-5 fill-current text-[#16382B]" />
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[#16382B]">
            Join SilverHands
          </h2>
          <p className="text-slate-600 text-base font-normal">
            Choose how you would like to participate today
          </p>
        </div>

        {/* Role Toggle Pills */}
        <div>
          <label className="block text-xs font-bold text-[#16382B] uppercase tracking-wider mb-2">
            Select Your Role:
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#F4F7F5] rounded-2xl border border-[#D5DDD7]">
            <button
              type="button"
              onClick={() => setRole('provider')}
              className={`py-3.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'provider'
                  ? 'bg-[#16382B] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#16382B]'
              }`}
            >
              <span>👵</span>
              <span>Offer My Skills</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-3.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                role === 'customer'
                  ? 'bg-[#16382B] text-white shadow-sm'
                  : 'text-slate-700 hover:text-[#16382B]'
              }`}
            >
              <span>🔍</span>
              <span>Find Services</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2 font-medium">
            {role === 'provider' 
              ? 'For Senior Citizens & Homemakers offering services, products, or mentoring.'
              : 'For Customers looking for trusted local services, traditional skills, or tutoring.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="font-semibold">{error}</div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="name">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="e.g. Lakshmi Devi"
              value={formData.name}
              onChange={handleChange}
              className="input-editorial"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="email">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              required
              placeholder="e.g. lakshmi@example.com"
              value={formData.email}
              onChange={handleChange}
              className="input-editorial"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="password">
              Password * (Minimum 6 characters)
            </label>
            <input
              id="password"
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="input-editorial"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="phone">
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
                className="input-editorial"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="city">
                City / Town
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-editorial"
              >
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Madurai">Madurai</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 rounded-xl text-base shadow-sm mt-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Footer Link */}
        <div className="text-center pt-4 border-t border-[#E2E7E3]">
          <p className="text-slate-600 font-medium text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#16382B] font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
