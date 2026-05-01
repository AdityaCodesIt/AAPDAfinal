// =====================================================
// TRANSLATION SERVICE — Google Translate (free endpoint)
// =====================================================

/**
 * Translate a single text string from one language to another.
 * Uses the free Google Translate API endpoint (no key needed).
 */
export async function translateText(text, targetLang, sourceLang = 'en') {
  if (!text || !targetLang || targetLang === sourceLang) return text;
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(x => x[0]).join('');
  } catch (e) {
    console.error('Translation failed:', e);
    return text;
  }
}

/**
 * Translate multiple fields of an object.
 * @param {Object} fields - { key: "text to translate" }
 * @param {string} targetLang - target language code
 * @returns {Object} - { key: "translated text" }
 */
export async function translateFields(fields, targetLang, sourceLang = 'en') {
  const entries = Object.entries(fields);
  const results = {};
  for (const [key, text] of entries) {
    results[key] = await translateText(text, targetLang, sourceLang);
  }
  return results;
}

/**
 * Extract language code from locale string like "Marathi (MR)" → "mr"
 */
export function extractLangCode(localeString) {
  if (!localeString) return 'hi';
  const match = localeString.match(/\(([A-Z]{2,3})\)/i);
  return match ? match[1].toLowerCase() : 'hi';
}

/**
 * List of supported Indian + major world languages for the translate picker.
 */
export const LANGUAGE_OPTIONS = [
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'ne', label: 'Nepali', native: 'नेपाली' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
];
