## Context

The application needs theme support.

## Goals / Non-Goals

**Goals:**

- Implement light, dark, and auto modes.
- Toggle switch UI component.

**Non-Goals:**

- Advanced theme customization for users.

## Decisions

- **Mechanism**: Use CSS variables for color values and Svelte state/localStorage to persist preference.
- **Theme Selection**: Logic that listens to system preferences (for 'auto') and overrides if user chooses light/dark.

## Risks / Trade-offs

- [Risk] Flash of incorrect theme on initial page load. → Mitigation: Add a small blocking script in `app.html` to set theme before DOM renders.
