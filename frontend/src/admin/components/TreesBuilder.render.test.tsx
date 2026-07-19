// @vitest-environment jsdom
import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

if (!window.localStorage) {
  const backing = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => backing.get(k) ?? null,
      setItem: (k: string, v: string) => void backing.set(k, String(v)),
      removeItem: (k: string) => void backing.delete(k),
      clear: () => backing.clear(),
    },
  });
}

const SAMPLE_GEDCOM = `0 HEAD
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME Ahmed /Mounir/
1 SEX M
1 FAMS @F1@
0 @I2@ INDI
1 NAME Fatima /Hassan/
1 SEX F
1 FAMS @F1@
0 @I3@ INDI
1 NAME Youssef /Mounir/
1 SEX M
1 FAMC @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I3@
0 TRLR
`;

const { default: TreesBuilder, parseGedcom } = await import("./TreesBuilder");

describe("TreesBuilder rendering", () => {
  it("renders GEDCOM people into visible SVG nodes", async () => {
    const people = parseGedcom(SAMPLE_GEDCOM);
    const errors: string[] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args.map(String).join(" "));
    });

    const { container } = render(<TreesBuilder people={people} readOnly />);

    await waitFor(() => {
      expect(container.querySelectorAll("g.node").length).toBe(3);
    });

    expect(errors.join("\n")).not.toMatch(/tree_render_failed|Failed to render tree/i);
    errorSpy.mockRestore();
  });
});
