import i18n from "sveltekit-i18n";

/** @type {import('sveltekit-i18n').Config} */
const config = {
  loaders: [
    {
      locale: "en",
      key: "validation",
      loader: async () => (await import("./en/validation.json")).default,
    },
    {
      locale: "en",
      key: "dashboard",
      loader: async () => (await import("./en/dashboard.json")).default,
    },
    {
      locale: "en",
      key: "faculties",
      loader: async () => (await import("./en/faculties.json")).default,
    },
    {
      locale: "en",
      key: "layout",
      loader: async () => (await import("./en/layout.json")).default,
    },
    {
      locale: "es",
      key: "validation",
      loader: async () => (await import("./es/validation.json")).default,
    },
    {
      locale: "es",
      key: "dashboard",
      loader: async () => (await import("./es/dashboard.json")).default,
    },
    {
      locale: "es",
      key: "faculties",
      loader: async () => (await import("./es/faculties.json")).default,
    },
    {
      locale: "es",
      key: "layout",
      loader: async () => (await import("./es/layout.json")).default,
    },
  ],
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
