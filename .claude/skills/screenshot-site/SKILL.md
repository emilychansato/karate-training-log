---
name: screenshot-site
description: Navigate to a URL and take a screenshot, saved as a local PNG that can be read directly into the conversation. Use when the user wants to see what a live website looks like, grab visual reference from another app/site, or check how a deployed page renders. Not for screenshotting this project's own local dev server pages that need interaction first - use the `run` skill for that.
---

# Screenshot a website

A standalone Playwright-based tool, isolated in this skill's own
directory (its own `package.json` - never imports from or affects the
main app's dependencies).

## First time only: install

```bash
cd .claude/skills/screenshot-site
npm install
npx playwright install chromium
```

This downloads a local headless Chromium (a few hundred MB, one-time).
Skip this step on every run after the first - only re-run if
`node screenshot.mjs` fails with a "browser not found" error.

## Take a screenshot

```bash
cd .claude/skills/screenshot-site
node screenshot.mjs <url> [output-name] [--viewport=WxH] [--no-full-page]
```

- `<url>` — required, full URL including `https://`
- `[output-name]` — optional; defaults to a slugified version of the URL
- `--viewport=WxH` — optional, e.g. `--viewport=390x844` for a phone-sized
  viewport; defaults to `1280x800`
- `--no-full-page` — optional; by default captures the full scrollable
  page, not just the visible viewport

The script prints the saved PNG's path on success, e.g.:

```
C:\Users\markc\projects\karate-training-log\.claude\skills\screenshot-site\screenshots\example-com.png
```

## Bring it into the conversation

Screenshots are saved as real files but Claude cannot see them until
told to. After running the script, use the Read tool on the printed
path - the image renders directly in the conversation, the same as any
other screenshot.

## Examples

```bash
# Desktop screenshot of a competitor app's landing page
node screenshot.mjs https://example-karate-app.com landing-page

# Mobile-sized viewport, visible area only (no full scroll capture)
node screenshot.mjs https://example.com mobile-hero --viewport=390x844 --no-full-page
```

## Notes

- Screenshots accumulate in `screenshots/` - that folder is git-ignored
  (add `.claude/skills/screenshot-site/screenshots/` to `.gitignore` if
  it isn't already) so reference grabs never get committed to the repo.
- Sites behind login walls or aggressive bot-protection (Cloudflare
  challenges, etc.) may render a blocked/challenge page instead of real
  content - this tool does not solve CAPTCHAs or handle auth.
- For very tall pages, `--no-full-page` avoids an excessively long image
  when only the first screen is needed.
