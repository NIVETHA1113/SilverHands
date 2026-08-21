import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { X, MapPin, ExternalLink, IndianRupee, AlertCircle, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default marker icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl:      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl:    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const oppIcon = new L.Icon({
  iconUrl:      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl:    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Re-center the map imperatively when center changes
function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 13); }, [center[0], center[1]]);
  return null;
}

const BUDGET_LABELS = { fixed: 'Fixed', per_hour: '/ hr', per_day: '/ day' };

const DEFAULT_LAT = 13.0827;
const DEFAULT_LNG = 80.2707;

const CHENNAI_NAMES = [
  'chennai', 't. nagar', 't nagar', 'tnagar', 'adyar',
  'anna nagar', 'velachery', 'tambaram', 'perambur',
  'kodambakkam', 'nungambakkam',
];

function isCityInChennai(city = '') {
  const c = city.toLowerCase();
  return CHENNAI_NAMES.some(n => c.includes(n));
}

function coordsAreDefaultChennai(lat, lng) {
  return Math.abs(lat - DEFAULT_LAT) < 0.01 && Math.abs(lng - DEFAULT_LNG) < 0.01;
}

// Forward-geocode a city string → [lat, lng] via OSM Nominatim
async function geocodeCity(query) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch (e) {
    console.error('[LocationMapModal] Geocode failed:', e.message);
  }
  return null;
}

// ─── State machine for center resolution ─────────────────────────────────────
// 'loading'  → still resolving
// 'ready'    → center is a valid [lat, lng]
// 'error'    → could not resolve any coordinates

export default function LocationMapModal({ user, onClose }) {
  const city         = user?.location?.city  || '';
  const displayLabel = city || 'Your Location';
  const storedLat    = user?.location?.latitude;
  const storedLng    = user?.location?.longitude;

  const [status, setStatus]         = useState('loading'); // 'loading' | 'ready' | 'error'
  const [center, setCenter]         = useState(null);
  const [isApproximate, setIsApproximate] = useState(false);

  const [opportunities, setOpportunities] = useState([]);
  const [loadingOpps, setLoadingOpps]     = useState(true);

  // ── Resolve map center ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function resolveCenter() {
      // 1. Use stored coords if they are real (not the Chennai model default
      //    while the user's city is somewhere else)
      const hasStoredCoords =
        storedLat != null &&
        storedLng != null &&
        Number.isFinite(storedLat) &&
        Number.isFinite(storedLng);

      const coordsAreGenericDefault =
        hasStoredCoords &&
        coordsAreDefaultChennai(storedLat, storedLng) &&
        city &&
        !isCityInChennai(city);

      if (hasStoredCoords && !coordsAreGenericDefault) {
        if (!cancelled) { setCenter([storedLat, storedLng]); setStatus('ready'); }
        return;
      }

      // 2. Forward-geocode the city name
      if (city) {
        const coords = await geocodeCity(`${city}, India`);
        if (!cancelled) {
          if (coords) {
            setCenter(coords);
            setIsApproximate(true);
            setStatus('ready');
            return;
          }
        }
      }

      // 3. Last resort — use stored coords even if they're the default
      if (hasStoredCoords) {
        if (!cancelled) {
          setCenter([storedLat, storedLng]);
          setIsApproximate(true);
          setStatus('ready');
        }
        return;
      }

      // 4. Completely no location data — show error state
      if (!cancelled) setStatus('error');
    }

    resolveCenter();
    return () => { cancelled = true; };
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
            o =>
              (o.location?.latitude && o.location?.longitude) ||
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

  // ── Shared modal shell ────────────────────────────────────────────────────
  const Shell = ({ children }) => (
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
            {isApproximate && (
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
        {children}
      </div>
    </div>
  );

  // ── Loading state ─────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <Shell>
        <div className="h-72 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#16382B]" />
          <p className="text-sm font-medium">
            Locating {city ? <strong>{city}</strong> : 'your location'}…
          </p>
        </div>
      </Shell>
    );
  }

  // ── Error state — no coordinates could be resolved ────────────────────────
  if (status === 'error') {
    return (
      <Shell>
        <div className="h-72 flex flex-col items-center justify-center gap-4 px-8 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-[#16382B]">Location not set</p>
            <p className="text-xs text-slate-500 mt-1">
              Your profile doesn't have a location yet. Complete the onboarding location step
              to see your map and nearby opportunities.
            </p>
          </div>
          <Link
            to="/onboarding"
            onClick={onClose}
            className="btn-primary text-xs py-2.5 px-5"
          >
            Set my location
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Ready state — render map ──────────────────────────────────────────────
  return (
    <Shell>
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
    </Shell>
  );
}
