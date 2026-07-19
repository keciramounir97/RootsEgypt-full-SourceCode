import {
  buildFallbackGedcom,
  getStoredGedcomText,
  hasGedcomIndividuals,
} from "./trees.controller";

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

  it("does not invent a person when the upload file and people cache are both missing", () => {
    const gedcom = buildFallbackGedcom({
      id: 24,
      title: "Guirguis Family of Tanta",
      description: "Lineage record",
    });

    expect(gedcom).not.toContain("0 @I1@ INDI");
    expect(gedcom).not.toContain("1 NAME Guirguis Family of Tanta");
    expect(gedcom).toContain("0 TRLR");
  });
});

describe("stored GEDCOM fallback", () => {
  it("accepts stored GEDCOM text only when it contains individuals", () => {
    const valid = "0 HEAD\n0 @I1@ INDI\n1 NAME A /Person/\n0 TRLR\n";

    expect(hasGedcomIndividuals(valid)).toBe(true);
    expect(getStoredGedcomText({ gedcom_text: valid })).toBe(valid);
    expect(getStoredGedcomText({ gedcom_text: "0 HEAD\n0 TRLR\n" })).toBeNull();
  });
});
