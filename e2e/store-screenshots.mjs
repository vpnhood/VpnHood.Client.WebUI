#!/usr/bin/env node
/**
 * Build App Store screenshots for the iOS Client from the running Windows client.
 *
 * iOS and Windows render the SAME SPA and gate the same features off — WinDevice and
 * IosDevice both report IsExcludeAppsSupported=false outside debug mode, and
 * WinDeviceUiProvider/IosDeviceUiProvider both extend NullDeviceUiProvider — so a Chromium
 * capture at iPhone/iPad metrics shows what the iOS build shows. The feature table this relies on
 * lives in VpnHood/fastlane/README.md; re-read it before adding a screen here.
 *
 * Both device slots App Store Connect requires are produced, because Info.plist declares
 * UIDeviceFamily [1, 2] (universal). Drop 'ipad-13' from DEVICES if iPad support is ever removed.
 * Everything is portrait: IosSpaWebViewController pins the mask to Portrait unless AllowRotation,
 * which nothing sets.
 *
 * Two phases, either runnable alone:
 *   capture  drives the SPA served by the client ITSELF (not the Vite dev server, where
 *            edgeToEdgeTopHeight/BottomHeight short-circuit to null under import.meta.env.DEV)
 *            and writes supersampled raw PNGs to raw/.
 *   frame    wraps each raw PNG in a device mockup and writes the store-sized finals to framed/.
 *            Every shipped screenshot is framed; raw/ is an intermediate, not a deliverable.
 *
 * Prerequisites:
 *   - The RELEASE Windows client on :4700. A Debug build sets AppConfigs.AppName to
 *     "VpnHood! Client (DEBUG)" — which HomePageHeader.vue prints into the header — and
 *     re-enables app splitting, putting the SPLIT APPS row back on the home screen.
 *   - The client CONNECTED, for shot 1.
 *   - Chromium once per machine: npx playwright install chromium
 *
 * Usage:
 *   node e2e/store-screenshots.mjs                          both devices, capture + frame
 *   node e2e/store-screenshots.mjs --device ipad-13         one device
 *   node e2e/store-screenshots.mjs --only 1 --speed 120/90  one shot, meter pinned
 *   node e2e/store-screenshots.mjs --frame-only             re-frame whatever is in raw/
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
const doCapture = !args.includes('--frame-only');
const doFrame = !args.includes('--capture-only');
// --only 1,4 restricts the run to those shot numbers, for iterating on one screen without
// re-shooting the whole set.
const only = argValue('--only', null)?.split(',').map(s => s.trim()).filter(Boolean) ?? null;

// --speed 120/90 pins the home meter to those Mbps figures by rewriting sessionStatus.speed on the
// way out of the API, so the SPA renders them itself rather than anything being painted onto the
// image afterwards. The meter is a live gauge and a capture catches whatever instant it fires on;
// this pins it to a representative figure instead. Only ever set it to throughput the product
// actually sustains — it is a performance claim on a store page.
// ConnectionInfo.vue renders `(speed * 10 / 1000000).toFixed(2)`, hence 1 Mbps == 100_000 here.
const MBPS_TO_API = 100_000;
const speedArg = argValue('--speed', null);
const speed = speedArg
  ? { received: Number(speedArg.split('/')[0]) * MBPS_TO_API, sent: Number(speedArg.split('/')[1]) * MBPS_TO_API }
  : null;
if (speedArg && (!Number.isFinite(speed.received) || !Number.isFinite(speed.sent)))
  throw new Error(`--speed expects <down>/<up> in Mbps, e.g. 120/90 — got "${speedArg}".`);

// Capture above the output scale: the app is drawn into a device narrower than the canvas, so it is
// downscaled on the way in, and shooting at the output scale left visibly soft text.
const CAPTURE_SUPERSAMPLE = 2;
// Chromium rasterizes a 3D-transformed subtree into a texture and then resamples it, which undoes
// that sharpness again. Render the frame above size too and downsample once, deliberately.
const FRAME_SUPERSAMPLE = 2;

// Straight-on for the whole set. This is also the sharpest option available: with no rotation there
// is no 3D subtree for Chromium to rasterize into a texture and resample, so the device edges and
// the app's text stay at full resolution through the frame pass. A shot can still opt out with its
// own `angle` if a tilt is ever wanted.
const ANGLE = { rotateX: 0, rotateY: 0, rotateZ: 0 };

/**
 * index.html sets no viewport-fit=cover and the SPA uses no env(safe-area-inset-*), so on iOS
 * WebKit insets the visual viewport to the safe area by itself: the page never draws under the
 * Dynamic Island or the home indicator. So capture into the safe rect and let the frame paint the
 * two bands. The safe insets are the numbers here assumed rather than measured — worth checking
 * against a Simulator capture if one is ever available.
 */
