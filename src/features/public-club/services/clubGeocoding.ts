/**
 * @fileoverview Geocoding and location resolution service for clubs and user profiles.
 */

// Well-known country capitals coordinates [lat, lng]
const COUNTRY_CAPITALS: Record<string, [number, number]> = {
  spain: [40.4168, -3.7038],
  espana: [40.4168, -3.7038],
  es: [40.4168, -3.7038],
  "united states": [38.9072, -77.0369],
  usa: [38.9072, -77.0369],
  us: [38.9072, -77.0369],
  "united kingdom": [51.5074, -0.1278],
  uk: [51.5074, -0.1278],
  gb: [51.5074, -0.1278],
  england: [51.5074, -0.1278],
  france: [48.8566, 2.3522],
  fr: [48.8566, 2.3522],
  germany: [52.5200, 13.4050],
  de: [52.5200, 13.4050],
  italy: [41.9028, 12.4964],
  it: [41.9028, 12.4964],
  portugal: [38.7223, -9.1393],
  pt: [38.7223, -9.1393],
  netherlands: [52.3676, 4.9041],
  nl: [52.3676, 4.9041],
  belgium: [50.8503, 4.3517],
  be: [50.8503, 4.3517],
  switzerland: [46.9480, 7.4474],
  ch: [46.9480, 7.4474],
  austria: [48.2082, 16.3738],
  at: [48.2082, 16.3738],
  canada: [45.4215, -75.6972],
  ca: [45.4215, -75.6972],
  australia: [-35.2809, 149.1300],
  au: [-35.2809, 149.1300],
  pakistan: [33.6844, 73.0479],
  pk: [33.6844, 73.0479],
  india: [28.6139, 77.2090],
  in: [28.6139, 77.2090],
  uae: [24.4539, 54.3773],
  "united arab emirates": [24.4539, 54.3773],
  "saudi arabia": [24.7136, 46.6753],
  sa: [24.7136, 46.6753],
  brazil: [-15.7975, -47.8919],
  br: [-15.7975, -47.8919],
  mexico: [19.4326, -99.1332],
  mx: [19.4326, -99.1332],
  japan: [35.6762, 139.6503],
  jp: [35.6762, 139.6503],
  norway: [59.9139, 10.7522],
  no: [59.9139, 10.7522],
  sweden: [59.3293, 18.0686],
  se: [59.3293, 18.0686],
  denmark: [55.6761, 12.5683],
  dk: [55.6761, 12.5683],
  finland: [60.1699, 24.9384],
  fi: [60.1699, 24.9384],
  ireland: [53.3498, -6.2603],
  ie: [53.3498, -6.2603],
  poland: [52.2297, 21.0122],
  pl: [52.2297, 21.0122],
  greece: [37.9838, 23.7275],
  gr: [37.9838, 23.7275],
  turkey: [39.9334, 32.8597],
  tr: [39.9334, 32.8597],
  colombia: [4.7110, -74.0721],
  co: [4.7110, -74.0721],
  argentina: [-34.6037, -58.3816],
  ar: [-34.6037, -58.3816],
};

// Common city / region coordinates for instant resolution
const CITY_COORDINATES: Record<string, [number, number]> = {
  aguero: [42.3556, -0.7931],
  agüero: [42.3556, -0.7931],
  huesca: [42.1401, -0.4089],
  zaragoza: [41.6488, -0.8891],
  madrid: [40.4168, -3.7038],
  barcelona: [41.3879, 2.1699],
  valencia: [39.4699, -0.3763],
  sevilla: [37.3891, -5.9845],
  seville: [37.3891, -5.9845],
  malaga: [36.7213, -4.4214],
  bilbao: [43.2630, -2.9350],
  london: [51.5074, -0.1278],
  paris: [48.8566, 2.3522],
  berlin: [52.5200, 13.4050],
  rome: [41.9028, 12.4964],
  roma: [41.9028, 12.4964],
  milan: [45.4642, 9.1900],
  milano: [45.4642, 9.1900],
  amsterdam: [52.3676, 4.9041],
  lisbon: [38.7223, -9.1393],
  lisboa: [38.7223, -9.1393],
  porto: [41.1579, -8.6291],
  "new york": [40.7128, -74.0060],
  "los angeles": [34.0522, -118.2437],
  "san francisco": [37.7749, -122.4194],
  chicago: [41.8781, -87.6298],
  miami: [25.7617, -80.1918],
  austin: [30.2672, -97.7431],
  sydney: [-33.8688, 151.2093],
  melbourne: [-37.8136, 144.9631],
  toronto: [43.6532, -79.3832],
  vancouver: [49.2827, -123.1207],
  tokyo: [35.6762, 139.6503],
  islamabad: [33.6844, 73.0479],
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  dubai: [25.2048, 55.2708],
};

