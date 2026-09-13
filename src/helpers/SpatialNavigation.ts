import { VpnHoodApp } from '@/services/VpnHoodApp';

// The D-pad on the TV UI. The browser has a walk of its own (spatial navigation: Android's WebView
// turns it on for a device without a touchscreen, the Windows host turns it on in TV mode), and it
// is not usable as it comes: it treats anything with a click handler as a focus target, and Vuetify
// puts click handlers on radio labels, switch tracks and control wrappers, so the ring landed on a
// label as a rectangle or on an invisible wrapper as nothing, and the jumps followed the geometry
// of those (from the cloak switch, Down went to the QUIC row because its text was the widest).
// Verified on the protocols page, 2026-09-12. The same rules apply on the TV itself.
//
// So the app decides, and cancels the browser's own move by handling the arrows first:
// - what a target is: a link, a button, a form control, or anything the app gave a tabindex other
//   than -1 (Vuetify's list items carry -2; -1 is the app's mark for a decorative control);
// - where a step goes: to the nearest target in the pressed direction, measured on rectangles —
//   a target inside a data-tv-row element is measured on that row, so a radio's or a switch's step
//   is the whole row and not the 40px control at its edge, and general.css draws the ring on the
//   row for the same reason (Leanback's model: the row is the thing you are on);
// - inside an open dialog or menu only that overlay's targets count, which is also what the eye sees.
// Enter on a radio or a checkbox clicks it: the D-pad centre arrives as Enter, which those inputs
// do nothing with by themselves (Space is their key). A text field keeps Left and Right for its
// caret, and a slider or a select keeps all four. With nothing to go to, the page scrolls a little,
// so a long text can still be read to its end.
type Direction = 'up' | 'down' | 'left' | 'right';

const DIRECTIONS: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

const TARGET_SELECTOR = 'a[href], button, input:not([type="hidden"]), select, textarea, [tabindex]';
const ROW_SELECTOR = '[data-tv-row]';
const TEXT_INPUT_TYPES = new Set(['text', 'password', 'search', 'url', 'email', 'number', 'tel']);
const SCROLL_STEP = 120;

// A rectangle's edges must not be behind the current one's in the pressed direction; this much
// slack forgives a row that sits a pixel or two off.
const EDGE_TOLERANCE = 4;

function isTarget(el: HTMLElement): boolean {
  // a list root only forwards its focus to a child; the children are the targets
  if (el.classList.contains('v-list'))
    return false;
  if (el.getAttribute('tabindex') === '-1')
    return false;
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true' || el.closest('[inert]'))
    return false;

  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// The topmost active Vuetify overlay (a dialog, a menu), else the page.
function scopeRoot(): Element {
  const overlays = document.querySelectorAll('.v-overlay--active > .v-overlay__content');
  return overlays.length ? overlays[overlays.length - 1] : document.body;
}

function rowOf(el: HTMLElement): HTMLElement {
  return el.closest<HTMLElement>(ROW_SELECTOR) ?? el;
}

function isTextEntry(el: Element | null): boolean {
  return el instanceof HTMLTextAreaElement
    || (el instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(el.type))
    || (el instanceof HTMLElement && el.isContentEditable);
}

// Lower is nearer; null is "not in that direction". The distance along the pressed direction, plus
// twice the gap between the two rectangles' projections on the other axis (zero when they overlap,
// which is what makes a walk down a column of rows step row by row), plus a little for the centre
// offset so that, among rows that all overlap, the one in line wins.
function scoreOf(from: DOMRect, to: DOMRect, direction: Direction): number | null {
  let primary: number;
  switch (direction) {
    case 'down':
      if (to.top < from.bottom - EDGE_TOLERANCE) return null;
      primary = to.top - from.bottom;
      break;
    case 'up':
      if (to.bottom > from.top + EDGE_TOLERANCE) return null;
      primary = from.top - to.bottom;
      break;
    case 'right':
      if (to.left < from.right - EDGE_TOLERANCE) return null;
      primary = to.left - from.right;
      break;
    case 'left':
      if (to.right > from.left + EDGE_TOLERANCE) return null;
      primary = from.left - to.right;
      break;
  }

  primary = Math.max(0, primary);
  const vertical = direction === 'up' || direction === 'down';
  const [fromStart, fromEnd, toStart, toEnd] = vertical
    ? [from.left, from.right, to.left, to.right]
    : [from.top, from.bottom, to.top, to.bottom];
  const orthogonal = Math.max(0, toStart - fromEnd, fromStart - toEnd);

  // A cone, not a half-plane: on the home page the last row's Down otherwise landed on the Connect
  // button, off to the left and one pixel lower. A sideways step gets the wider cone, since a
  // column beside another column is what Left and Right are for.
  const cone = vertical ? { slope: 1, base: 24 } : { slope: 2, base: 48 };
  if (orthogonal > primary * cone.slope + cone.base)
    return null;

  const centerOffset = Math.abs((fromStart + fromEnd) / 2 - (toStart + toEnd) / 2);
  return primary + 2 * orthogonal + 0.1 * centerOffset;
}

// Moves focus one step; false when nothing lies that way.
function move(direction: Direction): boolean {
  const root = scopeRoot();
  const targets = Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR)).filter(isTarget);
  const active = document.activeElement instanceof HTMLElement && document.activeElement !== document.body
    ? document.activeElement
    : null;

  // nothing (or nothing of ours) under the remote yet: the first target is the place to start
  if (!active || !root.contains(active)) {
    targets[0]?.focus();
    return targets[0] !== undefined;
  }

  const fromRow = rowOf(active);
  const from = fromRow.getBoundingClientRect();
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of targets) {
    const row = rowOf(el);
    if (el === active || row === fromRow)
      continue;

    const score = scoreOf(from, row.getBoundingClientRect(), direction);
    if (score !== null && score < bestScore) {
      best = el;
      bestScore = score;
    }
  }

  if (!best)
    return false;

  best.focus({ preventScroll: true });
  rowOf(best).scrollIntoView({ block: 'nearest', inline: 'nearest' });
  return true;
}

function onKeydown(e: KeyboardEvent): void {
  if (!VpnHoodApp.instance.data.isTvUi)
    return;

  const active = document.activeElement;
  if (e.key === 'Enter') {
    if (active instanceof HTMLInputElement && (active.type === 'radio' || active.type === 'checkbox')) {
      e.preventDefault();
      active.click();
    }
    return;
  }

  const direction = DIRECTIONS[e.key];
  if (!direction)
    return;
  if (isTextEntry(active) && (direction === 'left' || direction === 'right'))
    return;
  if (active?.closest('[role="slider"], [role="combobox"]'))
    return;

  // ours: neither the browser's walk nor Vuetify's list handler gets to act on it
  e.preventDefault();
  e.stopPropagation();

  if (!move(direction) && (direction === 'up' || direction === 'down'))
    window.scrollBy({ top: direction === 'down' ? SCROLL_STEP : -SCROLL_STEP, behavior: 'smooth' });
}

// Call once, from App.vue. The listener is a no-op off the TV UI.
export function installSpatialNavigation(): void {
  document.addEventListener('keydown', onKeydown, true);
}
