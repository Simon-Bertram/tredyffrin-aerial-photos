# Cloudflare traffic controls (WAF and rate limits)

This app is served by a **Cloudflare Worker** (SSR). These controls run at the
**zone edge** before your Worker runs, so they reduce invocation spikes from
abusive or runaway crawlers without changing application code.

Apply them on the **zone** that fronts your production hostname (not
`workers.dev`, unless that URL is public and matters).

## Prerequisites

- Zone active on Cloudflare with DNS proxied (orange cloud) for the site host.
- You know which paths are expensive (SSR + upstream fetches), e.g. `/`,
  `/about`, `/locations/*`.

## 1. Baseline security (quick wins)

In the dashboard:

- **Security → Settings**
  - **Security Level**: *Medium* (or *High* if you see sustained junk traffic).
  - **Bot Fight Mode** or **Super Bot Fight Mode**: enable only if you accept
    possible friction for some automated clients; prefer **rate limits** first
    for a catalog site.
- **Security → WAF → Managed rules**
  - Keep Cloudflare managed rulesets enabled; review false positives in
    **Security → Events** if legitimate users are blocked.

## 2. Rate limiting rules (recommended)

Use **Security → WAF → Rate limiting rules** (or the equivalent **Rulesets**
workflow in your plan tier).

Goal: cap **requests per IP** on HTML routes so one peer cannot drive unbounded
Worker + origin cost.

Suggested **starting thresholds** (tune from **Analytics** and **Security →
Events**):

| Rule name | Match | Action | Window | Requests |
|-----------|--------|--------|--------|----------|
| `rl-html-home-about` | `(http.request.uri.path eq "/" or http.request.uri.path eq "/about")` | Block or Managed Challenge | 1 minute | 120 per IP |
| `rl-html-locations` | `(http.request.uri.path matches "^/locations/")` | Block or Managed Challenge | 1 minute | 180 per IP |
| `rl-sitemap` | `(http.request.uri.path eq "/sitemap.xml")` | Block | 1 minute | 30 per IP |

Notes:

- Prefer **Managed Challenge** over hard **Block** if you see false positives
  for shared IPs (offices, VPNs).
- **Sitemap** is cacheable but crawlers can refetch aggressively; a low cap
  avoids hammering your Worker on `sitemap.xml` alone.
- Omit static asset paths (if any under your zone) so CDNs and browsers are
  not throttled; this app is mostly Worker-routed HTML.

If your plan uses **expression fields** differently, adapt the match to your
zone’s WAF UI (path, method `GET`, etc.).

## 3. Custom WAF rules (optional, targeted)

**Security → WAF → Custom rules**

Examples (enable only if needed after reviewing logs):

- **Block obvious non-browser abuse** on dynamic paths, e.g. unusual methods:
  - If `(http.request.uri.path matches "^/locations/") and not
    (http.request.method eq "GET")` → **Block**.
- **Challenge high threat scores** on expensive paths:
  - If `(cf.threat_score gt 14) and (http.request.uri.path matches
    "^/(locations/|$|about))")` → **Managed Challenge**.

Threat score availability depends on plan and request context; validate in
**Security → Events**.

## 4. Do not rely on these alone

- **Caching** (see middleware `Cache-Control` on HTML routes) cuts repeat cost
  for the same URL.
- **Application** query sizing (Sanity projections, about-only query) cuts CPU
  per invocation when the Worker does run.

## 5. Verification

After deployment:

1. **Security → Events** — confirm rules trigger as expected; adjust thresholds.
2. **Analytics → Workers** (or GraphQL analytics) — invocation rate under load
   or crawl should flatten.
3. Spot-check real users (mobile, corporate network) if you use **Challenge**.

## 6. Automation (optional)

Rules can be managed with the Cloudflare API (**Rulesets** for WAF and rate
limits). This repo does not ship Terraform for the zone; export rule JSON from
the dashboard or use the API if you want version-controlled definitions later.
