"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { margolis, type TabId } from "../lib/brand";
import { ACCENT, type OverlayHost } from "../lib/overlay-ui";
import IntroCard from "./intro-card";

// One gesture = one step. The strong part of a flick holds the lock; the
// momentum tail (sub-floor ticks) is ignored so the lock releases promptly.
const NEW_GESTURE = 6;
const MOMENTUM_FLOOR = 4;
const QUIET_MS = 80;
// Must match the popup fade-out animation duration.
const POPUP_FADE_MS = 200;

const brand = margolis;

// The intro overlay: a full-page hero card over the embedded site. ONE
// scroll/swipe gesture fades it out to reveal the page behind it; a floating
// pill then lets the visitor bring it back. A faithful React port of the boxii
// overlay's behaviour and design.
export default function Overlay() {
  // ---- Tab + popups ----
  const [tab, setTabState] = useState<TabId>("new");
  const [openChip, setOpenChip] = useState<string | null>(null);
  const [chipClosing, setChipClosing] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [navClosing, setNavClosing] = useState(false);
  const [ctaOpen, setCtaOpen] = useState(false);
  const [ctaClosing, setCtaClosing] = useState(false);

  // ---- Lifecycle ----
  const [dismissed, setDismissed] = useState(false);
  const [gone, setGone] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- Responsive layout (measured after mount, hidden behind the splash) ----
  const [desktop, setDesktop] = useState(false);
  const [compact, setCompact] = useState(false);

  // Gesture bookkeeping.
  const lockedRef = useRef(false);
  const idleTimerRef = useRef<number | null>(null);
  const touchYRef = useRef(0);
  const dismissedRef = useRef(false);
  const loadingRef = useRef(true);
  // Cancellable popup-unmount timers.
  const chipTimer = useRef<number | null>(null);
  const navTimer = useRef<number | null>(null);
  const ctaTimer = useRef<number | null>(null);

  useEffect(() => {
    dismissedRef.current = dismissed;
  }, [dismissed]);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // ---- Boot: hold the splash until the wordmark + fonts are ready ----
  useEffect(() => {
    let cancelled = false;
    const started = Date.now();
    const MIN_MS = 350;
    const MAX_MS = 3000;

    const preload = (src: string) =>
      new Promise<void>((res) => {
        const img = new Image();
        img.onload = () => res();
        img.onerror = () => res();
        img.src = src;
        if (img.complete) res();
      });

    const fontsReady =
      (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
        ?.ready ?? Promise.resolve();

    const ready = Promise.all([preload(brand.logoSrc), fontsReady]);
    const failsafe = new Promise<void>((res) => setTimeout(res, MAX_MS));

    Promise.race([ready, failsafe]).then(async () => {
      const elapsed = Date.now() - started;
      if (elapsed < MIN_MS) await new Promise((r) => setTimeout(r, MIN_MS - elapsed));
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Measure viewport (width => desktop, height => compact) ----
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1150px)");
    const short = window.matchMedia("(max-height: 680px)");
    const sync = () => {
      setDesktop(wide.matches);
      setCompact(short.matches);
    };
    sync();
    wide.addEventListener("change", sync);
    short.addEventListener("change", sync);
    return () => {
      wide.removeEventListener("change", sync);
      short.removeEventListener("change", sync);
    };
  }, []);

  // ---- Dismiss / reopen ----
  const dismiss = useCallback(() => setDismissed(true), []);
  const reopen = useCallback(() => {
    lockedRef.current = false;
    setDismissed(false);
    setGone(false);
  }, []);

  // ---- Popups: open instantly, close after a fade, cancellable ----
  const setTab = useCallback((id: TabId) => {
    setTabState(id);
    if (chipTimer.current) clearTimeout(chipTimer.current);
    setChipClosing(false);
    setOpenChip(null);
  }, []);

  const openChipPopup = useCallback((id: string) => {
    if (chipTimer.current) clearTimeout(chipTimer.current);
    setChipClosing(false);
    setOpenChip(id);
  }, []);
  const closeChip = useCallback(() => {
    setChipClosing(true);
    if (chipTimer.current) clearTimeout(chipTimer.current);
    chipTimer.current = window.setTimeout(() => {
      setOpenChip(null);
      setChipClosing(false);
    }, POPUP_FADE_MS);
  }, []);

  const openNav = useCallback(() => {
    if (navTimer.current) clearTimeout(navTimer.current);
    setNavClosing(false);
    setNavOpen(true);
  }, []);
  const closeNav = useCallback(() => {
    setNavClosing(true);
    if (navTimer.current) clearTimeout(navTimer.current);
    navTimer.current = window.setTimeout(() => {
      setNavOpen(false);
      setNavClosing(false);
    }, POPUP_FADE_MS);
  }, []);

  const closeCta = useCallback(() => {
    setCtaClosing(true);
    if (ctaTimer.current) clearTimeout(ctaTimer.current);
    ctaTimer.current = window.setTimeout(() => {
      setCtaOpen(false);
      setCtaClosing(false);
    }, POPUP_FADE_MS);
  }, []);
  const toggleCta = useCallback(() => {
    setCtaOpen((open) => {
      if (open && !ctaClosing) {
        closeCta();
        return open;
      }
      if (ctaTimer.current) clearTimeout(ctaTimer.current);
      setCtaClosing(false);
      return true;
    });
  }, [ctaClosing, closeCta]);

  // ---- One gesture = one dismiss ----
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (dismissedRef.current) return; // let scroll reach the page behind us
      e.preventDefault();
      if (loadingRef.current) return; // ignore gestures during the splash
      if (Math.abs(e.deltaY) >= MOMENTUM_FLOOR) {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = window.setTimeout(() => {
          lockedRef.current = false;
        }, QUIET_MS);
      }
      if (lockedRef.current) return;
      if (Math.abs(e.deltaY) < NEW_GESTURE) return;
      lockedRef.current = true;
      if (e.deltaY > 0) setDismissed(true);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (dismissedRef.current) return;
      e.preventDefault();
      if (loadingRef.current) return;
      if (lockedRef.current) return;
      const dy = touchYRef.current - e.touches[0].clientY;
      if (Math.abs(dy) < 40) return;
      lockedRef.current = true;
      if (dy > 0) setDismissed(true);
    };
    const onTouchEnd = () => {
      lockedRef.current = false;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const host: OverlayHost = {
    brand,
    tab,
    setTab,
    openChip,
    chipClosing,
    openChipPopup,
    closeChip,
    navOpen,
    navClosing,
    openNav,
    closeNav,
    ctaOpen,
    ctaClosing,
    toggleCta,
    closeCta,
    dismiss,
    reopen,
  };

  return (
    <>
      <div
        onTransitionEnd={(e) => {
          if (dismissed && e.target === e.currentTarget) setGone(true);
        }}
        className={`fixed inset-0 z-[9999] overflow-hidden bg-white transition-opacity duration-[700ms] ease-in-out ${
          gone ? "hidden" : ""
        } ${dismissed ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <div className="relative h-full w-full">
          <div className="absolute inset-0 flex items-center justify-center px-8 min-[1150px]:px-24">
            <div className="flex h-full w-full max-w-[min(100%,calc((100vh_-_10rem_-_8px)*9/16))] flex-col min-[1150px]:max-w-[min(100%,calc((100vh_-_10rem_-_8px)*16/9))]">
              <div className="min-h-0 flex-1" />
              <div className="shrink-0">
                <IntroCard host={host} layout={{ desktop, compact }} />
              </div>
              {brand.logos.length > 0 && (
                <div className="shrink-0 pt-8">
                  <Marquee />
                </div>
              )}
              <div className="min-h-0 flex-1" />
            </div>
          </div>
        </div>

        {/* Boot splash, fades out once the card art + fonts are ready. */}
        <div
          aria-hidden
          className={`absolute inset-0 z-[10000] flex items-center justify-center transition-opacity duration-[450ms] ${
            loading ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(120% 90% at 50% -10%, #0c3a33, transparent 60%), #051f20",
          }}
        >
          <div className="size-11 animate-spin rounded-full border-[3px] border-white/15 border-t-[#dbf0dd]" />
        </div>
      </div>

      {/* Floating reopen pill, shown once the overlay is dismissed. */}
      {dismissed && (
        <>
          {/* Mobile: full-width bar. */}
          <div
            className="fixed inset-x-6 bottom-6 z-[10000] flex gap-2 rounded-3xl border border-white/10 p-2 shadow-lg shadow-black/20 backdrop-blur-md min-[640px]:hidden"
            style={{ background: "rgba(31,43,59,0.55)" }}
          >
            <FloatingActions onReopen={reopen} fluid />
          </div>
          {/* Tablet+: compact pill bottom-left. */}
          <div
            className="fixed bottom-8 left-8 z-[10000] hidden gap-2 rounded-3xl border border-white/10 p-2 shadow-lg shadow-black/20 backdrop-blur-md min-[640px]:flex"
            style={{ background: "rgba(31,43,59,0.55)" }}
          >
            <FloatingActions onReopen={reopen} />
          </div>
        </>
      )}
    </>
  );
}

// The reopen actions inside the floating pill.
function FloatingActions({ onReopen, fluid }: { onReopen: () => void; fluid?: boolean }) {
  return (
    <>
      <button
        type="button"
        onClick={onReopen}
        className={`flex h-20 items-center justify-center rounded-2xl px-5 text-[1.0625rem] font-semibold ${ACCENT} ${
          fluid ? "flex-[2]" : "w-[10.5rem]"
        }`}
      >
        Let&apos;s Get Started
      </button>
      <button
        type="button"
        onClick={onReopen}
        className={`flex h-20 flex-col items-center justify-center gap-1 rounded-2xl text-white transition-colors hover:bg-white/15 ${
          fluid ? "flex-1" : "w-20"
        }`}
      >
        <Search className="size-6" />
        <span className="text-xs font-medium">Learn More</span>
      </button>
    </>
  );
}

// Auto-scrolling partner-logo strip (only rendered when a brand supplies logos;
// Margolis has none, so this stays dormant).
function Marquee() {
  const logos = [...brand.logos, ...brand.logos];
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#06302b] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#06302b] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#06302b] to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-16 pr-16">
        {logos.map((logo, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={logo.src} alt={logo.alt} aria-hidden className="h-6 w-auto shrink-0 opacity-90 min-[1150px]:h-7" />
        ))}
      </div>
    </div>
  );
}
