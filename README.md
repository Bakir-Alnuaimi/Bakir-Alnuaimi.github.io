# Bakir Zanoun – Portfolio

Personal website of **Abo Bakir Fawaz Zanoun**, Computer Engineer (M.Eng., HTW Berlin) – software, DevOps & IoT.

- Static site: plain HTML, CSS and JavaScript – no build step, no framework
- Bilingual (German / English) with light and dark mode
- Fonts are self-hosted: no cookies, no tracking, no requests to third parties
- CV as PDF in `cv/`, LaTeX source in `cv/lebenslauf.tex`

## Structure

```
index.html              main page
404.html                error page
assets/css/style.css    styles
assets/js/main.js       language, theme, small animations
assets/fonts/           self-hosted fonts (WOFF2)
assets/img/             favicon and social preview image
cv/                     CV (PDF + LaTeX source)
```

## Hosting

Deployed with **GitHub Pages** (Settings → Pages → Deploy from branch → `main` / root).
A custom domain is set via the `CNAME` file.
