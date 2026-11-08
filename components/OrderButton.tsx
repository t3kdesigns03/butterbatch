import { ORDER_URL } from "@/data/site";
import { ChatIcon } from "./icons";

type Props = {
  label?: string;
  size?: "md" | "lg";
  variant?: "butter" | "navy";
  className?: string;
};

/**
 * Phase 1 ordering: opens the Butter Batch Facebook Page (Message button) in a new tab.
 * Phase 2 swaps this for the real cart/checkout.
 */
export function OrderButton({
  label = "Message us to order",
  size = "lg",
  variant = "butter",
  className = "",
}: Props) {
  const sizing = size === "lg" ? "min-h-12 px-6 text-base" : "min-h-11 px-4 text-sm";
  const colors =
    variant === "butter"
      ? "bg-butter text-navy hover:bg-butter-light"
      : "bg-navy text-white hover:bg-navy-deep";
  return (
    <a
      href={ORDER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors ${sizing} ${colors} ${className}`}
    >
      <ChatIcon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span>{label}</span>
      <span className="sr-only">(opens Facebook in a new tab)</span>
    </a>
  );
}
