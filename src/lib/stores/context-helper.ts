import { setContext, getContext } from "svelte";

export function createStoreContext<T>(key: string) {
  return {
    set: (store: T) => setContext(key, store),
    get: () => getContext<T>(key),
  };
}
