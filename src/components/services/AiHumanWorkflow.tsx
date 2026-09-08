import { Section } from "@/components/layout/Section";
import { cn } from "@/lib/cn";

/**
 * How the work actually gets done: the six-step loop every service runs through.
 *
 * Shared across all ten `/services/[slug]` pages rather than stored per service,
 * because it genuinely is the same six steps every time — it describes the
 * agency's method, not any one service's plan. Duplicating it into ten data
 * entries would mean ten places to edit when the method is described
 * differently, and ten chances for them to drift apart.
 *
 * It is also the same "human strategy, AI-powered execution, human quality
 * control" claim the `/services` intro already makes, expanded into its steps —
 * so the two are consistent by construction rather than by remembering.
 *
 * Each step is marked as human-led or AI-assisted. That distinction is the whole
 * point of the sequence: four of the six are human, and the section says so
 * plainly rather than implying the work is automated end to end. The marker
 * carries a real text label, not only a colour — a hue alone would be invisible
 * to anyone who cannot distinguish it, and this is load-bearing information
 * rather than decoration.
 */
const STEPS = [
  { title: "Human strategy", sub: "A specialist scopes the problem and the plan", led: "Human" },
  { title: "AI-assisted production", sub: "AI accelerates drafting, iteration, repetitive work", led: "AI" },
  { title: "Human review & QA", sub: "A specialist checks accuracy, quality, brand fit", led: "Human" },
  { title: "Client approval", sub: "You review and sign off before anything ships", led: "Human" },
  { title: "Implementation", sub: "The system is deployed into your business", led: "AI" },
  { title: "Optimization", sub: "Your Account Manager monitors and improves it", led: "Human" },
] as const;

export function AiHumanWorkflow() {
  return (
    <Section spacing="compact">
      <div className="flex flex-col gap-6">
        <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
          AI + human workflow
        </h2>

        {/*
          An ordered list because the order is the content — these are six steps
          in sequence, not six independent features. The number is drawn from the
          list rather than authored into each step, so reordering renumbers.
        */}
        <ol className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-body-sm text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[11px] tracking-[var(--tracking-label)] uppercase",
                    step.led === "Human"
                      ? "bg-brand-emerald/12 text-brand-green"
                      : "bg-scrim-06 text-muted",
                  )}
                >
                  {step.led}
                </span>
              </div>
              <h3 className="text-body-lg font-medium text-ink">{step.title}</h3>
              <p className="text-body-md text-body">{step.sub}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
