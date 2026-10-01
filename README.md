# Het Prajapati — Portfolio

A responsive, static portfolio covering cybersecurity, software engineering, cloud infrastructure, projects, and certifications.

## Run locally

```sh
python3 -m http.server 3000
```

Open http://localhost:3000. No production build or framework is required. Deploy the repository root with the existing Vercel configuration or any static host.

## Maintain

- `index.html`: content, native project disclosures, certificate links, and contact form.
- `style.css`: responsive layout, typography, print styles, and reduced-motion support.
- `main.js`: mobile navigation, active-section indication, and the existing EmailJS integration.
- Certificate files remain at their original paths.

Content remains readable without JavaScript. Project details use native `details` elements. Certificates open directly without client-side PDF rendering. Google Fonts are optional; local font fallbacks are included. EmailJS loads on first form focus; unavailable delivery falls back to the visitor's mail client. EmailJS credentials are the existing public client configuration; delivery must be verified in the owner's EmailJS account.

## October 2026 update

Preserved existing project descriptions, qualifications, links, metrics, certificate assets, and contact configuration. Added resume-backed eInfochips experience, the in-progress Secaudit project, the Odoo × Gujarat Vidyapith finalist result, and software/security capabilities. CipherNest already represents the secure password manager, so it was not duplicated.

The original website lists CGPA 8.71, while the supplied resumes list 8.73. The website value is preserved pending owner clarification. The original LinkedIn URL is also preserved. No portrait was supplied in the repository; the hero uses a CSS illustration rather than an invented photograph.

Design references: the typography, spacing, and work-first presentation of [Dennis Snellenberg](https://dennissnellenberg.com/), and the distinctive personal identity of [Bruno Simon](https://bruno-simon.com/). This implementation is original and does not copy their assets or code.
