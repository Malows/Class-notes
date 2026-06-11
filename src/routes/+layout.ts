import { loadTranslations } from "$lib/i18n/config";

export const ssr = false;
export const prerender = false;
export const trailingSlash = "always";

export const load = async ({ url }) => {
  const { pathname } = url;
  const initLocale = "en";
  await loadTranslations(initLocale, pathname);
  return {};
};
