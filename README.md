# Fast Fashion Beauty Parlour — Reusable Salon/Business Website Engine

A single-page, cinematically-animated Flask website, built so the **entire
site can be re-skinned for a new business by editing JSON files** — no
template or Python changes required for a same-industry clone.

Built for: **Fast Fashion Beauty Parlour**, Tiwari Tola, Basti, UP.

## What's in this build

This is a functional Flask salon website engine: every visible section,
all animations (Lenis smooth scroll, GSAP ScrollTrigger reveals, custom
cursor, magnetic buttons, tilt cards, split-text hero, animated counters,
gallery filters + lightbox, before/after slider, FAQ accordion,
testimonials carousel, marquee Instagram strip), plus working booking and
newsletter APIs that persist to JSON files.

It also includes a lightweight admin dashboard for studio staff:

- `/admin` password login
- appointment request list with status changes
- newsletter subscriber list
- JSON exports for bookings and subscribers
- `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/healthz`
- favicon and OpenGraph SVG assets in `static/images/`

**Not included in this phase** (flagged so nothing is assumed silently):
- Database-backed admin accounts (the dashboard uses a single password from
  `ADMIN_PASSWORD` and JSON files for storage)
- Real photography — the gallery, team, and blog sections use abstract
  gradient "swatches" in the studio's palette instead of stock photos.
  Swap these for real images by editing the `.swatch` rules in
  `static/css/main.css` or extending gallery items with an `image_url`
  field and updating the templates to use `<img>` instead of the swatch div.
- Outbound email confirmations (booking/newsletter currently just persist
  to `data/*.json`; wire up Flask-Mail or an API like Resend/SendGrid
  when you're ready for real email).

## Run it

```bash
pip install -r requirements.txt --break-system-packages
python app.py
# visit http://localhost:5000
```

This checkout already has a virtualenv at `.newvenv`, so this also works:

```bash
.newvenv/bin/python app.py
```

If port 5000 is busy:

```bash
PORT=5001 .newvenv/bin/python app.py
```

Admin login:

```text
http://localhost:5000/admin
default password: admin123
```

Set `ADMIN_PASSWORD` and `SECRET_KEY` in the environment before deploying.

## How the reusable engine works

Every visible string, price, image swatch number, and nav link comes from
`/content/*.json`. Templates never hardcode copy. To relaunch this exact
codebase for a **different business** (a café, gym, clinic, etc.):

1. Duplicate the project folder.
2. Edit `content/business.json`, `content/seo.json`, `content/navigation.json`,
   `content/socials.json` with the new business's identity.
3. Rewrite `content/homepage.json`, `content/services.json`,
   `content/gallery.json`, `content/pricing.json`, `content/offers.json`,
   `content/faq.json`, `content/blog.json`, `content/testimonials.json`,
   `content/team.json` with the new business's real content.
4. Edit `content/theme.json` — every color, font, radius, shadow, and
   spacing token flows into CSS variables in `templates/base.html`.
   Changing this one file restyles the entire site.
5. Done. No template edits needed unless the new business needs a
   structurally different section (e.g. a restaurant needs a "Menu"
   section instead of "Bridal Services" — copy `templates/sections/bridal.html`
   as a starting point and point it at a new `content/menu.json`).

## Project structure

```
app.py                  Flask application factory + entrypoint
config.py                Environment-driven Flask config
blueprints/main.py       Routes: public site, APIs, admin dashboard, SEO/PWA utilities
content/*.json           ALL site copy, pricing, gallery, theme tokens — edit these to reskin
utils/content_loader.py  Loads + caches content/*.json into one namespace
utils/seo_helpers.py     Builds JSON-LD LocalBusiness schema from config
templates/base.html      Shell: theme CSS variables, fonts, vendor scripts
templates/index.html     Assembles all 19 sections in order
templates/sections/*     One template per section (hero, gallery, pricing, booking, ...)
templates/partials/*     Loader, cursor, navbar, footer
templates/admin/*        Password login and dashboard for booking/subscriber management
templates/macros/ui.html Reusable Jinja macros: section_header, btn_thread, swatch
static/css/main.css      All styling, theme-token driven
static/js/*.js           cursor.js, scroll.js (Lenis), animations.js (GSAP), gallery.js, forms.js
data/*.json              Appointment + newsletter submissions land here (gitignore in production)
```

## Design direction

Palette and type were chosen deliberately for this brief rather than
defaulted: a bordeaux/antique-gold "bridal editorial" system (Fraunces
display serif + Manrope body) instead of a generic salon pastel-pink or
cream/terracotta template look — see `content/theme.json` for the exact
tokens and rationale in code comments.

## Suggested next phases

1. **Database upgrade** — SQLAlchemy models and Flask-Login users if the
   salon needs multiple staff accounts or long-term reporting.
2. **Real photography** — replace `.swatch` placeholders with an image
   pipeline (WebP, lazy-loaded, responsive `srcset`).
3. **Email/SMS** — Flask-Mail, Resend, Twilio, or WhatsApp API for booking
   confirmations.
4. **Multi-tenant config** — a `clients/<slug>/content/` folder structure
   if you want several businesses served from one deployment.
