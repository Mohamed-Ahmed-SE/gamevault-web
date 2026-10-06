import { describe, expect, it } from "vitest";
import { focusTrapEdgeIndex } from "./focus-trap";

describe("modal tab focus boundaries", () => {
  it.each([
    ["Tab at the last control wraps to the first", 2, 3, false, 0],
    ["Shift+Tab at the first control wraps to the last", 0, 3, true, 2],
    ["Tab from outside the dialog enters at the first control", -1, 3, false, 0],
    ["Shift+Tab from outside the dialog enters at the last control", -1, 3, true, 2],
    ["Tab inside the controls follows normal browser order", 1, 3, false, null],
    ["empty dialogs have no focus target", -1, 0, false, null],
  ])("%s", (_scenario, activeIndex, focusableCount, reverse, expected) => {
    expect(focusTrapEdgeIndex(activeIndex, focusableCount, reverse)).toBe(expected);
  });
});
