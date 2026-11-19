import type { Handle } from "@sveltejs/kit";

/**
 * The document language must be right before hydration. The client persists the
 * chosen locale in a cookie so SSR can set `<html lang>` on the first paint.
 */
export const handle: Handle = async ({ event, resolve }) => {
  const locale = event.cookies.get("preferred-locale") === "en" ? "en" : "es";

  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace("%lang%", locale),
  });
};
