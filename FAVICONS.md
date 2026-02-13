# Replacing all favicons with your logo

The **browser tab** already uses your logo: `public/an_logo.svg` is set as the primary favicon in `index.html`.

To replace **all** favicon sizes (bookmarks, home screen, taskbar, etc.) with the same logo:

1. Go to **[realfavicongenerator.net](https://realfavicongenerator.net/)** (or [favicon.io](https://favicon.io/)).
2. Upload **`public/an_logo.svg`** (or a square 260×260+ PNG of your logo).
3. Download the generated package.
4. Replace the files in **`public/`** with the new ones:
   - `favicon.ico`
   - `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`
   - `apple-touch-icon.png` and `apple-icon-*.png`
   - `android-chrome-*.png` / `android-icon-*.png`
   - `ms-icon-*.png`
5. If the generator gives you a new `site.webmanifest` or `browserconfig.xml`, replace those in `public/` too.

After that, all favicons will use your logo.
