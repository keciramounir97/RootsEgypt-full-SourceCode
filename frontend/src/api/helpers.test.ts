import { describe, expect, it } from "vitest";
import { normalizeTree } from "./helpers";

describe("normalizeTree", () => {
  it("keeps API-provided hasGedcom true even when the file path is hidden", () => {
    const tree = normalizeTree(
      {
        id: 12,
        title: "Shared family",
        hasGedcom: true,
        is_public: true,
      },
      { apiRoot: "https://api.rootsegypt.org", isPublic: true },
    );

    expect(tree.hasGedcom).toBe(true);
    expect(tree.gedcomUrl).toBe("https://api.rootsegypt.org/api/trees/12/gedcom");
  });
});
