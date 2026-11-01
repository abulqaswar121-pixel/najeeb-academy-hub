import { describe, expect, it } from "vitest";
import { EMPTY_WALLET, applyPass, canUnlock, passTier } from "./passes";

describe("academy pass rules", () => {
  it("Starter costs 3000 and unlocks 3 courses", () => {
    expect(passTier("starter")).toMatchObject({ priceNgn: 3000, courses: 3 });
    const tier = passTier("starter");
    if (!tier) throw new Error("Starter tier missing");
    expect(canUnlock({ ...applyPass(EMPTY_WALLET, tier, "starter-test"), creditsUsed: 3 })).toBe(false);
  });
  it("Skill Pack costs 6500 and unlocks 8 courses", () => {
    expect(passTier("skill")).toMatchObject({ priceNgn: 6500, courses: 8 });
  });
  it("Pro Track costs 12000 and unlocks 18 courses", () => {
    expect(passTier("pro")).toMatchObject({ priceNgn: 12000, courses: 18 });
  });
  it("All-Access costs 25000 and includes future courses without a credit limit", () => {
    expect(passTier("all")).toMatchObject({ priceNgn: 25000, courses: null });
    const tier = passTier("all");
    if (!tier) throw new Error("All-Access tier missing");
    expect(canUnlock(applyPass(EMPTY_WALLET, tier, "all-test"))).toBe(true);
  });
  it("an empty wallet cannot unlock a course", () => {
    expect(canUnlock(EMPTY_WALLET)).toBe(false);
  });
});