import { describe, it, expect } from "vitest";
import { buildUnlockedSet, isFeatureUnlocked, getLockInfo } from "./gating";

describe("gating", () => {
  it("free features are always in the unlocked set", () => {
    const set = buildUnlockedSet();
    expect(set.has("addition")).toBe(true);
    expect(set.has("subtraction")).toBe(true);
    expect(set.has("multiplication")).toBe(false);
  });

  it("merges purchased features with free ones", () => {
    const set = buildUnlockedSet(["multiplication", "division"]);
    expect(set.has("multiplication")).toBe(true);
    expect(set.has("division")).toBe(true);
    expect(set.has("addition")).toBe(true);
  });

  it("isFeatureUnlocked reflects membership", () => {
    const set = buildUnlockedSet(["equals"]);
    expect(isFeatureUnlocked("equals", set)).toBe(true);
    expect(isFeatureUnlocked("history", set)).toBe(false);
  });

  it("getLockInfo returns pricing metadata for locked features", () => {
    const set = buildUnlockedSet();
    const info = getLockInfo("equals", set);
    expect(info.isLocked).toBe(true);
    expect(info.planName).toBe("God Mode");
    expect(info.price).toBe(299900);
  });

  it("getLockInfo marks owned features unlocked", () => {
    const set = buildUnlockedSet(["multiplication"]);
    expect(getLockInfo("multiplication", set).isLocked).toBe(false);
  });
});