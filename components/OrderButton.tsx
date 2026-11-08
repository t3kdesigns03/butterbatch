import { ORDER_URL } from "@/data/site";
import { ChatIcon } from "./icons";

type Props = {
  label?: string;
  size?: "md" | "lg";
  variant?: "butter" | "white";
  className?: string;
};

/** Opens the Butter Batch Facebook Page (Message button) in a new tab. No payment on this site. */
export function OrderButton({ label = "Message us to order", size = "lg", variant = "butter", className = "" }: Props) {
  const sizing = size === "lg" ? "min-h-12 px-6 text-base" : "min-h-11 px-4 text-sm";
  const colors = variant === "butter" ? "bg-butter text-royal hover:bg-butter-light" : "bg-white text-royal hover:bg-butter-light";
  return (
    <a
      href={ORDER_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-colors ${sizing} ${colors} ${className}`}
    >
      <ChatIcon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      <span>{label}</span>
      <span className="sr-only">(opens Facebook in a new tab)</span>
    </a>
  );
}
