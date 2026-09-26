// Google Translate Integration Utilities for Multilingual Support

export const LANGUAGES = {
  en: { name: "English", nativeName: "English", googleCode: "en" },
  hi: { name: "Hindi", nativeName: "हिंदी", googleCode: "hi" },
  as: { name: "Assamese", nativeName: "অসমীয়া", googleCode: "as" },
  bn: { name: "Bengali", nativeName: "বাংলা", googleCode: "bn" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી", googleCode: "gu" },
  mr: { name: "Marathi", nativeName: "मराठी", googleCode: "mr" },
  ta: { name: "Tamil", nativeName: "தமிழ்", googleCode: "ta" },
  te: { name: "Telugu", nativeName: "తెలుగు", googleCode: "te" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ", googleCode: "kn" },
  or: { name: "Odia", nativeName: "ଓଡ଼ିଆ", googleCode: "or" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", googleCode: "pa" },
  ne: { name: "Nepali", nativeName: "नेपाली", googleCode: "ne" },
  mni: { name: "Manipuri", nativeName: "মৈতৈলোন্", googleCode: "mni-Mtei" },
  lus: { name: "Mizo", nativeName: "Mizo ṭawng", googleCode: "lus" },
  kha: { name: "Khasi", nativeName: "Ka Ktien Khasi", googleCode: "kha" },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages: string;
            layout?: number;
          },
          elementId: string
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

/**
 * Load Google Translate script dynamically
 */
export function loadGoogleTranslateScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.translate) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="translate.google.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject());
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.onerror = () =>
      reject(new Error("Failed to load Google Translate script"));

    document.head.appendChild(script);

    window.googleTranslateElementInit = () => {
      resolve();
    };
  });
}

/**
 * Initialize Google Translate widget
 */
export function initGoogleTranslate(): void {
  if (!window.google?.translate?.TranslateElement) {
    console.warn("Google Translate not loaded yet");
    return;
  }

  const includedLanguages = Object.values(LANGUAGES)
    .map((lang) => lang.googleCode)
    .join(",");

  new window.google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages,
      layout: 0,
    },
    "google_translate_element"
  );
}

/**
 * Get current language from googtrans cookie
 */
export function getLanguageFromCookie(): LanguageCode {
  if (typeof document === 'undefined') return 'en';
  const cookies = document.cookie.split(";");
  const googtransCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("googtrans=")
  );

  if (!googtransCookie) return "en";

  const value = googtransCookie.split("=")[1];
  const parts = value.split("/");
  const langCode = parts[2] || "en";

  for (const [key, lang] of Object.entries(LANGUAGES)) {
    if (lang.googleCode === langCode) {
      return key as LanguageCode;
    }
  }

  return "en";
}

/**
 * Set googtrans cookie
 */
export function setLanguageCookie(langCode: LanguageCode): void {
  if (typeof document === 'undefined') return;
  const target = LANGUAGES[langCode] || LANGUAGES.en;
  const googleCode = target.googleCode;
  const cookieValue = `/en/${googleCode}`;

  document.cookie = "googtrans=; path=/; max-age=0";
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `googtrans=${cookieValue}; path=/; max-age=${maxAge}`;
  document.cookie = `googtrans=${cookieValue}; path=/; domain=${window.location.hostname}; max-age=${maxAge}`;
}

/**
 * Change language and reload page
 */
export function changeLanguage(langCode: LanguageCode): void {
  setLanguageCookie(langCode);
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem("selectedLanguage", langCode);
  }
  window.location.reload();
}

/**
 * Get initial language
 */
export function getInitialLanguage(): LanguageCode {
  const cookieLang = getLanguageFromCookie();
  if (cookieLang !== "en") return cookieLang;

  if (typeof localStorage !== 'undefined') {
    const storedLang = localStorage.getItem("selectedLanguage") as LanguageCode;
    if (storedLang && storedLang in LANGUAGES) return storedLang;
  }

  return "en";
}
