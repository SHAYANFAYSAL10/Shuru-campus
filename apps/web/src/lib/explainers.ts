/**
 * The ideas behind the space, quoted with their sources (docs/02-content.md → About copy). Used
 * by Home #8 "Why co-working" and, in T5.7, the About page. The quotes are the content doc's
 * excerpts, word for word; `here` says what each idea means on site.
 */
export interface Explainer {
  id: string;
  title: string;
  quote: string;
  source: { name: string; url: string };
  here: string;
}

export const EXPLAINERS: readonly Explainer[] = [
  {
    id: 'shared-economy',
    title: 'Shared economy',
    quote:
      'A sharing economy is an economic model in which individuals are able to borrow or rent assets owned by someone else… most likely to be used when the price of a particular asset is high and the asset is not fully utilized all the time.',
    source: {
      name: 'Investopedia',
      url: 'https://www.investopedia.com/terms/s/sharing-economy.asp',
    },
    here: 'An office is exactly that kind of asset. Here you rent a fully equipped one by the hour, the day, the week or the month, and only for as long as you need it.',
  },
  {
    id: 'co-working',
    title: 'Co-working',
    quote:
      'A style of work that involves a shared working environment, often an office, and independent activity. Unlike in a typical office environment, those co-working are usually not employed by the same organization.',
    source: { name: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Coworking' },
    here: 'Businesses, entrepreneurs and independent professionals share one workspace and its office services here, each getting on with their own work.',
  },
];
