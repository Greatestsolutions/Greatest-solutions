import type { ImageSource } from "@/types/media";

/**
 * Portfolio.
 *
 * Every entry below is a real repository found on this machine under the
 * `UzairAli78` GitHub account, and every description is drawn from that project's
 * own README. Nothing here is a client engagement, and nothing claims a result,
 * a metric or an outcome — each card says what the thing is and what it was built
 * with, which is all the evidence supports.
 *
 * `type` is stated on the card for exactly that reason: these are internal and
 * personal builds, and labelling them as such is more credible than leaving a
 * reader to assume they were commissioned.
 *
 * No screenshots exist in any of these repositories, so `thumbnail` is optional
 * and omitted throughout. `ProjectCard` falls back to a neutral typographic panel
 * rather than a stock image or a generated mockup — a fake screenshot would be the
 * same category of invention as a fake client.
 */
export type ProjectType = "Client Project" | "Internal Project" | "Personal Project";

export interface ProjectImage {
  source: ImageSource;
  /** Required: gallery images are content, not decoration. */
  alt: string;
  caption?: string;
}

export interface Project {
  /** Route under /works. */
  slug: string;
  title: string;
  /**
   * Who the work was for. Omit unless there is a real, named client who has
   * agreed to be named — an absent value renders nothing rather than "Internal".
   */
  client?: string;
  /** Stated on the card so no entry is read as client work by default. */
  type: ProjectType;
  category: string;
  /** One or two lines; clamped to two in the card. */
  description: string;
  /** The case study body on the detail page. */
  fullDescription: string;
  /** Slugs from `services.ts`. Drives the "Services provided" section. */
  services: string[];
  /** Confirmed from the repository or the client only — never inferred. */
  technologies: string[];
  /** Capability tags, rendered as `Pill`s on the card. */
  tags: string[];
  /** Card and detail hero. Omitted when no real screenshot exists. */
  thumbnail?: ImageSource;
  /** Detail-page gallery. Omitted or empty when there are no real images. */
  gallery?: ProjectImage[];
  /** Live site or repository, when one is public. */
  url?: string;
  /** Promoted placement, if the grid ever needs to distinguish entries. */
  featured?: boolean;
}

/*
 * Schema reference — NOT rendered. A fully-populated client entry looks like:
 *
 *   {
 *     slug: "acme-portal",
 *     title: "Acme Customer Portal",
 *     client: "Acme Ltd",                     // only with permission to name them
 *     type: "Client Project",
 *     category: "Web Application",
 *     description: "A self-service portal for account and billing management.",
 *     fullDescription: "...",
 *     services: ["web-applications", "ui-ux-product-design"],
 *     technologies: ["Next.js", "PostgreSQL"],
 *     tags: ["Dashboard", "Authentication"],
 *     thumbnail: { avif: "/works/acme.avif", webp: "...", fallback: "..." },
 *     gallery: [{ source: {...}, alt: "The billing screen", caption: "Billing" }],
 *     url: "https://example.com",
 *     featured: true,
 *   }
 *
 * Adding a project is a data edit alone: the card, the grid, `/works/[slug]`,
 * `generateStaticParams` and the sitemap all read from this array.
 */

/** Intrinsic size of a project thumbnail, when one exists. */
export const THUMB_WIDTH = 832;
export const THUMB_HEIGHT = 1104;

export const worksEyebrow = "Featured Work";
export const worksTitle = "Things we have designed, built and shipped";
export const worksCta = "Book an intro call";

export const projects: Project[] = [
  {
    slug: "pricewatch",
    title: "PriceWatch",
    description:
      "A competitor price monitoring and product matching platform for furniture and mattress retailers.",
    fullDescription:
      "A full-stack price intelligence system: scrapers collect competitor listings, a matching engine pairs them to a catalogue using brand family, part numbers and fuzzy name matching, and a dashboard exposes live price comparison, a review queue for uncertain matches, and alerting for undercuts and price drops. The repository covers the backend, frontend, scrapers, matching engine and supporting automation, with handover documentation written so a developer can go from a fresh machine to a running system.",
    type: "Internal Project",
    category: "Data Platform",
    tags: ["Web Scraping", "Dashboard", "Automation"],
    technologies: ["Python", "Full-stack web"],
    services: ["custom-software-development"],
  },
  {
    slug: "docchat-ai",
    title: "DocChat AI",
    description:
      "A document question-and-answer chatbot built on a retrieval-augmented generation pipeline.",
    fullDescription:
      "Upload a document and ask questions about it in natural language. A two-stage intent classifier routes casual conversation away from the vector store so it is only queried when a question actually needs grounding. Built as a FastAPI backend with a single-page frontend.",
    type: "Personal Project",
    category: "AI / RAG",
    tags: ["RAG", "API", "Document Q&A"],
    technologies: ["FastAPI", "FAISS", "LangChain", "Groq (Llama 3.3)"],
    services: ["web-applications"],
  },
  {
    slug: "policai",
    title: "PolicAI",
    description:
      "An HR policy assistant that answers employee questions from uploaded policy documents.",
    fullDescription:
      "A retrieval-augmented generation pipeline over a company's own HR documents: ingestion chunks and embeds the source material, retrieval grounds each answer in it, and a guardrail stage sits between the model and the response. Employees ask in natural language rather than searching a PDF.",
    type: "Personal Project",
    category: "AI / RAG",
    tags: ["RAG", "Internal Tool", "Document Search"],
    technologies: ["Flask", "ChromaDB", "Sentence Transformers", "Groq (Llama 3.1)"],
    services: ["custom-software-development"],
  },
  {
    slug: "linkedin-job-scraper",
    title: "LinkedIn Job Scraper",
    description:
      "A job scraping and AI summarisation tool with both a web interface and a command-line pipeline.",
    fullDescription:
      "Collects job listings and summarises them, offered two ways: a Streamlit web UI for interactive use, and a CLI pipeline that runs scraping and summarisation as separate steps. Results are written to a single spreadsheet ready to open in Google Sheets.",
    type: "Personal Project",
    category: "Automation",
    tags: ["Web Scraping", "Automation", "Summarisation"],
    technologies: ["Python", "Selenium", "Streamlit"],
    services: ["custom-software-development"],
  },
  {
    slug: "flipsense",
    title: "FlipSense",
    description:
      "A product review sentiment analyser running entirely on open-source models.",
    fullDescription:
      "Analyses e-commerce product review sentiment using DistilBERT, with VADER as an automatic fallback. Built deliberately without paid APIs — the whole pipeline runs on open-source models.",
    type: "Personal Project",
    category: "Machine Learning",
    tags: ["NLP", "Sentiment Analysis", "Open Source"],
    technologies: ["Python", "DistilBERT (HuggingFace)", "VADER"],
    services: ["custom-software-development"],
  },
  {
    slug: "comixhub",
    title: "ComixHub",
    description:
      "A front-end catalogue app for browsing and bookmarking serialised comics.",
    fullDescription:
      "A static multi-page site with no backend: the catalogue ships in the page and bookmarks live in localStorage. Includes live text search across title, author and description, genre and status filters, five sort orders, three view modes, pagination, and a detail modal per title. Responsive from 320px upward.",
    type: "Personal Project",
    category: "Front-end",
    tags: ["Front-end", "Search & Filtering", "Responsive"],
    technologies: ["HTML", "Tailwind CSS", "Vanilla JavaScript"],
    services: ["web-development"],
  },
];
