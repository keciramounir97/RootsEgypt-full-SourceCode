// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// The theme store reads window.localStorage at module scope; some jsdom/node
// combinations don't provide it, so stub it before importing TreesBuilder.
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

const {
  buildGedcom,
  buildGedcomXJson,
  buildGedcomXXml,
  extractPersonLinks,
  hydrateEditableSourceLinks,
  getDocumentSourceLink,
  normalizeExistingDocumentsResponse,
  parseGedcom,
  parseGedcomX,
  updateEditableSourceLinks,
} = await import("./TreesBuilder");

const SAMPLE_GEDCOM = `0 HEAD
1 SOUR RootsEgypt
1 GEDC
2 VERS 5.5.1
0 @I1@ INDI
1 NAME Ahmed /Mounir/
1 SEX M
1 BIRT
2 DATE 1901
2 PLAC Cairo, Egypt
1 SOUR Gallica https://gallica.bnf.fr/ark:/12148/bpt6k5530456v
1 OBJE
2 FILE https://www.familysearch.org/ark:/61903/1:1:ABCD-123
1 WWW https://archive.org/details/egyptcensus1907
1 REFN /uploads/documents/birth-record-1901.pdf
1 FAMS @F1@
0 @I2@ INDI
1 NAME Fatima /Hassan/
1 SEX F
1 FAMS @F1@
1 NOTE See https://gallica.bnf.fr/ark:/12148/btv1b8449691v for the marriage act
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

describe("GEDCOM source/document links", () => {
  const people = parseGedcom(SAMPLE_GEDCOM);
  const byName = (name: string) =>
    people.find((p: any) => `${p.given} ${p.surname}`.includes(name));

  it("parses all individuals and relationships", () => {
    expect(people).toHaveLength(3);
    const child = byName("Youssef");
    expect(String(child.father)).toBe(String(byName("Ahmed").id));
    expect(String(child.mother)).toBe(String(byName("Fatima").id));
  });

  it("captures OBJE/FILE and WWW links on the person", () => {
    const ahmed = byName("Ahmed");
    expect(ahmed.sourceLinks).toContain(
      "https://www.familysearch.org/ark:/61903/1:1:ABCD-123"
    );
    expect(ahmed.sourceLinks).toContain(
      "https://archive.org/details/egyptcensus1907"
    );
  });

  it("extracts labeled links from tags, source text, and local paths", () => {
    const links = extractPersonLinks(byName("Ahmed"));
    const labels = links.map((l: any) => l.label);
    const kinds = Object.fromEntries(links.map((l: any) => [l.label, l.kind]));

    expect(labels).toContain("Gallica (BnF)");
    expect(labels).toContain("FamilySearch");
    expect(labels).toContain("Internet Archive");
    expect(labels).toContain("birth-record-1901.pdf");
    expect(kinds["birth-record-1901.pdf"]).toBe("local");
    // local doc resolves to an absolute URL on the API host
    const local = links.find((l: any) => l.kind === "local");
    expect(local.url).toMatch(/^https?:\/\/.+\/uploads\/documents\/birth-record-1901\.pdf$/);
  });

  it("extracts links embedded in NOTE text", () => {
    const links = extractPersonLinks(byName("Fatima"));
    expect(links.some((l: any) => l.label === "Gallica (BnF)")).toBe(true);
  });

  it("extracts local document paths embedded inside archive text", () => {
    const links = extractPersonLinks({
      archiveSource: "Civil record scan: /uploads/documents/cairo-birth-1901.pdf",
      documentCode: "See private_uploads/documents/family-register.pdf",
    });

    expect(links.map((l: any) => l.label)).toEqual([
      "cairo-birth-1901.pdf",
      "family-register.pdf",
    ]);
    expect(links.every((l: any) => l.kind === "local")).toBe(true);
  });

  it("returns no links for a person without sources", () => {
    expect(extractPersonLinks(byName("Youssef"))).toHaveLength(0);
  });

  it("hydrates detected links into an editable managed list", () => {
    const hydrated = hydrateEditableSourceLinks(byName("Ahmed"));

    expect(hydrated.sourceLinksManaged).toBe(true);
    expect(hydrated.sourceLinks).toEqual(
      expect.arrayContaining([
        "https://gallica.bnf.fr/ark:/12148/bpt6k5530456v",
        "https://www.familysearch.org/ark:/61903/1:1:ABCD-123",
        "https://archive.org/details/egyptcensus1907",
      ])
    );
    expect(hydrated.sourceLinks.some((link: string) => link.includes("birth-record-1901.pdf"))).toBe(true);
  });

  it("respects edits and deletions after links become managed", () => {
    const hydrated = hydrateEditableSourceLinks(byName("Ahmed"));
    const edited = updateEditableSourceLinks(hydrated, [
      "https://gallica.bnf.fr/ark:/12148/edited",
      "",
      "https://gallica.bnf.fr/ark:/12148/edited",
    ]);

    expect(edited.sourceLinksManaged).toBe(true);
    expect(edited.sourceLinks).toEqual(["https://gallica.bnf.fr/ark:/12148/edited"]);
    expect(extractPersonLinks(edited).map((link: any) => link.url)).toEqual([
      "https://gallica.bnf.fr/ark:/12148/edited",
    ]);
  });

  it("labels managed absolute upload URLs as local documents", () => {
    const links = extractPersonLinks({
      sourceLinksManaged: true,
      sourceLinks: ["http://localhost:5000/uploads/documents/managed-scan.pdf"],
    });

    expect(links).toMatchObject([
      {
        label: "managed-scan.pdf",
        kind: "local",
      },
    ]);
  });

  it("extracts GEDCOM X person source links", () => {
    const people = parseGedcomX(`<?xml version="1.0"?>
