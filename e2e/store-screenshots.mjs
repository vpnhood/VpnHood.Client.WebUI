#!/usr/bin/env node
/**
 * Build App Store screenshots for the iOS Client from the running Windows client.
 *
 * iOS and Windows render the SAME SPA and gate the same features off — WinDevice and
 * IosDevice both report IsExcludeAppsSupported=false outside debug mode, and
 * WinDeviceUiProvider/IosDeviceUiProvider both extend NullDeviceUiProvider — so a Chromium
 * capture at iPhone metrics shows what the iOS build shows. The feature table this relies on
 * lives in VpnHood/fastlane/README.md; re-read it before adding a screen here.
 *
 * Two phases, either runnable alone:
 *   capture  drives the SPA served by the client ITSELF (not the Vite dev server, where
 *            edgeToEdgeTopHeight/BottomHeight short-circuit to null under import.meta.env.DEV)
 *            and writes raw 1290x2796 PNGs to raw/.
 *   frame    wraps each raw PNG in an angled iPhone mockup and writes the finals to framed/.
 *
 * Prerequisites:
 *   - The RELEASE Windows client on :4700. A Debug build sets AppConfigs.AppName to
 *     "VpnHood! Client (DEBUG)" — which HomePageHeader.vue prints into the header — and
 *     re-enables app splitting, putting the SPLIT APPS row back on the home screen.
 *   - The client CONNECTED, for shot 1.
 *   - Chromium once per machine: npx playwright install chromium
 *
 * Usage:
 *   node e2e/store-screenshots.mjs                      capture + frame
 *   node e2e/store-screenshots.mjs --frame-only         re-frame whatever is in raw/
 *   node e2e/store-screenshots.mjs --frame-only --from <dir>   frame someone else's PNGs
 *   node e2e/store-screenshots.mjs --capture-only
 *   node e2e/store-screenshots.mjs --api http://localhost:4701
 */
import { promises as fs } from 'fs';
import http from 'http';
import path from 'path';
import url from 'url';
import { chromium } from 'playwright';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'test-results', 'store-screenshots');
const rawDir = path.join(outDir, 'raw');
const framedDir = path.join(outDir, 'framed');

const args = process.argv.slice(2);
const argValue = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const apiBase = argValue('--api', 'http://localhost:4700').replace(/\/$/, '');
const fromDir = path.resolve(argValue('--from', rawDir));
const doCapture = !args.includes('--frame-only');
const doFrame = !args.includes('--capture-only');
// --only 1,4 restricts the run to those shot numbers, for iterating on one screen without
// re-shooting the whole set.
const only = argValue('--only', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;

// Apple's 6.9" iPhone slot takes 1290x2796 (14/15 Pro Max, 15/16 Plus) or 1320x2868 (16 Pro Max).
// 1290 keeps us consistent with the existing files in fastlane/screenshots/ios/en-US.
const SCALE = 3;
const CSS_WIDTH = 430;
const CSS_HEIGHT = 932;

// index.html sets no viewport-fit=cover and the SPA uses no env(safe-area-inset-*), so on iOS
// WebKit insets the visual viewport to the safe area by itself: the page never draws under the
// Dynamic Island or the home indicator. Capturing the full 932 and overlaying the island instead
// puts the island on top of the app's own header. So capture into the safe rect and let the frame
// paint the two bands. 59/34 are the standard 6.9" insets — verify them against a Simulator
// capture when one is available, they are the one number here that is assumed rather than measured.
const SAFE_TOP = 59;
const SAFE_BOTTOM = 34;
const CAPTURE_HEIGHT = CSS_HEIGHT - SAFE_TOP - SAFE_BOTTOM;

// Angles vary per shot so the set reads as a sequence rather than six identical mockups. Kept
// inside ±15° — past that the far edge of the screen compresses enough to hurt legibility.
const SHOTS = [
  { file: '1_en-US', route: '/', label: 'Home (connected)', rotateY: -13, rotateZ: -1.5 },
  { file: '2_en-US', route: '/servers', label: 'Servers', rotateY: 13, rotateZ: 1.5 },
  { file: '3_en-US', route: '/protocols', label: 'Protocols', rotateY: -9, rotateZ: -1 },
  { file: '4_en-US', route: '/protocols/cloak-mode', label: 'Cloak Mode', rotateY: 9, rotateZ: 1 },
  { file: '5_en-US', route: '/split-tunneling', label: 'Split Tunneling', rotateY: -15, rotateZ: -2 },
  { file: '6_en-US', route: '/dns', label: 'DNS', rotateY: 15, rotateZ: 2 },
];

const selected = () => only ? SHOTS.filter(s => only.includes(s.file.split('_')[0])) : SHOTS;

// node:http instead of fetch, matching smoke.mjs: Node 24's undici intermittently hits a parser
// assertion against these local servers and crashes the process instead of failing the probe.
function request(method, urlToCall) {
  return new Promise((resolve, reject) => {
    const req = http.request(urlToCall, { method, timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode ?? 0, body: data }));
    });
    req.on('timeout', () => req.destroy(new Error(`Timed out: ${method} ${urlToCall}`)));
    req.on('error', reject);
    req.end();
  });
}

