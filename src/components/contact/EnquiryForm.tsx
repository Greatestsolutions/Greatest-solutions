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
 * **Sends for real.** POSTs to `/api/enquiry`, which delivers through Gmail SMTP
 * (see that route for the sending side). This replaced an earlier `mailto:`
 * version — genuine at the time (no provider was configured), but a visitor's
 * own mail client popping up mid-enquiry was never the intended experience, only
 * the honest fallback for not having one yet. The `mailto:` link below still
 * exists, now only as the error state's backup if the real send fails.
 *
 * Native `required` and `type="email"` give instant client-side feedback; the
 * route re-validates everything server-side regardless, since a request can
 * always arrive without having gone through this form at all.
 */
/**
 * `card` — the standalone form with its own panel, as the /contact page uses it.
 * `bare` — fields only, for a surface that is already a panel (the dialog).
 */
export type EnquiryFormVariant = "card" | "bare";

type SendStatus = "idle" | "loading" | "success" | "error";

export function EnquiryForm({ variant = "card" }: { variant?: EnquiryFormVariant } = {}) {
  const [status, setStatus] = useState<SendStatus>("idle");
  /*
   * Field ids are namespaced per instance. The dialog can be opened while the
   * /contact page is rendered behind it, which would otherwise put two `id="name"`
   * inputs in one document — every label would then point at the first form and
   * clicking a label in the dialog would focus the page behind it. `name`
   * attributes stay fixed, because those are what the submission is keyed on.
   */
  const uid = useId();
  const fid = (key: string) => `${key}-${uid}`;
  const honeypotName = "website";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    /*
     * The select submits a SLUG, because service titles are not unique — two
     * entries can share a title and only the slug says which was chosen. The
     * enquiry itself still has to be readable, so the slug is resolved back to
     * its title here and the slug kept alongside it to disambiguate the pair.
     * An unmatched value (the "Something else" option) passes through as-is.
     */
    const chosen = services.find((s) => s.slug === get("service"));

    setStatus("loading");
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          email: get("email"),
          company: get("company"),
          service: chosen ? `${chosen.title} (${chosen.slug})` : get("service"),
          message: get("message"),
          // Honeypot — real visitors never see this field, so a non-empty
          // value means whatever submitted the form is a bot filling in
          // every input it can find.
          website: get(honeypotName),
        }),
      });
      if (!response.ok) throw new Error("send failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
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

      {/*
        Honeypot. Visually gone (off-screen, zero size) rather than
        `display:none` or `hidden` — some bots specifically skip fields a
        stylesheet hides, so this stays a real, laid-out input a screen
        reader also never lands on (`aria-hidden`, `tabIndex={-1}`, and
        `autoComplete="off"` so no browser offers to fill it for a human
        tabbing past). A real visitor's copy of this field is always empty;
        the route rejects — silently, with a fake success — anything where
        it isn't.
      */}
      <input
        type="text"
        name={honeypotName}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute h-0 w-0 overflow-hidden opacity-0"
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Send enquiry"}
        </Button>
        {/* aria-live so the confirmation is announced, not just shown. */}
        <p aria-live="polite" className="text-body-md flex items-center gap-1.5">
          {status === "success" && (
            <span className="flex items-center gap-1.5 text-brand-green">
              <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden="true" focusable="false">
                <path
                  d="M4 10.5l4 4 8-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Successfully sent — we&apos;ll be in touch soon.
            </span>
          )}
          {status === "error" && (
            <span className="text-body">
              Couldn&apos;t send that. Email us directly at{" "}
              <a href={`mailto:${site.email}`} className="text-ink underline underline-offset-4">
                {site.email}
              </a>
              .
            </span>
          )}
        </p>
      </div>

      <p className="text-body-sm text-muted">
        Prefer to write directly? Email <span className="break-all text-ink">{site.email}</span>.
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
