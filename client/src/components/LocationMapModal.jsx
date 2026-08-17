import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { X, MapPin, ExternalLink, IndianRupee } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// User location marker — green tint
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Opportunity marker — orange tint
const oppIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Re-center the map imperatively when center changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center[0], center[1]]);
  return null;
}

const BUDGET_LABELS = { fixed: 'Fixed', per_hour: '/ hr', per_day: '/ day' };

// The DB default coords (Chennai). If a user's stored coords match these
// but their city is NOT Chennai, the coords are just the model default —
// we must geocode the real city instead.
const DEFAULT_LAT = 13.0827;
const DEFAULT_LNG = 80.2707;
const CHENNAI_NAMES = ['chennai', 't. nagar', 't nagar', 'tnagar', 'adyar', 'anna nagar',
  'velachery', 'tambaram', 'perambur', 'kodambakkam', 'nungambakkam'];

function isCityInChennai(city = '') {
  const c = city.toLowerCase();
  return CHENNAI_NAMES.some(n => c.includes(n));
}

function coordsAreDefaultChennai(lat, lng) {
  return Math.abs(lat - DEFAULT_LAT) < 0.01 && Math.abs(lng - DEFAULT_LNG) < 0.01;
}

// Geocode a location string via OSM Nominatim (free, no key required)
async function geocodeCity(locationQuery) {
  try {
    const q = encodeURIComponent(locationQuery);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data[0]) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.error('[LocationMapModal] Geocode failed:', e.message);
  }
  return null;
}

export default function LocationMapModal({ user, onClose }) {
  const city    = user?.location?.city  || '';
  const state   = user?.location?.state || '';
  // Build display label purely from city + state — never use `address`
  // because the model default for address is 'T. Nagar, Chennai' for all users
  const displayLabel = [city, state].filter(Boolean).join(', ') || 'Your Location';

  // Determine initial center from stored coords
  const storedLat = user?.location?.latitude;
  const storedLng = user?.location?.longitude;

  // We'll update center once geocoding completes if needed
  const [center, setCenter] = useState(null);    // null = still resolving
  const [geocodeFailed, setGeocodeFailed] = useState(false);

  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpps, setLoadingOpps] = useState(true);

  // ── Resolve the correct map center ───────────────────────────────────────
  useEffect(() => {
    async function resolveCenter() {
      const hasRealCoords =
        storedLat != null &&
        storedLng != null &&
        !(coordsAreDefaultChennai(storedLat, storedLng) && city && !isCityInChennai(city));

      if (hasRealCoords) {
        setCenter([storedLat, storedLng]);
        return;
      }

      // Coords are missing or are the Chennai default but city is elsewhere → geocode
      if (city) {
        const query = state ? `${city}, ${state}, India` : `${city}, India`;
        const coords = await geocodeCity(query);
        if (coords) {
          setCenter(coords);
          return;
        }
      }

      // Last resort: use stored coords even if they're defaults
      if (storedLat != null && storedLng != null) {
        setCenter([storedLat, storedLng]);
      } else {
        setGeocodeFailed(true);
        setCenter([DEFAULT_LAT, DEFAULT_LNG]);
      }
    }

    resolveCenter();
  }, [storedLat, storedLng, city]);

  // ── Fetch nearby open opportunities ──────────────────────────────────────
  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoadingOpps(true);
      try {
        const token = localStorage.getItem('silverhands_token');
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/opportunities?status=open&limit=20`,
          token ? { headers: { Authorization: `Bearer ${token}` } } : {}
        );
        const data = await res.json();
        if (data.success) {
          const opps = (data.opportunities || []).filter(
            o => (o.location?.latitude && o.location?.longitude) ||
                 (city && o.location?.city?.toLowerCase() === city.toLowerCase())
          );
          setOpportunities(opps);
        }
      } catch (err) {
        console.error('[LocationMapModal] Failed to load opportunities:', err.message);
      } finally {
        setLoadingOpps(false);
      }
    };
    fetchOpportunities();
  }, [city]);

  const mappedOpps = opportunities.filter(o => o.location?.latitude && o.location?.longitude);
  const listedOpps = opportunities.slice(0, 5);

  // Don't render map until center is resolved
  if (!center) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-3xl border border-[#E2E7E3] shadow-2xl w-full max-w-2xl p-10 flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#16382B] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-600 font-medium">Locating {city || 'your location'}…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl border border-[#E2E7E3] shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E7E3]">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#16382B]" />
            <span className="font-editorial text-base font-bold text-[#16382B]">{displayLabel}</span>
            {geocodeFailed && (
              <span className="text-[10px] text-slate-400 ml-1">(approximate)</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-[#16382B] rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map */}
        <div className="h-72 w-full">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={center} />

            {/* User location marker */}
            <Marker position={center} icon={userIcon}>
              <Popup>
                <div className="text-xs font-semibold text-[#16382B]">
                  📍 {user?.name || 'You'}<br />
                  <span className="text-slate-500 font-normal">{displayLabel}</span>
                </div>
              </Popup>
            </Marker>

            {/* Nearby opportunity markers */}
            {mappedOpps.map(opp => (
              <Marker
                key={opp._id}
                position={[opp.location.latitude, opp.location.longitude]}
                icon={oppIcon}
              >
                <Popup>
                  <div className="text-xs space-y-1 min-w-[140px]">
                    <p className="font-bold text-[#16382B]">{opp.title}</p>
                    <p className="text-slate-500">{opp.category}</p>
                    {opp.budget != null && (
                      <p className="text-slate-600 font-semibold">
                        ₹{opp.budget.toLocaleString('en-IN')} {BUDGET_LABELS[opp.budgetType] || ''}
                      </p>
                    )}
                    <a
                      href={`/opportunities/${opp._id}`}
                      className="inline-flex items-center gap-1 text-[#16382B] font-bold underline underline-offset-2"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Nearby opportunities list */}
        <div className="px-5 py-4 border-t border-[#E2E7E3] space-y-3 max-h-52 overflow-y-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {loadingOpps
              ? 'Loading nearby opportunities…'
              : `Nearby Open Opportunities${city ? ` in ${city}` : ''}`}
          </p>

          {!loadingOpps && listedOpps.length === 0 && (
            <p className="text-xs text-slate-400">
              No open opportunities found{city ? ` near ${city}` : ''}.
            </p>
          )}

          {listedOpps.map(opp => (
            <div key={opp._id} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#16382B] truncate">{opp.title}</p>
                <p className="text-[10px] text-slate-400">
                  {opp.category} · {opp.location?.city || city}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {opp.budget != null && (
                  <span className="text-xs text-slate-600 font-semibold flex items-center gap-0.5">
                    <IndianRupee className="w-3 h-3" />{opp.budget.toLocaleString('en-IN')}
                  </span>
                )}
                <Link
                  to={`/opportunities/${opp._id}`}
                  onClick={onClose}
                  className="text-[10px] font-bold text-white bg-[#16382B] px-2.5 py-1 rounded-lg hover:bg-[#1a4a35] transition-colors whitespace-nowrap"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
