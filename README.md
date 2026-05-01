# 🚨 AAPDA — Disaster Alert & Emergency Intelligence System

> **आपदा** (AAPDA) — Hindi for "disaster"

A real-time, multi-language disaster alert platform built for India. AAPDA aggregates disaster data from global and national sources, delivers severity-classified alerts, and **automatically translates critical emergency information** into the user's regional language using the Google Translate API.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [How AAPDA Solves It](#-how-aapda-solves-it)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [User Flow](#-user-flow)
- [Screens & Components](#-screens--components)
- [Data Sources](#-data-sources)
- [Translation System](#-translation-system)
- [Authentication & Database](#-authentication--database)
- [Design Philosophy](#-design-philosophy)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Future Scope](#-future-scope)

---

## 🔴 Problem Statement

India is one of the most disaster-prone countries in the world — facing floods, cyclones, earthquakes, heatwaves, and landslides regularly. The core problems with existing alert systems:

1. **Language Barrier** — Official disaster warnings are typically issued in English or Hindi. India has **22 official languages** and hundreds of dialects. A farmer in Tamil Nadu or a fisherman in Odisha may not understand an English-language cyclone warning, putting lives at risk.

2. **Information Fragmentation** — Disaster data is scattered across multiple agencies (GDACS, IMD, CWC, ReliefWeb). There's no single unified dashboard for Indian citizens.

3. **Delayed Reach** — Government SMS alerts are slow and limited. People need instant, visually clear alerts on their phones.

4. **No Personalization** — Existing systems don't personalize alerts based on the user's exact geographic location or language preference.

---

## ✅ How AAPDA Solves It

| Problem | AAPDA's Solution |
|---------|-----------------|
| Language barrier | **Auto-detects user's state** via geolocation → maps to regional language → **translates alerts via Google Translate API** |
| Information fragmentation | **Aggregates from GDACS, ReliefWeb, IMD, CWC** into a single feed |
| Delayed alerts | **Real-time SPA** with instant loading, no page refreshes |
| No personalization | **Geo-located alerts** prioritized by user's state/region + severity classification (LOW / MEDIUM / HIGH) |
| Inaccessible UI | **Terminal-inspired dark UI** with high contrast, designed for readability even in low-light/emergency conditions |

---

## ⚡ Key Features

### 🌍 Multi-Source Disaster Aggregation
- Fetches live data from **GDACS** (Global Disaster Alert Coordination System)
- Pulls humanitarian reports from **ReliefWeb** (UN OCHA)
- 11+ hardcoded Indian disaster alerts as fallback (heatwaves, cyclones, floods, earthquakes, landslides, AQI crises)
- Each alert classified as **LOW** (advisory), **MEDIUM** (elevated), or **HIGH** (critical)

### 🌐 Real-Time Multi-Language Translation
- **Automatic locale detection**: Uses browser geolocation → reverse geocoding → maps Indian state to regional language
- **3-panel alert detail view**:
  1. **Regional Language** (auto-translated on page load)
  2. **English** (original)
  3. **Any Language** (user picks from 22+ languages via searchable dropdown)
- Powered by **Google Translate API** (free endpoint, no API key required)
- Translates: title, description, safety guidelines, and emergency contacts

### 🔐 Google OAuth Authentication
- One-tap **Google Sign-In** via Supabase Auth
- Returning users skip registration (profile loaded from database)
- New users go through a 3-step onboarding flow

### 📍 Geolocation-Aware
- Auto-detects country, state, and region via **BigDataCloud Reverse Geocoding API**
- Maps Indian states to their official regional language (all 28 states + 8 UTs covered)
- Pre-fills registration form with detected location

### 👤 User Profile & Data Persistence
- Full user profiles stored in **Supabase PostgreSQL**
- Fields: name, phone, email, country, state, region, PIN, preferred language, detected locale
- Profile accessible from any device after sign-in

### 🤖 AI Terminal Interface
- Dedicated AI chat-style terminal interface
- Terminal command input with CRT scanline effects
- Designed for future integration with LLM-based disaster Q&A

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | React 18 | Component-based SPA |
| **Build Tool** | Vite 5 | Fast dev server + HMR |
| **Styling** | Tailwind CSS 3.4 | Utility-first responsive styling |
| **Authentication** | Supabase Auth (Google OAuth) | Secure user sign-in |
| **Database** | Supabase PostgreSQL | User profile persistence |
| **Translation** | Google Translate API (free endpoint) | Real-time multi-language translation |
| **Geolocation** | Browser Geolocation API + BigDataCloud | Location detection + reverse geocoding |
| **Disaster Data** | GDACS API + ReliefWeb API | Live global disaster feeds |
| **Typography** | Space Grotesk + Inter (Google Fonts) | Terminal-aesthetic typography |
| **Icons** | Material Symbols Outlined | Consistent iconography |

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     BROWSER (React SPA)                  │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Splash  │→ │Register  │→ │ Verify   │→ │Language  │  │
│  │ Screen  │  │  Form    │  │ Contact  │  │ Settings │  │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘  │
│       │                                        │         │
│       ▼                                        ▼         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              TERMINAL HOMEPAGE                      │ │
│  │  ┌──────────────────────────────────────────────┐   │ │
│  │  │  Alert Cards (Low / Medium / High severity)  │   │ │
│  │  └──────────────┬───────────────────────────────┘   │ │
│  └─────────────────┼───────────────────────────────────┘ │
│                    │ click                                │
│                    ▼                                      │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              ALERT DETAILS PAGE                     │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐  │ │
│  │  │ Regional │ │ English  │ │ Custom Language     │  │ │
│  │  │ Language │ │ Original │ │ (Searchable Picker) │  │ │
│  │  └────┬─────┘ └──────────┘ └─────────┬──────────┘  │ │
│  └───────┼──────────────────────────────┼──────────────┘ │
│          │                              │                │
└──────────┼──────────────────────────────┼────────────────┘
           │                              │
           ▼                              ▼
┌──────────────────┐          ┌──────────────────────┐
│  Google Translate │          │  Google Translate     │
│  API (auto)       │          │  API (on-demand)      │
└──────────────────┘          └──────────────────────┘

External Data Sources:
┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌───────┐
│  GDACS   │  │ ReliefWeb │  │ BigDataCloud │  │  IMD  │
│  (Live)  │  │  (Live)   │  │ (Geocoding)  │  │ (Ref) │
└──────────┘  └───────────┘  └──────────────┘  └───────┘

Backend:
┌────────────────────────────────────────┐
│           SUPABASE                     │
│  ┌──────────┐    ┌──────────────────┐  │
│  │  Auth     │    │  PostgreSQL DB   │  │
│  │ (Google   │    │  (users table)   │  │
│  │  OAuth)   │    │                  │  │
│  └──────────┘    └──────────────────┘  │
└────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ApadaFinal/
├── index.html                    # Entry HTML (Google Fonts, Material Symbols)
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS theme config
├── postcss.config.js             # PostCSS plugins
│
├── video/
│   ├── ref.mp4                   # Desktop splash background video
│   └── refMobile.mp4             # Mobile splash background video
│
├── src/
│   ├── main.jsx                  # React entry point
│   ├── App.jsx                   # Root component — routing, auth, state management
│   ├── index.css                 # Global styles (animations, CRT effects, breach overlay)
│   │
│   ├── supabaseClient.js         # Supabase client initialization
│   ├── disasterService.js        # Disaster data fetching (GDACS + ReliefWeb + fallbacks)
│   ├── translateService.js       # Google Translate API wrapper + language options
│   │
│   ├── Registration.jsx          # Step 1: User registration (name, phone, location)
│   ├── ContactVerification.jsx   # Step 2: Email & phone verification
│   ├── LanguageSettings.jsx      # Step 3: Language preference + locale config
│   │
│   ├── TerminalHomepage.jsx      # Main dashboard — alert feed, severity filters
│   ├── AlertDetails.jsx          # Alert detail view with 3-language translation
│   ├── AITerminal.jsx            # AI chat terminal interface
│   └── AapdaAccountProfileFixed.jsx  # User profile page (CRT glitch effects)
│
├── *.html                        # Static design reference files (not used in app)
└── dist/                         # Production build output
```

---

## 🔄 User Flow

```
1. SPLASH SCREEN
   └─→ User sees AAPDA branding + "Sign in with Google" button
   └─→ Background video plays with CRT scanline effects

2. GOOGLE AUTHENTICATION (Supabase OAuth)
   ├─→ RETURNING USER: Profile loaded from DB → skip to Terminal Homepage
   └─→ NEW USER: Pre-fill name/email from Google → Registration flow

3. REGISTRATION (3 Steps)
   ├─→ Step 1: Full name, phone, country, state, region, PIN
   ├─→ Step 2: Email & phone verification
   └─→ Step 3: Language preference, detected locale, English override toggle

4. TERMINAL HOMEPAGE
   ├─→ Animated boot sequence (typewriter + system init)
   ├─→ Alert cards sorted by severity (HIGH → MEDIUM → LOW)
   ├─→ Each card shows: icon, title, severity badge, location, timestamp
   └─→ Click any card → Alert Details

5. ALERT DETAILS
   ├─→ Panel 1: Auto-translated to user's regional language
   ├─→ Panel 2: Original English version
   ├─→ Panel 3: "Translate to Any Language" with searchable dropdown
   └─→ Safety guidelines + emergency contacts in all translations

6. AI TERMINAL
   └─→ Chat-style interface for future LLM integration

7. PROFILE
   └─→ View all saved data, sign out option, CRT glitch aesthetic
```

---

## 📱 Screens & Components

### 1. Splash Screen (`App.jsx`)
- Full-screen background video (desktop + mobile variants)
- AAPDA glitch logo with violent-jitter animation
- Google Sign-In button with power-surge glow effect
- Breach overlay flash on load

### 2. Registration (`Registration.jsx`)
- 6-field form: name, phone, country, state, region, PIN
- Real-time validation with terminal-style error messages
- Decorative glitch border elements

### 3. Contact Verification (`ContactVerification.jsx`)
- Email + phone verification step
- Encrypted visual motifs
- Monochrome circuit board background

### 4. Language Settings (`LanguageSettings.jsx`)
- 33 languages in dropdown (Indian + international)
- Auto-detected locale display (locked field)
- English override toggle (emergency fail-safe)
- Warning about protocol synchronization delays

### 5. Terminal Homepage (`TerminalHomepage.jsx`)
- Animated boot sequence with typewriter effect
- "SYSTEM BREACH" flash + scanlines
- Scrolling alert feed with animated reveal
- Severity color coding:
  - 🔴 **HIGH** → Red glow border
  - 🟡 **MEDIUM** → Yellow/amber styling
  - 🟢 **LOW** → Green/teal styling
- System status footer (GDACS, ReliefWeb, IMD indicators)
- Bottom navigation bar: HOME / AI / PROFILE

### 6. Alert Details (`AlertDetails.jsx`)
- **3-panel translation view**:
  - Regional language (auto-translated via Google Translate)
  - English (original)
  - Custom language (searchable picker with 22+ options)
- Severity-aware header styling (pulsing glow for critical alerts)
- Safety guidelines and emergency contacts
- Shimmer loading states during translation

### 7. AI Terminal (`AITerminal.jsx`)
- Chat-style message bubbles (AI + User)
- CLI command input with blinking cursor
- Security scan simulation UI
- Connection status indicator

### 8. Profile (`AapdaAccountProfileFixed.jsx`)
- Canvas-based noise animation background
- CRT overlay with scanlines + barrel distortion
- Glitch headline effect on hover
- User data displayed in terminal-style cards
- Sign out with "INITIATE_PROTOCOL_SIGNOUT"

---

## 📡 Data Sources

### GDACS (Global Disaster Alert and Coordination System)
- **Endpoint**: `https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP`
- **Data**: Earthquakes, tropical cyclones, floods, volcanic eruptions, droughts, wildfires
- **Mapping**: GDACS severity (Red/Orange/Green) → App severity (high/medium/low)

### ReliefWeb (UN OCHA)
- **Endpoint**: `https://api.reliefweb.int/v1/reports`
- **Data**: Humanitarian situation reports
- **Filter**: Region = India (South Asia), recent reports

### Hardcoded Fallback Alerts
When APIs are unavailable, 11+ pre-configured Indian disaster alerts are shown:
- Heatwave (Maharashtra) — HIGH
- Cyclone Dana (Odisha) — HIGH
- Brahmaputra Flooding (Assam) — HIGH
- Earthquake (Uttarakhand) — MEDIUM
- Landslide (Himachal Pradesh) — MEDIUM
- AQI Crisis (Delhi NCR) — MEDIUM
- Thunderstorm (Rajasthan) — MEDIUM
- Minor Tremor (Jammu & Kashmir) — LOW
- Coastal Erosion (Kerala) — LOW
- Heat Advisory (Vidarbha) — LOW
- Dense Fog (Punjab) — LOW

---

## 🌐 Translation System

### How It Works

```
User clicks alert card
        │
        ▼
AlertDetails.jsx loads
        │
        ├─→ Extracts lang code from detected_locale
        │   e.g., "Marathi (MR)" → "mr"
        │
        ├─→ Calls translateService.translateText()
        │   for title, description, each guideline, emergency text
        │
        ├─→ API: translate.googleapis.com/translate_a/single
        │   ?client=gtx&sl=en&tl=mr&dt=t&q=<text>
        │
        └─→ Renders translated text in Panel 1 (regional)
            + Panel 3 (custom language on-demand)
```

### Supported Languages (22+)

| Indian Languages | International |
|-----------------|--------------|
| Hindi, Marathi, Tamil, Telugu | English, Spanish, French |
| Bengali, Gujarati, Kannada | German, Japanese, Chinese |
| Malayalam, Punjabi, Odia | Arabic, Russian, Portuguese |
| Assamese, Urdu, Nepali | |

### State → Language Mapping
The system maps all 28 Indian states and 8 Union Territories to their official regional languages:
- Maharashtra → Marathi (MR)
- Tamil Nadu → Tamil (TA)
- West Bengal → Bengali (BN)
- Karnataka → Kannada (KN)
- Kerala → Malayalam (ML)
- And 30+ more...

---

## 🔐 Authentication & Database

### Supabase Auth
- **Provider**: Google OAuth 2.0
- **Flow**: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- **Session**: Persisted via Supabase, auto-restored on reload
- **Timeout**: 5-second fallback if Supabase is unreachable

### Supabase Database (PostgreSQL)

**`users` table schema:**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `auth_id` | TEXT | Supabase Auth user ID |
| `full_name` | TEXT | User's full name |
| `phone_number` | TEXT | Primary phone (10 digits) |
| `email` | TEXT | Email address |
| `verification_phone` | TEXT | Verification phone number |
| `country` | TEXT | Country (auto-detected) |
| `state` | TEXT | State (auto-detected) |
| `region` | TEXT | District/region |
| `pin` | TEXT | PIN code |
| `preferred_language` | TEXT | User-selected language |
| `detected_locale` | TEXT | Auto-detected regional language |
| `emergency_override_english` | BOOLEAN | English fallback toggle |

---

## 🎨 Design Philosophy

AAPDA uses a **military/terminal-inspired dark UI** — this is intentional:

1. **High Contrast for Emergencies** — White text on dark backgrounds is readable in all lighting conditions, including outdoors during disasters
2. **Terminal Aesthetic** — Conveys urgency, authority, and seriousness. Users instinctively trust "system-level" interfaces
3. **CRT Effects** — Scanlines, noise, glitch text, and barrel distortion create an immersive "command center" feel
4. **Motion with Purpose** — Animations (typewriter boot, breach flash, jitter) aren't decorative; they simulate system initialization and maintain attention
5. **Severity Color Language**:
   - 🔴 Red (`#ff3b3b`) — Critical/life-threatening
   - 🟡 Yellow (`#ffb800`) — Elevated risk
   - 🟢 Green (`#22c55e`) — Advisory/low risk
   - ⚪ White — System text and UI elements

### Fonts
- **Space Grotesk** — Headlines, branding (geometric, futuristic)
- **Inter** — Body text, readability
- **Space Mono** — Monospaced elements, data fields, terminal output

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ApadaFinal.git
cd ApadaFinal

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be running at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview    # Preview the production build
```

---

## 🔑 Environment Variables

The project uses hardcoded Supabase credentials in `supabaseClient.js`. For production, migrate these to environment variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

No API keys are needed for:
- Google Translate (uses free `gtx` client endpoint)
- GDACS (public API)
- ReliefWeb (public API)
- BigDataCloud Reverse Geocoding (free tier)

---

## 🔮 Future Scope

- [ ] **Live Push Notifications** — Firebase Cloud Messaging for real-time push alerts
- [ ] **AI-Powered Q&A** — Integrate Gemini/GPT for disaster preparedness queries in the AI Terminal
- [ ] **Offline Mode** — Service worker caching for alerts when network is unavailable
- [ ] **SOS Beacon** — One-tap emergency signal with GPS coordinates sent to emergency services
- [ ] **Community Reports** — User-submitted disaster reports with photo/video evidence
- [ ] **Evacuation Route Maps** — Integrated maps with shelter locations and safe routes
- [ ] **Voice Alerts** — Text-to-speech for visually impaired users (in regional languages)
- [ ] **SMS Fallback** — Auto-send alert summaries via SMS for users without internet
- [ ] **PWA** — Progressive Web App for installable mobile experience

---

## 📜 License

This project is developed as an academic/research initiative for disaster management and public safety.

---

<p align="center">
  <b>AAPDA</b> — Because in a disaster, every second counts. And language should never be the barrier. 🇮🇳
</p>
