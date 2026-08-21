import React, { useState } from 'react';
import { MapPin, Navigation, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

// Reverse-geocode coords → { city, state, address } via OSM Nominatim (free, no key)
async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (!data || data.error) return null;

    const addr = data.address || {};
    // city: try city → town → village → county in order
    const city =
      addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
    const state   = addr.state || '';
    const country = addr.country || 'India';
    // Build a readable short address: neighbourhood / suburb / district
    const locality =
      addr.neighbourhood || addr.suburb || addr.city_district || addr.district || '';
    const address = locality ? `${locality}, ${city}` : city;

    return { city, state, country, address };
  } catch (e) {
    console.error('[StepLocation] Reverse geocode failed:', e.message);
    return null;
  }
}

export default function StepLocation({ data, onNext, onBack }) {
  const [formData, setFormData] = useState({
    city:      data.location?.city      || '',
    state:     data.location?.state     || '',
    country:   data.location?.country   || 'India',
    address:   data.location?.address   || '',
    latitude:  data.location?.latitude  ?? null,
    longitude: data.location?.longitude ?? null,
  });

  const [geoStatus, setGeoStatus] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
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

    setGeoLoading(true);
    setGeoStatus('Locating your position…');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Update coords immediately so user sees feedback fast
        setFormData(prev => ({ ...prev, latitude, longitude }));
        setGeoStatus('Coordinates captured. Looking up your city…');

        // Reverse-geocode to fill city / state / address
        const place = await reverseGeocode(latitude, longitude);

        if (place) {
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            city:    place.city    || prev.city,
            state:   place.state   || prev.state,
            country: place.country || prev.country,
            address: place.address || prev.address,
          }));
          setGeoStatus(`Location detected: ${place.city}${place.state ? ', ' + place.state : ''} ✓`);
        } else {
          setGeoStatus('Coordinates captured. Could not detect city — please fill it in manually.');
        }

        setGeoLoading(false);
      },
      (err) => {
        const messages = {
          1: 'Location permission denied. Please enter your city manually.',
          2: 'Location unavailable. Please enter your city manually.',
          3: 'Location request timed out. Please enter your city manually.',
        };
        setGeoStatus(messages[err.code] || 'Location unavailable. Please enter your city manually.');
        setGeoLoading(false);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.city.trim()) {
      setError('Please enter your city so local customers can find you.');
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
            <p className="text-sm font-bold text-[#16382B]">Automatic Location Detection</p>
            <p className="text-xs text-slate-600">
              Detects your GPS position and fills in your city automatically.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={geoLoading}
          className="btn-secondary text-xs py-2.5 px-4 bg-white text-[#16382B] shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {geoLoading
            ? <Loader2 className="w-4 h-4 text-[#16382B] animate-spin" />
            : <Navigation className="w-4 h-4 text-[#16382B]" />
          }
          <span>{geoLoading ? 'Detecting…' : 'Use my current location'}</span>
        </button>
      </div>

      {geoStatus && (
        <p className={`text-xs font-semibold p-3 rounded-xl border ${
          geoStatus.includes('✓')
            ? 'text-[#16382B] bg-[#E6ECE7] border-[#D2DDD5]'
            : 'text-slate-600 bg-white border-[#E2E7E3]'
        }`}>
          {geoStatus}
        </p>
      )}

      {/* Manual Location Inputs */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="city">
            City / Town <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            name="city"
            required
            placeholder="e.g. Chennai, Coimbatore, Madurai…"
            value={formData.city}
            onChange={handleChange}
            className="input-editorial"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#16382B] mb-1" htmlFor="address">
            Locality / Neighbourhood
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
              placeholder="e.g. Tamil Nadu"
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

        {/* Show captured coords as subtle confirmation */}
        {formData.latitude != null && formData.longitude != null && (
          <p className="text-[11px] text-slate-400 font-mono">
            📍 {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
          </p>
        )}
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
