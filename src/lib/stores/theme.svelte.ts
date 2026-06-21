import { locale } from "$lib/i18n/config";

export class ThemeStore {
  #currentTheme = $state<"light" | "dark">("light");
  #currentLocale = $state<"es" | "en">("en");
  #esClickCount = $state<number>(0);

  constructor() {
    if (typeof window !== "undefined") {
      // 1. Initialize Theme
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      if (savedTheme) {
        this.#currentTheme = savedTheme;
      } else if (
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        this.#currentTheme = "dark";
      }
      this.#updateDOMTheme();

      // 2. Initialize Locale
      const savedLocale = localStorage.getItem("preferred-locale") as "es" | "en";
      if (savedLocale === "es" || savedLocale === "en") {
        this.#currentLocale = savedLocale;
      } else if (typeof navigator !== "undefined") {
        const browserLang = navigator.language.split("-")[0];
        if (browserLang === "es") {
          this.#currentLocale = "es";
        }
      }

      // 3. Initialize Spanish Click Counter
      const savedCount = localStorage.getItem("es-click-count");
      if (savedCount) {
        this.#esClickCount = Number(savedCount);
      }

      // Synchronize initial locale store
      locale.set(this.#currentLocale);
    }
  }

  get currentTheme() {
    return this.#currentTheme;
  }

  get currentLocale() {
    return this.#currentLocale;
  }

  get esFlag() {
    // Alternates between Argentina (🇦🇷) and Colombia (🇨🇴) on each transition to Spanish
    // When esClickCount is even (including 0 initially), show 🇦🇷. When odd, show 🇨🇴.
    return this.#esClickCount % 2 === 0 ? "🇦🇷" : "🇨🇴";
  }

  // Backward compatibility getters & methods
  get current() {
    return this.#currentTheme;
  }

  toggle = () => {
    this.toggleTheme();
  };

  toggleTheme = () => {
    this.#currentTheme = this.#currentTheme === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", this.#currentTheme);
      this.#updateDOMTheme();
    }
  };

  toggleLanguage = () => {
    const next = this.#currentLocale === "en" ? "es" : "en";
    this.#currentLocale = next;

    if (next === "es") {
      this.#esClickCount += 1;
      if (typeof window !== "undefined") {
        localStorage.setItem("es-click-count", String(this.#esClickCount));
      }
    }

    locale.set(next);

    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-locale", next);
    }
  };

  #updateDOMTheme() {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", this.#currentTheme === "dark");
    }
  }
}

export const themeStore = new ThemeStore();
