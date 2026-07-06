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

1. `index.html` — launch page, v1.44 improvements, product proof and support
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
- Product claims match the shipped v1.44.0 package
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
