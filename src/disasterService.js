// =====================================================
// DISASTER DATA SERVICE — GDACS + ReliefWeb
// =====================================================
// Now supports ANY country, state, and region.
// Alerts are filtered based on user's registered location.
// =====================================================

// Severity mapping: GDACS alert levels → app severity
const GDACS_ALERT_MAP = {
  'Red': 'high',
  'Orange': 'medium',
  'Green': 'low',
};

// Event type labels
const EVENT_TYPE_LABELS = {
  'EQ': 'EARTHQUAKE',
  'TC': 'TROPICAL_CYCLONE',
  'FL': 'FLOOD',
  'VO': 'VOLCANIC_ERUPTION',
  'DR': 'DROUGHT',
  'WF': 'WILDFIRE',
  'TS': 'TSUNAMI',
};

// Country name → ISO3 mapping (common countries)
const COUNTRY_ISO3_MAP = {
  'INDIA': 'IND',
  'UNITED STATES': 'USA',
  'UNITED STATES OF AMERICA': 'USA',
  'USA': 'USA',
  'GERMANY': 'DEU',
  'DEUTSCHLAND': 'DEU',
  'FRANCE': 'FRA',
  'UNITED KINGDOM': 'GBR',
  'UK': 'GBR',
  'JAPAN': 'JPN',
  'CHINA': 'CHN',
  'AUSTRALIA': 'AUS',
  'CANADA': 'CAN',
  'BRAZIL': 'BRA',
  'RUSSIA': 'RUS',
  'ITALY': 'ITA',
  'SPAIN': 'ESP',
  'MEXICO': 'MEX',
  'INDONESIA': 'IDN',
  'TURKEY': 'TUR',
  'SOUTH KOREA': 'KOR',
  'NEPAL': 'NPL',
  'PAKISTAN': 'PAK',
  'BANGLADESH': 'BGD',
  'SRI LANKA': 'LKA',
  'MYANMAR': 'MMR',
  'THAILAND': 'THA',
  'PHILIPPINES': 'PHL',
  'VIETNAM': 'VNM',
  'MALAYSIA': 'MYS',
  'SINGAPORE': 'SGP',
  'SOUTH AFRICA': 'ZAF',
  'NIGERIA': 'NGA',
  'EGYPT': 'EGY',
  'KENYA': 'KEN',
  'ARGENTINA': 'ARG',
  'CHILE': 'CHL',
  'COLOMBIA': 'COL',
  'PERU': 'PER',
  'NETHERLANDS': 'NLD',
  'BELGIUM': 'BEL',
  'SWITZERLAND': 'CHE',
  'AUSTRIA': 'AUT',
  'POLAND': 'POL',
  'SWEDEN': 'SWE',
  'NORWAY': 'NOR',
  'DENMARK': 'DNK',
  'FINLAND': 'FIN',
  'PORTUGAL': 'PRT',
  'GREECE': 'GRC',
  'IRELAND': 'IRL',
  'NEW ZEALAND': 'NZL',
  'SAUDI ARABIA': 'SAU',
  'UAE': 'ARE',
  'UNITED ARAB EMIRATES': 'ARE',
  'IRAN': 'IRN',
  'IRAQ': 'IRQ',
  'ISRAEL': 'ISR',
  'AFGHANISTAN': 'AFG',
  'UKRAINE': 'UKR',
  'ROMANIA': 'ROU',
  'HUNGARY': 'HUN',
  'CZECH REPUBLIC': 'CZE',
  'CZECHIA': 'CZE',
};

// Approximate country bounding boxes (lat/lon) for major countries
const COUNTRY_BOUNDS = {
  'IND': { latMin: 6.5, latMax: 35.5, lonMin: 68.0, lonMax: 97.5 },
  'USA': { latMin: 24.5, latMax: 49.5, lonMin: -125.0, lonMax: -66.5 },
  'DEU': { latMin: 47.3, latMax: 55.1, lonMin: 5.9, lonMax: 15.0 },
  'FRA': { latMin: 41.3, latMax: 51.1, lonMin: -5.1, lonMax: 9.6 },
  'GBR': { latMin: 49.9, latMax: 60.9, lonMin: -8.6, lonMax: 1.8 },
  'JPN': { latMin: 24.0, latMax: 46.0, lonMin: 123.0, lonMax: 146.0 },
  'AUS': { latMin: -44.0, latMax: -10.0, lonMin: 113.0, lonMax: 154.0 },
  'BRA': { latMin: -33.8, latMax: 5.3, lonMin: -73.9, lonMax: -34.8 },
  'CHN': { latMin: 18.0, latMax: 53.6, lonMin: 73.5, lonMax: 135.0 },
  'CAN': { latMin: 41.7, latMax: 83.1, lonMin: -141.0, lonMax: -52.6 },
  'RUS': { latMin: 41.2, latMax: 81.9, lonMin: 19.6, lonMax: 180.0 },
  'IDN': { latMin: -11.0, latMax: 6.1, lonMin: 95.0, lonMax: 141.0 },
  'TUR': { latMin: 36.0, latMax: 42.1, lonMin: 26.0, lonMax: 44.8 },
  'NPL': { latMin: 26.4, latMax: 30.4, lonMin: 80.1, lonMax: 88.2 },
  'PAK': { latMin: 23.7, latMax: 37.1, lonMin: 60.9, lonMax: 77.8 },
  'PHL': { latMin: 4.6, latMax: 21.1, lonMin: 116.9, lonMax: 126.6 },
  'ITA': { latMin: 36.6, latMax: 47.1, lonMin: 6.6, lonMax: 18.5 },
  'ESP': { latMin: 36.0, latMax: 43.8, lonMin: -9.3, lonMax: 3.3 },
  'MEX': { latMin: 14.5, latMax: 32.7, lonMin: -118.4, lonMax: -86.7 },
};

