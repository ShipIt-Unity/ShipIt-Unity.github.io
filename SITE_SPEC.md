# ShipIt Public Website — v1 Specification

## Purpose

Create a small, credible website for the ShipIt Unity publisher profile and
public documentation for Unity Supabase Toolkit. The website must demonstrate
relevant work, provide support information, and help customers evaluate and use
the product without exposing the paid package.

## Audience

- Unity developers evaluating the toolkit
- Existing customers looking for setup and troubleshooting help
- Unity Asset Store reviewers validating the publisher and product

## Public URL

Initial hosting: GitHub Pages at `https://<github-username>.github.io`.

A custom ShipIt domain can be connected later without rebuilding the site.

## Pages

1. `index.html` — launch page, v1.46.3 improvements, product proof and support
2. `documentation.html` — public setup and API guide
3. `live-ops.html` — feature overview only; not the working admin console
4. `privacy.html` — website and toolkit privacy summary
5. `404.html` — simple recovery page

## Public/private boundary

Public:

- Product descriptions and screenshots
- Quick-start and API examples
- Security guidance, compatibility and dependency information
- Support email and trademark notices

Private/paid:

- Toolkit C# source and package download
- Functional Live-Ops Dashboard source
- SQL pack implementation catalog
- Service-role keys, test-project URLs, API credentials and customer data

## Technical approach

- Plain HTML and CSS; no framework or build step
- Responsive layouts for desktop and mobile
- No analytics, cookies, forms or third-party JavaScript in v1
- Relative links so the site works on GitHub Pages and locally
- Repository contains website files only, not the toolkit workspace

## Brand

- Publisher name: **ShipIt**
- Product name: **Unity Supabase Toolkit**
- Primary color: Supabase-inspired green on a dark neutral background
- Visual direction: restrained, editorial and product-led; subtle grid/glow
  treatments, compact technical UI previews and minimal card repetition
- Tone: technical, practical, security-conscious

## Acceptance criteria

- Every page opens locally and all internal links resolve
- No secrets, private project URLs or paid source files are present
- Product claims match the shipped v1.46.3 package
- Support and privacy information are easy to find
- Publisher name is consistently spelled **ShipIt**
- Site works at mobile widths without horizontal page overflow

## Inputs still needed

- GitHub username or organization name
- Final profile icon and banner
- Unity Asset Store product URL after the listing exists
- Optional custom domain later

## Delivery plan

1. Build and validate this standalone site locally.
2. Create a new public repository named `<github-username>.github.io`.
3. Upload only the contents of this folder.
4. Enable GitHub Pages from the `main` branch and repository root.
5. Add the resulting URL to the Unity publisher profile.
6. Add the Asset Store listing link after Unity creates the product page.
7. Review the site whenever the toolkit version or support policy changes.

## Addendum — AWS Toolkit pages (v3)

`aws-toolkit.html` and `aws-documentation.html` extend the site to a second
product:

- **Landing** (`aws-toolkit.html`): hero, proof strip, runtime SDK bento,
  game systems, editor/Setup-tab workflow, an API code showcase, the honest
  WebGL matrix, security/compatibility, a public-preview CTA and a Supabase
  cross-sell — all built from the shared stylesheet.
- **Documentation** (`aws-documentation.html`): public setup and API guide
  with search, quick links, code samples and the error-string troubleshooting
  table. Body class `doc-page` plus the `.layout`/`.docs-sidebar` grid, so
  search, scroll-spy, table wrappers and copy buttons are wired by `site.js`.
- Nav: every page links **AWS Toolkit** then **AWS docs** after
  *Documentation/Supabase docs*; the current page carries
  `aria-current="page"`.
- Status badge lives in the footer legal line (`vX.Y.Z — public preview`);
  bump both AWS pages with each release and flip to the store URL when the
  listing goes live (then roll the link into all navs' store button).
- Content must mirror the shipped package: test counts, service surface and
  platform matrix are release-gated claims, not marketing license.
- The Supabase hero remains untouched — this is additive until a
  multi-product homepage redesign is warranted.
- SEO: both pages are in `sitemap.xml` at priority 0.9.
- The AWS page carries a **Studio Edition** section (`#studio`): the $999
  per-title tier sold direct (invoice, named seats, support term), cross-linked
  from the hero/CTA. Commercial terms live in the toolkit repository's
  `marketing/` folder (`studio-license.md`, `pricing-ladder.md`,
  `roi-one-pager.md`, `studio-evaluation-guide.md`) and are the source of
  truth — keep the section's claims in sync with them.
