import { describe, expect, it } from "vitest";

import { getActivePeriodKey } from "./active-period";

describe("getActivePeriodKey", () => {
  it("maps March to July to semester 1 of the current year", () => {
    expect(getActivePeriodKey(new Date("2026-03-15T12:00:00.000Z"))).toEqual({
      year: 2026,
      semester: 1,
    });
    expect(getActivePeriodKey(new Date("2026-07-31T12:00:00.000Z"))).toEqual({
      year: 2026,
      semester: 1,
    });
  });

  it("maps August to December to semester 2 of the current year", () => {
    expect(getActivePeriodKey(new Date("2026-08-01T12:00:00.000Z"))).toEqual({
      year: 2026,
      semester: 2,
    });
    expect(getActivePeriodKey(new Date("2026-12-24T12:00:00.000Z"))).toEqual({
      year: 2026,
      semester: 2,
    });
  });

  it("maps January and February to semester 2 of the previous year", () => {
    expect(getActivePeriodKey(new Date("2026-01-15T12:00:00.000Z"))).toEqual({
      year: 2025,
      semester: 2,
    });
    expect(getActivePeriodKey(new Date("2026-02-28T12:00:00.000Z"))).toEqual({
      year: 2025,
      semester: 2,
    });
  });
});