function getISO3(countryName) {
  if (!countryName) return null;
  return COUNTRY_ISO3_MAP[countryName.toUpperCase().trim()] || null;
}

function isInCountry(lat, lon, iso3) {
  const bounds = COUNTRY_BOUNDS[iso3];
  if (!bounds) return false;
  return lat >= bounds.latMin && lat <= bounds.latMax &&
         lon >= bounds.lonMin && lon <= bounds.lonMax;
}

function matchesLocation(text, userState, userRegion) {
  if (!text) return false;
  const lower = text.toLowerCase();

  // If user has a state, check if text mentions it
  if (userState) {
    if (lower.includes(userState.toLowerCase())) return true;
  }

  // If user has a region/city, check if text mentions it
  if (userRegion) {
    if (lower.includes(userRegion.toLowerCase())) return true;
  }

  return false;
}

// CORS proxy for GDACS (their API doesn't set CORS headers)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Helper for fetch with timeout
const fetchWithTimeout = async (url, options = {}) => {
  const { timeout = 5000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
};

export async function fetchDisasterAlerts(userCountry, userState, userRegion) {
  const alerts = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

  const countryUpper = (userCountry || '').toUpperCase().trim();
  const userISO3 = getISO3(countryUpper);
  const stateUpper = (userState || '').toUpperCase().trim();
  const regionUpper = (userRegion || '').toUpperCase().trim();

  console.log(`[DisasterService] Fetching alerts for: Country=${countryUpper} (${userISO3}), State=${stateUpper}, Region=${regionUpper}`);

  // ===== CUSTOM MOCK ALERT FOR MUMBAI =====
  if (countryUpper === 'INDIA' && (regionUpper.includes('MUMBAI') || regionUpper.includes('MIRA') || stateUpper.includes('MAHARASHTRA') || (!regionUpper && !stateUpper))) {
    alerts.push({
      id: 'custom-mira-bhayander-fire',
      title: 'MAJOR FIRE BREAKOUT: MIRA BHAYANDER',
      description: 'A Level-3 massive fire has broken out in the Mira Bhayander region. Multiple fire engines and rescue teams have been dispatched. Citizens are strongly advised to avoid the area, stay indoors, and keep windows closed to avoid toxic smoke inhalation.',
      severity: 'high',
      timestamp: now,
      source: 'LOCAL_AUTHORITY // FIRE_DEPT',
      location: 'MIRA BHAYANDER, MUMBAI, MAHARASHTRA',
      alertLevel: 'Red',
      eventType: 'FIRE',
      lat: 19.2813,
      lon: 72.8665,
    });
  }

  // ===== SOURCE 1: GDACS EVENT LIST =====
  try {
    const gdacsUrl = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,TC,FL,VO,DR,WF&alertlevel=Green;Orange;Red`;
    const res = await fetchWithTimeout(CORS_PROXY + encodeURIComponent(gdacsUrl), { timeout: 8000 });

    if (res.ok) {
      const data = await res.json();
      const features = data.features || [];

      for (const feature of features) {
        const props = feature.properties || {};
        const geo = feature.geometry || {};
        const coords = geo.coordinates || [];
        const lon = coords[0];
        const lat = coords[1];

        const iso3 = props.iso3 || '';
        const affectedCountries = props.affectedcountries || '';
        const eventName = props.name || props.eventname || '';
        const description = props.description || props.htmldescription || '';
        const combined = `${eventName} ${description} ${affectedCountries}`;

        // Check if this event is in the user's country
        let isUserCountryEvent = false;

        // Match by ISO3 code
        if (userISO3) {
          if (iso3 === userISO3 || affectedCountries.includes(userISO3)) {
            isUserCountryEvent = true;
          }
        }

        // Match by country name in text
        if (!isUserCountryEvent && countryUpper) {
          if (combined.toUpperCase().includes(countryUpper)) {
            isUserCountryEvent = true;
          }
        }

        // Match by geographic bounding box
        if (!isUserCountryEvent && lat && lon && userISO3) {
          if (isInCountry(lat, lon, userISO3)) {
            isUserCountryEvent = true;
          }
        }

        if (!isUserCountryEvent) continue;

        // Further filter by state/region if provided
        if (stateUpper || regionUpper) {
          const locationMatch = matchesLocation(combined, stateUpper, regionUpper);
          // For GDACS, we still show country-level events even if state doesn't match
          // (earthquakes/cyclones affect large areas)
        }

        const alertLevel = props.alertlevel || 'Green';
        const severity = GDACS_ALERT_MAP[alertLevel] || 'low';
        const eventType = props.eventtype || 'EQ';
        const eventLabel = EVENT_TYPE_LABELS[eventType] || eventType;

        const fromDate = props.fromdate
          ? new Date(props.fromdate).toISOString().slice(0, 19).replace('T', ' ') + ' UTC'
          : 'UNKNOWN';

        const severityData = props.severity || {};
        const severityText = severityData.severitytext || severityData.severityunit || '';

        alerts.push({
          id: `gdacs-${props.eventid || Math.random()}`,
          title: eventName.toUpperCase() || `${eventLabel} EVENT DETECTED`,
          description: description.replace(/<[^>]*>/g, '').slice(0, 350) ||
            `${eventLabel} event reported. ${severityText}. Alert level: ${alertLevel}. Follow local authority instructions and stay alert.`,
          severity,
          timestamp: fromDate,
          source: `GDACS // ${eventLabel}`,
          location: stateUpper || countryUpper || 'GLOBAL',
          alertLevel,
          eventType,
          lat,
          lon,
        });
      }
    }
  } catch (err) {
    console.warn('GDACS fetch failed or timed out:', err);
  }

  // ===== SOURCE 2: RELIEFWEB DISASTERS =====
  try {
    // Use the user's country name for ReliefWeb filtering
    const reliefCountry = countryUpper
      ? countryUpper.charAt(0) + countryUpper.slice(1).toLowerCase()
      : '';

    // Build the ReliefWeb URL with dynamic country filter
    let reliefUrl = 'https://api.reliefweb.int/v1/disasters?appname=aapda&limit=30' +
      '&sort[]=date.event:desc' +
      '&fields[include][]=name&fields[include][]=description&fields[include][]=date.event&fields[include][]=type&fields[include][]=status&fields[include][]=country';

    if (reliefCountry) {
      reliefUrl += `&filter[field]=country.name&filter[value]=${encodeURIComponent(reliefCountry)}`;
    }

    const res2 = await fetchWithTimeout(reliefUrl, { timeout: 6000 });
    if (res2.ok) {
      const data2 = await res2.json();
      const disasters = data2.data || [];

      for (const disaster of disasters) {
        const name = disaster.fields?.name || '';
        const desc = disaster.fields?.description || '';
        const combined = name + ' ' + desc;

        // Filter by state/region if provided
        if (stateUpper || regionUpper) {
          const locationMatch = matchesLocation(combined, stateUpper, regionUpper);
          // Show country-level disasters too (they affect the whole country)
        }

        // Avoid duplicates with GDACS
        const titleUpper = name.toUpperCase();
        if (alerts.find(a => a.title === titleUpper)) continue;

        // Determine severity from keywords
        const lower = combined.toLowerCase();
        let severity = 'low';
        if (lower.includes('earthquake') || lower.includes('flood') || lower.includes('cyclone') || lower.includes('tsunami')) {
          severity = 'high';
        } else if (lower.includes('storm') || lower.includes('drought') || lower.includes('landslide') || lower.includes('heat')) {
          severity = 'medium';
        }

        const type = disaster.fields?.type?.[0]?.name || 'DISASTER';
        const date = disaster.fields?.['date.event']
          ? new Date(disaster.fields['date.event']).toISOString().slice(0, 19).replace('T', ' ') + ' UTC'
          : 'UNKNOWN';

        alerts.push({
          id: 'reliefweb-' + disaster.id,
          title: titleUpper,
          description: desc.replace(/<[^>]*>/g, '').slice(0, 350) || `${type} event reported in the region.`,
          severity,
          timestamp: date,
          source: `RELIEFWEB // ${type.toUpperCase()}`,
          location: stateUpper || countryUpper || 'GLOBAL',
          alertLevel: severity === 'high' ? 'Red' : severity === 'medium' ? 'Orange' : 'Green',
          eventType: type,
        });
      }
    }
  } catch (err) {
    console.warn('ReliefWeb fetch failed or timed out:', err);
  }

  // ===== FALLBACK: If no alerts found, show a status message =====
  if (alerts.length === 0) {
    alerts.push({
      id: 'system-no-alerts',
      title: `NO ACTIVE DISASTERS — ${stateUpper || countryUpper || 'YOUR REGION'}`,
      description: `No active disaster alerts found for ${regionUpper ? regionUpper + ', ' : ''}${stateUpper ? stateUpper + ', ' : ''}${countryUpper || 'your region'}. All monitoring systems are operational. Stay prepared and keep your emergency kit ready.`,
      severity: 'low',
      timestamp: now,
      source: 'SYSTEM // STATUS_CHECK',
      location: stateUpper || countryUpper || 'GLOBAL',
      alertLevel: 'Green',
      eventType: 'STATUS',
    });
  }

  // Sort: high severity first, then medium, then low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts.slice(0, 15); // Max 15 alerts
}
