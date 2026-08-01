/**
 * Per-project store-screenshot configuration. THIS is the file a fork edits — the engine in
 * ../store-screenshots.mjs stays untouched.
 *
 * Three things live here: the PLATFORMS to produce (each with its capability patch, devices,
 * screens and install destination), the API ROUTES that answer the SPA from fixture.json, and the
 * prepare() hook that synthesizes fixture data needing a renderer (the demo app icons).
 *
 * The fixture is one recording (a Windows Release client), and each platform overlays its own
 * capability patch so the SPA renders exactly what that OS build shows. Patch values are NOT free to
 * invent — each one mirrors a device class in the VpnHood repo, cited next to the patch. When a
 * capability changes there, change it here.
 */
import { promises as fs } from 'fs';
import path from 'path';
import url from 'url';

const projectRoot = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..', '..');

// A shared tilt reads as a deliberate treatment where a per-shot angle reads as drift. Straight-on
// is also the sharpest option: with no rotation there is no 3D subtree for Chromium to rasterize
// into a texture and resample. A shot can override with its own `angle`.
export const ANGLE = { rotateX: 0, rotateY: 0, rotateZ: 0 };

/**
 * Patches applied to the mocked API for a shot, as a deep merge over fixture.json (after the
 * platform patch). Only the fields that matter to the screen need to appear.
 *
 * ConnectionInfo.vue renders `(speed * 10 / 1000000).toFixed(2)`, so 1 Mbps == 100_000 here. Only
 * ever use throughput the product actually sustains — it is a performance claim on a store page.
 */
const MBPS = 100_000;

const CONNECTED = {
  state: {
    connectionState: 'Connected',
    sessionStatus: { speed: { received: 116.4 * MBPS, sent: 89.39 * MBPS } },
  },
};

// The CLIENT app ships with no servers — users bring their own key, and the store page must not
// suggest a bundled server list (that is the VpnHood! CONNECT story). Live-captured Servers shots
// use this; the reused Play capture (see SERVERS_PLAY_PNG) predates the rule and shows a demo list.
const NO_SERVERS = { clientProfileInfos: [] };

/**
 * The Apps Filter page calls GET /api/app/installed-apps, which on a real device returns the
 * installed apps with their icons. The mock answers with common-category demo apps whose icons are
 * SYNTHESIZED by prepare() below — monogram tiles, not real brand artwork: a screenshot of a real
 * phone incidentally showing Google's icons is one thing, committing their artwork as fixture data
 * is another.
 */
const DEMO_APPS = [
  { appId: 'com.demo.browser', appName: 'Browser', hue: 210, letter: 'B' },
  { appId: 'com.demo.messages', appName: 'Messages', hue: 130, letter: 'M' },
  { appId: 'com.demo.video', appName: 'Video Player', hue: 0, letter: 'V' },
  { appId: 'com.demo.music', appName: 'Music', hue: 25, letter: 'M' },
  { appId: 'com.demo.photos', appName: 'Photos', hue: 280, letter: 'P' },
  { appId: 'com.demo.maps', appName: 'Maps', hue: 160, letter: 'M' },
  { appId: 'com.demo.mail', appName: 'Mail', hue: 200, letter: 'M' },
  { appId: 'com.demo.camera', appName: 'Camera', hue: 340, letter: 'C' },
  { appId: 'com.demo.social', appName: 'Social', hue: 190, letter: 'S' },
  { appId: 'com.demo.games', appName: 'Games', hue: 45, letter: 'G' },
];

/**
 * Renders the demo app icons through the engine's Chromium and plants them on the fixture before
 * any capture runs. Deterministic on any machine: fixed hues, and the app's own Poppins face is
 * inlined so no system font can drift the glyphs between a dev box and CI.
 */
