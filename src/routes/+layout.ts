import { loadTranslations } from "$lib/common/i18n/config";

export const ssr = true;
export const prerender = false;
export const trailingSlash = "always";

export const load = async ({ url, data }) => {
  const { pathname } = url;
  let initLocale = "en";

  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("preferred-locale");
    if (saved === "es" || saved === "en") {
      initLocale = saved;
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "es") {
        initLocale = "es";
      }
    }
  } else if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "es") {
      initLocale = "es";
    }
  }

  if (typeof window !== "undefined") {
    console.log(
      `[i18n] Initializing translations. Chosen locale: "${initLocale}". (Preferred saved: "${typeof localStorage !== "undefined" ? localStorage.getItem("preferred-locale") : null}", Browser default: "${typeof navigator !== "undefined" ? navigator.language : null}")`,
    );
  }

  await loadTranslations(initLocale, pathname);
  return {
    locale: initLocale,
    metadata: data.metadata,
  };
};
