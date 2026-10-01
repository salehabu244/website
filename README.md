# PieIt.net — Corporate Website

A modern, responsive, SEO-friendly corporate website for **PieIt.net** — an IT infrastructure,
cloud, hosting, email, cybersecurity, communication and software development company.

Built with plain **HTML + CSS + JavaScript** (no framework, no build step required to run),
plus an optional **PHP** contact handler that emails enquiries to your inbox.

---

## 1. Quick start

Open `index.html` in a browser. That's it — the site is fully static.

For the **contact form to send email**, the site must run on a server with PHP
(most shared hosting in Bangladesh supports PHP out of the box). See section 3.

---

## 2. Project structure

```
New folder (3)/
├── index.html                  Home (full flow: hero → services → software → cloud
│                               → why → process → industries → ecosystem → CTA
│                               → about → FAQ → contact)
├── cloud-vps.html              Cloud & VPS / VMs
├── email-solutions.html        Email Solutions
├── domain-hosting.html         Domain & Hosting
├── software-development.html   Software / ERP development (flagship page)
├── security.html               Security Solutions
├── cloud-pabx.html             Cloud PABX
├── about.html                  About + values
├── contact.html                Contact + full enquiry form
├── privacy.html / terms.html   Legal pages
│
├── css/
│   ├── base.css                Design tokens, reset, typography, buttons, utilities
│   └── layout.css              Header, hero, sections, cards, timeline, footer, forms
├── js/
│   ├── main.js                 Nav, sticky header, scroll reveal, counters, FAQ
│   └── contact.js              Form validation + AJAX submission
│
├── images/                     Design assets (illustrations, icons, logos)
├── contact.php                 Email handler for the contact form
├── robots.txt                  Crawler rules
├── sitemap.xml                 XML sitemap
├── .htaccess                   Compression, caching, security headers (Apache)
└── _build/                     Page builder (optional — see section 5)
    ├── template.html           Shared shell (head + header + footer)
    ├── bodies/*.html           Per-page content
    └── build.ps1               Regenerates the inner pages
```

---

## 3. Making the contact form send email

The form on `index.html` and `contact.html` posts to **`contact.php`**, which emails the
enquiry to you.

1. Open **`contact.php`** and set your address(es):

   ```php
   $TO_SALES = 'info@pieit.net';   // where enquiries should arrive
   $CC       = '';                  // optional
   ```

2. Upload the whole folder to your host (PHP-enabled).

3. Send a test message from the live site. If you do not receive it:

   - Check the spam folder.
   - Confirm your host allows `mail()` (many do). If not, use an SMTP-based sender.
   - To switch to SMTP without touching the form, replace the `@mail(...)` call at the
     bottom of `contact.php` with a library such as [PHPMailer](https://github.com/PHPMailer/PHPMailer).
     Everything else stays the same.

**Already built in:**
- Server-side validation + header-injection protection
- Honeypot field and simple rate limiting
- Client-side validation with friendly inline errors
- Graceful fallback: if sending fails, the user is told to email `info@pieit.net`

> If you cannot run PHP at all, tell me and I can switch the form to a hosted form
> endpoint (e.g. FormSubmit / Formspree) instead.

---

## 4. Customising

| What | Where |
|------|-------|
| Colours, fonts, spacing | `css/base.css` → `:root { … }` |
| Logo | `images/logo.png` (header), `images/logo-footer.png` (footer) |
| Favicon | `favicon.ico`, `images/favicon.png`, `images/favicon-32.png`, `images/favicon-16.png`, `images/apple-touch-icon.png` |
| Phone / email in header, footer, contact info | every `.html` (and `_build/template.html` for inner pages) |
| Service area / city | `.html` files + `contact.php` |
| Social links | footer of each page (`_build/template.html` + `index.html`) |
| SEO titles, descriptions, keywords | each page `<head>`; inner pages come from `_build/build.ps1` |

Replace the placeholder phone number **+880 1700-000000** and email addresses
**info@ / sales@ / support@ / careers@pieit.net** with your real details.

---

## 5. Editing the inner pages (optional)

The inner pages are generated from `_build/template.html` + `_build/bodies/*.html` so the
header and footer stay identical everywhere. After editing, regenerate with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "_build\build.ps1"
```

`index.html` is standalone (hand-written) and is **not** overwritten by the builder.
You can also edit the generated `.html` files directly if you prefer — just remember that
running the builder again will overwrite those edits. Delete `_build/` if you don't want it.

---

## 6. SEO & performance features

- Unique title, meta description and keywords per page
- Semantic HTML5 landmarks and heading hierarchy
- Canonical URLs, Open Graph and Twitter Card metadata
- JSON-LD structured data: Organization, WebSite, Service, BreadcrumbList
- `sitemap.xml` and `robots.txt`
- Lazy loading on below-the-fold images, `width`/`height` on hero art
- `preconnect` to font/icon CDNs, `defer` scripts
- `.htaccess` gzip compression, long-lived asset caching and security headers
- Responsive, mobile-first layout; respects `prefers-reduced-motion`; keyboard accessible

---

## 7. Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari). The site degrades gracefully:
if JavaScript is disabled, with the exception of the animated menus, all content remains
readable and the form falls back to a normal POST to `contact.php`.

---

## 8. Attribution / assets

Design language and imagery were adapted from the reference layout at
`invisionitbd.com` at the client's request. Replace or license any third-party logos
or client marks before public launch.
