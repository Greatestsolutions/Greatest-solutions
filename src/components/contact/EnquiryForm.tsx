"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { services } from "@/data/services";
import { site } from "@/config/site";

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
export function EnquiryForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const body = [
      `Name: ${get("name")}`,
      `Email: ${get("email")}`,
      get("company") && `Company: ${get("company")}`,
      `Service: ${get("service")}`,
      "",
      get("message"),
    ]
      .filter(Boolean)
      .join("\n");

    const subject = `Project enquiry — ${get("name") || "New enquiry"}`;
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-6 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-10"
    >
      <div className="grid gap-6 tablet:grid-cols-2">
        <Field id="name" label="Your name" placeholder="Jordan Lee" required />
        <Field id="email" label="Your email" type="email" placeholder="you@company.com" required />
      </div>

      <div className="grid gap-6 tablet:grid-cols-2">
        <Field id="company" label="Company" placeholder="Company name" />

        <div className="flex flex-col gap-2">
          <Label htmlFor="service">What do you need built?</Label>
          <select
            id="service"
            name="service"
            defaultValue={services[0]?.title}
            className="h-11 rounded-[var(--radius-sm)] border border-black/12 bg-white px-3 text-body-md text-ink transition-colors duration-[var(--duration-quick)] focus-visible:border-brand-green focus-visible:outline-none"
          >
            {services.map((service) => (
              <option key={service.slug}>{service.title}</option>
            ))}
            <option>Something else</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Project details</Label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell us what you need built — the problem, any deadlines, and what it has to work with."
          className="resize-y rounded-[var(--radius-sm)] border border-black/12 bg-white p-3 text-body-md text-ink transition-colors duration-[var(--duration-quick)] placeholder:text-muted focus-visible:border-brand-green focus-visible:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Send enquiry
        </Button>
        {/* aria-live so the confirmation is announced, not just shown. */}
        <p aria-live="polite" className="text-body-md text-body">
          {sent ? "Opening your email app — send the message to reach us." : ""}
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
  id, label, placeholder, type = "text", required,
}: {
  id: string; label: string; placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-11 rounded-[var(--radius-sm)] border border-black/12 bg-white px-3 text-body-md text-ink transition-colors duration-[var(--duration-quick)] placeholder:text-muted focus-visible:border-brand-green focus-visible:outline-none"
      />
    </div>
  );
}
