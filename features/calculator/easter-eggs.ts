import type { EasterEgg } from "@/types/calculator";

/**
 * Hidden delights. Triggered when a computed result matches a known value.
 * Kept deadpan on purpose — the humor lands harder when the app never winks.
 */
const EASTER_EGGS: Record<string, EasterEgg> = {
  "42": { key: "42", message: "The answer to life, the universe, and everything.", type: "message" },
  "69": { key: "69", message: "nice.", type: "message" },
  "420": { key: "420", message: "Elevated.", type: "message" },
  "80085": { key: "80085", message: "Achievement unlocked: Very Mature.", type: "achievement" },
  "1337": { key: "1337", message: "Achievement unlocked: Elite.", type: "achievement" },
  "666": { key: "666", message: "Ominous.", type: "message" },
  "3.14": { key: "3.14", message: "Approximately delicious.", type: "message" },
};

/** Return an easter egg for a formatted result, if one exists. */
export function detectEasterEgg(result: string): EasterEgg | null {
  return EASTER_EGGS[result.trim()] ?? null;
}

const PERSISTENCE_MESSAGES: Record<number, string> = {
  3: "Persistence is appreciated.",
  5: "It is still locked. So is your resolve, apparently.",
  8: "Have you considered simply paying?",
  12: "This button admires your commitment. It will not budge.",
};

/**
 * Message shown when the user repeatedly jabs a locked button.
 * @param pressCount total consecutive presses on locked controls
 */
export function getPersistenceMessage(pressCount: number): string | null {
  return PERSISTENCE_MESSAGES[pressCount] ?? null;
}

export { EASTER_EGGS };