import { buildFallbackGedcom } from "./trees.controller";

describe("buildFallbackGedcom", () => {
  it("builds a valid GEDCOM with database people when the upload file is missing", () => {
    const gedcom = buildFallbackGedcom(
      { id: 24, title: "Guirguis Family" },
      [{ id: 1, name: "Guirguis Ibrahim" }, { id: 2, name: "Marie Guirguis" }],
    );

    expect(gedcom).toContain("0 @I1@ INDI");
    expect(gedcom).toContain("1 NAME Guirguis Ibrahim");
    expect(gedcom).toContain("0 @I2@ INDI");
    expect(gedcom).toContain("1 NAME Marie Guirguis");
    expect(gedcom).toContain("0 TRLR");
  });

  it("builds a valid single-card GEDCOM from tree metadata when no people exist", () => {
    const gedcom = buildFallbackGedcom({
      id: 24,
      title: "Guirguis Family of Tanta",
      description: "Lineage record",
    });

    expect(gedcom).toContain("0 @I1@ INDI");
    expect(gedcom).toContain("1 NAME Guirguis Family of Tanta");
    expect(gedcom).toContain("1 NOTE Lineage record");
    expect(gedcom).toContain("0 TRLR");
  });
});
