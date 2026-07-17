import * as matchers from "@testing-library/jest-dom/matchers";
import { afterEach, expect } from "vitest";
import { cleanup } from "@testing-library/react";

expect.extend(matchers);

// Explicit cleanup since `test.globals` is off — RTL's auto-cleanup relies on
// detecting a global `afterEach`, which doesn't exist without it.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia — AppLayout uses it to detect the lg breakpoint.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
