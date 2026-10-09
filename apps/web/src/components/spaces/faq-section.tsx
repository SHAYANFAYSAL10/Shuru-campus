import { SectionHeading } from '@/components/sections/section-heading';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Link } from '@/components/ui/link';
import { type FaqItem } from '@/lib/faq';
import { BOOK_VISIT_HREF } from '@/lib/navigation';

export interface FaqSectionProps {
  items: readonly FaqItem[];
}

const TITLE_ID = 'faq-title';
const GROUP = 'spaces-faq';

/**
 * Spaces → FAQ (05): short answers from the Terms and Refund policy, as an accordion of native
 * `<details>` that opens one at a time. A 4/7 split from `lg` (B1); the heading stays beside
 * the questions as they open.
 */
export function FaqSection({ items }: FaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={TITLE_ID}>
      <div className="mx-auto grid max-w-content gap-10 py-section px-page-safe lg:grid-cols-12 lg:gap-gutter">
        <SectionHeading
          id={TITLE_ID}
          eyebrow="Questions"
          title={
            <>
              Good to <em>know</em>.
            </>
          }
          lead="The short answers, from our terms and refund policy."
          className="lg:sticky lg:top-(--sticky-top) lg:col-span-4 lg:self-start lg:pt-8"
        />
        <div className="lg:col-span-7 lg:col-start-6">
          <Accordion>
            {items.map((item) => (
              <AccordionItem key={item.id} id={item.id} group={GROUP} title={item.question}>
                <div className="flex flex-col gap-3">
                  {item.answer.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {item.link ? (
                    <p>
                      <Link href={item.link.href} variant="standalone" className="min-h-hit">
                        {item.link.label}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-8 text-fg-muted">
            Something else on your mind?{' '}
            <Link href={BOOK_VISIT_HREF} className="hit-target">
              Ask us
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
