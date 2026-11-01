import { describe, expect, it } from "vitest";
import { PASS_TIERS, EMPTY_WALLET, applyPass, canUnlock, passTier } from "./passes";

describe("academy pass rules", () => {
  it("Starter costs 3000 and unlocks 3 courses", () => {
    expect(passTier("starter")).toMatchObject({ priceNgn: 3000, courses: 3 });
    expect(canUnlock({ ...applyPass(EMPTY_WALLET, PASS_TIERS[0], "starter-test"), creditsUsed: 3 })).toBe(false);
  });
  it("Skill Pack costs 6500 and unlocks 8 courses", () => {
    expect(passTier("skill")).toMatchObject({ priceNgn: 6500, courses: 8 });
  });
  it("Pro Track costs 12000 and unlocks 18 courses", () => {
    expect(passTier("pro")).toMatchObject({ priceNgn: 12000, courses: 18 });
  });
  it("All-Access costs 25000 and includes future courses without a credit limit", () => {
    expect(passTier("all")).toMatchObject({ priceNgn: 25000, courses: null });
    expect(canUnlock(applyPass(EMPTY_WALLET, PASS_TIERS[3], "all-test"))).toBe(true);
  });
  it("an empty wallet cannot unlock a course", () => {
    expect(canUnlock(EMPTY_WALLET)).toBe(false);
  });
});