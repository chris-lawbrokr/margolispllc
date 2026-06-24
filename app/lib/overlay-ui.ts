// Shared styling constants + the host contract for the intro overlay.
// Mirrors the boxii overlay's design tokens, expressed as Tailwind class
// strings for the Margolis theme (deep-green card, white ink, soft-mint accent).

import type { Brand, TabId } from "./brand";

// Liquid-glass surfaces (translucent white over the dark green card).
export const GLASS =
  "border border-white/30 bg-white/10 shadow-lg shadow-black/10 backdrop-blur-md";
export const GLASS_BTN = `${GLASS} transition-colors hover:bg-white/20`;

// Soft-mint accent pill with deep-green ink (primary CTAs).
export const ACCENT =
  "bg-[#dbf0dd] text-[#06302b] transition-colors hover:bg-[#c7e6cb]";

// Deep-green hero card background (layered glows in the firm's green).
export const CARD_BG =
  "radial-gradient(55% 45% at 18% 12%, rgba(46,112,96,0.40) 0%, transparent 55%)," +
  "radial-gradient(50% 50% at 88% 18%, rgba(46,112,96,0.28) 0%, transparent 55%)," +
  "radial-gradient(70% 70% at 80% 115%, rgba(46,112,96,0.22) 0%, transparent 60%)," +
  "linear-gradient(160deg, #06302b 0%, #04201d 100%)";

// Desktop breakpoint used throughout (matches boxii's 1150px switch).
export const DESKTOP = "min-[1150px]";

/**
 * The overlay host: all reactive state + actions, handed down to the card and
 * its popups (a React port of boxii's BoxiiHost interface).
 */
export interface OverlayHost {
  brand: Brand;

  tab: TabId;
  setTab(id: TabId): void;

  openChip: string | null;
  chipClosing: boolean;
  openChipPopup(id: string): void;
  closeChip(): void;

  navOpen: boolean;
  navClosing: boolean;
  openNav(): void;
  closeNav(): void;

  ctaOpen: boolean;
  ctaClosing: boolean;
  toggleCta(): void;
  closeCta(): void;

  dismiss(): void;
  reopen(): void;
}
