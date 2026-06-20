# Persistent Locale Selector with localStorage & A11y

## Objective

Build an interactive, keyboard-accessible language selector in the navigation bar (`NavBar.svelte`) that overrides browser detection based on user preference, saves choices in `localStorage`, and instantly updates the page language dynamically for assistive technologies.

## Key Files & Context

- **Configuration**: `src/lib/i18n/config.ts`
- **Initial Loader**: `src/routes/+layout.ts`
- **Page Layout**: `src/routes/+layout.svelte`
- **Navigation Bar**: `src/lib/components/layout/NavBar.svelte`
- **Translations**:
  - `src/lib/i18n/es/layout.json`
  - `src/lib/i18n/en/layout.json`

## Accessibility (A11y) Assertions

1. **Explicit ARIA Labeling**:
   - The toggle element must possess a clear `aria-label` detailing the action (e.g. `aria-label="Cambiar idioma a Español"` when currently in English, and vice versa).
   - Alternatively, if using a dropdown component, the trigger must use `aria-haspopup="listbox"` and `aria-expanded` reflecting the popup state.
2. **Keyboard Focusability**:
   - The selector must be navigable using the `Tab` key, utilizing a native `<button>` element rather than non-semantic elements.
   - Active focus outlines must remain clearly visible and styled with hand-drawn aesthetic parameters (`sketch-border` / `outline: 2px solid var(--border-color)`).
3. **Instant Document-Lang Synchronization**:
   - Upon changing the locale, the `document.documentElement.lang` attribute must immediately synchronize with the new locale to ensure browser screen-reader engines instantly switch language speech synthesis modules without needing a page refresh.

## Implementation Steps

### Step 1: Update the +layout.ts Loader
1. Update `load` to inspect `localStorage` first:
   - If `localStorage.getItem("preferred-locale")` exists, use it as `initLocale`.
   - If not, fall back to `navigator.language` split-codes ("es" or "en").
   - Handle server-side safe checks (check if `typeof window !== "undefined"` or `typeof localStorage !== "undefined"`).

### Step 2: Implement Selector Component in NavBar
1. Design the selector inside `NavBar.svelte`:
   - Bind a click handler that calls Sveltekit-i18n's exported reactive `locale.set("es" | "en")` and updates `localStorage.setItem("preferred-locale", value)`.
   - Style the button to fit the hand-drawn paper aesthetic (e.g., using small paper-style toggles).
   - Ensure `aria-label` dynamically reflects the target language options.

## Verification & Testing

1. **Automated Testing**:
   - Update `NavBar.test.ts` to assert that the toggle is present, can be clicked, and changes the active language.
2. **Persistence Validation**:
   - Manually toggle language to Spanish, refresh the page, and assert that the site renders in Spanish immediately without defaulting.
