import { VpnHoodApp } from '@/services/VpnHoodApp';

// On a TV the browser moves focus with the arrow keys: spatial navigation, which Android's WebView
// turns on by itself on a device without a touchscreen and the Windows host turns on in TV mode.
// Vuetify's list moves focus on the same keys in its own way: ArrowDown and ArrowUp go to the next
// and the previous item, wrap at the ends, and cancel the event. So inside a list the browser never
// sees an arrow, and focus can never leave the list by one; on the servers page only Tab got out
// (owner, 2026-09-12). The items are no way out either: Vuetify gives them tabindex -2, and the
// browser's walk steps over anything with a negative tabindex (verified in WebView2), so with
// Vuetify's handler simply removed the walk would jump from the first item straight out of the list.
//
// So Vuetify keeps the keys inside a list, where its next/previous is exactly what a vertical list
// wants, and gives them back at the ends: ArrowDown on the last item and ArrowUp on the first are
// stopped before the list's own listener runs (a capture listener on the document runs first) and
// are NOT cancelled, which is what leaves them to the browser, whose walk then finds the control
// below or above the list. Nothing else changes: Left and Right were never Vuetify's, and Enter on
// an item still activates it.
//
// The items are Vuetify's own set (focusableChildren: anything focusable except tabindex -1,
// disabled or inert), less what is not laid out: a collapsed group's items are in the DOM but not
// on the screen, and the walk must hand over at the last one that is.
const FOCUSABLE_SELECTOR = ['button', '[href]', 'input:not([type="hidden"])', 'select', 'textarea', '[tabindex]']
  .map(s => s + ':not([tabindex="-1"], [disabled], [inert])')
  .join(', ');

function onKeydown(e: KeyboardEvent): void {
  if (!VpnHoodApp.instance.data.isTvUi)
    return;
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')
    return;

  const target = e.target instanceof HTMLElement ? e.target : null;
  const list = target?.closest('.v-list');
  if (!target || !list)
    return;

  const items = Array.from(list.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => el.getClientRects().length > 0);
  const edge = e.key === 'ArrowDown' ? items[items.length - 1] : items[0];
  if (edge === target)
    e.stopPropagation();
}

// Call once, from App.vue. The listener is a no-op off the TV UI.
export function bridgeListsToSpatialNavigation(): void {
  document.addEventListener('keydown', onKeydown, true);
}
