import { describe, it, expect } from "vitest";
import { detectEasterEgg, getPersistenceMessage } from "./easter-eggs";

describe("easter eggs", () => {
  it("detects the answer to everything", () => {
    expect(detectEasterEgg("42")?.message).toContain("answer");
  });

  it("detects 69", () => {
    expect(detectEasterEgg("69")?.message).toBe("nice.");
  });

  it("classifies 80085 as an achievement", () => {
    expect(detectEasterEgg("80085")?.type).toBe("achievement");
  });

  it("returns null for ordinary results", () => {
    expect(detectEasterEgg("7")).toBeNull();
  });

  it("trims whitespace before matching", () => {
    expect(detectEasterEgg("  42  ")?.key).toBe("42");
  });
});

describe("persistence messages", () => {
  it("says nothing before the third press", () => {
    expect(getPersistenceMessage(1)).toBeNull();
    expect(getPersistenceMessage(2)).toBeNull();
  });

  it("appreciates persistence on the third press", () => {
    expect(getPersistenceMessage(3)).toBe("Persistence is appreciated.");
  });

  it("has an escalated message later", () => {
    expect(getPersistenceMessage(8)).toContain("paying");
  });
});