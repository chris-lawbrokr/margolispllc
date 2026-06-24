// Full-site clone script: crawls the entire live site (seeded from its sitemap
// plus on-page link discovery), captures a self-contained snapshot of every
// internal page (inlining CSS + images as data URIs), rewrites inter-page links
// to point at the locally-saved copies, and writes the result to
// public/site/<path>/index.html. The homepage lands at public/site/index.html.
//
//   node scripts/clone.mjs
//
import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://www.margolispllc.com";
const HOSTS = ["margolispllc.com", "www.margolispllc.com"];
const SITEMAP = `${ORIGIN}/sitemap.xml`;
const OUT_ROOT = fileURLToPath(new URL("../public/site/", import.meta.url));
const SERVE_BASE = "/site/"; // public path the saved files are served from
const MAX_PAGES = 80;

// --- url -> clean pathname (no trailing slash, no query/hash) ---
function normalizePath(href, base = ORIGIN) {
  const url = new URL(href, base);
  let p = url.pathname.replace(/\/+$/, "");
  return p === "" ? "/" : p;
}

// --- pathname -> local file under public/site/ (and its served URL) ---
function localFile(p) {
  return p === "/" ? "index.html" : `${p.replace(/^\//, "")}/index.html`;
}

async function getSitemapUrls() {
  try {
    const res = await fetch(SITEMAP);
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  } catch {
    return [];
  }
}

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
  ],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Seed the crawl queue from the sitemap, homepage first.
  const seeds = (await getSitemapUrls())
    .filter((u) => HOSTS.includes(new URL(u).hostname))
    .map((u) => normalizePath(u));
  const queue = ["/", ...seeds];
  const queued = new Set(queue);
  const visited = new Set();
  let saved = 0;

  while (queue.length && visited.size < MAX_PAGES) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);

    const target = ORIGIN + (path === "/" ? "/" : path);
    try {
      await page.goto(target, { waitUntil: "networkidle0", timeout: 60000 });
    } catch (err) {
      console.warn(`! skip ${path}: ${err.message}`);
      continue;
    }
    // Let lazy assets / fonts settle.
    await new Promise((r) => setTimeout(r, 2000));

    // Trigger lazy-loaded images by scrolling through the page.
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = window.innerHeight;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          y += step;
          if (y >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            resolve();
          }
        }, 120);
      });
    });
    await new Promise((r) => setTimeout(r, 1500));

    const { html, links } = await page.evaluate(
      async (HOSTS, SERVE_BASE) => {
        function normalizePathInPage(href) {
          try {
            const url = new URL(href, document.baseURI);
            if (!HOSTS.includes(url.hostname)) return null;
            if (!/^https?:$/.test(url.protocol)) return null;
            let p = url.pathname.replace(/\/+$/, "");
            return { path: p === "" ? "/" : p, hash: url.hash };
          } catch {
            return null;
          }
        }
        function localFile(p) {
          return p === "/" ? "index.html" : p.replace(/^\//, "") + "/index.html";
        }

        async function toDataUri(resourceUrl) {
          try {
            const res = await fetch(resourceUrl, { mode: "cors" });
            if (!res.ok) return resourceUrl;
            const blob = await res.blob();
            return await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.onerror = () => resolve(resourceUrl);
              reader.readAsDataURL(blob);
            });
          } catch {
            return resourceUrl;
          }
        }

        async function inlineCssUrls(cssText, baseUrl) {
          const urlRegex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
          const matches = [];
          let m;
          while ((m = urlRegex.exec(cssText)) !== null) {
            if (!m[1].startsWith("data:")) matches.push({ full: m[0], url: m[1] });
          }
          for (const it of matches) {
            try {
              const absoluteUrl = new URL(it.url, baseUrl).toString();
              const dataUri = await toDataUri(absoluteUrl);
              cssText = cssText.split(it.full).join(`url("${dataUri}")`);
            } catch {}
          }
          return cssText;
        }

        const baseUrl = document.baseURI;

        // --- strip scripts / noscript / preloads ---
        document.querySelectorAll("script, noscript").forEach((s) => s.remove());
        document
          .querySelectorAll(
            'link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"], link[rel="preconnect"], link[rel="dns-prefetch"]'
          )
          .forEach((el) => el.remove());

        // --- remove cookie/chat/admin widgets ---
        document
          .querySelectorAll(
            '#wpadminbar, [class*="cookie"], [class*="consent"], [class*="gdpr"], [id*="cookie"], [id*="consent"], [class*="chat-widget"], [id*="hubspot"], [id*="intercom"], [id*="crisp"], [id*="tawk"], [class*="drift"]'
          )
          .forEach((el) => el.remove());

        // --- inline stylesheets ---
        const linkEls = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of linkEls) {
          const href = link.href;
          if (!href) continue;
          try {
            const res = await fetch(href);
            if (!res.ok) continue;
            let cssText = await res.text();
            cssText = await inlineCssUrls(cssText, href);
            const style = document.createElement("style");
            style.textContent = cssText;
            link.replaceWith(style);
          } catch {}
        }

        // --- inline <style> url() refs ---
        for (const style of document.querySelectorAll("style")) {
          if (style.textContent && style.textContent.includes("url(")) {
            style.textContent = await inlineCssUrls(style.textContent, baseUrl);
          }
        }

        // --- inline images ---
        const imageCache = new Map();
        for (const img of document.querySelectorAll("img")) {
          img.removeAttribute("loading");
          img.removeAttribute("decoding");
          const src = img.currentSrc || img.src;
          img.removeAttribute("srcset");
          img.removeAttribute("imageSrcSet");
          img.removeAttribute("imageSizes");
          if (!src || src.startsWith("data:")) continue;
          try {
            if (imageCache.has(src)) {
              img.src = imageCache.get(src);
            } else {
              const dataUri = await toDataUri(src);
              imageCache.set(src, dataUri);
              img.src = dataUri;
            }
          } catch {}
        }
        document.querySelectorAll("picture source").forEach((s) => s.remove());

        // --- inline inline-style background images ---
        for (const el of document.querySelectorAll("[style]")) {
          const bg = el.style.backgroundImage;
          if (bg && bg.includes("url(") && !bg.includes("data:")) {
            const um = bg.match(/url\(\s*['"]?([^'")]+)['"]?\s*\)/);
            if (um) {
              try {
                const absoluteUrl = new URL(um[1], baseUrl).toString();
                const dataUri = await toDataUri(absoluteUrl);
                el.style.backgroundImage = `url("${dataUri}")`;
              } catch {}
            }
          }
        }

        // --- force-reveal scroll animation content ---
        // Reveal sections start hidden and are shown by JS adding a class on
        // scroll. With scripts stripped that never fires, leaving blank bands —
        // e.g. the "Get in Touch" CTA above the footer. The site's own CSS is
        // `[data-animate]{opacity:0} [data-animate].visible{opacity:1}`, so just
        // add the reveal class (covers all such sections site-wide).
        document
          .querySelectorAll("[data-animate]")
          .forEach((el) => el.classList.add("visible"));
        // Belt-and-suspenders: un-hide anything still left at inline opacity:0
        // (only elements actually faded out, so decorative transforms that keep
        // opacity:1 are untouched).
        for (const el of document.querySelectorAll('[style*="opacity"]')) {
          const o = el.style.opacity;
          if (o !== "" && parseFloat(o) < 1) {
            el.style.opacity = "1";
            if (el.style.transform) el.style.transform = "none";
            el.style.transition = "none";
            el.style.visibility = "visible";
          }
        }

        // --- rewrite internal <a> links to local copies; collect them ---
        const links = new Set();
        for (const a of document.querySelectorAll("a[href]")) {
          const raw = a.getAttribute("href");
          if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:"))
            continue;
          const info = normalizePathInPage(a.href);
          if (!info) continue; // external / non-http -> leave as absolute
          links.add(info.path);
          a.setAttribute("href", SERVE_BASE + localFile(info.path) + info.hash);
          a.removeAttribute("target");
        }

        // Drop any <base> so our root-relative local links resolve correctly.
        document.querySelectorAll("base").forEach((b) => b.remove());

        return {
          html: "<!DOCTYPE html>" + document.documentElement.outerHTML,
          links: [...links],
        };
      },
      HOSTS,
      SERVE_BASE
    );

    // Enqueue newly discovered internal pages.
    for (const p of links) {
      if (!queued.has(p)) {
        queued.add(p);
        queue.push(p);
      }
    }

    const outPath = OUT_ROOT + localFile(path);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html, "utf-8");
    saved += 1;
    console.log(
      `✓ ${path} -> ${localFile(path)} (${(html.length / 1024 / 1024).toFixed(2)} MB)`
    );
  }

  console.log(`\nDone. Saved ${saved} page(s) under public/site/.`);
  if (queue.length)
    console.warn(`Stopped at MAX_PAGES=${MAX_PAGES}; ${queue.length} still queued.`);
} finally {
  await browser.close();
}
