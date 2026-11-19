import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { gotoMock, beforeNavigateMock } = vi.hoisted(() => ({
  gotoMock: vi.fn().mockResolvedValue(undefined),
  beforeNavigateMock: vi.fn(),
}));

vi.mock("$app/navigation", () => ({
  beforeNavigate: (callback: unknown) => beforeNavigateMock(callback),
  goto: gotoMock,
}));

import NavigationGuardProbe from "./__fixtures__/NavigationGuardProbe.svelte";

type NavigateArgs = {
  to: { url: URL } | null;
  cancel: () => void;
};

let component: ReturnType<typeof mount>;

function mountProbe(isDirty: () => boolean, save: () => Promise<boolean>) {
  component = mount(NavigationGuardProbe, { target: document.body, props: { isDirty, save } });
  flushSync();
  return beforeNavigateMock.mock.calls.at(-1)?.[0] as (args: NavigateArgs) => void;
}

const navigate = (callback: (args: NavigateArgs) => void, href = "http://localhost/other") => {
  const cancel = vi.fn();
  callback({ to: { url: new URL(href) }, cancel });
  flushSync();
  return cancel;
};

const state = () =>
  document.body.querySelector('[data-test-id="guard-open"]')?.textContent?.trim() ?? "";

beforeEach(() => {
  gotoMock.mockClear();
  beforeNavigateMock.mockClear();
});

afterEach(() => {
  if (component) unmount(component);
  document.body.innerHTML = "";
});

describe("useNavigationGuard", () => {
  it("does not interfere with a clean form", () => {
    const callback = mountProbe(
      () => false,
      async () => true,
    );
    const cancel = navigate(callback);

    expect(cancel).not.toHaveBeenCalled();
    expect(state()).toBe("closed");
  });

  it("pauses a dirty navigation and can stay", () => {
    const callback = mountProbe(
      () => true,
      async () => true,
    );
    const cancel = navigate(callback);

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(state()).toBe("open");

    document.body.querySelector<HTMLButtonElement>('[data-test-id="guard-stay"]')?.click();
    flushSync();

    expect(state()).toBe("closed");
    expect(gotoMock).not.toHaveBeenCalled();
  });

  it("discards and continues to the target", () => {
    const callback = mountProbe(
      () => true,
      async () => true,
    );
    navigate(callback, "http://localhost/faculties");

    document.body.querySelector<HTMLButtonElement>('[data-test-id="guard-discard"]')?.click();
    flushSync();

    expect(gotoMock).toHaveBeenCalledWith("http://localhost/faculties");
  });

  it("saves before leaving", async () => {
    const save = vi.fn().mockResolvedValue(true);
    const callback = mountProbe(() => true, save);
    navigate(callback);

    document.body.querySelector<HTMLButtonElement>('[data-test-id="guard-save"]')?.click();
    await vi.waitFor(() => expect(gotoMock).toHaveBeenCalled());

    expect(save).toHaveBeenCalledTimes(1);
  });

  it("stays when the save fails", async () => {
    const save = vi.fn().mockResolvedValue(false);
    const callback = mountProbe(() => true, save);
    navigate(callback);

    document.body.querySelector<HTMLButtonElement>('[data-test-id="guard-save"]')?.click();
    await vi.waitFor(() => expect(save).toHaveBeenCalled());

    expect(gotoMock).not.toHaveBeenCalled();
    expect(state()).toBe("open");
  });

  it("warns on unload only while dirty", () => {
    let dirty = true;
    mountProbe(
      () => dirty,
      async () => true,
    );

    const dirtyEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);

    dirty = false;
    const cleanEvent = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(cleanEvent);
    expect(cleanEvent.defaultPrevented).toBe(false);
  });
});