async function readConfig() {
  const res = await request('GET', `${apiBase}/api/app/config`).catch(() => null);
  if (!res || res.status < 200 || res.status >= 400)
    throw new Error(
      `The client API is not answering at ${apiBase}/api/app/config.\n` +
      'Start the RELEASE Windows client (it serves the SPA and the API on :4700).');
  return JSON.parse(res.body);
}

/** Fails loudly on the two states that silently poison a whole capture run. */
function assertCaptureWorthy(config) {
  const features = config.features ?? {};
  if (/debug/i.test(features.appName ?? ''))
    throw new Error(
      `features.appName is "${features.appName}" — this is a Debug build and its name is ` +
      'rendered into the header of every screenshot. Rebuild in Release.');
  if (features.isExcludeAppsSupported || features.isIncludeAppsSupported)
    throw new Error(
      'This build reports app-splitting as supported, so the home screen will show a SPLIT APPS ' +
      'row that the iOS build hides (WinDevice enables it in debug mode). Rebuild in Release.');
}

async function capture() {
  const config = await readConfig();
  assertCaptureWorthy(config);
  await fs.mkdir(rawDir, { recursive: true });

  const browser = await chromium.launch().catch((err) => {
    throw new Error(`Could not launch Chromium — run 'npx playwright install chromium' once.\n${err.message.split('\n')[0]}`);
  });
  const context = await browser.newContext({
    viewport: { width: CSS_WIDTH, height: CAPTURE_HEIGHT },
    deviceScaleFactor: SCALE,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  for (const shot of selected()) {
    await page.goto(apiBase + shot.route, { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    // The app mounts only after its async startup (config round-trip + locale chunk), so wait on
    // the condition rather than a fixed delay.
    await page.waitForFunction(() => document.querySelector('#app')?.children.length > 0,
      { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600); // let transitions and the speed meter settle
    await page.screenshot({ path: path.join(rawDir, `${shot.file}.png`) });
    console.log(`captured  ${shot.file}  ${shot.label}`);
  }

  await browser.close();
}

/**
 * The mockup is drawn in CSS rather than composited from an image asset: no binary to keep in the
 * repo, and the bezel/island geometry stays editable. Everything is inlined — the page never makes
 * a request.
 */
function framePage(dataUri, shot) {
  const screenW = 296;
  const screenH = Math.round(screenW * (CSS_HEIGHT / CSS_WIDTH));
  const bandScale = screenH / CSS_HEIGHT;
  const topBand = +(SAFE_TOP * bandScale).toFixed(2);
  const bottomBand = +(SAFE_BOTTOM * bandScale).toFixed(2);
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${CSS_WIDTH}px; height: ${CSS_HEIGHT}px; overflow: hidden; }
  body {
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(120% 80% at 50% 0%, #1c3fb0 0%, #10206b 45%, #070f38 100%);
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  }
  .stage { perspective: 1500px; perspective-origin: 50% 45%; }
  .phone {
    position: relative;
    width: ${screenW + 18}px; height: ${screenH + 18}px;
    border-radius: 54px;
    padding: 9px;
    background: linear-gradient(145deg, #c9ced8 0%, #6f747f 18%, #3c414c 42%, #767c88 68%, #b9bfc9 100%);
    transform: rotateX(3deg) rotateY(${shot.rotateY}deg) rotateZ(${shot.rotateZ}deg);
    box-shadow:
      0 40px 70px rgba(0, 0, 0, .55),
      0 8px 20px rgba(0, 0, 0, .35),
      inset 0 0 2px rgba(255, 255, 255, .5);
  }
  /* The screen is a column: the app only ever occupies the middle (safe) strip, exactly as it does
     on iOS. The bands are painted with the app's own edge colours, sampled below. */
  .screen {
    position: relative; width: 100%; height: 100%;
    border-radius: 46px; overflow: hidden; background: #0b1440;
    display: flex; flex-direction: column;
  }
  .band { position: relative; flex: none; }
  .band.top { height: ${topBand}px; }
  .band.bottom { height: ${bottomBand}px; }
  #shot { flex: 1 1 auto; width: 100%; min-height: 0; object-fit: cover; object-position: top center; display: block; }
  .island {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: 86px; height: 25px; border-radius: 14px; background: #000;
  }
  .status {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 26px 0; color: #fff;
    font-size: 11.5px; font-weight: 600; letter-spacing: .2px;
  }
  .status .right { display: flex; align-items: center; gap: 4px; }
  .bars { display: flex; align-items: flex-end; gap: 1.5px; height: 9px; }
  .bars i { width: 2.5px; background: #fff; border-radius: 1px; }
  .bars i:nth-child(1) { height: 3px; }
  .bars i:nth-child(2) { height: 5px; }
  .bars i:nth-child(3) { height: 7px; }
  .bars i:nth-child(4) { height: 9px; }
  .battery { width: 20px; height: 10px; border: 1px solid rgba(255,255,255,.65); border-radius: 3px; padding: 1.5px; }
  .battery span { display: block; width: 100%; height: 100%; background: #fff; border-radius: 1px; }
  .indicator {
    position: absolute; bottom: 7px; left: 50%; transform: translateX(-50%);
    width: 105px; height: 4px; border-radius: 2px; background: rgba(255, 255, 255, .85);
  }
</style></head>
<body>
  <div class="stage">
    <div class="phone">
      <div class="screen">
        <div class="band top" id="bandTop">
          <div class="status">
            <span>9:41</span>
            <span class="right">
              <span class="bars"><i></i><i></i><i></i><i></i></span>
              <span class="battery"><span></span></span>
            </span>
          </div>
          <div class="island"></div>
        </div>
        <img id="shot" src="${dataUri}" alt="">
        <div class="band bottom" id="bandBottom"><div class="indicator"></div></div>
      </div>
    </div>
  </div>
<script>
  // Sample the capture's own top and bottom edge so the bands continue the app's background
  // instead of guessing a colour that drifts whenever the theme changes.
  const img = document.getElementById('shot');
  const paint = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const at = (y) => {
      const [r, g, b] = ctx.getImageData(Math.floor(canvas.width / 2), y, 1, 1).data;
      return \`rgb(\${r}, \${g}, \${b})\`;
    };
    document.getElementById('bandTop').style.background = at(1);
    document.getElementById('bandBottom').style.background = at(canvas.height - 2);
    window.__framed = true;
  };
  if (img.complete) paint(); else img.addEventListener('load', paint);
</script>
</body></html>`;
}

async function frame() {
  await fs.mkdir(framedDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: CSS_WIDTH, height: CSS_HEIGHT },
    deviceScaleFactor: SCALE,
  });

  let framed = 0;
  for (const shot of selected()) {
    const source = path.join(fromDir, `${shot.file}.png`);
    const png = await fs.readFile(source).catch(() => null);
    if (!png) {
      console.log(`skipped   ${shot.file}  (no ${path.relative(projectRoot, source)})`);
      continue;
    }
    await page.setContent(framePage(`data:image/png;base64,${png.toString('base64')}`, shot),
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.__framed === true, { timeout: 10000 });
    await page.screenshot({ path: path.join(framedDir, `${shot.file}.png`) });
    console.log(`framed    ${shot.file}  ${shot.label}  (rotateY ${shot.rotateY}°)`);
    framed++;
  }

  await browser.close();
  return framed;
}

if (doCapture) await capture();
if (doFrame) {
  const count = await frame();
  console.log(`\n${count} framed screenshot(s) at ${CSS_WIDTH * SCALE}x${CSS_HEIGHT * SCALE} in ${path.relative(projectRoot, framedDir)}`);
}