const geocodeCache: Record<string, [number, number]> = {};

/**
 * Resolves country name to its capital coordinates.
 */
export const getCoordinatesForCountry = (country?: string): [number, number] | null => {
  if (!country) return null;
  const key = country.trim().toLowerCase();
  if (COUNTRY_CAPITALS[key]) {
    return COUNTRY_CAPITALS[key];
  }
  for (const [name, coords] of Object.entries(COUNTRY_CAPITALS)) {
    if (key.includes(name) || name.includes(key)) {
      return coords;
    }
  }
  return null;
};

/**
 * Resolves club location text to lat/lng coordinates.
 */
export const resolveClubCoordinates = async (
  club: any,
  index: number = 0,
  referenceCoords?: [number, number] | null
): Promise<[number, number]> => {
  // 1. Direct coordinates on object
  if (club.latitude && club.longitude) {
    const lat = Number(club.latitude);
    const lng = Number(club.longitude);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }
  if (club.lat && club.lng) {
    const lat = Number(club.lat);
    const lng = Number(club.lng);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  const rawLocation = club.location ? String(club.location).trim() : "";

  // 2. Comma separated coordinates (e.g. "40.4168, -3.7038")
  const coordMatch = rawLocation.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[3]);
    if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
  }

  // 3. Cache lookup
  const cacheKey = rawLocation.toLowerCase();
  if (geocodeCache[cacheKey]) {
    return geocodeCache[cacheKey];
  }

  // Try sessionStorage cache
  try {
    const stored = sessionStorage.getItem(`geo_${cacheKey}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 2) {
        geocodeCache[cacheKey] = parsed as [number, number];
        return parsed as [number, number];
      }
    }
  } catch {}

  // 4. Built-in city dictionary lookup
  for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
    if (cacheKey.includes(city)) {
      geocodeCache[cacheKey] = coords;
      try {
        sessionStorage.setItem(`geo_${cacheKey}`, JSON.stringify(coords));
      } catch {}
      return coords;
    }
  }

  // 5. Country dictionary lookup
  for (const [country, coords] of Object.entries(COUNTRY_CAPITALS)) {
    if (cacheKey.includes(country)) {
      // Jitter slightly so multiple clubs in same country aren't identical pixel
      const jitterLat = coords[0] + ((index % 5) - 2) * 0.08;
      const jitterLng = coords[1] + (((index * 3) % 5) - 2) * 0.08;
      const result: [number, number] = [jitterLat, jitterLng];
      geocodeCache[cacheKey] = result;
      return result;
    }
  }

  // 6. Google Geocoding API if key available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (apiKey && rawLocation) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          rawLocation
        )}&key=${apiKey}`
      );
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        const result: [number, number] = [loc.lat, loc.lng];
        geocodeCache[cacheKey] = result;
        try {
          sessionStorage.setItem(`geo_${cacheKey}`, JSON.stringify(result));
        } catch {}
        return result;
      }
    } catch {}
  }

  // 7. Fallback: reference coordinates with jitter, or default to Spain/Agüero region
  const baseLat = referenceCoords ? referenceCoords[0] : 42.3556;
  const baseLng = referenceCoords ? referenceCoords[1] : -0.7931;

  // Apply deterministic jitter based on club id or index
  const offsetId = Number(club.id) || index;
  const jitterLat = baseLat + ((offsetId % 7) - 3) * 0.05;
  const jitterLng = baseLng + (((offsetId * 2) % 7) - 3) * 0.05;
  return [jitterLat, jitterLng];
};

/**
 * Resolves an image URL from the backend, handling relative uploads, windows paths,
 * or returning the fallback.
 */
export const resolveImageUrl = (img?: string | null): string => {
  if (!img || typeof img !== "string" || img.trim() === "" || img === "null" || img === "undefined") return "";
  const trimmed = img.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("./")) {
    return trimmed;
  }
  const cleanPath = trimmed.replace(/\\/g, "/").replace(/^\/?(uploads\/)?/, "");
  const imageBase = (import.meta.env.VITE_APP_IMAGE_BASE_URL || "https://api.ridewithpals.com/uploads").replace(/\/$/, "");
  return `${imageBase}/${cleanPath}`;
};

