export type PlanId =
  | "free"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "scientist"
  | "developer"
  | "ultimate"
  | "god_mode";

export type FeatureSlug =
  | "addition"
  | "subtraction"
  | "multiplication"
  | "division"
  | "parentheses"
  | "square_root"
  | "modulo"
  | "power"
  | "history"
  | "copy_result"
  | "memory"
  | "scientific"
  | "themes"
  | "binary"
  | "hexadecimal"
  | "decimal_places"
  | "equals";

export interface FeatureDefinition {
  slug: FeatureSlug;
  name: string;
  description: string;
  /** Plan tier that unlocks this feature. */
  plan: PlanId;
  /** Human-readable plan name, e.g. "Bronze Mathematics Expansion". */
  planName: string;
  /** Price in paise. ₹49 = 4900. Free features are 0. */
  price: number;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  /** Price in paise. */
  price: number;
  tagline: string;
  /** Feature slugs bundled with this plan (excludes lower tiers). */
  features: FeatureSlug[];
  /** Marketing highlight — the plan card border glows. */
  highlighted?: boolean;
}