const DEVICES = {
  'iphone-6.9': {
    label: 'iPhone 6.9"',
    prefix: '',
    cssWidth: 430, cssHeight: 932, scale: 3,   // -> 1290x2796
    safeTop: 59, safeBottom: 34,
    screenW: 344,
    bezel: 9, outerRadius: 54, screenRadius: 46,
    island: { width: 86, height: 25 },
    statusFont: 11.5, statusPad: 26,
    indicatorWidth: 105,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  },
  'ipad-13': {
    label: 'iPad 13"',
    prefix: 'ipad_',
    cssWidth: 1032, cssHeight: 1376, scale: 2, // -> 2064x2752
    safeTop: 24, safeBottom: 20,
    screenW: 800,
    // Proportionally thicker bezel and squarer corners than the phone, and no Dynamic Island —
    // an iPad wearing an iPhone's cutout is the tell that a mockup was never checked.
    bezel: 20, outerRadius: 58, screenRadius: 40,
    island: null,
    statusFont: 9, statusPad: 34,
    indicatorWidth: 224,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  },
};

const deviceArg = argValue('--device', null);
const deviceKeys = deviceArg ? deviceArg.split(',').map(s => s.trim()) : Object.keys(DEVICES);
for (const key of deviceKeys)
  if (!DEVICES[key])
    throw new Error(`Unknown --device "${key}". Known: ${Object.keys(DEVICES).join(', ')}.`);

// A shot is either captured live from `route`, or reused from a static `source` PNG. The navigation
// drawer is absent from both lists on purpose: it shows profile names and session identifiers.
const SHOTS = [
  { num: '1', route: '/', label: 'Home (connected)' },
  {
    num: '2', label: 'Servers',
    // Reused from the Play Store set rather than captured live: the Servers page is identical on
    // both platforms (nothing on it is platform-gated), and the Android capture carries sanitised
    // demo profiles with masked IPs, where a live capture would put the real profile names, SIDs
    // and server IPs of whichever machine ran the script onto the listing.
    source: '../VpnHood/fastlane/metadata/android/en-US/images/phoneScreenshots/2_en-US.png',
  },
  { num: '3', route: '/protocols', label: 'Protocols' },
  { num: '4', route: '/protocols/cloak-mode', label: 'Cloak Mode' },
  {
    num: '5', route: '/split-tunneling', label: 'Split Tunneling',
    // The "IP Leak Risk" chip is an accurate in-app caution about a setting the user opts into
    // (split tunneling exposes your IP to whatever you route around the tunnel — true of every
    // VPN). Out of context on a store page it reads as a claim about the product instead. Hidden
    // for the capture only; the app still shows it to anyone who turns the setting on.
    hide: ['.v-chip.text-warning'],
  },
  { num: '6', route: '/dns', label: 'DNS' },
];

const selected = () => only ? SHOTS.filter(s => only.includes(s.num)) : SHOTS;
const fileName = (device, shot) => `${device.prefix}${shot.num}_en-US.png`;

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

