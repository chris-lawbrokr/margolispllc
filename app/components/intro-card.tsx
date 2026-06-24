"use client";

import { ArrowRight, ArrowUpRight, Menu, Newspaper, X } from "lucide-react";
import { rhymesDisplay } from "../lib/fonts";
import { TAB_ORDER, type TabId } from "../lib/brand";
import { ACCENT, CARD_BG, GLASS, GLASS_BTN, type OverlayHost } from "../lib/overlay-ui";
import { ChipPopup, NavModal } from "./overlay-popups";

type Layout = { desktop: boolean; compact: boolean };

// The hero center: headline, subhead, quick-question chips, and the text CTA.
// Re-keyed by tab so it crossfades when the active tab changes.
function Hero({ host, compact }: { host: OverlayHost; compact: boolean }) {
  const t = host.brand.tabs[host.tab];
  return (
    <div
      key={host.tab}
      className="animate-hero-fade relative z-10 flex w-full max-w-3xl flex-col items-center gap-4 px-8 text-white"
    >
      <h2
        className={`m-0 text-center text-balance text-[clamp(1.75rem,4.8vw,4.25rem)] font-medium leading-[1.08] tracking-[-0.01em] ${rhymesDisplay.className} min-[1150px]:whitespace-nowrap min-[1150px]:text-[clamp(1.75rem,3.1vw,3rem)]`}
      >
        {t.headline.map((p, i) => (
          <span key={i} className={p.hl ? "text-[#9ed9b4]" : undefined}>
            {p.t}
          </span>
        ))}
      </h2>

      {!compact && (
        <>
          {t.subhead ? (
            <p className="m-0 max-w-[34rem] text-center text-base font-normal leading-normal text-white/80">
              {t.subhead}
            </p>
          ) : (
            <div className="h-2" aria-hidden />
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {t.chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => host.openChipPopup(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.8125rem] font-normal text-white/90 ${GLASS_BTN}`}
              >
                <span aria-hidden>{c.icon}</span> {c.q}
              </button>
            ))}
          </div>

          {host.tab === "customer" ? (
            <button
              type="button"
              onClick={host.openNav}
              className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-normal text-white/60 transition-colors hover:text-white"
            >
              {t.cta}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <a
              href={t.ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-[0.9375rem] font-normal text-white/60 transition-colors hover:text-white"
            >
              {t.cta}
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          )}
        </>
      )}
    </div>
  );
}

// The hamburger dropdown shown in the card's top-right on phones / short
// screens (swaps the tab row + header CTAs).
function MobileMenu({ host }: { host: OverlayHost }) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={host.ctaOpen}
        onClick={host.toggleCta}
        className={`flex size-12 items-center justify-center rounded-full text-white ${GLASS_BTN}`}
      >
        {host.ctaOpen && !host.ctaClosing ? (
          <X className="size-5" />
        ) : (
          <Menu className="size-5" />
        )}
      </button>
      {host.ctaOpen && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={host.closeCta}
            className="fixed inset-0 z-[39] cursor-default"
          />
          <div
            className={`absolute inset-x-0 top-full z-40 mt-2 flex flex-col gap-1 rounded-2xl border border-white/[0.18] p-2 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.45)] backdrop-blur-2xl ${
              host.ctaClosing ? "animate-cta-out" : "animate-cta-in"
            }`}
            style={{ background: "rgba(5,31,32,0.97)" }}
          >
            {TAB_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  host.setTab(id);
                  host.closeCta();
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/15 ${
                  host.tab === id ? "bg-white/[0.12] font-semibold" : "font-normal"
                }`}
              >
                {host.brand.tabs[id].label}
              </button>
            ))}
            <div className="mx-1 my-1 h-px bg-white/15" />
            <a
              href={host.brand.ctaSecondary.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={host.closeCta}
              className="w-full rounded-xl px-3 py-2 text-left text-sm font-normal text-white transition-colors hover:bg-white/15"
            >
              {host.brand.ctaSecondary.label}
            </a>
            <a
              href={host.brand.ctaPrimary.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={host.closeCta}
              className={`w-full rounded-xl px-3 py-2 text-center text-sm font-semibold ${ACCENT}`}
            >
              {host.brand.ctaPrimary.label}
            </a>
          </div>
        </>
      )}
    </div>
  );
}

