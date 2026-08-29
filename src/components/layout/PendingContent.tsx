import { Button } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import { site } from "@/config/site";

/**
 * An honest placeholder for a route whose copy has not been written yet.
 *
 * The whole point is that it does **not** impersonate finished content. Task 4.2
 * required the routes to exist so navigation can stop pointing at disabled
 * links, but the copy for several of them is genuinely unavailable — and
 * inventing services, projects or company claims to fill the space would put
 * fabricated statements about a real business on a real domain.
 *
 * So the page says plainly that the section is being written, and offers the one
 * destination that does work: email.
 */
export function PendingContent({ what }: { what: string }) {
  return (
    <Section spacing="spacious">
      <div className="flex flex-col items-start gap-6 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-12">
        <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
          In progress
        </p>
        <p className="max-w-[56ch] text-body-lg text-body">
          {what} is being written and will be published here shortly. In the meantime, the
          quickest way to get a straight answer is to email{" "}
          <a href={`mailto:${site.email}`} className="break-all text-ink underline underline-offset-4">
            {site.email}
          </a>
          .
        </p>
        {/* Label kept short: `Button` is `whitespace-nowrap`, so putting the
            27-character address inside it forces the button wider than a phone
            viewport. The address is in the sentence above instead. */}
        <Button href={`mailto:${site.email}`} size="lg">
          Email us
        </Button>
      </div>
    </Section>
  );
}