async function captureDevice(browser, device) {
  // Opened on first live shot, so a run of only static-source shots needs neither a browser page
  // nor the client running.
  let context = null;
  let page = null;
  const openPage = async () => {
    context = await browser.newContext({
      viewport: { width: device.cssWidth, height: device.cssHeight - device.safeTop - device.safeBottom },
      deviceScaleFactor: device.scale * CAPTURE_SUPERSAMPLE,
      isMobile: true,
      hasTouch: true,
      userAgent: device.userAgent,
    });
    page = await context.newPage();

    // Both endpoints carry the state the meter reads: /api/app/state is the AppState itself, while
    // /api/app/config nests it under .state for the initial load.
    if (speed) {
      await page.route(/\/api\/app\/(state|config|configure)(\?|$)/, async (route) => {
        const response = await route.fetch();
        const body = await response.json().catch(() => null);
        const state = body?.sessionStatus ? body : body?.state;
        if (!state?.sessionStatus?.speed)
          return route.fulfill({ response });
        state.sessionStatus.speed = { ...state.sessionStatus.speed, ...speed };
        return route.fulfill({ response, json: body });
      });
    }
  };

  for (const shot of selected()) {
    // A static source is device-independent: the frame pass fits and crops it to each device's
    // content box, so the same PNG serves both slots.
    if (shot.source) {
      await fs.copyFile(path.resolve(projectRoot, shot.source), path.join(rawDir, fileName(device, shot)));
      console.log(`reused    ${device.label.padEnd(11)} ${fileName(device, shot)}  ${shot.label}  <- ${path.basename(shot.source)}`);
      continue;
    }

    if (!page) await openPage();
    await page.goto(apiBase + shot.route, { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    // The app mounts only after its async startup (config round-trip + locale chunk), so wait on
    // the condition rather than a fixed delay.
    await page.waitForFunction(() => document.querySelector('#app')?.children.length > 0,
      { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(600); // let transitions and the speed meter settle
    if (shot.hide?.length) {
      const selector = shot.hide.join(', ');
      // Fail rather than quietly ship the element: a Vuetify upgrade that renames these classes
      // would otherwise silently put the hidden chip back into the listing.
      const matched = await page.locator(selector).count();
      if (matched === 0)
        throw new Error(`${fileName(device, shot)}: nothing matched "${selector}", so it was not hidden.`);
      await page.addStyleTag({ content: `${selector} { display: none !important; }` });
      await page.waitForTimeout(150); // the row reflows without the chip
    }
    await page.screenshot({ path: path.join(rawDir, fileName(device, shot)) });
    console.log(`captured  ${device.label.padEnd(11)} ${fileName(device, shot)}  ${shot.label}`);
  }

  if (context) await context.close();
}

/**
 * The mockup is drawn in CSS rather than composited from an image asset: no binary to keep in the
 * repo, and the bezel geometry stays editable per device. Everything is inlined — the page never
 * makes a request.
 */
function framePage(dataUri, device, shot) {
  const angle = shot.angle ?? ANGLE;
  const screenH = Math.round(device.screenW * (device.cssHeight / device.cssWidth));
  const bandScale = screenH / device.cssHeight;
  const topBand = +(device.safeTop * bandScale).toFixed(2);
  const bottomBand = +(device.safeBottom * bandScale).toFixed(2);
  const island = device.island
    ? `<div class="island"></div>`
    : '';
  const islandCss = device.island ? `
  .island {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    width: ${device.island.width}px; height: ${device.island.height}px;
    border-radius: ${device.island.height / 2}px; background: #000;
  }` : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${device.cssWidth}px; height: ${device.cssHeight}px; overflow: hidden; }
  body {
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(120% 80% at 50% 0%, #1c3fb0 0%, #10206b 45%, #070f38 100%);
    font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
  }
  .stage { perspective: ${device.cssWidth * 3.5}px; perspective-origin: 50% 45%; }
  .phone {
    position: relative;
    width: ${device.screenW + device.bezel * 2}px; height: ${screenH + device.bezel * 2}px;
    border-radius: ${device.outerRadius}px;
    padding: ${device.bezel}px;
    background: linear-gradient(145deg, #c9ced8 0%, #6f747f 18%, #3c414c 42%, #767c88 68%, #b9bfc9 100%);
    transform: rotateX(${angle.rotateX}deg) rotateY(${angle.rotateY}deg) rotateZ(${angle.rotateZ}deg);
    box-shadow:
      0 ${device.bezel * 4}px ${device.bezel * 7}px rgba(0, 0, 0, .55),
      0 ${device.bezel}px ${device.bezel * 2}px rgba(0, 0, 0, .35),
      inset 0 0 2px rgba(255, 255, 255, .5);
  }
  /* The screen is a column: the app only ever occupies the middle (safe) strip, exactly as it does
     on iOS. The bands are painted with the app's own edge colours, sampled below. */
  .screen {
    position: relative; width: 100%; height: 100%;
    border-radius: ${device.screenRadius}px; overflow: hidden; background: #0b1440;
    display: flex; flex-direction: column;
  }
  .band { position: relative; flex: none; }
  .band.top { height: ${topBand}px; }
  .band.bottom { height: ${bottomBand}px; }
  #shot { flex: 1 1 auto; width: 100%; min-height: 0; object-fit: cover; object-position: top center; display: block; }
  .status {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: space-between;
    padding: ${topBand * 0.15}px ${device.statusPad}px 0; color: #fff;
    font-size: ${device.statusFont}px; font-weight: 600; letter-spacing: .2px;
  }
  .status .right { display: flex; align-items: center; gap: 4px; }
  .bars { display: flex; align-items: flex-end; gap: 1.5px; height: ${device.statusFont * 0.78}px; }
  .bars i { width: ${device.statusFont * 0.22}px; background: #fff; border-radius: 1px; }
  .bars i:nth-child(1) { height: 33%; }
  .bars i:nth-child(2) { height: 55%; }
  .bars i:nth-child(3) { height: 78%; }
  .bars i:nth-child(4) { height: 100%; }
  .battery {
    width: ${device.statusFont * 1.74}px; height: ${device.statusFont * 0.87}px;
    border: 1px solid rgba(255,255,255,.65); border-radius: 3px; padding: 1.5px;
  }
  .battery span { display: block; width: 100%; height: 100%; background: #fff; border-radius: 1px; }
  .indicator {
    position: absolute; bottom: ${bottomBand * 0.3}px; left: 50%; transform: translateX(-50%);
    width: ${device.indicatorWidth}px; height: ${Math.max(3, bottomBand * 0.17)}px;
    border-radius: 2px; background: rgba(255, 255, 255, .85);
  }${islandCss}
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
          ${island}
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

/**
 * Resize through a canvas at imageSmoothingQuality 'high' rather than letting the screenshot land
 * at the output size directly — a deliberate 2:1 downsample of an already-rasterized image beats
 * Chromium's compositor filtering of a live 3D layer.
 */
async function downsample(page, buffer, width, height) {
  const base64 = await page.evaluate(async ({ src, w, h }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { src: `data:image/png;base64,${buffer.toString('base64')}`, w: width, h: height });
  return Buffer.from(base64, 'base64');
}

async function frameDevice(browser, resizer, device) {
  const page = await browser.newPage({
    viewport: { width: device.cssWidth, height: device.cssHeight },
    deviceScaleFactor: device.scale * FRAME_SUPERSAMPLE,
  });

  let count = 0;
  for (const shot of selected()) {
    const name = fileName(device, shot);
    const png = await fs.readFile(path.join(rawDir, name)).catch(() => null);
    if (!png) {
      console.log(`skipped   ${device.label.padEnd(11)} ${name}  (not in raw/)`);
      continue;
    }
    await page.setContent(framePage(`data:image/png;base64,${png.toString('base64')}`, device, shot),
      { waitUntil: 'load' });
    await page.waitForFunction(() => window.__framed === true, { timeout: 10000 });
    const supersampled = await page.screenshot();
    await fs.writeFile(path.join(framedDir, name),
      await downsample(resizer, supersampled, device.cssWidth * device.scale, device.cssHeight * device.scale));
    console.log(`framed    ${device.label.padEnd(11)} ${name}  ${shot.label}`);
    count++;
  }

  await page.close();
  return count;
}

if (doCapture) {
  // Only reach for the client when something actually has to be captured from it.
  if (selected().some(shot => !shot.source))
    assertCaptureWorthy(await readConfig());
  await fs.mkdir(rawDir, { recursive: true });
  if (speed)
    console.log(`speed override: down ${speed.received / MBPS_TO_API} Mbps, up ${speed.sent / MBPS_TO_API} Mbps`);

  const browser = await chromium.launch().catch((err) => {
    throw new Error(`Could not launch Chromium — run 'npx playwright install chromium' once.\n${err.message.split('\n')[0]}`);
  });
  for (const key of deviceKeys) await captureDevice(browser, DEVICES[key]);
  await browser.close();
}

if (doFrame) {
  await fs.mkdir(framedDir, { recursive: true });
  const browser = await chromium.launch();
  const resizer = await browser.newPage();
  let total = 0;
  for (const key of deviceKeys) total += await frameDevice(browser, resizer, DEVICES[key]);
  await browser.close();

  const sizes = deviceKeys.map(k => `${DEVICES[k].label} ${DEVICES[k].cssWidth * DEVICES[k].scale}x${DEVICES[k].cssHeight * DEVICES[k].scale}`);
  console.log(`\n${total} framed screenshot(s) in ${path.relative(projectRoot, framedDir)} — ${sizes.join(', ')}`);
}
