/**
 * Frequently asked questions. The last section inside `Main` in the reference,
 * where it carries no `data-framer-name`.
 *
 * **The reference ships the same answer for all six questions.** That is not a
 * transcription error — each item's Answer block was opened and read
 * individually and all six returned identical copy, which is template filler
 * left in the Greatest Solutions source. It is reproduced here rather than invented around,
 * and is the one piece of content on the page that plainly needs replacing
 * before launch.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

/** The answer every entry shares in the reference. */
export const faqEntries: FaqEntry[] = [
  {
    question: "What services does Greatest Solutions provide?",
    answer:
      "Web development, custom software, web applications and SaaS, UI/UX and product design, and ongoing maintenance and support. Each is described in more detail on the Services page.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "It depends on scope. We give a timeline once we understand what is being built and what it has to integrate with — an accurate estimate after that conversation is more useful than a generic figure before it.",
  },
  {
    question: "Do you work with startups or established companies?",
    answer:
      "Both. What matters more than company size is that the problem is well defined and that someone on your side can make decisions.",
  },
  {
    question: "What is your design and development process?",
    answer:
      "We scope the work, design and build in reviewable increments, test, and hand over with documentation. You see progress throughout rather than only at the end.",
  },
  {
    question: "Can Greatest Solutions redesign an existing brand or website?",
    answer:
      "Yes. We work on existing codebases and products as well as new builds, including modernising something already in production.",
  },
  {
    question: "Do you provide ongoing support after launch?",
    answer:
      "Yes — dependency and security updates, monitoring, fixes and small feature work, arranged as an ongoing agreement or on request.",
  },
];

export const faqEyebrow = "FAQ";
export const faqTitle = ["Questions?", "We are here to help"] as const;
