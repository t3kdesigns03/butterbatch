/**
 * Tiny event bus for popcorn bursts, consumed by the page-wide <PopLayer/>.
 * Coordinates are viewport (client) pixels. Bursts always launch UP first.
 */
import type { Look } from "../data/menu";

export type BurstRequest =
  | { kind: "point"; x: number; y: number; look?: Look; count?: number }
  /** Logo tap: kernels rise from the popcorn pile along the bottom of the logo artwork. */
  | { kind: "pile"; rect: { left: number; top: number; width: number; height: number }; count?: number };

type Listener = (r: BurstRequest) => void;
const listeners = new Set<Listener>();

export function onBurst(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function burst(r: BurstRequest) {
  for (const l of listeners) l(r);
}
