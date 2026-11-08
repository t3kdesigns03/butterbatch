import { ORDER_URL } from "@/data/site";
import { ChatIcon } from "./icons";

type Props = {
  label?: string;
  size?: "md" | "lg";
  variant?: "butter" | "royal";
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
  const sizing = size === "lg" ? "min-h-14 px-7 text-lg" : "min-h-11 px-4 text-base";
  const colors =
    variant === "butter"
      ? "bg-butter text-navy shadow-[0_4px_0_#b07c00] hover:bg-butter-light active:translate-y-[2px] active:shadow-[0_2px_0_#b07c00]"
      : "bg-royal text-white shadow-[0_4px_0_#001a4d] hover:bg-royal-deep active:translate-y-[2px] active:shadow-[0_2px_0_#001a4d]";
  return (
    <a
      href={ORDER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-label font-semibold uppercase tracking-wide transition-colors ${sizing} ${colors} ${className}`}
    >
      <ChatIcon className={size === "lg" ? "h-6 w-6" : "h-5 w-5"} />
      <span>{label}</span>
      <span className="sr-only">(opens Facebook in a new tab)</span>
    </a>
  );
}
