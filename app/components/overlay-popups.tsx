"use client";

import { X } from "lucide-react";
import { rhymesDisplay } from "../lib/fonts";
import type { OverlayHost } from "../lib/overlay-ui";
import { ACCENT } from "../lib/overlay-ui";
import { TAB_ORDER } from "../lib/brand";

// Shared backdrop + panel chrome for the two card popups (chip answer + site
// map). Positioned absolutely inside the card, flex-centered, capped to the
// card area so the panel never overflows.
function PopupShell({
  closing,
  onClose,
  wide,
  children,
}: {
  closing: boolean;
  onClose: () => void;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={`absolute inset-0 z-30 flex items-center justify-center p-4 ${
        closing ? "animate-ov-out" : "animate-ov-in"
      }`}
      style={{ background: "rgba(8,24,22,0.55)" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-[31] flex max-h-full flex-col rounded-[1.25rem] border border-white/30 text-left text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
          wide ? "w-[min(94%,44rem)] p-8" : "w-[min(94%,40rem)] p-5 px-7"
        } ${closing ? "animate-panel-out" : "animate-panel-in"}`}
        style={{ background: "rgba(6,38,35,0.86)" }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="size-4" />
        </button>
        <div className="-mx-2 -my-1 min-h-0 overflow-y-auto px-2 py-1 [overscroll-behavior:contain]">
          {children}
        </div>
      </div>
    </div>
  );
}

// The answer popup shown when a hero question chip is clicked.
export function ChipPopup({ host }: { host: OverlayHost }) {
  const chip = TAB_ORDER.flatMap((id) => host.brand.tabs[id].chips).find(
    (c) => c.id === host.openChip
  );
  if (!chip) return null;

  return (
    <PopupShell closing={host.chipClosing} onClose={host.closeChip}>
      <h3 className="mr-8 mb-2.5 text-[1.0625rem] font-bold tracking-[-0.01em] text-white">
        {chip.title}
      </h3>
      <p className="text-[0.9375rem] leading-[1.55] text-white/85">{chip.body}</p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <a
          href={chip.href ?? undefined}
          target={chip.href ? "_blank" : undefined}
          rel={chip.href ? "noopener noreferrer" : undefined}
          className={`inline-flex items-center justify-center rounded-full px-[1.125rem] py-2 text-sm font-semibold ${ACCENT}`}
        >
          {chip.primary}
        </a>
        <a
          href={host.brand.ctaPrimary.href ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-white/10 px-[1.125rem] py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
        >
          {host.brand.ctaPrimary.label}
        </a>
      </div>
      <p className="mt-5 text-xs leading-[1.4] text-white/55">{host.brand.chipFoot}</p>
    </PopupShell>
  );
}

// (chip popup above; nav modal below)

// The full site-map modal opened from the "I'm looking for something else" CTA.
export function NavModal({ host }: { host: OverlayHost }) {
  if (!host.navOpen) return null;
  return (
    <PopupShell wide closing={host.navClosing} onClose={host.closeNav}>
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-7 text-left">
        {host.brand.siteNav.map((col) => (
          <div key={col.heading} className="flex flex-col items-start gap-2.5">
            <span className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white/50">
              {col.heading}
            </span>
            {col.links.map((link) => (
              <button
                key={link}
                type="button"
                className={`text-left text-[0.9375rem] font-normal text-white/85 transition-colors hover:text-white ${rhymesDisplay.className}`}
              >
                {link}
              </button>
            ))}
          </div>
        ))}
      </div>
    </PopupShell>
  );
}
