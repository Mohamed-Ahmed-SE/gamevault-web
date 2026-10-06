export function focusTrapEdgeIndex(activeIndex: number, focusableCount: number, reverse: boolean): number | null {
  if (focusableCount === 0) return null;
  if (activeIndex < 0) return reverse ? focusableCount - 1 : 0;
  if (reverse && activeIndex === 0) return focusableCount - 1;
  if (!reverse && activeIndex === focusableCount - 1) return 0;
  return null;
}
