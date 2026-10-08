/**
 * Every public route the responsive suite checks (docs/08-testing.md → Responsive invariants).
 * Each M5 page task adds its routes here.
 */
export const PUBLIC_ROUTES = [
  { name: 'Home', path: '/' },
  { name: 'Spaces', path: '/spaces' },
  { name: 'Spaces, filtered', path: '/spaces?period=monthly' },
] as const;
