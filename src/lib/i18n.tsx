import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Display-language preference for the global chrome (navigation, menu,
 * ecosystem bar, footer headings) — following the family sites' language
 * switcher (English / Français / العربية). Course and lesson content itself
 * remains in English; the switcher localizes the shared site chrome and sets
 * the document direction (RTL for Arabic).
 */

export type Language = "en" | "fr" | "ar";

export const LANGUAGES: { id: Language; label: string; dir: "ltr" | "rtl" }[] = [
  { id: "en", label: "English", dir: "ltr" },
  { id: "fr", label: "Français", dir: "ltr" },
  { id: "ar", label: "العربية", dir: "rtl" },
];

const STORAGE_KEY = "ndh-academy-language";

const en = {
  "nav.courses": "Courses",
  "nav.pricing": "Pricing",
  "nav.about": "About",
  "nav.faq": "FAQ",
  "nav.contact": "Contact",
  "nav.verify": "Verify a certificate",
  "menu.title": "Menu",
  "menu.onThisSite": "On this site",
  "menu.ecosystem": "Najeeb Digital Hub ecosystem",
  "menu.preferences": "Preferences",
  "menu.language": "Language",
  "menu.currency": "Currency",
  "menu.currencyNote": "USD shown for reference — you are charged in Naira (₦).",
  "menu.login": "Log in",
  "menu.logout": "Log out",
  "menu.dashboard": "Dashboard",
  "menu.admin": "Admin portal",
  "menu.startLearning": "Start learning",
  "menu.current": "You are here",
  "footer.tracks": "Popular tracks",
  "footer.academy": "Academy",
  "footer.family": "Najeeb Digital Hub",
} as const;

export type ChromeKey = keyof typeof en;

const fr: Record<ChromeKey, string> = {
  "nav.courses": "Cours",
  "nav.pricing": "Tarifs",
  "nav.about": "À propos",
  "nav.faq": "FAQ",
  "nav.contact": "Contact",
  "nav.verify": "Vérifier un certificat",
  "menu.title": "Menu",
  "menu.onThisSite": "Sur ce site",
  "menu.ecosystem": "Écosystème Najeeb Digital Hub",
  "menu.preferences": "Préférences",
  "menu.language": "Langue",
  "menu.currency": "Devise",
  "menu.currencyNote": "USD affiché à titre indicatif — vous êtes facturé en naira (₦).",
  "menu.login": "Se connecter",
  "menu.logout": "Se déconnecter",
  "menu.dashboard": "Tableau de bord",
  "menu.admin": "Portail admin",
  "menu.startLearning": "Commencer",
  "menu.current": "Vous êtes ici",
  "footer.tracks": "Parcours populaires",
  "footer.academy": "Académie",
  "footer.family": "Najeeb Digital Hub",
};

const ar: Record<ChromeKey, string> = {
  "nav.courses": "الدورات",
  "nav.pricing": "الأسعار",
  "nav.about": "حول",
  "nav.faq": "الأسئلة الشائعة",
  "nav.contact": "اتصل بنا",
  "nav.verify": "التحقق من شهادة",
  "menu.title": "القائمة",
  "menu.onThisSite": "في هذا الموقع",
  "menu.ecosystem": "منظومة نجيب ديجيتال هب",
  "menu.preferences": "التفضيلات",
  "menu.language": "اللغة",
  "menu.currency": "العملة",
  "menu.currencyNote": "يُعرض الدولار للاسترشاد فقط — تتم المحاسبة بالنيرة (₦).",
  "menu.login": "تسجيل الدخول",
  "menu.logout": "تسجيل الخروج",
  "menu.dashboard": "لوحة التحكم",
  "menu.admin": "بوابة الإدارة",
  "menu.startLearning": "ابدأ التعلم",
  "menu.current": "أنت هنا",
  "footer.tracks": "المسارات الشائعة",
  "footer.academy": "الأكاديمية",
  "footer.family": "نجيب ديجيتال هب",
};

const DICTIONARIES: Record<Language, Record<ChromeKey, string>> = { en, fr, ar };

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: ChromeKey) => string;
}>({ language: "en", setLanguage: () => {}, t: (key) => en[key] });

export function LanguageProvider({ children }: { children: ReactNode }) {
  // SSR and first paint render English so hydration matches; the stored
  // preference applies after mount.
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "fr" || stored === "ar") setLanguageState(stored);
    } catch {
      /* ignore */
    }
  }, []);

  // Reflect the choice on the document (lang attribute + text direction).
  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0]!;
    document.documentElement.lang = language;
    document.documentElement.dir = meta.dir;
  }, [language]);

  const setLanguage = (next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const t = (key: ChromeKey) => DICTIONARIES[language][key] ?? en[key];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
