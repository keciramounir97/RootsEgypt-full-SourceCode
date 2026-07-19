import { parseTreePeopleFromContent } from "./trees.service";

const GEDCOM_551_WITH_GALLICA = `0 HEAD
1 SOUR RootsEgypt
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Ould Mohamed /Abdallahi/
1 SEX M
1 BIRT
2 DATE 1948
2 PLAC Nouakchott, Mauritania
1 SOUR Gallica https://gallica.bnf.fr/ark:/12148/bpt6k9760202w
1 OBJE
2 FILE https://gallica.bnf.fr/ark:/12148/btv1b8451617s
0 @I2@ INDI
1 GIVN Fatimetou
1 SURN Mint Ahmed
1 NOTE Source: https://gallica.bnf.fr/services/engine/search/sru?operation=searchRetrieve&query=Fatimetou
0 TRLR
`;

const GEDCOM_7_WITH_GALLICA = `0 HEAD
1 GEDC
2 VERS 7.0
1 SCHMA
2 TAG _LINK https://gallica.bnf.fr/ark:/12148/bpt6k1234567
1 CHAR UTF-8
0 @m1@ INDI
1 NAME Sidi /Mohamed/
1 SEX M
1 WWW https://gallica.bnf.fr/ark:/12148/bpt6k6543210
0 TRLR
`;

const GEDCOMX_XML_WITH_GALLICA = `<?xml version="1.0" encoding="UTF-8"?>
<gedx:Gedcomx xmlns:gedx="http://gedcomx.org/v1/">
  <gedx:person id="m1">
    <gedx:names>
      <gedx:name><gedx:nameForm><gedx:fullText>Ould Mohamed Abdallahi</gedx:fullText></gedx:nameForm></gedx:name>
    </gedx:names>
    <gedx:source descriptionRef="https://gallica.bnf.fr/ark:/12148/bpt6k9760202w"/>
  </gedx:person>
  <gedx:person id="m2">
    <gedx:names>
      <gedx:name><gedx:nameForm><gedx:fullText>Fatimetou Mint Ahmed</gedx:fullText></gedx:nameForm></gedx:name>
    </gedx:names>
  </gedx:person>
</gedx:Gedcomx>`;

describe("parseTreePeopleFromContent", () => {
  it("extracts GEDCOM 5.5.1 people from database text even when source links are present", () => {
    expect(parseTreePeopleFromContent(GEDCOM_551_WITH_GALLICA, "tree.ged")).toEqual([
      { name: "Ould Mohamed Abdallahi" },
      { name: "Fatimetou Mint Ahmed" },
    ]);
  });

  it("extracts GEDCOM 7 people from database text", () => {
    expect(parseTreePeopleFromContent(GEDCOM_7_WITH_GALLICA, "tree.ged")).toEqual([
      { name: "Sidi Mohamed" },
    ]);
  });

  it("extracts GEDCOM X XML people from database text", () => {
    expect(parseTreePeopleFromContent(GEDCOMX_XML_WITH_GALLICA, "tree.gedx")).toEqual([
      { name: "Ould Mohamed Abdallahi" },
      { name: "Fatimetou Mint Ahmed" },
    ]);
  });
});