<gedx:Gedcomx xmlns:gedx="http://gedcomx.org/v1/">
  <gedx:person id="p1">
    <gedx:names><gedx:name><gedx:nameForm><gedx:fullText>Ould Mohamed Abdallahi</gedx:fullText></gedx:nameForm></gedx:name></gedx:names>
    <gedx:source descriptionRef="https://gallica.bnf.fr/services/engine/search/sru?operation=searchRetrieve&amp;query=Ould%20Mohamed%20Abdallahi"/>
    <gedx:source descriptionRef="/uploads/documents/ould-mohamed-birth-register.pdf"/>
  </gedx:person>
</gedx:Gedcomx>`);

    const links = extractPersonLinks(people[0]);

    expect(links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Gallica (BnF)",
          kind: "external",
        }),
        expect.objectContaining({
          label: "ould-mohamed-birth-register.pdf",
          kind: "local",
        }),
      ])
    );
  });

  it("exports source links in GEDCOM and GEDCOM X formats", () => {
    const people = [
      {
        id: "p1",
        names: { en: "A Person" },
        given: "A",
        surname: "Person",
        sourceLinks: ["https://gallica.bnf.fr/ark:/12148/test"],
      },
    ];

    expect(buildGedcom(people, "en", (key: string, fallback: string) => fallback)).toContain(
      "2 FILE https://gallica.bnf.fr/ark:/12148/test",
    );
    expect(buildGedcomXJson(people, "en", (_key: string, fallback: string) => fallback)).toContain(
      '"descriptionRef": "https://gallica.bnf.fr/ark:/12148/test"',
    );
    expect(buildGedcomXXml(people, "en", (_key: string, fallback: string) => fallback)).toContain(
      'descriptionRef="https://gallica.bnf.fr/ark:/12148/test"',
    );
  });

  it("normalizes existing uploaded documents into selectable source links", () => {
    const docs = normalizeExistingDocumentsResponse(
      {
        documents: [
          {
            id: 12,
            title: "Birth act",
            document_code: "ACT-12",
            file_path: "/uploads/documents/birth-act.pdf",
          },
          {
            id: 13,
            title: "Marriage act",
            filePath: "marriage-act.pdf",
          },
        ],
      },
      "https://api.rootsegypt.org"
    );

    expect(docs).toMatchObject([
      {
        id: 12,
        title: "Birth act",
        sourceUrl: "https://api.rootsegypt.org/uploads/documents/birth-act.pdf",
      },
      {
        id: 13,
        title: "Marriage act",
        sourceUrl: "https://api.rootsegypt.org/uploads/documents/marriage-act.pdf",
      },
    ]);
  });

  it("keeps absolute existing document URLs unchanged", () => {
    expect(
      getDocumentSourceLink(
        { file_path: "https://gallica.bnf.fr/ark:/12148/bpt6k9760202w" },
        "https://api.rootsegypt.org"
      )
    ).toBe("https://gallica.bnf.fr/ark:/12148/bpt6k9760202w");
  });

  it("parses the larger GEDCOM 5.5.1, GEDCOM 7, and GEDCOM X sample trees with links", () => {
    const sampleRoot = resolve(process.cwd(), "../backend/sample-data");
    const ged551 = readFileSync(
      resolve(sampleRoot, "gallica-family-gedcom-5.5.1.ged"),
      "utf8",
    );
    const ged7 = readFileSync(
      resolve(sampleRoot, "gallica-family-gedcom-7.ged"),
      "utf8",
    );
    const gedx = readFileSync(
      resolve(sampleRoot, "gallica-family-gedcomx.gedx"),
      "utf8",
    );

    const parsed551 = parseGedcom(ged551);
    const parsed7 = parseGedcom(ged7);
    const parsedX = parseGedcomX(gedx);

    expect(parsed551).toHaveLength(8);
    expect(parsed7).toHaveLength(8);
    expect(parsedX).toHaveLength(8);
    expect(extractPersonLinks(parsed551[0]).map((link: any) => link.label)).toEqual(
      expect.arrayContaining(["Gallica (BnF)", "ould-mohamed-birth-register.pdf"]),
    );
    expect(extractPersonLinks(parsed7[0]).map((link: any) => link.label)).toEqual(
      expect.arrayContaining(["Gallica (BnF)", "ould-mohamed-birth-register.pdf"]),
    );
    expect(extractPersonLinks(parsedX[1]).map((link: any) => link.label)).toEqual(
      expect.arrayContaining(["Gallica (BnF)", "fatimetou-family-register.pdf"]),
    );
  });
});
