import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

export default function StepLocation({ data, onNext, onBack }) {
  const [formData, setFormData] = useState({
    city: data.location?.city || 'Chennai',
    state: data.location?.state || 'Tamil Nadu',
    country: data.location?.country || 'India',
    address: data.location?.address || 'T. Nagar, Chennai',
    latitude: data.location?.latitude || 13.0827,
    longitude: data.location?.longitude || 80.2707
  });

  const [geoStatus, setGeoStatus] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('Locating your position...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeoStatus('Current coordinates captured successfully! ✓');
      },
      (err) => {
        setGeoStatus('Location permission denied or unavailable. You can enter your city manually.');
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.city.trim()) {
      setError('Please tell us your city so local customers can find you.');
      return;
    }

    onNext({ location: formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-editorial text-3xl font-bold text-[#16382B]">
          Where are you based?
        </h2>
        <p className="text-slate-600 text-base mt-1">
          We'll use your location to help you discover nearby opportunities.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Geolocation Button */}
      <div className="bg-[#E6ECE7] p-5 rounded-2xl border border-[#D2DDD5] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#16382B] shrink-0" />
          <div>
            <p className="text-sm font-bold text-[#16382B]">Automatic Location Discovery</p>
            <p className="text-xs text-slate-600">Optionally capture your GPS coordinates for local matching.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="btn-secondary text-xs py-2.5 px-4 bg-white text-[#16382B] shrink-0"
        >
          <Navigation className="w-4 h-4 text-[#16382B]" />
          <span>Use my current location</span>
        </button>
      </div>

      {geoStatus && (
        <p className="text-xs font-semibold text-[#16382B] bg-white p-3 rounded-xl border border-[#E2E7E3]">
          {geoStatus}
        </p>
      )}

      {/* Manual Location Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="city">
            City / Town *
          </label>
          <input
            id="city"
            type="text"
            name="city"
            required
            placeholder="e.g. Chennai"
            value={formData.city}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="address">
            Locality / Neighborhood Address
          </label>
          <input
            id="address"
            type="text"
            name="address"
            placeholder="e.g. T. Nagar, Anna Salai"
            value={formData.address}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="state">
              State
            </label>
            <input
              id="state"
              type="text"
              name="state"
              placeholder="Tamil Nadu"
              value={formData.state}
              onChange={handleChange}
              className="input-editorial"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="country">
              Country
            </label>
            <input
              id="country"
              type="text"
              name="country"
              value={formData.country}
              disabled
              className="input-editorial bg-[#F5F2EA] text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-[#E2E7E3]">
        <button type="button" onClick={onBack} className="btn-secondary py-3 px-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button type="submit" className="btn-primary py-3 px-8 text-base">
          <span>Next: Languages</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
