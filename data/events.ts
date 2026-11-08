/**
 * Upcoming events — ONLY events the business itself has published (their Facebook Events tab).
 * Never invent an event or a date. Each entry records where it came from.
 * Past events are hidden automatically at runtime (America/Chicago time).
 *
 * Not ours, never list: UNL's "Popcorn Pop-Up" (the university's own free-popcorn social).
 */

export type PopEvent = {
  id: string;
  title: string;
  /** ISO 8601 with Lincoln's UTC offset. */
  start: string;
  /** Optional; when absent the event is treated as running through the end of its day. */
  end?: string;
  venue: string;
  city: string;
  /** Where we read it. */
  sourceUrl: string;
  checkedOn: string;
};

export const events: PopEvent[] = [
  {
    id: "nebraska-holiday-market-2026",
    title: "Nebraska Holiday Market",
    start: "2026-11-22T10:00:00-06:00",
    venue: "Sandhills Global Event Center",
    city: "Lincoln",
    sourceUrl: "https://www.facebook.com/events/3735965306566797/",
    checkedOn: "2026-11-08",
  },
];