export async function prepare(browser, fixture) {
  const font = await fs.readFile(path.join(projectRoot, 'src', 'assets', 'fonts', 'Poppins-SemiBold.ttf'));
  const page = await browser.newPage();
  const icons = await page.evaluate(async ({ apps, fontB64 }) => {
    const face = new FontFace('StoreFrame', `url(data:font/ttf;base64,${fontB64})`);
    await face.load();
    document.fonts.add(face);

    return apps.map(app => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 96;
      const ctx = canvas.getContext('2d');
      const fill = ctx.createLinearGradient(0, 0, 96, 96);
      fill.addColorStop(0, `hsl(${app.hue} 72% 58%)`);
      fill.addColorStop(1, `hsl(${app.hue + 20} 76% 40%)`);
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.roundRect(0, 0, 96, 96, 24);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '600 46px StoreFrame';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(app.letter, 48, 52);
      // The SPA prepends 'data:image/png;base64, ' itself (split-apps.vue), so strip the header.
      return canvas.toDataURL('image/png').split(',')[1];
    });
  }, { apps: DEMO_APPS, fontB64: font.toString('base64') });
  await page.close();

  fixture.installedApps = DEMO_APPS.map((app, i) => ({
    appId: app.appId, appName: app.appName, iconPng: icons[i],
  }));
}

// "All except 2 apps": Browser and Social ride outside the tunnel, mirroring the story the old
// hand-shot listing told with Play Store and WhatsApp.
const APPS_FILTER = {
  num: '3', route: '/split-tunneling/split-apps', label: 'Apps Filter',
  patch: { userSettings: { splitTunneling: { appMode: 'Exclude', apps: ['com.demo.browser', 'com.demo.social'] } } },
};

// The Servers page renders the fixture's sanitised demo profiles, so a live mock capture leaks
// nothing — but the committed Play capture shows the richer demo country list, which the
// two-profile fixture cannot reproduce. The two portrait phone-aspect sets reuse it; every other
// aspect captures live, because cover-cropping a 1440x2960 portrait would cut the list off anyway.
const SERVERS_PLAY_PNG = '../VpnHood/fastlane/metadata/android/en-US/images/phoneScreenshots/2_en-US.png';

// The "IP Leak Risk" chip is an accurate in-app caution about a setting the user opts into (split
// tunneling exposes your IP to whatever you route around the tunnel — true of every VPN). Out of
// context on a store page it reads as a claim about the product. Hidden for the capture only; the
// app still shows it to anyone who turns the setting on.
const HIDE_LEAK_CHIP = ['.v-chip.text-warning'];

/**
 * Device fields by frame type:
 *   frame: 'phone'    bezel mockup around the capture — needs the safe-area and bezel geometry
 *                     fields; statusStyle 'android' swaps the iOS status cluster for wifi+signal+
 *                     battery and `punchHole` replaces `island`; final size = css * scale
 *   frame: 'none'     the bare capture; final size = css * scale
 *   frame: 'desktop'  the capture composited into an OS window on a backdrop — needs `canvas`;
 *                     final size = canvas.width x canvas.height
 *
 * cssWidth/cssHeight is always the CAPTURE viewport in CSS pixels. On iOS WebKit insets the visual
 * viewport to the safe area itself (no viewport-fit=cover, no env() use in the SPA); the same
 * capture-into-the-safe-strip approach is applied to the Android mockups, whose bands paint a
 * status bar and gesture pill. Safe insets are assumed rather than measured.
 */

const IOS_DEVICES = {
  'iphone-6.9': {
    label: 'iPhone 6.9"',
    prefix: '',
    frame: 'phone',
    cssWidth: 430, cssHeight: 932, scale: 3,   // -> 1290x2796, Apple's required iPhone slot
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
    frame: 'phone',
    cssWidth: 1032, cssHeight: 1376, scale: 2, // -> 2064x2752, required while UIDeviceFamily has 2
    safeTop: 24, safeBottom: 20,
    screenW: 800,
    // Proportionally thicker bezel and squarer corners than the phone, and no Dynamic Island — an
    // iPad wearing an iPhone's cutout is the tell that a mockup was never checked.
    bezel: 20, outerRadius: 58, screenRadius: 40,
    island: null,
    statusFont: 9, statusPad: 34,
    indicatorWidth: 224,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_5 like Mac OS X) AppleWebKit/605.1.15 ' +
      '(KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  },
};

