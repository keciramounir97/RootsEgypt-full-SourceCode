// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  it("opens and closes the persistent person details card from the SVG button", async () => {
    const people = parseGedcom(SAMPLE_GEDCOM);
    const { container } = render(<TreesBuilder people={people} readOnly />);

    await waitFor(() => {
      expect(container.querySelectorAll("g.node-open-details-button").length).toBe(3);
    });

    fireEvent.click(container.querySelector("g.node-open-details-button") as Element, {
      clientX: 220,
      clientY: 180,
    });

    expect(await screen.findByRole("dialog", { name: "Person card" })).toBeTruthy();
    expect(await screen.findByText("Person card")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Close"));

    await waitFor(() => {
      expect(screen.queryByText("Person card")).toBeNull();
    });
  });

  it("shows the GEDCOM version badge and opens the Link with... media menu as a portal", async () => {
    const people = parseGedcom(SAMPLE_GEDCOM);
    const { container } = render(
      <TreesBuilder people={people} setPeople={() => {}} dataFormat="gedcom7" />
    );

    await waitFor(() => {
      expect(container.querySelectorAll("g.node-open-details-button").length).toBe(3);
    });

    fireEvent.click(container.querySelector("g.node-open-details-button") as Element, {
      clientX: 220,
      clientY: 180,
    });

    const dialog = await screen.findByRole("dialog", { name: "Person card" });
    expect(dialog).toBeTruthy();
    expect(within(dialog).getByText(/GEDCOM 7\.0/)).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: /Link with/i }));

    const menu = await screen.findByRole("menu");
    // The menu is portaled straight into document.body, not nested inside
    // the scrollable dialog panel — guards against the overflow-clipping bug.
    expect(menu.closest('[role="dialog"]')).toBeNull();
    expect(document.body.contains(menu)).toBe(true);

    expect(screen.getByRole("menuitem", { name: /Document/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Image/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Audio/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Book/i })).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });
});
