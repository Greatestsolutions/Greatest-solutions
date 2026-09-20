"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, fieldBase, fieldControl } from "@/components/ui/Input";
import { services } from "@/data/services";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Contact enquiry form.
 *
 * Structure adapted from the project's own `index1.html` Greatest Solutions
 * reference, which lays the contact section out as an intro column beside a form
 * card with paired rows: [Name | Email], [Company | Service], then a message and
 * a submit. Field set and pairing are the same; only the styling is ours and the
 * service options come from `services.ts` rather than being hardcoded.
 *
 * **It has no backend, and it does not pretend to.** No email or form provider is
 * configured, so on submit it composes a `mailto:` with the fields filled in and
 * hands off to the user's mail client. That is a real action that genuinely
 * delivers the enquiry — unlike a POST to nowhere, which would silently discard
 * it. When a provider is chosen (Resend, Formspree, a route handler), `onSubmit`
 * is the single place that changes.
 *
 * Native `required` and `type="email"` do the validation; no library.
 */
/**
 * `card` — the standalone form with its own panel, as the /contact page uses it.
 * `bare` — fields only, for a surface that is already a panel (the dialog).
 */
export type EnquiryFormVariant = "card" | "bare";

export function EnquiryForm({ variant = "card" }: { variant?: EnquiryFormVariant } = {}) {
  const [sent, setSent] = useState(false);
  /*
   * Field ids are namespaced per instance. The dialog can be opened while the
   * /contact page is rendered behind it, which would otherwise put two `id="name"`
   * inputs in one document — every label would then point at the first form and
   * clicking a label in the dialog would focus the page behind it. `name`
   * attributes stay fixed, because those are what the submission is keyed on.
   */
  const uid = useId();
  const fid = (key: string) => `${key}-${uid}`;

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    /*
     * The select submits a SLUG, because service titles are not unique — two
     * entries can share a title and only the slug says which was chosen. The
     * enquiry itself still has to be readable, so the slug is resolved back to
     * its title here and the slug kept alongside it to disambiguate the pair.
     * An unmatched value (the "Something else" option) passes through as-is.
     */
    const chosen = services.find((s) => s.slug === get("service"));

    const body = [
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      get("company") && `Company: ${get("company")}`,
      `Service: ${chosen ? `${chosen.title} (${chosen.slug})` : get("service")}`,
      "",
      get("message"),
    ]
      .filter(Boolean)
      .join("\n");

    const subject = `Project enquiry: ${get("name") || "New enquiry"}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex flex-col gap-6",
        // The dialog is already a panel; a second bordered card inside it reads
        // as a box in a box.
        variant === "card" && "rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-10",
      )}
    >
      <div className="grid gap-6 tablet:grid-cols-2">
        <Field id={fid("name")} name="name" label="Your name" placeholder="Jordan Lee" required />
        <Field id={fid("email")} name="email" label="Your email" type="email" placeholder="you@company.com" required />
      </div>

      <div className="grid gap-6 tablet:grid-cols-2">
        <Field id={fid("company")} name="company" label="Company" placeholder="Company name" />

        <div className="flex flex-col gap-2">
          <Label htmlFor={fid("service")}>What do you need built?</Label>
          <select
            id={fid("service")}
            name="service"
            /* Must be a slug now that the options carry slugs as values — a title
               here would match no option and silently fall through to the first. */
            defaultValue={services[0]?.slug}
            className={fieldControl}
          >
            {/* `value` is the slug, not the label: titles can repeat, slugs cannot,
                so without this two different services submit the same string. */}
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
            <option>Something else</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={fid("message")}>Project details</Label>
        <textarea
          id={fid("message")}
          name="message"
          rows={5}
          required
          placeholder="Tell us what you need built: the problem, any deadlines, and what it has to work with."
          className={cn("resize-y p-3", fieldBase)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Send enquiry
        </Button>
        {/* aria-live so the confirmation is announced, not just shown. */}
        <p aria-live="polite" className="text-body-md text-body">
          {sent ? "Opening your email app. Send the message to reach us." : ""}
        </p>
      </div>

      <p className="text-body-sm text-muted">
        This form opens your email app with the details filled in. Prefer to write directly?
        Email <span className="break-all text-ink">{site.email}</span>.
      </p>
    </form>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-body-md font-medium text-ink">
      {children}
    </label>
  );
}

function Field({
  id, name, label, placeholder, type = "text", required,
}: {
  /** Unique per form instance. */
  id: string;
  /** Fixed: this is the key the submission is read by. */
  name: string;
  label: string; placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} required={required} placeholder={placeholder} />
    </div>
  );
}
