import type {
  FeatureDefinition,
  FeatureSlug,
  PlanDefinition,
} from "@/types/features";

/**
 * The canonical feature map. Every gated calculator capability lives here.
 * `price` is in paise (₹1 = 100 paise). This drives the pricing page,
 * the seed script, and the runtime feature gate.
 */
export const FEATURES: Record<FeatureSlug, FeatureDefinition> = {
  addition: {
    slug: "addition",
    name: "Addition",
    description: "Add two or more numbers together. The gateway drug.",
    plan: "free",
    planName: "Free Tier",
    price: 0,
  },
  subtraction: {
    slug: "subtraction",
    name: "Subtraction",
    description: "Take numbers away. Complimentary, for now.",
    plan: "free",
    planName: "Free Tier",
    price: 0,
  },
  multiplication: {
    slug: "multiplication",
    name: "Multiplication",
    description: "Repeated addition, but faster. A premium convenience.",
    plan: "bronze",
    planName: "Bronze Mathematics Expansion",
    price: 4900,
  },
  modulo: {
    slug: "modulo",
    name: "Modulo",
    description: "The remainder operator. For people who love leftovers.",
    plan: "bronze",
    planName: "Bronze Mathematics Expansion",
    price: 4900,
  },
  division: {
    slug: "division",
    name: "Division",
    description: "Split numbers fairly. Division is not free. The irony is intentional.",
    plan: "silver",
    planName: "Silver Mathematics Expansion",
    price: 9900,
  },
  parentheses: {
    slug: "parentheses",
    name: "Parentheses",
    description: "Control the order of operations like a true professional.",
    plan: "gold",
    planName: "Gold Mathematics Expansion",
    price: 14900,
  },
  square_root: {
    slug: "square_root",
    name: "Square Root",
    description: "Undo squaring. Rooted in premium value.",
    plan: "platinum",
    planName: "Platinum Mathematics Expansion",
    price: 19900,
  },
  power: {
    slug: "power",
    name: "Exponentiation",
    description: "Raise numbers to great heights. Power has a price.",
    plan: "scientist",
    planName: "Scientist Edition",
    price: 29900,
  },
  scientific: {
    slug: "scientific",
    name: "Scientific Functions",
    description: "sin, cos, tan, log, and ln. For the discerning calculator user.",
    plan: "scientist",
    planName: "Scientist Edition",
    price: 29900,
  },
  binary: {
    slug: "binary",
    name: "Binary Mode",
    description: "See results in base 2. There are 10 kinds of people who want this.",
    plan: "developer",
    planName: "Developer Edition",
    price: 39900,
  },
  hexadecimal: {
    slug: "hexadecimal",
    name: "Hexadecimal Mode",
    description: "Base 16 output. 0xDEADBEEF not included.",
    plan: "developer",
    planName: "Developer Edition",
    price: 39900,
  },
  history: {
    slug: "history",
    name: "Calculation History",
    description: "Remember what you calculated. Memory is a luxury good.",
    plan: "ultimate",
    planName: "Ultimate Edition",
    price: 49900,
  },
  copy_result: {
    slug: "copy_result",
    name: "Copy Result",
    description: "Copy answers to your clipboard. Ctrl+C is a paid feature now.",
    plan: "ultimate",
    planName: "Ultimate Edition",
    price: 49900,
  },
  memory: {
    slug: "memory",
    name: "Memory (M+, M-, MR, MC)",
    description: "Store and recall values. Enterprise-grade forgetfulness prevention.",
    plan: "ultimate",
    planName: "Ultimate Edition",
    price: 49900,
  },
  themes: {
    slug: "themes",
    name: "Premium Themes",
    description: "Midnight, Paper, and Retro themes. Beauty is not free.",
    plan: "ultimate",
    planName: "Ultimate Edition",
    price: 49900,
  },
  decimal_places: {
    slug: "decimal_places",
    name: "Unlimited Decimals",
    description: "Free tier truncates to 2 decimals. Precision is premium.",
    plan: "ultimate",
    planName: "Ultimate Edition",
    price: 49900,
  },
  equals: {
    slug: "equals",
    name: "The Equals Button",
    description:
      "Actually see your answer. The single most important button, sold separately.",
    plan: "god_mode",
    planName: "God Mode",
    price: 299900,
  },
};

/** Features available without paying a rupee. */
export const FREE_FEATURES: FeatureSlug[] = (
  Object.values(FEATURES) as FeatureDefinition[]
)
  .filter((f) => f.price === 0)
  .map((f) => f.slug);

/** Free tier calculation limit per day. */
export const FREE_DAILY_CALC_LIMIT = 3;

/**
 * Plan tiers for the pricing page. A plan bundles a set of feature slugs.
 * Buying any feature via its modal unlocks exactly that feature; plan cards
 * are the "storefront" framing of the same catalog.
 */
export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free Tier",
    price: 0,
    tagline: "Addition & subtraction. 3 calculations a day. Ads included.",
    features: ["addition", "subtraction"],
  },
  {
    id: "bronze",
    name: "Bronze Mathematics Expansion",
    price: 4900,
    tagline: "Unlock the multiplicative arts.",
    features: ["multiplication", "modulo"],
  },
  {
    id: "silver",
    name: "Silver Mathematics Expansion",
    price: 9900,
    tagline: "Division, at last.",
    features: ["division"],
  },
  {
    id: "gold",
    name: "Gold Mathematics Expansion",
    price: 14900,
    tagline: "Order of operations, professionally.",
    features: ["parentheses"],
  },
  {
    id: "platinum",
    name: "Platinum Mathematics Expansion",
    price: 19900,
    tagline: "Get to the root of things.",
    features: ["square_root"],
  },
  {
    id: "scientist",
    name: "Scientist Edition",
    price: 29900,
    tagline: "Trigonometry, logarithms, and exponents.",
    features: ["power", "scientific"],
  },
  {
    id: "developer",
    name: "Developer Edition",
    price: 39900,
    tagline: "Binary and hexadecimal output.",
    features: ["binary", "hexadecimal"],
  },
  {
    id: "ultimate",
    name: "Ultimate Edition",
    price: 49900,
    tagline: "History, memory, copy, themes, and unlimited decimals.",
    features: ["history", "copy_result", "memory", "themes", "decimal_places"],
    highlighted: true,
  },
  {
    id: "god_mode",
    name: "God Mode",
    price: 299900,
    tagline: "The Equals button. Enlightenment is expensive.",
    features: ["equals"],
  },
];

export function getFeature(slug: FeatureSlug): FeatureDefinition {
  return FEATURES[slug];
}

export const ALL_FEATURE_SLUGS = Object.keys(FEATURES) as FeatureSlug[];