import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { PlayButton } from "@/components/works/PlayButton";
import { Section } from "@/components/layout/Section";
import { services } from "@/data/services";
import { site } from "@/config/site";
import { THUMB_HEIGHT, THUMB_WIDTH, projects } from "@/data/works";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/works/${project.slug}` },
  };
}

/**
 * Project detail.
 *
 * Every block below is conditional on its data existing. A project with no
 * screenshot, no gallery and no public URL renders a clean page rather than empty
 * frames — which is what lets honest entries sit beside fully-documented client
 * case studies without either looking broken.
 *
 * Nothing here is authored in JSX: the page is a view over `data/works.ts`, so a
 * new project is a data edit.
 */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const provided = project.services
    .map((s) => services.find((service) => service.slug === s))
    .filter((s): s is (typeof services)[number] => Boolean(s));

  return (
    <PageShell>
      <PageHeader
        eyebrow={project.type}
        title={project.title}
        description={project.description}
      >
        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <li key={tag}>
              <Pill>{tag}</Pill>
            </li>
          ))}
        </ul>
      </PageHeader>

      {/* ---- hero image ------------------------------------------------- */}
      {project.thumbnail && (
        <Section spacing="compact">
          <div className="overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float">
            <div className="relative aspect-[416/522] w-full overflow-clip rounded-[var(--radius-card)] tablet:aspect-[16/9]">
              <Picture
                source={project.thumbnail}
                alt=""
                width={THUMB_WIDTH}
                height={THUMB_HEIGHT}
                className="size-full object-cover"
              />

              {/* A real video: the same play-button + modal-player mechanism the
                  works cards use, not a second implementation. Centred and
                  always visible, same reasoning as `ProjectCard`'s — see
                  `PlayButton`'s own docblock. */}
              {project.media?.type === "video" && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <PlayButton project={project} className="pointer-events-auto" />
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ---- case study + project information --------------------------- */}
      <Section spacing="compact">
        <div className="grid gap-10 desktop:grid-cols-[1fr_280px] desktop:gap-16">
          <p className="max-w-[70ch] text-body-lg text-body">{project.fullDescription}</p>

          <dl className="flex flex-col gap-6 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6">
            <Detail label="Type" value={project.type} />
            {project.client && <Detail label="Client" value={project.client} />}
            <Detail label="Category" value={project.category} />
            {project.url && (
              <div className="flex flex-col gap-1.5">
                <Label>Link</Label>
                <dd>
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="break-all text-body-md font-medium text-ink underline underline-offset-4"
                  >
                    {project.url.replace(/^https?:\/\//, "")}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>
      </Section>

      {/* ---- gallery ----------------------------------------------------- */}
      {project.gallery && project.gallery.length > 0 && (
        <Section spacing="compact">
          <h2 className="sr-only">Gallery</h2>
          <ul className="grid gap-6 tablet:grid-cols-2">
            {project.gallery.map((image) => (
              <li key={image.alt} className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float">
                  <div className="relative aspect-[16/10] w-full overflow-clip rounded-[var(--radius-card)]">
                    <Picture
                      source={image.source}
                      alt={image.alt}
                      width={THUMB_WIDTH}
                      height={THUMB_HEIGHT}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
                {image.caption && <p className="px-3 text-body-md text-body">{image.caption}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* ---- technologies ------------------------------------------------ */}
      {project.technologies.length > 0 && (
        <Section spacing="compact">
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              Built with
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.technologies.map((item) => (
                <li key={item}>
                  <Pill>{item}</Pill>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* ---- services provided ------------------------------------------- */}
      {provided.length > 0 && (
        <Section spacing="compact">
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              Services provided
            </h2>
            <ul className="flex flex-wrap gap-3">
              {provided.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-body-lg font-medium text-ink underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:underline"
                  >
                    {service.title} &rarr;
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      <Section spacing="compact">
        <div className="flex flex-wrap gap-3">
          <Button href={`mailto:${site.email}?subject=${encodeURIComponent(project.title)}`} size="lg">
            Talk about similar work
          </Button>
          <Button href="/works" tone="light" size="lg">
            All work
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <dt className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
      {children}
    </dt>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <dd className="text-body-md text-ink">{value}</dd>
    </div>
  );
}