/**
 * AndroidDevice + AndroidDeviceUiProvider on a phone or tablet (every intent gate below is `!IsTv`
 * plus an API-level floor the Play target exceeds). Phones and tablets share one capability set —
 * only the viewport differs.
 */
const ANDROID_PATCH = {
  features: {
    // AndroidDevice.IsExcludeAppsSupported / IsIncludeAppsSupported => true
    isExcludeAppsSupported: true,
    isIncludeAppsSupported: true,
  },
  intentFeatures: {
    isQuickLaunchSupported: true,             // AndroidDeviceUiProvider, API 24+ & !IsTv
    isRequestQuickLaunchSupported: true,
    isRequestNotificationSupported: true,     // API 33+ & !IsTv
    isPrivateDnsSettingsSupported: true,      // API 28+ & !IsTv
    isKillSwitchSettingsSupported: true,      // API 24+ & !IsTv
    isAlwaysOnSettingsSupported: true,        // API 24+ & !IsTv
    isSettingsSupported: true,
    isAppSettingsSupported: true,
    isAppNotificationSettingsSupported: true,
  },
  state: { isNotificationEnabled: true },
};

/**
 * Google Play accepts AT MOST 8 screenshots per device type. The Android sets deliberately generate
 * more than 8 so every marketable screen exists — pick the 8 to upload when installing (the
 * destination workflow is still to be decided).
 */
const ANDROID_SHOTS = [
  { num: '1', route: '/', label: 'Home (connected)', patch: CONNECTED },
  { num: '2', label: 'Servers', source: SERVERS_PLAY_PNG },
  APPS_FILTER,
  { num: '4', route: '/protocols', label: 'Protocols' },
  { num: '5', route: '/protocols/cloak-mode', label: 'Cloak Mode' },
  { num: '6', route: '/split-tunneling', label: 'Split Tunneling', hide: HIDE_LEAK_CHIP },
  { num: '7', route: '/dns', label: 'DNS' },                       // shows the Private DNS card too
  { num: '8', route: '/settings/kill-switch', label: 'Kill Switch' },
  { num: '9', route: '/settings/always-on', label: 'Always On' },
  { num: '10', route: '/settings/quick-launch', label: 'Quick Launch' },
  { num: '11', route: '/settings/proxies', label: 'Proxies' },
  { num: '12', route: '/settings', label: 'Settings' },
];

/** installDir is relative to the WebUI repo root; used only when `--install` is passed. The npm
 * script does NOT install — screenshots stay in test-results/ until the destination is decided
 * (committing them into the main repo bloats it). */
