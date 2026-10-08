/** Lower-cases the first letter for running text ("Locker" → "locker"), but not acronyms ("TV"). */
export function lowerFirst(text: string): string {
  // A capital second letter means an acronym.
  if (/^.\p{Lu}/u.test(text)) return text;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** "a", "a and b", "a, b and c". */
export function listText(items: readonly string[]): string {
  if (items.length <= 2) return items.join(' and ');
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1) ?? ''}`;
}
