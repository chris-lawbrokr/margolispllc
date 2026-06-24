// Brand content for the intro overlay — a faithful React port of the boxii
// overlay's brand model (tabs, quick-question chips, site nav, bottom-bar
// cards), themed for Margolis PLLC: fractional general counsel & commercial
// legal support for growing businesses (offices in New York and Florida).
//
// Copy and links come from margolispllc.com. The visual theme (deep-green card,
// soft-mint accent) lives in the components; this file is content only.

export type TabId = "new" | "comparing" | "customer";

// A headline is a list of segments so part of it can be highlighted (mint).
export type HeadlinePart = { t: string; hl?: boolean };

export type Chip = {
  id: string;
  icon: string; // emoji glyph, matching the boxii chips
  q: string; // the question shown on the chip
  title: string;
  body: string;
  primary: string;
  /** If set, the chip is a new-tab link instead of opening its answer popup. */
  href?: string;
};

export type NavCol = { heading: string; links: string[] };

export type TabContent = {
  label: string;
  headline: HeadlinePart[];
  subhead?: string;
  cta: string;
  /** Makes the hero CTA a new-tab link; the "customer" tab otherwise opens nav. */
  ctaHref?: string;
  chips: Chip[];
};

export type Logo = { src: string; alt: string };

export type Brand = {
  name: string;
  logoSrc: string;
  ctaPrimary: { label: string; href?: string };
  ctaSecondary: { label: string; href?: string };
  tabs: Record<TabId, TabContent>;
  siteNav: NavCol[];
  logos: Logo[];
  testimonial: {
    quote: string;
    readMore: string;
    avatar: string;
    href?: string;
  };
  infoCards: { label: string; title: string; sub: string; href?: string }[];
  chipFoot: string;
};

export const TAB_ORDER: TabId[] = ["new", "comparing", "customer"];

const SITE = "https://www.margolispllc.com";
const CONTACT = `${SITE}/contact-us`;
// Lawbrokr intake link — ALL "Let's Get Started" / "Get in touch" CTAs point here.
export const INTAKE = "https://margolispllc.lawbrokr.com/";

