// Shared styling + the host contract for the intro overlay.
//
// The overlay is themeable via CSS custom properties (the `--ov-*` vars). A
// theme is just a set of those values applied to the overlay root; every
// component reads them through Tailwind arbitrary classes, so swapping the
// theme re-skins the whole overlay without touching component markup.

import type { Brand, TabId } from "./brand";

// Liquid-glass surfaces (translucent panels; colour driven by the theme).
export const GLASS =
  "border border-[var(--ov-glass-border)] bg-[var(--ov-glass-bg)] shadow-lg shadow-black/10 backdrop-blur-xl";
export const GLASS_BTN = `${GLASS} transition-colors hover:bg-[var(--ov-glass-bg-hover)]`;

// Accent pill (primary CTAs).
export const ACCENT =
  "bg-[var(--ov-accent)] text-[var(--ov-accent-ink)] transition-colors hover:bg-[var(--ov-accent-hover)]";

// Deep-green hero card background for the dark theme.
export const CARD_BG =
  "radial-gradient(55% 45% at 18% 12%, rgba(46,112,96,0.40) 0%, transparent 55%)," +
  "radial-gradient(50% 50% at 88% 18%, rgba(46,112,96,0.28) 0%, transparent 55%)," +
  "radial-gradient(70% 70% at 80% 115%, rgba(46,112,96,0.22) 0%, transparent 60%)," +
  "linear-gradient(160deg, #06302b 0%, #04201d 100%)";

export type OverlayVariant = "dark" | "light";

export type OverlayTheme = {
  variant: OverlayVariant;
  /** Wordmark image (white wordmark on dark, dark wordmark on light). */
  logoSrc: string;
  /** `--ov-*` custom properties applied to the overlay root. */
  vars: Record<string, string>;
};

// Dark theme — the deep-green Margolis card (the default homepage).
export const darkTheme: OverlayTheme = {
  variant: "dark",
  logoSrc: "/images/margolis-logo.svg",
  vars: {
    "--ov-text": "#ffffff",
    "--ov-headline": "#ffffff",
    "--ov-subhead": "rgb(255 255 255 / 0.8)",
    "--ov-ink": "255 255 255",
    "--ov-accent": "#dbf0dd",
    "--ov-accent-hover": "#c7e6cb",
    "--ov-accent-ink": "#06302b",
    "--ov-glass-bg": "rgba(255,255,255,0.10)",
    "--ov-glass-bg-hover": "rgba(255,255,255,0.20)",
    "--ov-glass-border": "rgba(255,255,255,0.30)",
    "--ov-panel-bg": "rgba(6,38,35,0.86)",
    "--ov-menu-bg": "rgba(5,31,32,0.97)",
    "--ov-tab-active-bg": "#ffffff",
    "--ov-tab-active-ink": "#06302b",
    "--ov-float-bg": "rgba(31,43,59,0.55)",
    "--ov-float-border": "rgba(31,43,59,0.5)",
    "--ov-dim": "rgba(8,24,22,0.55)",
    "--ov-boot": "radial-gradient(120% 90% at 50% -10%, #0c3a33, transparent 60%), #051f20",
  },
};

// Light theme — bright white liquid glass over the meeting photo.
export const lightTheme: OverlayTheme = {
  variant: "light",
  logoSrc: "/images/margolis-logo-dark.svg",
  vars: {
    "--ov-text": "#103a33",
    "--ov-headline": "#235547",
    "--ov-subhead": "rgb(16 58 51 / 0.95)",
    "--ov-ink": "16 58 51",
    "--ov-accent": "#2e7060",
    "--ov-accent-hover": "#357d6c",
    "--ov-accent-ink": "#ffffff",
    "--ov-glass-bg": "rgba(255,255,255,0.45)",
    "--ov-glass-bg-hover": "rgba(255,255,255,0.62)",
    "--ov-glass-border": "rgba(255,255,255,0.75)",
    "--ov-panel-bg": "rgba(255,255,255,0.90)",
    "--ov-menu-bg": "rgba(255,255,255,0.96)",
    "--ov-tab-active-bg": "#103a33",
    "--ov-tab-active-ink": "#ffffff",
    "--ov-float-bg": "rgba(255,255,255,0.80)",
    "--ov-float-border": "rgba(16,58,51,0.14)",
    "--ov-dim": "rgba(20,40,35,0.35)",
    "--ov-boot": "radial-gradient(120% 90% at 50% -10%, #ffffff, #e7f1ec)",
  },
};

/**
 * The overlay host: all reactive state + actions, handed down to the card and
 * its popups.
 */
export interface OverlayHost {
  brand: Brand;
  theme: OverlayTheme;

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
