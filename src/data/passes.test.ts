import { describe, expect, it } from "vitest";
import { applyPass, canUnlock, EMPTY_WALLET, passTier } from "./passes";

describe("course passes", () => {
  it("has the agreed prices and course counts", () => {
    expect(passTier("starter")).toMatchObject({ priceNgn: 3000, courses: 3 });
    expect(passTier("skill")).toMatchObject({ priceNgn: 6500, courses: 8 });
    expect(passTier("pro")).toMatchObject({ priceNgn: 12000, courses: 18 });
    expect(passTier("all")).toMatchObject({ priceNgn: 25000, courses: null });
  });

  it("starter gives 3 credits and blocks the 4th course", () => {
    const w = applyPass(EMPTY_WALLET, passTier("starter")!, "r1");
    expect(w.creditsTotal).toBe(3);
    expect(canUnlock({ ...w, creditsUsed: 2 })).toBe(true);
    expect(canUnlock({ ...w, creditsUsed: 3 })).toBe(false);
  });

  it("all-access unlocks without credits", () => {
    const w = applyPass(EMPTY_WALLET, passTier("all")!, "r1");
    expect(canUnlock({ ...w, creditsUsed: 999 })).toBe(true);
  });

  it("an empty wallet cannot unlock", () => {
    expect(canUnlock(EMPTY_WALLET)).toBe(false);
  });
});
