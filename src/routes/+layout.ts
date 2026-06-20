import { loadTranslations } from "$lib/i18n/config";

export const ssr = false;
export const prerender = false;
export const trailingSlash = "always";

export const load = async ({ url }) => {
  const { pathname } = url;
  let initLocale = "en";

  if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0]; // e.g., "es-ES" -> "es"
    if (browserLang === "es") {
      initLocale = "es";
    }
    console.log(`[i18n] Detected browser language: "${navigator.language}", setting locale to: "${initLocale}"`);
  } else {
    console.log(`[i18n] Navigator is undefined (non-browser environment), defaulting locale to: "${initLocale}"`);
  }

  await loadTranslations(initLocale, pathname);
  return {};
};