export const PLATFORMS = {
  ios: {
    label: 'App Store',
    installDir: '../VpnHood/fastlane/screenshots/ios/en-US',
    // No patch: the fixture IS the iOS capability profile. It was recorded from a Windows Release
    // client, and WinDevice/WinDeviceUiProvider gate off the same features IosDevice does — no app
    // split, no Private DNS, no kill switch (see the table in fastlane/README.md).
    patch: {},
    devices: IOS_DEVICES,
    shots: [
      {
        num: '1', route: '/', label: 'Home (connected)',
        // The only screen that needs a session. Everything else looks identical disconnected, which
        // is why the fixture does not have to simulate a whole tunnel.
        patch: CONNECTED,
      },
      { num: '2', label: 'Servers', source: SERVERS_PLAY_PNG },
      { num: '3', route: '/protocols', label: 'Protocols' },
      { num: '4', route: '/protocols/cloak-mode', label: 'Cloak Mode' },
      { num: '5', route: '/split-tunneling', label: 'Split Tunneling', hide: HIDE_LEAK_CHIP },
      { num: '6', route: '/dns', label: 'DNS' },
      { num: '7', route: '/settings/proxies', label: 'Proxies' },
      { num: '8', route: '/settings', label: 'Settings' },
    ],
  },

  'android-phone': {
    label: 'Google Play',
    installDir: '../VpnHood/fastlane/metadata/android/en-US/images/phoneScreenshots',
    patch: ANDROID_PATCH,
    devices: {
      'android-phone': {
        label: 'Android',
        prefix: '',
        frame: 'phone',
        statusStyle: 'android',
        cssWidth: 360, cssHeight: 740, scale: 4,  // -> 1440x2960, same as the hand-shot set
        safeTop: 28, safeBottom: 20,
        screenW: 288,
        bezel: 8, outerRadius: 44, screenRadius: 36,
        island: null, punchHole: { size: 12 },
        statusFont: 11, statusPad: 22,
        indicatorWidth: 96,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
      },
    },
    shots: ANDROID_SHOTS,
  },

  'android-tablet-7': {
    label: 'Google Play 7" tablet',
    installDir: '../VpnHood/fastlane/metadata/android/en-US/images/sevenInchScreenshots',
    patch: ANDROID_PATCH,
    devices: {
      'android-tablet-7': {
        label: 'Tablet 7"',
        prefix: '',
        frame: 'phone',
        statusStyle: 'android',
        cssWidth: 600, cssHeight: 960, scale: 2,  // -> 1200x1920, a Nexus-7-class panel
        safeTop: 24, safeBottom: 18,
        screenW: 480,
        bezel: 14, outerRadius: 36, screenRadius: 26,
        island: null, punchHole: null,            // tablet cameras sit on the long edge — no cutout
        statusFont: 10, statusPad: 26,
        indicatorWidth: 140,
        userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',   // tablet UA carries no "Mobile"
      },
    },
    shots: ANDROID_SHOTS,
  },

  'android-tablet-10': {
    label: 'Google Play 10" tablet',
    installDir: '../VpnHood/fastlane/metadata/android/en-US/images/tenInchScreenshots',
    patch: ANDROID_PATCH,
    devices: {
      'android-tablet-10': {
        label: 'Tablet 10"',
        prefix: '',
        frame: 'phone',
        statusStyle: 'android',
        cssWidth: 800, cssHeight: 1280, scale: 2, // -> 1600x2560
        safeTop: 24, safeBottom: 18,
        screenW: 640,
        bezel: 18, outerRadius: 42, screenRadius: 30,
        island: null, punchHole: null,
        statusFont: 10, statusPad: 30,
        indicatorWidth: 180,
        userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    },
    shots: ANDROID_SHOTS,
  },

  'android-tv': {
    label: 'Google Play TV',
    installDir: '../VpnHood/fastlane/metadata/android/en-US/images/tvScreenshots',
    // AndroidDevice with AndroidUtils.IsTv() true: app split stays supported, but every
    // AndroidDeviceUiProvider intent is gated on !IsTv — so intentFeatures keep the fixture's
    // all-false baseline, and the SPA switches to its isTv layout.
    patch: {
      features: {
        isTv: true,
        isExcludeAppsSupported: true,
        isIncludeAppsSupported: true,
      },
    },
    devices: {
      'android-tv': {
        label: 'Android TV',
        prefix: '',
        // Bare on purpose even though the other Android sets are framed: a TV screenshot IS the
        // full 16:9 panel — wrapping it in a TV bezel would just shrink the app into letterboxing.
        frame: 'none',
        // -> 1920x1080 landscape, the tvScreenshots size. 1280x720 CSS (a 720p/tvdpi-class panel)
        // rather than 960x540 (1080p/xhdpi): both exist on real TVs, and the roomier one fits the
        // whole home page — at 540 CSS the config rows clip before the PROTOCOL row.
        cssWidth: 1280, cssHeight: 720, scale: 1.5,
        safeTop: 0, safeBottom: 0,
        isMobile: false, hasTouch: false,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; ADT-3) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      },
    },
    // No Apps Filter (FilterList is finger-driven and the page is not in the TV remote flow) and no
    // Kill Switch / Always On / Quick Launch (every one is gated `!IsTv`).
    shots: [
      { num: '1', route: '/', label: 'Home (connected)', patch: CONNECTED },
      { num: '2', route: '/servers', label: 'Servers' },
      { num: '3', route: '/protocols', label: 'Protocols' },
      { num: '4', route: '/protocols/cloak-mode', label: 'Cloak Mode' },
      { num: '5', route: '/split-tunneling', label: 'Split Tunneling', hide: HIDE_LEAK_CHIP },
      { num: '6', route: '/dns', label: 'DNS' },
      { num: '7', route: '/settings/proxies', label: 'Proxies' },
      { num: '8', route: '/settings', label: 'Settings' },
    ],
  },

  windows: {
    label: 'Microsoft Store',
    // No fastlane lane exists for the Microsoft Store — upload via Partner Center or the msstore CLI.
    installDir: '../VpnHood/store/microsoft/en-US/screenshots',
    // No patch: the fixture was recorded from this exact build (WinDevice in Release: no app split,
    // WinDeviceUiProvider: no settings intents).
    patch: {},
    devices: {
      'windows-desktop': {
        label: 'Windows',
        prefix: '',
        frame: 'desktop',
        // The real WPF window is a fixed 400x700 (AppResources.WindowSize, ResizeMode.CanMinimize),
        // far under the Store's 1366x768 floor — so the capture is composited into a desktop scene.
        cssWidth: 400, cssHeight: 700, scale: 3,
        safeTop: 0, safeBottom: 0,
        isMobile: false, hasTouch: false,
        canvas: { width: 1920, height: 1080, windowWidth: 520, titleBar: 40 },
        windowTitle: 'VpnHood! CLIENT',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
          '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
      },
    },
    shots: [
      { num: '1', route: '/', label: 'Home (connected)', patch: CONNECTED },
      // A brand-new listing must open on the truthful first-run story: no bundled servers, the
      // user adds a key.
      { num: '2', route: '/servers', label: 'Servers (empty)', patch: NO_SERVERS },
      { num: '3', route: '/protocols', label: 'Protocols' },
      { num: '4', route: '/protocols/cloak-mode', label: 'Cloak Mode' },
      { num: '5', route: '/split-tunneling', label: 'Split Tunneling', hide: HIDE_LEAK_CHIP },
      { num: '6', route: '/dns', label: 'DNS' },
      { num: '7', route: '/settings/proxies', label: 'Proxies' },
      { num: '8', route: '/settings', label: 'Settings' },
    ],
  },
};

/**
 * Endpoints the mock answers, on top of the (platform-patched) fixture. The SPA's startup path is
 * POST /api/app/configure followed by GET /api/app/state polling; everything else is per-page.
 * Unmatched /api/** calls are logged by the engine rather than silently 404ing, so a screen that
 * starts needing a new endpoint shows up as a warning instead of a broken screenshot.
 */
export const ROUTES = {
  'POST /api/app/configure': (fixture) => fixture,
  // Returns the whole AppConfig, not void: answering null here wipes features on the client and
  // VpnHoodApp.getVersion() then throws on `fullVersion.split('.')`, which cascades into an error
  // dialog over the screenshot.
  'PATCH /api/app/configure': (fixture) => fixture,
  'GET /api/app/config': (fixture) => fixture,
  'GET /api/app/state': (fixture) => fixture.state,
  'GET /api/client-profiles': (fixture) => fixture.clientProfileInfos,
  'GET /api/app/installed-apps': (fixture) => fixture.installedApps ?? [],
  'PUT /api/app/user-settings': () => null, // void
};
