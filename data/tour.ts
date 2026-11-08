/**
 * Virtual tour stops. ONLY real photos from the repo (the business's own). Captions state only
 * what the photo shows or facts already on the site — nothing invented.
 */
import type { Photo } from "./menu";

export type TourStop = {
  id: "shelf" | "fresh-batch" | "pickup" | "events";
  title: string;
  caption: string;
  photo: Photo;
  /** Aspect of the photo file, for layout. */
  aspect: string;
  /** Says what the photo shows when the stop is about something broader. */
  pictured?: string;
};

export const tourStops: TourStop[] = [
  {
    id: "shelf",
    title: "The shelf",
    caption: "A Butter Batch shelf, stocked with fresh bags.",
    photo: {
      src: "/photos/store-display.jpg",
      alt: "Shelves stocked with Butter Batch bags in front of a Butter Batch banner: butter, kettle, cheddar, caramel and pink-coated flavors, with a framed price list.",
    },
    aspect: "4 / 3",
  },
  {
    id: "fresh-batch",
    title: "The fresh batch table",
    caption: "A table of fresh Butter Batch bags, labeled and ready to go.",
    photo: {
      src: "/photos/fresh-batch-bags.jpg",
      alt: "A long table covered in Butter Batch bags of fresh popcorn — Kettle, Butter, green Caramel Apple and orange Cheddar — each with the Butter Batch label.",
    },
    aspect: "1840 / 655",
  },
  {
    id: "pickup",
    title: "Pickup spots",
    caption: "Order in Messenger, then pick up at one of our Lincoln spots, listed right on our menu board.",
    photo: {
      src: "/photos/menu-board.jpg",
      alt: "The Butter Batch printed menu board, with Classics and Specialty prices and a Find us at panel listing Creative Collabs Collective and KT Designs.",
    },
    aspect: "1024 / 1535",
  },
  {
    id: "events",
    title: "Events & game nights",
    caption: "We pop for parties, fundraisers and game nights around Lincoln.",
    photo: {
      src: "/photos/popcorn-treat.jpg",
      alt: "Close-up of a drizzled, crumble-topped Butter Batch popcorn treat in a clear clamshell, with a Butter Batch label on the lid.",
    },
    aspect: "3 / 4",
    pictured: "Pictured: a Butter Batch popcorn treat.",
  },
];
