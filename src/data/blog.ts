import type { ImageSource } from "@/types/media";

/**
 * Insights articles. `Section - Blog` in the reference.
 *
 * Thumbnails are the reference's 816x536 renders, self-hosted — see
 * `scripts/build-image-assets.mjs`. They are editorial artwork with no caption
 * role, and each card's heading already names the article, so they carry an
 * empty `alt`: announcing them would repeat the title to a screen reader.
 */
export interface Article {
  /** Route under /blog. Arrives in Task 4; the card is not a link until then. */
  slug: string;
  title: string;
  description: string;
  /** Displayed uppercase; stored as written so it reads correctly in the DOM. */
  date: string;
  /** Machine-readable form for the <time> element. */
  dateTime: string;
  category: string;
  thumbnail: ImageSource;
}


/**
 * EMPTY UNTIL REAL ARTICLES EXIST.
 *
 * The three entries here were the template's articles. Publishing invented
 * thought-leadership under the company byline is the same problem as an invented
 * portfolio, so the list is empty and the section says so.
 */
export const articles: Article[] = [];


export const blogEyebrow = "Notes";
export const blogTitle = ["Notes from our work", "and thinking"] as const;
export const blogCta = "View all Articles";

/** Intrinsic thumbnail size. Aspect 816/536 holds at every breakpoint. */
export const THUMB_WIDTH = 816;
export const THUMB_HEIGHT = 536;
