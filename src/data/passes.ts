/** The 4 course passes students can buy. Prices are in Naira. */
export type PassTierId = "starter" | "skill" | "pro" | "all";

export interface PassTier {
  id: PassTierId;
  name: string;
  priceNgn: number;
  /** Number of courses the pass unlocks; null = every course. */
  courses: number | null;
  blurb: string;
  highlight?: boolean;
}

export const PASS_TIERS: PassTier[] = [
  { id: "starter", name: "Starter", priceNgn: 3000, courses: 3, blurb: "Try AI skills with any 3 courses." },
  { id: "skill", name: "Skill Pack", priceNgn: 6500, courses: 8, blurb: "Build one solid skill set with any 8 courses." },
  { id: "pro", name: "Pro Track", priceNgn: 12000, courses: 18, blurb: "Go deep across tracks with any 18 courses.", highlight: true },
  { id: "all", name: "All-Access Pass", priceNgn: 25000, courses: null, blurb: "Every course now, plus every new course we add." },
];

export function passTier(id: string): PassTier | undefined {
  return PASS_TIERS.find((t) => t.id === id);
}

/** A student's pass wallet. */
export interface PassWallet {
  allAccess: boolean;
  creditsTotal: number;
  creditsUsed: number;
  /** Paystack references already redeemed (stops reuse). */
  references: string[];
}

export const EMPTY_WALLET: PassWallet = { allAccess: false, creditsTotal: 0, creditsUsed: 0, references: [] };

/** Adds a bought pass to a wallet. */
export function applyPass(wallet: PassWallet, tier: PassTier, reference: string): PassWallet {
  return {
    allAccess: wallet.allAccess || tier.courses === null,
    creditsTotal: wallet.creditsTotal + (tier.courses ?? 0),
    creditsUsed: wallet.creditsUsed,
    references: [...wallet.references, reference],
  };
}

/** Can this wallet unlock one more course? */
export function canUnlock(wallet: PassWallet): boolean {
  return wallet.allAccess || wallet.creditsUsed < wallet.creditsTotal;
}