// Desktop bottom bar: testimonial card + info cards + "Main site" (dismiss).
function DesktopBar({ host }: { host: OverlayHost }) {
  return (
    <div className="absolute inset-x-8 bottom-8 z-10 hidden items-stretch gap-4 min-[1150px]:flex">
      <div className={`flex h-24 flex-[1.7] items-center gap-4 rounded-3xl px-6 text-left ${GLASS}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={host.brand.testimonial.avatar}
          alt=""
          aria-hidden
          className="size-12 shrink-0 rounded-xl bg-white/10 object-cover"
        />
        <div className="flex flex-col gap-1">
          <blockquote className="m-0 max-w-[300px] text-sm font-normal text-white">
            {host.brand.testimonial.quote}
          </blockquote>
          <a
            href={host.brand.testimonial.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-white/70 transition-colors hover:text-white"
          >
            {host.brand.testimonial.readMore}
            <ArrowRight className="size-3.5" />
          </a>
        </div>
      </div>

      {host.brand.infoCards.map((c) => (
        <a
          key={c.title}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-24 flex-1 flex-col justify-center gap-1 overflow-hidden rounded-3xl px-5 text-left ${GLASS_BTN}`}
        >
          <span className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white/60">
            {c.label}
          </span>
          <span className="truncate text-lg font-medium leading-tight text-white">
            {c.title}
          </span>
          <span className="line-clamp-2 text-[0.8125rem] font-normal text-white/70">
            {c.sub}
          </span>
        </a>
      ))}

      <button
        type="button"
        onClick={host.dismiss}
        className={`flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-3xl text-base font-medium text-white ${GLASS_BTN}`}
      >
        <ArrowUpRight className="size-5" />
        Main site
      </button>
    </div>
  );
}

// Compact bottom bar (phones / short screens).
function MobileBar({ host }: { host: OverlayHost }) {
  return (
    <div className="absolute inset-x-6 bottom-6 z-10 flex gap-3 min-[1150px]:hidden">
      <a
        href="https://www.margolispllc.com/blog"
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-medium text-white ${GLASS_BTN}`}
      >
        <Newspaper className="size-5" />
        Blogs
      </a>
      <a
        href={host.brand.ctaPrimary.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-center text-sm font-semibold leading-tight ${ACCENT}`}
      >
        <ArrowUpRight className="size-5" />
        Get started
      </a>
      <button
        type="button"
        onClick={host.dismiss}
        className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl py-3 text-sm font-medium text-white ${GLASS_BTN}`}
      >
        <ArrowUpRight className="size-5" />
        Main site
      </button>
    </div>
  );
}

export default function IntroCard({
  host,
  layout,
}: {
  host: OverlayHost;
  layout: Layout;
}) {
  const showTabs = layout.desktop && !layout.compact;
  const showMobileMenu = !showTabs;

  return (
    <div
      className="relative mx-auto flex aspect-[1080/1920] w-full max-w-[min(100%,calc((100vh_-_10rem_-_8px)*9/16))] items-center justify-center overflow-hidden rounded-[2rem] text-[#111] shadow-[0_20px_50px_-24px_rgba(17,17,26,0.45)] min-[1150px]:aspect-[1920/1080] min-[1150px]:max-w-[min(100%,calc((100vh_-_10rem_-_8px)*16/9))]"
    >
      {/* Deep-green hero background. */}
      <div className="absolute inset-0" aria-hidden style={{ background: CARD_BG }} />

      {/* Wordmark, top-left. */}
      <img
        src={host.brand.logoSrc}
        alt={host.brand.name}
        className="absolute left-6 top-6 w-32 min-[1150px]:left-8 min-[1150px]:top-8 min-[1150px]:w-40"
      />

      {/* Top-center tabs (desktop, tall enough). */}
      {showTabs && (
        <div
          className={`absolute left-1/2 top-8 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full p-1 ${GLASS}`}
          role="tablist"
        >
          {TAB_ORDER.map((id) => {
            const active = host.tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => host.setTab(id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-[#06302b]"
                    : "bg-transparent text-white/70 hover:text-white"
                }`}
              >
                {host.brand.tabs[id].label}
              </button>
            );
          })}
        </div>
      )}

      {/* Top-right header CTAs (desktop) or the mobile menu. */}
      {showTabs ? (
        <div className="absolute right-8 top-8 flex items-center gap-3">
          <a
            href={host.brand.ctaSecondary.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-base font-normal text-white ${GLASS_BTN}`}
          >
            {host.brand.ctaSecondary.label}
          </a>
          <a
            href={host.brand.ctaPrimary.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-base font-semibold ${ACCENT}`}
          >
            {host.brand.ctaPrimary.label}
          </a>
        </div>
      ) : null}

      {showMobileMenu && (
        <div className="absolute right-6 top-6 flex justify-end min-[1150px]:right-8 min-[1150px]:top-8">
          <MobileMenu host={host} />
        </div>
      )}

      {/* Hero center. */}
      <Hero host={host} compact={layout.compact} />

      {/* Bottom bars (one per layout). */}
      {layout.desktop && !layout.compact ? <DesktopBar host={host} /> : <MobileBar host={host} />}

      {/* Popups. */}
      <ChipPopup host={host} />
      <NavModal host={host} />
    </div>
  );
}