export const margolis: Brand = {
  name: "Margolis PLLC",
  logoSrc: "/images/margolis-logo.svg",

  ctaPrimary: { label: "Let's Get Started", href: INTAKE },
  ctaSecondary: { label: "Contact", href: CONTACT },

  tabs: {
    new: {
      label: "Getting Started",
      headline: [
        { t: "Legal clarity in a " },
        { t: "complex world.", hl: true },
      ],
      subhead:
        "Tailored legal solutions for entrepreneurs, companies, and legal departments.",
      cta: "Let's get started",
      ctaHref: INTAKE,
      chips: [
        {
          id: "do",
          icon: "⚖️",
          q: "What does Margolis do?",
          title: "Your legal team, embedded in the business",
          body: "Margolis acts as fractional general counsel — handling commercial contracts, corporate matters, and the day-to-day legal decisions that keep deals moving, without the cost of a full in-house team.",
          primary: "How we help",
          href: `${SITE}/how-we-help`,
        },
        {
          id: "fractional",
          icon: "🧩",
          q: "What is fractional legal support?",
          title: "Senior counsel, scaled to what you need",
          body: "Instead of one expensive hire or an unpredictable law-firm bill, you get experienced counsel on a flexible engagement — looped into contracts, sales, and strategy exactly as much as the moment requires.",
          primary: "See the model",
          href: `${SITE}/services`,
        },
        {
          id: "contracts",
          icon: "📄",
          q: "Can you speed up our contracts?",
          title: "Faster deals, less legal friction",
          body: "From the deal desk to redlines and indemnity, Margolis builds the playbooks and reviews that let sales close confidently — turning legal from a bottleneck into a competitive edge.",
          primary: "Get in touch",
          href: INTAKE,
        },
      ],
    },
    comparing: {
      label: "How We Help",
      headline: [{ t: "Your counsel, " }, { t: "on demand.", hl: true }],
      subhead:
        "Embedded support for contracts, deals, and the decisions in between.",
      cta: "See how we help",
      ctaHref: `${SITE}/how-we-help`,
      chips: [
        {
          id: "commercial",
          icon: "🤝",
          q: "Commercial contracts?",
          title: "Contracts that protect and close",
          body: "MSAs, SaaS and reseller agreements, NDAs, and the AI terms and indemnity language modern deals demand — drafted and negotiated to move quickly while keeping your risk in check.",
          primary: "Explore services",
          href: `${SITE}/services`,
        },
        {
          id: "gc",
          icon: "🏛️",
          q: "Outside general counsel?",
          title: "A GC function without the headcount",
          body: "Governance, vendor and customer agreements, employment basics, and the judgment calls founders face — handled by counsel who know your business and are a message away.",
          primary: "Meet the team",
          href: `${SITE}/our-team`,
        },
        {
          id: "dealdesk",
          icon: "⚡",
          q: "Help our sales team move?",
          title: "A deal desk that unblocks revenue",
          body: "Clear playbooks, fallback positions, and fast turnarounds so sales-legal friction stops stalling pipeline — your reps know what they can offer and legal sees every deal.",
          primary: "Read the guide",
          href: `${SITE}/post/deal-desk-guide`,
        },
      ],
    },
    customer: {
      label: "Why Margolis",
      headline: [{ t: "Why teams choose Margolis." }],
      subhead:
        "Business-minded advice, senior attention, and pricing that fits how you grow.",
      cta: "I'm looking for something else",
      ctaHref: `${SITE}/`,
      chips: [
        {
          id: "business",
          icon: "📈",
          q: "Will you understand our business?",
          title: "Advice in context, not in a vacuum",
          body: "Margolis works as part of your team, so the guidance accounts for your goals, your customers, and your appetite for risk — practical answers, not just a list of what could go wrong.",
          primary: "How we help",
          href: `${SITE}/how-we-help`,
        },
        {
          id: "pricing",
          icon: "💡",
          q: "How does pricing work?",
          title: "Predictable, right-sized engagements",
          body: "Flexible fractional arrangements scale with your needs and keep legal spend predictable — you get the right amount of counsel without the surprise of hourly billing.",
          primary: "Let's get started",
          href: INTAKE,
        },
        {
          id: "locations",
          icon: "📍",
          q: "Where are you located?",
          title: "New York and Florida — serving clients anywhere",
          body: "With offices in New York and Florida and a remote-first practice, Margolis supports growing companies wherever they operate.",
          primary: "Our locations",
          href: `${SITE}/our-locations`,
        },
      ],
    },
  },

  siteNav: [
    {
      heading: "Firm",
      links: ["How We Help", "Our Team", "Services", "Our Locations"],
    },
    {
      heading: "Services",
      links: [
        "Commercial Contracts",
        "Outside General Counsel",
        "Corporate & Governance",
        "AI & Privacy",
      ],
    },
    {
      heading: "Resources",
      links: [
        "Blog",
        "Deal Desk Guide",
        "First-Time GC Guide",
        "Sales & Legal",
      ],
    },
    {
      heading: "Company",
      links: [
        "Let's Get Started",
        "Contact Us",
        "Privacy Policy",
        "Disclaimer",
      ],
    },
  ],

  // Margolis has no partner-logo strip; an empty list hides the marquee band.
  logos: [],

  testimonial: {
    quote: "See how Margolis can support your business and your team.",
    readMore: "Get in touch",
    avatar: "/images/matt.png",
    href: INTAKE,
  },

  infoCards: [
    {
      label: "Explore",
      title: "How we help",
      sub: "See the fractional legal model in a few minutes.",
      href: `${SITE}/how-we-help`,
    },
    {
      label: "Read",
      title: "Blog & guides",
      sub: "Practical playbooks for founders and in-house teams.",
      href: `${SITE}/blog`,
    },
  ],

  chipFoot: "Answer curated by Margolis PLLC — last reviewed Jun 2026.",
};
