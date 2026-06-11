import i18n from "sveltekit-i18n";

/** @type {import('sveltekit-i18n').Config} */
const config = {
  loaders: [
    {
      locale: "en",
      key: "common",
      loader: async () => (await import("./en/common.json")).default,
    },
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
      key: "subjects",
      loader: async () => (await import("./en/subjects.json")).default,
    },
    {
      locale: "en",
      key: "periods",
      loader: async () => (await import("./en/periods.json")).default,
    },
    {
      locale: "en",
      key: "commissions",
      loader: async () => (await import("./en/commissions.json")).default,
    },
    {
      locale: "en",
      key: "students",
      loader: async () => (await import("./en/students.json")).default,
    },
    {
      locale: "en",
      key: "assignments",
      loader: async () => (await import("./en/assignments.json")).default,
    },
    {
      locale: "en",
      key: "layout",
      loader: async () => (await import("./en/layout.json")).default,
    },
    {
      locale: "es",
      key: "common",
      loader: async () => (await import("./es/common.json")).default,
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
      key: "subjects",
      loader: async () => (await import("./es/subjects.json")).default,
    },
    {
      locale: "es",
      key: "periods",
      loader: async () => (await import("./es/periods.json")).default,
    },
    {
      locale: "es",
      key: "commissions",
      loader: async () => (await import("./es/commissions.json")).default,
    },
    {
      locale: "es",
      key: "students",
      loader: async () => (await import("./es/students.json")).default,
    },
    {
      locale: "es",
      key: "assignments",
      loader: async () => (await import("./es/assignments.json")).default,
    },
    {
      locale: "es",
      key: "layout",
      loader: async () => (await import("./es/layout.json")).default,
    },
  ],
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
