/**
 * Every public route the responsive suite checks (docs/08-testing.md → Responsive invariants).
 * Each M5 page task adds its routes here.
 */
export const PUBLIC_ROUTES = [
  { name: 'Home', path: '/' },
  { name: 'Spaces', path: '/spaces' },
  { name: 'Spaces, filtered', path: '/spaces?period=monthly' },
  // The plan with the longest rate list and the one priced by size cover both layouts' extremes.
  { name: 'Plan detail', path: '/spaces/meeting-room' },
  { name: 'Plan detail, priced by size', path: '/spaces/private-office' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
  // The longest option in the space select, pre-selected.
  { name: 'Contact, pre-filled', path: '/contact?plan=seminar-room&rate=up-to-30' },
] as const;
