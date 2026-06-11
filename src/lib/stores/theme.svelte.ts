export class ThemeStore {
  #current = $state<"light" | "dark">("light");

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as "light" | "dark";
      if (saved) {
        this.#current = saved;
      } else if (
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        this.#current = "dark";
      }
      this.#updateDOM();
    }
  }

  get current() {
    return this.#current;
  }

  toggle = () => {
    this.#current = this.#current === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", this.#current);
      this.#updateDOM();
    }
  };

  #updateDOM() {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", this.#current === "dark");
    }
  }
}

export const themeStore = new ThemeStore();
