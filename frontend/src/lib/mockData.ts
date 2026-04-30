/**
 * ROOTS EGYPT — Comprehensive Mock Data
 * Realistic Egyptian genealogy & heritage content for prototype mode.
 */

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
export const MOCK_USERS = [
  {
    id: 1,
    email: "admin@rootsegypt.org",
    password: "password123",
    fullName: "Kamel Ibrahim Al-Masry",
    phone: "+20 10 1234 5678",
    role: 1,
    roleName: "Admin",
    status: "active",
    permissions: ["manage_users", "manage_content", "view_analytics"],
  },
  {
    id: 2,
    email: "demo@rootsegypt.org",
    password: "demo123",
    fullName: "Layla Hassan Nour",
    phone: "+20 11 9876 5432",
    role: 2,
    roleName: "Member",
    status: "active",
    permissions: [],
  },
  {
    id: 3,
    email: "researcher@rootsegypt.org",
    password: "research123",
    fullName: "Dr. Amr Fouad Al-Said",
    phone: "+20 12 5555 6666",
    role: 3,
    roleName: "Researcher",
    status: "active",
    permissions: ["manage_content"],
  },
];

export const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.bW9jaw.bW9jaw";
export const MOCK_REFRESH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.cmVmcmVzaA.cmVmcmVzaA";

// ─────────────────────────────────────────────
// GEDCOM DATA FOR FAMILY TREES
// ─────────────────────────────────────────────

const GEDCOM_AL_MASRY = `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Ahmed /Al-Masry/
1 SEX M
1 BIRT
2 DATE 1895
2 PLAC Cairo, Egypt
1 DEAT
2 DATE 1972
2 PLAC Cairo, Egypt
1 FAMS @F1@
0 @I2@ INDI
1 NAME Khadija /Salim/
1 SEX F
1 BIRT
2 DATE 1900
2 PLAC Giza, Egypt
1 DEAT
2 DATE 1985
2 PLAC Cairo, Egypt
1 FAMS @F1@
0 @I3@ INDI
1 NAME Mahmoud /Al-Masry/
1 SEX M
1 BIRT
2 DATE 1922
2 PLAC Cairo, Egypt
1 FAMS @F2@
1 FAMC @F1@
0 @I4@ INDI
1 NAME Fatima /Al-Masry/
1 SEX F
1 BIRT
2 DATE 1925
2 PLAC Cairo, Egypt
1 FAMC @F1@
0 @I5@ INDI
1 NAME Ibrahim /Al-Masry/
1 SEX M
1 BIRT
2 DATE 1928
2 PLAC Cairo, Egypt
1 FAMC @F1@
0 @I6@ INDI
1 NAME Amina /Youssef/
1 SEX F
1 BIRT
2 DATE 1924
2 PLAC Alexandria, Egypt
1 FAMS @F2@
0 @I7@ INDI
1 NAME Kamel /Al-Masry/
1 SEX M
1 BIRT
2 DATE 1952
2 PLAC Cairo, Egypt
1 FAMC @F2@
0 @I8@ INDI
1 NAME Hoda /Al-Masry/
1 SEX F
1 BIRT
2 DATE 1955
2 PLAC Cairo, Egypt
1 FAMC @F2@
0 @I9@ INDI
1 NAME Nour /Ibrahim/
1 SEX F
1 BIRT
2 DATE 1980
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @I10@ INDI
1 NAME Tarek /Al-Masry/
1 SEX M
1 BIRT
2 DATE 1978
2 PLAC Cairo, Egypt
1 FAMS @F3@
1 FAMC @F2@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1920
2 PLAC Cairo, Egypt
1 CHIL @I3@
1 CHIL @I4@
1 CHIL @I5@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I6@
1 MARR
2 DATE 1948
2 PLAC Cairo, Egypt
1 CHIL @I7@
1 CHIL @I8@
1 CHIL @I10@
0 @F3@ FAM
1 HUSB @I10@
1 WIFE @I9@
1 MARR
2 DATE 2004
2 PLAC Cairo, Egypt
0 TRLR`;

const GEDCOM_HASSAN = `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Abdel-Rahman /Hassan/
1 SEX M
1 BIRT
2 DATE 1880
2 PLAC Alexandria, Egypt
1 DEAT
2 DATE 1955
1 FAMS @F1@
0 @I2@ INDI
1 NAME Zeinab /Ibrahim/
1 SEX F
1 BIRT
2 DATE 1885
2 PLAC Alexandria, Egypt
1 DEAT
2 DATE 1960
1 FAMS @F1@
0 @I3@ INDI
1 NAME Omar /Hassan/
1 SEX M
1 BIRT
2 DATE 1910
2 PLAC Alexandria, Egypt
1 FAMS @F2@
1 FAMC @F1@
0 @I4@ INDI
1 NAME Fatima /Hassan/
1 SEX F
1 BIRT
2 DATE 1912
2 PLAC Alexandria, Egypt
1 FAMC @F1@
0 @I5@ INDI
1 NAME Hoda /Osman/
1 SEX F
1 BIRT
2 DATE 1915
2 PLAC Cairo, Egypt
1 FAMS @F2@
0 @I6@ INDI
1 NAME Amr /Hassan/
1 SEX M
1 BIRT
2 DATE 1940
2 PLAC Alexandria, Egypt
1 FAMC @F2@
1 FAMS @F3@
0 @I7@ INDI
1 NAME Layla /Hassan/
1 SEX F
1 BIRT
2 DATE 1943
2 PLAC Alexandria, Egypt
1 FAMC @F2@
0 @I8@ INDI
1 NAME Mona /Saad/
1 SEX F
1 BIRT
2 DATE 1945
2 PLAC Alexandria, Egypt
1 FAMS @F3@
0 @I9@ INDI
1 NAME Hassan /Amr-Hassan/
1 SEX M
1 BIRT
2 DATE 1968
2 PLAC Alexandria, Egypt
1 FAMC @F3@
0 @I10@ INDI
1 NAME Rania /Amr-Hassan/
1 SEX F
1 BIRT
2 DATE 1972
2 PLAC Alexandria, Egypt
1 FAMC @F3@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1905
2 PLAC Alexandria, Egypt
1 CHIL @I3@
1 CHIL @I4@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I5@
1 MARR
2 DATE 1938
2 PLAC Alexandria, Egypt
1 CHIL @I6@
1 CHIL @I7@
0 @F3@ FAM
1 HUSB @I6@
1 WIFE @I8@
1 MARR
2 DATE 1965
2 PLAC Alexandria, Egypt
1 CHIL @I9@
1 CHIL @I10@
0 TRLR`;

const GEDCOM_AL_SAID = `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Youssef /Al-Said/
1 SEX M
1 BIRT
2 DATE 1890
2 PLAC Luxor, Egypt
1 DEAT
2 DATE 1965
1 FAMS @F1@
0 @I2@ INDI
1 NAME Nefissa /Ragab/
1 SEX F
1 BIRT
2 DATE 1895
2 PLAC Luxor, Egypt
1 DEAT
2 DATE 1980
1 FAMS @F1@
0 @I3@ INDI
1 NAME Saad /Al-Said/
1 SEX M
1 BIRT
2 DATE 1918
2 PLAC Luxor, Egypt
1 FAMC @F1@
1 FAMS @F2@
0 @I4@ INDI
1 NAME Mariam /Al-Said/
1 SEX F
1 BIRT
2 DATE 1920
2 PLAC Luxor, Egypt
1 FAMC @F1@
0 @I5@ INDI
1 NAME Amna /Khalaf/
1 SEX F
1 BIRT
2 DATE 1922
2 PLAC Aswan, Egypt
1 FAMS @F2@
0 @I6@ INDI
1 NAME Fouad /Al-Said/
1 SEX M
1 BIRT
2 DATE 1948
2 PLAC Luxor, Egypt
1 FAMC @F2@
1 FAMS @F3@
0 @I7@ INDI
1 NAME Suha /Mustafa/
1 SEX F
1 BIRT
2 DATE 1952
2 PLAC Cairo, Egypt
1 FAMS @F3@
0 @I8@ INDI
1 NAME Dr. Amr /Al-Said/
1 SEX M
1 BIRT
2 DATE 1975
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @I9@ INDI
1 NAME Salma /Al-Said/
1 SEX F
1 BIRT
2 DATE 1978
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1914
2 PLAC Luxor, Egypt
1 CHIL @I3@
1 CHIL @I4@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I5@
1 MARR
2 DATE 1945
2 PLAC Luxor, Egypt
1 CHIL @I6@
0 @F3@ FAM
1 HUSB @I6@
1 WIFE @I7@
1 MARR
2 DATE 1973
2 PLAC Cairo, Egypt
1 CHIL @I8@
1 CHIL @I9@
0 TRLR`;

const GEDCOM_AL_NUBA = `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Mohamed /Idris/
1 SEX M
1 BIRT
2 DATE 1905
2 PLAC Wadi Halfa, Nubia
1 DEAT
2 DATE 1978
2 PLAC Aswan, Egypt
1 FAMS @F1@
0 @I2@ INDI
1 NAME Halima /Kamal/
1 SEX F
1 BIRT
2 DATE 1910
2 PLAC Wadi Halfa, Nubia
1 DEAT
2 DATE 1990
2 PLAC Aswan, Egypt
1 FAMS @F1@
0 @I3@ INDI
1 NAME Idris /Mohamed-Idris/
1 SEX M
1 BIRT
2 DATE 1932
2 PLAC Wadi Halfa, Nubia
1 FAMC @F1@
1 FAMS @F2@
0 @I4@ INDI
1 NAME Fatima /Mohamed-Idris/
1 SEX F
1 BIRT
2 DATE 1935
2 PLAC Wadi Halfa, Nubia
1 FAMC @F1@
0 @I5@ INDI
1 NAME Nadia /Saleh/
1 SEX F
1 BIRT
2 DATE 1938
2 PLAC Kom Ombo, Egypt
1 FAMS @F2@
0 @I6@ INDI
1 NAME Youssef /Idris/
1 SEX M
1 BIRT
2 DATE 1960
2 PLAC Aswan, Egypt
1 FAMC @F2@
0 @I7@ INDI
1 NAME Hana /Idris/
1 SEX F
1 BIRT
2 DATE 1963
2 PLAC Aswan, Egypt
1 FAMC @F2@
0 @I8@ INDI
1 NAME Kamal /Idris/
1 SEX M
1 BIRT
2 DATE 1990
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @I9@ INDI
1 NAME Sara /Ahmed/
1 SEX F
1 BIRT
2 DATE 1992
2 PLAC Cairo, Egypt
1 FAMS @F3@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1928
2 PLAC Wadi Halfa, Nubia
1 CHIL @I3@
1 CHIL @I4@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I5@
1 MARR
2 DATE 1958
2 PLAC Aswan, Egypt
1 CHIL @I6@
1 CHIL @I7@
0 @F3@ FAM
1 HUSB @I8@
1 WIFE @I9@
1 MARR
2 DATE 2015
2 PLAC Cairo, Egypt
0 TRLR`;

const GEDCOM_KHALIL = `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Girgis /Khalil/
1 SEX M
1 BIRT
2 DATE 1895
2 PLAC Suez, Egypt
1 DEAT
2 DATE 1970
1 FAMS @F1@
0 @I2@ INDI
1 NAME Marium /Boulos/
1 SEX F
1 BIRT
2 DATE 1900
2 PLAC Port Said, Egypt
1 DEAT
2 DATE 1982
1 FAMS @F1@
0 @I3@ INDI
1 NAME Naguib /Khalil/
1 SEX M
1 BIRT
2 DATE 1924
2 PLAC Suez, Egypt
1 FAMC @F1@
1 FAMS @F2@
0 @I4@ INDI
1 NAME Soad /Khalil/
1 SEX F
1 BIRT
2 DATE 1928
2 PLAC Suez, Egypt
1 FAMC @F1@
0 @I5@ INDI
1 NAME Widad /Mansour/
1 SEX F
1 BIRT
2 DATE 1926
2 PLAC Ismailia, Egypt
1 FAMS @F2@
0 @I6@ INDI
1 NAME George /Naguib-Khalil/
1 SEX M
1 BIRT
2 DATE 1950
2 PLAC Cairo, Egypt
1 FAMC @F2@
1 FAMS @F3@
0 @I7@ INDI
1 NAME Vivienne /Aziz/
1 SEX F
1 BIRT
2 DATE 1955
2 PLAC Cairo, Egypt
1 FAMS @F3@
0 @I8@ INDI
1 NAME Michael /Khalil/
1 SEX M
1 BIRT
2 DATE 1978
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @I9@ INDI
1 NAME Christine /Khalil/
1 SEX F
1 BIRT
2 DATE 1981
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1920
2 PLAC Suez, Egypt
1 CHIL @I3@
1 CHIL @I4@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I5@
1 MARR
2 DATE 1948
2 PLAC Suez, Egypt
1 CHIL @I6@
0 @F3@ FAM
1 HUSB @I6@
1 WIFE @I7@
1 MARR
2 DATE 1976
2 PLAC Cairo, Egypt
1 CHIL @I8@
1 CHIL @I9@
0 TRLR`;

// ─────────────────────────────────────────────
// TREES
// ─────────────────────────────────────────────
export const MOCK_TREES = [
  {
    id: 1,
    title: "Al-Masry Family Tree",
    description:
      "Four-generation family lineage from Cairo, traced through Ottoman tax records and civil registers from 1895 to present day.",
    owner_name: "Kamel Ibrahim Al-Masry",
    owner: "kameladmin",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/1/gedcom",
    gedcomPath: "/api/trees/1/gedcom",
    data_format: "gedcom",
    archiveSource: "Dar Al-Wathaeq Al-Qawmiya",
    documentCode: "EGY-CAI-1895",
    createdAt: "2025-01-15T10:00:00Z",
    gedcom: GEDCOM_AL_MASRY,
  },
  {
    id: 2,
    title: "Hassan-Ibrahim Family (Alexandria)",
    description:
      "A prominent Alexandrian family lineage spanning five generations, including records from the Greek-Egyptian community and port authority archives.",
    owner_name: "Dr. Amr Fouad Al-Said",
    owner: "researcher",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/2/gedcom",
    gedcomPath: "/api/trees/2/gedcom",
    data_format: "gedcom",
    archiveSource: "Alexandria Municipal Archives",
    documentCode: "EGY-ALX-1880",
    createdAt: "2025-02-03T14:30:00Z",
    gedcom: GEDCOM_HASSAN,
  },
  {
    id: 3,
    title: "Al-Said Family — Luxor Lineage",
    description:
      "Upper Egyptian family with roots in Luxor, documented through Coptic church birth registries and Sharia court marriage records from 1910.",
    owner_name: "Layla Hassan Nour",
    owner: "layla",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/3/gedcom",
    gedcomPath: "/api/trees/3/gedcom",
    data_format: "gedcom",
    archiveSource: "Luxor Church of the Holy Virgin",
    documentCode: "EGY-LUX-1910",
    createdAt: "2025-03-10T09:15:00Z",
    gedcom: GEDCOM_AL_SAID,
  },
  {
    id: 4,
    title: "Idris Family — Nubian Heritage",
    description:
      "Nubian family from Wadi Halfa region, displaced during the construction of the High Dam in 1964. Oral history and community records preserved.",
    owner_name: "Kamel Ibrahim Al-Masry",
    owner: "kameladmin",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/4/gedcom",
    gedcomPath: "/api/trees/4/gedcom",
    data_format: "gedcom",
    archiveSource: "Nubian Heritage Documentation Project",
    documentCode: "EGY-NUB-1900",
    createdAt: "2025-03-22T16:00:00Z",
    gedcom: GEDCOM_AL_NUBA,
  },
  {
    id: 5,
    title: "Khalil Family — Coptic Lineage (Suez)",
    description:
      "Coptic Christian family from Suez with connections to Port Said trade community. Records sourced from Episcopal Diocese registers 1905-1990.",
    owner_name: "Dr. Amr Fouad Al-Said",
    owner: "researcher",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/5/gedcom",
    gedcomPath: "/api/trees/5/gedcom",
    data_format: "gedcom",
    archiveSource: "Coptic Diocese of Suez",
    documentCode: "EGY-SUZ-1905",
    createdAt: "2025-04-01T11:00:00Z",
    gedcom: GEDCOM_KHALIL,
  },
  {
    id: 6,
    title: "Bey Family — Ottoman Cairo Lineage (1720-1890)",
    description:
      "An Ottoman-Egyptian family lineage documented through Istanbul Başbakanlık Archives and Cairo Sharia court sijill records spanning the Mamluk-to-Khedive transition.",
    owner_name: "Kamel Ibrahim Al-Masry",
    owner: "kameladmin",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/6/gedcom",
    gedcomPath: "/api/trees/6/gedcom",
    data_format: "gedcom",
    archiveSource: "Başbakanlık Osmanlı Arşivi / Cairo Sharia Court Records",
    documentCode: "EGY-OTT-1720",
    createdAt: "2025-04-10T08:30:00Z",
    gedcom: `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Mustafa Pasha /Al-Qahiri/
1 SEX M
1 BIRT
2 DATE 1720
2 PLAC Istanbul, Ottoman Empire
1 DEAT
2 DATE 1791
2 PLAC Cairo, Egypt
1 NOTE Governor of Cairo Province, appointed 1758. Records in Ottoman sijill archives.
1 FAMS @F1@
0 @I2@ INDI
1 NAME Fatima /Hanım/
1 SEX F
1 BIRT
2 DATE 1730
2 PLAC Cairo, Egypt
1 DEAT
2 DATE 1798
1 FAMS @F1@
0 @I3@ INDI
1 NAME Ibrahim Bey /Al-Qahiri/
1 SEX M
1 BIRT
2 DATE 1755
2 PLAC Cairo, Egypt
1 DEAT
2 DATE 1823
2 PLAC Cairo, Egypt
1 NOTE Merchant and Ottoman tax collector, documented in Cairo Sharia Court records 1780-1820.
1 FAMC @F1@
1 FAMS @F2@
0 @I4@ INDI
1 NAME Zainab /Osman/
1 SEX F
1 BIRT
2 DATE 1762
2 PLAC Cairo, Egypt
1 FAMS @F2@
0 @I5@ INDI
1 NAME Ahmed Bey /Al-Qahiri/
1 SEX M
1 BIRT
2 DATE 1785
2 PLAC Cairo, Egypt
1 DEAT
2 DATE 1852
2 PLAC Cairo, Egypt
1 NOTE Served Muhammad Ali's administration; land deed in Dar Al-Wathaeq archive.
1 FAMC @F2@
1 FAMS @F3@
0 @I6@ INDI
1 NAME Khayria /Abdallah/
1 SEX F
1 BIRT
2 DATE 1792
2 PLAC Bulaq, Cairo
1 FAMS @F3@
0 @I7@ INDI
1 NAME Omar Effendi /Al-Qahiri/
1 SEX M
1 BIRT
2 DATE 1815
2 PLAC Cairo, Egypt
1 DEAT
2 DATE 1882
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @I8@ INDI
1 NAME Mariam /Al-Qahiri/
1 SEX F
1 BIRT
2 DATE 1818
2 PLAC Cairo, Egypt
1 FAMC @F3@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1750
2 PLAC Cairo, Egypt
1 CHIL @I3@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I4@
1 MARR
2 DATE 1780
2 PLAC Cairo, Egypt
1 CHIL @I5@
0 @F3@ FAM
1 HUSB @I5@
1 WIFE @I6@
1 MARR
2 DATE 1812
2 PLAC Cairo, Egypt
1 CHIL @I7@
1 CHIL @I8@
0 TRLR`,
  },
  {
    id: 7,
    title: "Aurelius Family — Greco-Roman Alexandria (30 BCE – 350 CE)",
    description:
      "A Greco-Egyptian family from Roman Alexandria documented through papyrus contracts, Fayyum census records, and the Oxyrhynchus papyri collection. Spans Roman domination period.",
    owner_name: "Dr. Amr Fouad Al-Said",
    owner: "researcher",
    isPublic: true,
    hasGedcom: true,
    gedcom_path: "/api/trees/7/gedcom",
    gedcomPath: "/api/trees/7/gedcom",
    data_format: "gedcom",
    archiveSource:
      "Oxyrhynchus Papyri Project / British Museum Papyrus Collection",
    documentCode: "EGY-ROM-0030BCE",
    createdAt: "2025-04-15T14:00:00Z",
    gedcom: `0 HEAD
1 SOUR RootsEgypt
2 VERS 1.0
1 GEDC
2 VERS 5.5.1
1 CHAR UTF-8
0 @I1@ INDI
1 NAME Gaius Julius /Aurelius/
1 SEX M
1 BIRT
2 DATE ABT 30 BCE
2 PLAC Alexandria, Roman Egypt
1 DEAT
2 DATE ABT 25 CE
2 PLAC Alexandria, Roman Egypt
1 NOTE Merchant of mixed Macedonian-Egyptian descent. Listed in Alexandrian census papyrus P.Oxy 984.
1 FAMS @F1@
0 @I2@ INDI
1 NAME Thaisis /Harpokration/
1 SEX F
1 BIRT
2 DATE ABT 25 BCE
2 PLAC Memphis, Roman Egypt
1 DEAT
2 DATE ABT 30 CE
1 NOTE Egyptian-born. Marriage contract (P.Oxy 265) dated 3 CE lists dowry and family witnesses.
1 FAMS @F1@
0 @I3@ INDI
1 NAME Marcus Aurelius /Alexandros/
1 SEX M
1 BIRT
2 DATE ABT 5 CE
2 PLAC Alexandria, Roman Egypt
1 DEAT
2 DATE ABT 65 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 NOTE Enrolled as Roman citizen under Claudius. Papyrus P.Oxy 3912 records his land holdings.
1 FAMC @F1@
1 FAMS @F2@
0 @I4@ INDI
1 NAME Isidora /Diodorus/
1 SEX F
1 BIRT
2 DATE ABT 10 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 FAMS @F2@
0 @I5@ INDI
1 NAME Aurelius /Theon/
1 SEX M
1 BIRT
2 DATE ABT 40 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 DEAT
2 DATE ABT 110 CE
1 NOTE Documented in Fayyum census (P.Lond 1912) as gymnasiarch of Oxyrhynchus.
1 FAMC @F2@
1 FAMS @F3@
0 @I6@ INDI
1 NAME Thermouthas /Apollonios/
1 SEX F
1 BIRT
2 DATE ABT 45 CE
2 PLAC Arsinoe, Roman Egypt
1 FAMS @F3@
0 @I7@ INDI
1 NAME Aurelius /Sarapion/
1 SEX M
1 BIRT
2 DATE ABT 80 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 DEAT
2 DATE ABT 155 CE
1 NOTE Listed in Roman tax register (P.Oxy 1476) paying poll tax as a minor landowner.
1 FAMC @F3@
0 @I8@ INDI
1 NAME Aurelia /Dionysias/
1 SEX F
1 BIRT
2 DATE ABT 85 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 FAMC @F3@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE ABT 3 CE
2 PLAC Alexandria, Roman Egypt
1 CHIL @I3@
0 @F2@ FAM
1 HUSB @I3@
1 WIFE @I4@
1 MARR
2 DATE ABT 32 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 CHIL @I5@
0 @F3@ FAM
1 HUSB @I5@
1 WIFE @I6@
1 MARR
2 DATE ABT 68 CE
2 PLAC Oxyrhynchus, Roman Egypt
1 CHIL @I7@
1 CHIL @I8@
0 TRLR`,
  },
];

// ─────────────────────────────────────────────
// BOOKS & DOCUMENTS
// ─────────────────────────────────────────────
export const MOCK_BOOKS = [
  {
    id: 101,
    title: "Tracing Your Egyptian Roots: A Complete Guide",
    author: "Dr. Hisham Al-Wakil",
    description:
      "The definitive guide to Egyptian genealogical research, covering Ottoman archives, Coptic church records, civil registration, and tribal nasab manuscripts. Includes bilingual research templates.",
    category: "Genealogy",
    isPublic: true,
    rating: 5,
    downloads: 2847,
    coverUrl: "https://picsum.photos/seed/book-egypt-roots/400/600",
    createdAt: "2024-09-01T00:00:00Z",
    fileSize: 4200000,
    filePath: null,
  },
  {
    id: 102,
    title: "Egyptian Family Names: Origins & Distribution",
    author: "Prof. Amal Osman",
    description:
      "Comprehensive etymological study of Egyptian surnames across Arab, Coptic, Nubian, and Bedouin traditions. Maps showing regional distribution of major family clans.",
    category: "Linguistics",
    isPublic: true,
    rating: 4,
    downloads: 1534,
    coverUrl: "https://picsum.photos/seed/book-names-egypt/400/600",
    createdAt: "2024-10-15T00:00:00Z",
    fileSize: 3100000,
    filePath: null,
  },
  {
    id: 103,
    title: "The Nile Valley Civilizations: Genealogy & Lineage",
    author: "Dr. Saad Abdel-Hakim",
    description:
      "An academic exploration of dynastic lineages from the Pharaonic period through the Arab conquest, drawing from hieroglyphic records, papyri, and Greek documentation.",
    category: "History",
    isPublic: true,
    rating: 5,
    downloads: 3201,
    coverUrl: "https://picsum.photos/seed/book-nile-valley/400/600",
    createdAt: "2024-08-20T00:00:00Z",
    fileSize: 8500000,
    filePath: null,
  },
  {
    id: 104,
    title: "Alexandria: A City of Many Families",
    author: "Mona Hilal",
    description:
      "Social history of Alexandria's multicultural families — Greek, Jewish, Italian, Armenian, and Arab communities — from the 1800s through post-revolution Egypt.",
    category: "Social History",
    isPublic: true,
    rating: 4,
    downloads: 987,
    coverUrl: "https://picsum.photos/seed/book-alexandria/400/600",
    createdAt: "2024-11-10T00:00:00Z",
    fileSize: 5400000,
    filePath: null,
  },
  {
    id: 105,
    title: "Nubian Heritage: People, Migration & Memory",
    author: "Dr. Ibrahim Suleiman",
    description:
      "Documents the forced relocation of Nubian communities after the Aswan High Dam and traces family lineages using oral traditions, photographs, and community records.",
    category: "Heritage",
    isPublic: true,
    rating: 5,
    downloads: 1876,
    coverUrl: "https://picsum.photos/seed/book-nubian/400/600",
    createdAt: "2024-12-01T00:00:00Z",
    fileSize: 6200000,
    filePath: null,
  },
  {
    id: 106,
    title: "Coptic Christianity: Records of Faith and Family",
    author: "Father Bishoy Marcus",
    description:
      "A guide to researching Coptic family heritage through baptismal records, marriage registers, and monastery archives spanning 2,000 years of continuous tradition.",
    category: "Religion & Heritage",
    isPublic: true,
    rating: 4,
    downloads: 743,
    coverUrl: "https://picsum.photos/seed/book-coptic/400/600",
    createdAt: "2025-01-05T00:00:00Z",
    fileSize: 3900000,
    filePath: null,
  },
  {
    id: 107,
    title: "Sinai Tribes: Bedouin Genealogies of the Peninsula",
    author: "Maj. Ahmad Al-Tarabin",
    description:
      "Oral and documented genealogies of the 14 major Sinai Bedouin tribes, including the Tarabin, Tiyaha, and Azazma clans, with maps and photographic evidence.",
    category: "Tribal Studies",
    isPublic: true,
    rating: 4,
    downloads: 621,
    coverUrl: "https://picsum.photos/seed/book-sinai/400/600",
    createdAt: "2025-01-20T00:00:00Z",
    fileSize: 4700000,
    filePath: null,
  },
  {
    id: 108,
    title: "The Muhammad Ali Dynasty: A Royal Family History",
    author: "Dr. Khaled Fahmy",
    description:
      "Detailed genealogical history of Egypt's ruling dynasty from Muhammad Ali Pasha (1769-1849) to King Farouk, with court records, portraits, and European diplomatic sources.",
    category: "Royalty & Politics",
    isPublic: true,
    rating: 5,
    downloads: 4102,
    coverUrl: "https://picsum.photos/seed/book-dynasty/400/600",
    createdAt: "2024-07-15T00:00:00Z",
    fileSize: 12100000,
    filePath: null,
  },
  {
    id: 201,
    title: "Ottoman Tax Registers of Egypt: 1800-1882 (Digital Edition)",
    author: "Turkish National Archives — Cairo Branch",
    description:
      "Digitized Ottoman miri tax registers listing Egyptian household heads, occupations, and property by village across all provinces of Egypt. Essential for pre-1882 genealogical research.",
    category: "Archives & Records",
    isPublic: true,
    rating: 5,
    downloads: 1203,
    coverUrl: "https://picsum.photos/seed/doc-ottoman-tax/400/600",
    createdAt: "2024-11-01T00:00:00Z",
    fileSize: 45000000,
    filePath: null,
  },
  {
    id: 202,
    title: "Coptic Diocese Birth & Death Registry: Cairo 1850–1950",
    author: "Coptic Orthodox Archdiocese of Cairo",
    description:
      "Scanned baptismal and burial records from 23 Cairo parishes covering 100 years. Includes handwritten entries in Coptic and Arabic with transliteration guide.",
    category: "Archives & Records",
    isPublic: true,
    rating: 4,
    downloads: 876,
    coverUrl: "https://picsum.photos/seed/doc-coptic-reg/400/600",
    createdAt: "2024-12-15T00:00:00Z",
    fileSize: 78000000,
    filePath: null,
  },
  {
    id: 203,
    title: "Cairo Sharia Court Marriage Records: 1700–1900",
    author: "Dar Al-Wathaeq Al-Qawmiya",
    description:
      "Transcribed marriage contracts (aqd zawaj) from Cairo's Islamic courts, listing names, witnesses, dowry, and family connections for over 35,000 couples.",
    category: "Archives & Records",
    isPublic: true,
    rating: 5,
    downloads: 2341,
    coverUrl: "https://picsum.photos/seed/doc-sharia-court/400/600",
    createdAt: "2025-01-10T00:00:00Z",
    fileSize: 32000000,
    filePath: null,
  },
  {
    id: 204,
    title: "Egypt's First Modern Census: Muhammad Ali's 1848 Survey",
    author: "Egyptian Survey Authority",
    description:
      "The first comprehensive population survey of Egypt under Muhammad Ali, recording names, ages, occupations, and village locations for over 2 million individuals.",
    category: "Archives & Records",
    isPublic: true,
    rating: 5,
    downloads: 3087,
    coverUrl: "https://picsum.photos/seed/doc-census-1848/400/600",
    createdAt: "2025-02-01T00:00:00Z",
    fileSize: 28000000,
    filePath: null,
  },
  {
    id: 205,
    title: "Nile Delta Land Deeds Collection: 1882–1920",
    author: "Egyptian Land Registry",
    description:
      "Scanned land ownership documents (hayyaza) from the Nile Delta provinces listing landowners, heirs, and property transactions during the British administration period.",
    category: "Archives & Records",
    isPublic: false,
    rating: 4,
    downloads: 654,
    coverUrl: "https://picsum.photos/seed/doc-land-deeds/400/600",
    createdAt: "2025-02-20T00:00:00Z",
    fileSize: 56000000,
    filePath: null,
  },
  {
    id: 206,
    title: "Alexandria Jewish Community Records: 1850–1960",
    author: "Cairo Geniza Project",
    description:
      "Birth, marriage, and death records of Alexandria's Jewish community from the Ben Ezra Synagogue archives, covering Sephardic, Ashkenazi, and Karaite families.",
    category: "Archives & Records",
    isPublic: true,
    rating: 4,
    downloads: 891,
    coverUrl: "https://picsum.photos/seed/doc-jewish-alx/400/600",
    createdAt: "2025-03-05T00:00:00Z",
    fileSize: 41000000,
    filePath: null,
  },
  {
    id: 207,
    title: "Ottoman Sijill Records — Mamluk to Khedive Transition (1517–1882)",
    author: "Dr. Nelly Hanna, AUC",
    description:
      "Annotated transcriptions of Islamic court sijill (registry) records from Ottoman Cairo covering property, marriage, inheritance, and commerce. Essential for tracing urban Egyptian families of the Ottoman period.",
    category: "Archives & Records",
    isPublic: true,
    rating: 5,
    downloads: 1542,
    coverUrl: "https://picsum.photos/seed/doc-ottoman-sijill/400/600",
    createdAt: "2025-03-15T00:00:00Z",
    fileSize: 38000000,
    filePath: null,
  },
  {
    id: 208,
    title: "Başbakanlık Osmanlı Arşivi: Egyptian Provincial Files 1600–1800",
    author: "Turkish Directorate of State Archives",
    description:
      "Guide to accessing Ottoman imperial archives relevant to Egyptian genealogy research. Includes mühimme defterleri (council decrees), tapu tahrir (land surveys), and Egyptian provincial appointment records.",
    category: "Archives & Records",
    isPublic: true,
    rating: 4,
    downloads: 674,
    coverUrl: "https://picsum.photos/seed/doc-baskanlık/400/600",
    createdAt: "2025-03-25T00:00:00Z",
    fileSize: 22000000,
    filePath: null,
  },
  {
    id: 301,
    title: "Families of Roman Egypt: Oxyrhynchus Papyri Genealogical Index",
    author: "Oxyrhynchus Papyri Project, Oxford",
    description:
      "A searchable index of family names and relationships extracted from 4,500 papyrus documents found at Oxyrhynchus (modern Bahnasa). Covers the Roman and Byzantine periods, 30 BCE–641 CE.",
    category: "Classical History",
    isPublic: true,
    rating: 5,
    downloads: 2210,
    coverUrl: "https://picsum.photos/seed/doc-oxyrhynchus/400/600",
    createdAt: "2025-01-08T00:00:00Z",
    fileSize: 18000000,
    filePath: null,
  },
  {
    id: 302,
    title: "The Fayyum Mummy Portraits: Art and Identity in Roman Egypt",
    author: "Prof. Susan Walker, Ashmolean Museum",
    description:
      "Comprehensive catalog of Fayyum portrait paintings (1st–4th century CE), each depicting named Egyptian individuals with Greek or Roman names — a unique window into mixed Greco-Egyptian family identity.",
    category: "Classical History",
    isPublic: true,
    rating: 4,
    downloads: 1890,
    coverUrl: "https://picsum.photos/seed/doc-fayyum-portraits/400/600",
    createdAt: "2025-01-20T00:00:00Z",
    fileSize: 67000000,
    filePath: null,
  },
  {
    id: 303,
    title:
      "Demotic & Greek Papyrus Contracts: Marriage and Inheritance in Ptolemaic Egypt",
    author: "Dr. Willy Clarysse, KU Leuven",
    description:
      "A scholarly edition of 200 bilingual papyrus marriage contracts (332 BCE – 30 BCE) from the Ptolemaic period, listing spouses, family witnesses, dowries, and divorce clauses in both Greek and Demotic Egyptian.",
    category: "Classical History",
    isPublic: false,
    rating: 5,
    downloads: 438,
    coverUrl: "https://picsum.photos/seed/doc-demotic/400/600",
    createdAt: "2025-02-10T00:00:00Z",
    fileSize: 29000000,
    filePath: null,
  },
  {
    id: 304,
    title:
      "Roman Census Returns from Egypt: A Complete Translation (P.Lond Series)",
    author: "British Museum Press",
    description:
      "English translations of all known Roman household census returns (kata oikian apographai) from Egypt (19 CE – 265 CE). Each return lists household head, spouse, children, and ages — the most complete Roman-era family records surviving anywhere.",
    category: "Classical History",
    isPublic: true,
    rating: 5,
    downloads: 3104,
    coverUrl: "https://picsum.photos/seed/doc-roman-census/400/600",
    createdAt: "2025-02-28T00:00:00Z",
    fileSize: 14000000,
    filePath: null,
  },
];

// ─────────────────────────────────────────────
// GALLERY
// ─────────────────────────────────────────────
export const MOCK_GALLERY = [
  {
    id: 1,
    title: "Al-Masry Family Portrait — Cairo 1952",
    description:
      "Three generations of the Al-Masry family photographed at their home in Heliopolis district. Original silver gelatin print.",
    author: "Family Collection",
    archiveSource: "Private Archive",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-01-10T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-portrait-1/800/600",
  },
  {
    id: 2,
    title: "Nubian Village Before the Dam — Aswan 1958",
    description:
      "Rare photograph of a traditional Nubian village taken before the area was flooded by the Aswan High Dam reservoir in 1964.",
    author: "Nubian Documentation Project",
    archiveSource: "Aswan Museum",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-01-15T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-nubia-1/800/600",
  },
  {
    id: 3,
    title: "Ottoman-Era Marriage Certificate — Cairo 1887",
    description:
      "Original Arabic marriage contract (aqd zawaj) from the Cairo Sharia court. Names of both families and 8 witnesses are legible.",
    author: "Dar Al-Wathaeq",
    archiveSource: "Cairo National Archives",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-01-20T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-document-1/800/600",
  },
  {
    id: 4,
    title: "Coptic Baptism Record — Alexandria Diocese 1921",
    description:
      "Handwritten baptism registry page from the Church of St. Mark, Alexandria, recording 47 baptisms in a single year.",
    author: "Coptic Archives",
    archiveSource: "Alexandria Diocese",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-01-25T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-coptic-doc/800/600",
  },
  {
    id: 5,
    title: "Hassan Family Wedding — Alexandria 1945",
    description:
      "Wedding photograph of Abdel-Rahman Hassan and Hoda Osman taken at the Cecil Hotel, Alexandria. Note the traditional dress.",
    author: "Hassan Family Archive",
    archiveSource: "Private Collection",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-02-01T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-wedding-1/800/600",
  },
  {
    id: 6,
    title: "Luxor Temple — Evening View, 1900",
    description:
      "Rare early photographic print of Luxor Temple by an unknown photographer, showing the site before modern restoration works.",
    author: "Egyptian Antiquities",
    archiveSource: "Egyptian Museum",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-02-05T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-luxor/800/600",
  },
  {
    id: 7,
    title: "Nile Felucca with Family — Aswan 1970",
    description:
      "Colorized photograph of a Nubian family crossing the Nile on a traditional felucca. The High Dam is visible in the background.",
    author: "Ahmed Said",
    archiveSource: "Personal Archive",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-02-10T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-nile-boat/800/600",
  },
  {
    id: 8,
    title: "Egyptian Civil Registry — Minieh Province 1902",
    description:
      "Page from the civil birth register (sijil al-mawaledat) of Minieh province showing handwritten entries for 15 newborns.",
    author: "Civil Registry Office",
    archiveSource: "Dar Al-Wathaeq",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-02-15T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-registry/800/600",
  },
  {
    id: 9,
    title: "Khan El-Khalili Market — Cairo 1930s",
    description:
      "Black and white photograph of a family-owned shop in Khan El-Khalili, with three generations of the Habib merchant family.",
    author: "Pierre Moreau",
    archiveSource: "Cairo Library",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-02-20T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-cairo-market/800/600",
  },
  {
    id: 10,
    title: "Al-Said Family Elder — Luxor 1982",
    description:
      "Portrait of Saad Al-Said, patriarch of the Al-Said family, taken in the family courtyard surrounded by his grandchildren.",
    author: "Dr. Amr Fouad",
    archiveSource: "Al-Said Family Archive",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-02-25T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-elder/800/600",
  },
  {
    id: 11,
    title: "Sinai Tribal Gathering — 1975",
    description:
      "Representatives of the Tarabin and Tiyaha tribes meeting for a reconciliation council (majlis). Traditional dress and customs visible.",
    author: "Maj. Ahmad Al-Tarabin",
    archiveSource: "Sinai Documentation Project",
    category: "Tribal Heritage",
    isPublic: true,
    createdAt: "2025-03-01T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-sinai-tribe/800/600",
  },
  {
    id: 12,
    title: "Jewish Synagogue — Alexandria 1950",
    description:
      "Interior view of the Eliyahu Hanavi Synagogue, showing the ornate decoration before the mass emigration of Egypt's Jewish community.",
    author: "Unknown Photographer",
    archiveSource: "Cairo Geniza Project",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-03-05T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-synagogue/800/600",
  },
  {
    id: 13,
    title: "Manuscript Fragment — Fatimid Period",
    description:
      "Digitized fragment of a 12th-century Fatimid-era genealogical manuscript (nasab) tracing a prominent Cairo family back 7 generations.",
    author: "Egyptian Museum",
    archiveSource: "Egyptian Museum",
    category: "Manuscripts",
    isPublic: true,
    createdAt: "2025-03-10T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-manuscript/800/600",
  },
  {
    id: 14,
    title: "Khalil Family Christmas — Cairo 1963",
    description:
      "The Khalil Coptic family celebrating Christmas in their home in Shubra, Cairo. Traditional Coptic decorations and garments.",
    author: "Khalil Family",
    archiveSource: "Private Collection",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-03-15T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-coptic-family/800/600",
  },
  {
    id: 15,
    title: "Suez Canal Opening Ceremony — 1869",
    description:
      "Historical engraving of the Suez Canal inaugural festivities showing Egyptian dignitaries and their families at Port Said.",
    author: "Illustrated London News",
    archiveSource: "British Library",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-03-20T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-suez-canal/800/600",
  },
  {
    id: 16,
    title: "Ismailia Family Beach Portrait — 1955",
    description:
      "Summer portrait of a middle-class Egyptian family on the shores of Lake Timsah, Ismailia, during the pre-revolution golden era.",
    author: "Studio Orientale",
    archiveSource: "Private Archive",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-03-25T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-beach-family/800/600",
  },
  {
    id: 17,
    title: "Pharaonic Genealogy — Ramesses II Lineage",
    description:
      "Reproduction of the royal cartouche lineage inscription from Abu Simbel temple showing Ramesses II's ancestors across 6 generations.",
    author: "Egyptian Museum",
    archiveSource: "Abu Simbel Temple Archive",
    category: "Manuscripts",
    isPublic: true,
    createdAt: "2025-04-01T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-pharaonic/800/600",
  },
  {
    id: 18,
    title: "Delta Village Families — Kafr El-Sheikh 1965",
    description:
      "Documentary photograph of three neighboring farming families from the Nile Delta before modernization of the agricultural system.",
    author: "Agricultural Survey Agency",
    archiveSource: "Ministry of Agriculture Archive",
    category: "Family Portraits",
    isPublic: true,
    createdAt: "2025-04-05T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-delta-village/800/600",
  },
  {
    id: 19,
    title: "Tax Register Page — Upper Egypt 1830",
    description:
      "Handwritten Ottoman fiscal register (daftar miri) for a village in Asyut province listing 67 household heads with their tax obligations.",
    author: "Ottoman Archives",
    archiveSource: "Turkish State Archives",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-04-10T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-tax-register/800/600",
  },
  {
    id: 20,
    title: "Nile Flood Season — Cairo, Circa 1890",
    description:
      "Pre-High Dam photograph showing the annual Nile flood at its peak near Cairo. Several families are seen in boats navigating flooded streets.",
    author: "G. Lekegian & Co.",
    archiveSource: "Rare Books Library AUC",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-04-15T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-nile-flood/800/600",
  },
  {
    id: 21,
    title: "Ottoman Firman — Land Grant to Cairo Merchant, 1812",
    description:
      "Rare Ottoman imperial decree (firman) issued by Mehmed IV granting trade rights to a Cairo merchant family. Stamped with the Sultan's tughra.",
    author: "Dar Al-Wathaeq",
    archiveSource: "Egyptian National Archives",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-04-18T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-ottom-firman/800/600",
  },
  {
    id: 22,
    title: "Istanbul Archives — Egyptian Provincial Register, 1740",
    description:
      "Page from the Ottoman Başbakanlık archives listing Egyptian provincial governors, their salaries, and family members eligible for state pensions.",
    author: "Başbakanlık Arşivi",
    archiveSource: "Turkish State Archives",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-04-20T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-ottoman-reg/800/600",
  },
  {
    id: 23,
    title: "Greco-Roman Papyrus — Fayyum Census, 104 CE",
    description:
      "Digitized papyrus fragment from the Roman census of Egypt (116/117 CE) listing a Greek-Egyptian household in the Arsinoite nome with 6 family members.",
    author: "Oxyrhynchus Papyri Project",
    archiveSource: "British Museum",
    category: "Manuscripts",
    isPublic: true,
    createdAt: "2025-04-22T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-roman-papyrus/800/600",
  },
  {
    id: 24,
    title: "Alexandria Catacomb Inscription — 2nd Century CE",
    description:
      "Funerary inscription from the Kom Al-Shuqafa catacombs, Alexandria, naming a Greco-Egyptian family with bilingual Greek-Demotic text.",
    author: "Alexandria Museum",
    archiveSource: "Greco-Roman Museum Alexandria",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-04-24T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-alexandria-cata/800/600",
  },
  {
    id: 25,
    title: "Mamluk-Era Waqf Deed — Cairo 1480",
    description:
      "Digitized religious endowment (waqf) document from Mamluk Cairo specifying land bequeathed to a mosque, with the founding family's lineage in 7 generations.",
    author: "Egyptian Museum",
    archiveSource: "Egyptian Museum",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-04-26T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-mamluk-waqf/800/600",
  },
  {
    id: 26,
    title: "Bedouin Family Camp — Eastern Desert 1910",
    description:
      "Early 20th-century photograph of a Bedouin family in their traditional black tent with tribal markings visible on the tent poles.",
    author: "Military Survey Dept.",
    archiveSource: "Survey of Egypt Archives",
    category: "Tribal Heritage",
    isPublic: true,
    createdAt: "2025-04-28T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-bedouin-tent/800/600",
  },
  {
    id: 27,
    title: "Roman Forum Remnants — Alexandria, 1920s Survey",
    description:
      "Archaeological survey photograph of Roman forum excavation in Alexandria, showing marble columns with carved family dedication inscriptions.",
    author: "Egyptian Expedition Society",
    archiveSource: "Alexandria University Archive",
    category: "Historical Sites",
    isPublic: true,
    createdAt: "2025-05-01T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-roman-forum/800/600",
  },
  {
    id: 28,
    title: "Khedive-Era Passport — Egyptian Family, 1898",
    description:
      "Rare example of a Khedivate of Egypt travel document issued to an Egyptian merchant family, listing all family members with physical descriptions.",
    author: "Dar Al-Wathaeq",
    archiveSource: "Cairo National Archives",
    category: "Documents",
    isPublic: true,
    createdAt: "2025-05-03T00:00:00Z",
    image_path: "https://picsum.photos/seed/gallery-khedive-passport/800/600",
  },
];

// ─────────────────────────────────────────────
// ARTICLES (pre-seeded)
// ─────────────────────────────────────────────
export const MOCK_ARTICLES = [
  {
    id: "art-mock-001",
    title: "Tracing Your Egyptian Roots: A Beginner's Complete Guide",
    body: `Starting your Egyptian genealogy journey can feel overwhelming, but the records are richer than most people expect.\n\n**Start with Civil Registration**\nEgypt established a civil registration system in 1839 under Muhammad Ali. Birth, marriage, and death records from this period are held at Dar Al-Wathaeq Al-Qawmiya (National Archives) in Cairo. Records after 1957 are at the Ministry of Interior.\n\n**Sharia Court Records**\nIslamic court (mahkama shar'iyya) records are invaluable. Marriage contracts, inheritance disputes, and property deeds list not just names but entire family networks. Cairo courts alone hold millions of documents dating to the 16th century.\n\n**Coptic Church Registers**\nFor Christian families, the Coptic Orthodox Church has maintained baptismal and marriage records since the 4th century. Contact the diocese where your family worshipped — many have been digitized.\n\n**The Ottoman Connection**\nFrom 1517 to 1882, Egypt was an Ottoman province. Tax registers (daftar miri), military conscription lists, and land surveys from this period survive in Istanbul's archives as well as in Cairo.\n\n**Start at Home First**\nBefore any archive visit, collect documents at home — ID cards (bitaqa), birth certificates, military service books, passports, and old photographs. Interview the oldest family members and record everything.`,
    authorName: "Dr. Amr Fouad Al-Said",
    authorId: 3,
    roleLabel: "Researcher",
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-1/800/400",
    categories: ["genealogy", "archives"],
  },
  {
    id: "art-mock-002",
    title: "The Ottoman Influence on Egyptian Family Names",
    body: `Egyptian family names (laqab or nasab) carry centuries of history, and the Ottoman period (1517-1882) left a particularly deep imprint.\n\n**Turkish-Origin Names**\nMany Egyptian families today bear surnames derived from Turkish official titles: Basha (Pasha), Bey, Agha, and Effendi were Ottoman ranks that became hereditary family markers. Families like Al-Turki, Bashawat, and similar surnames trace directly to Ottoman officials who settled in Egypt.\n\n**Geographical Origins**\nPre-modern Egyptians often used their village or province of origin as an identifier. Names like Al-Masry ("The Egyptian"), Al-Saidi ("From Upper Egypt"), Al-Qahiri ("From Cairo"), and Al-Iskandrani ("From Alexandria") persist to this day.\n\n**Occupational Surnames**\nCraft guilds and occupations became surnames: Al-Najjar (carpenter), Al-Haddad (blacksmith), Al-Khayyat (tailor), Al-Tabbakh (cook). The Ottoman guild system solidified these occupational identities.\n\n**The Nasab Tradition**\nThe formal Arabic genealogical chain (nasab) — "Ibn" (son of) chains — was the traditional way of naming. Many rural families maintained 5-7 generation nasab chains for legal and social purposes, often recorded in mosque registers.`,
    authorName: "Kamel Ibrahim Al-Masry",
    authorId: 1,
    roleLabel: "Admin",
    createdAt: Date.now() - 22 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-2/800/400",
    categories: ["islamic", "genealogy"],
  },
  {
    id: "art-mock-003",
    title: "Nubian Families: Preserving Identity After Displacement",
    body: `The construction of the Aswan High Dam (1960-1968) resulted in the forced relocation of over 100,000 Nubian people from their ancestral lands. This displacement threatened not just homes but the very fabric of family identity.\n\n**What Was Lost**\nNubian villages had maintained family records through a combination of oral traditions (maintained by specialized griots called "fakkis"), community elders, and mosque records. The flooding destroyed physical records but oral memory survived.\n\n**Community Documentation Efforts**\nSince the 1970s, organizations like the Nubian General Union have worked to document displaced family trees. Their archive in Cairo holds over 50,000 family records compiled from oral interviews.\n\n**The Role of Women**\nNubian women were the primary keepers of genealogical knowledge, maintaining "familial maps" — informal oral records connecting extended family networks across dispersed communities.\n\n**Digital Preservation Today**\nModern tools like this platform allow Nubian families to rebuild their trees using oral history recordings, old photographs, and community knowledge. Several complete village genealogies have been reconstructed.`,
    authorName: "Layla Hassan Nour",
    authorId: 2,
    roleLabel: "Member",
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-3/800/400",
    categories: ["nubia", "heritage"],
  },
  {
    id: "art-mock-004",
    title: "How to Read Old Arabic Genealogy Documents",
    body: `Arabic genealogical manuscripts can look intimidating, but with a basic understanding of the script style and common formulas, most researchers can begin extracting useful information.\n\n**The Nasab Formula**\nThe classic nasab chain reads: [Name] ibn [Father] ibn [Grandfather] ibn [Great-grandfather]. For women, "bint" (daughter of) replaces "ibn". This chain tells you the patrilineal lineage directly.\n\n**Common Archival Terms**\n- توفي (tuwaffiya) — "passed away" + death date\n- وُلد (wulida) — "was born" + birth date\n- تزوج (tazawwaja) — "married"\n- ابنة/بنت — daughter of\n- ابن — son of\n- عقد الزواج (aqd al-zawaj) — marriage contract\n- شهود (shuhud) — witnesses\n\n**Ottoman Sijill Documents**\nSharia court sijill records used a standard Ottoman formula. The plaintiff/subject is named first, followed by their nasab chain, their quarter (hara) and city of residence.`,
    authorName: "Dr. Amr Fouad Al-Said",
    authorId: 3,
    roleLabel: "Researcher",
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-4/800/400",
    categories: ["archives", "genealogy"],
  },
  {
    id: "art-mock-005",
    title: "Alexandria's Lost Communities: Jewish, Greek & Armenian Heritage",
    body: `For much of the 19th and early 20th centuries, Alexandria was one of the most cosmopolitan cities on earth. Multiple non-Muslim communities maintained their own institutions — and their own genealogical records.\n\n**The Jewish Community**\nAt its peak in the 1940s, Egypt's Jewish population numbered 80,000, largely concentrated in Cairo and Alexandria. The Ben Ezra Synagogue archives and the Cairo Geniza Project have preserved marriage, birth, and death records.\n\n**The Greek Community**\nGreek families (Rum) ran major businesses in Alexandria for generations. The Greek Orthodox Patriarchate of Alexandria holds birth and marriage records dating to the 1700s, available to descendants.\n\n**The Armenian Community**\nArmeni refugees who arrived in Egypt after 1915 built churches and schools that maintained genealogical records. The Armenian Apostolic Church in Cairo preserves these documents.`,
    authorName: "Kamel Ibrahim Al-Masry",
    authorId: 1,
    roleLabel: "Admin",
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-5/800/400",
    categories: ["alexandria", "modern"],
  },
  {
    id: "art-mock-006",
    title: "Understanding Egyptian Naming Conventions Across Eras",
    body: `Egyptian naming traditions have evolved across millennia but retain certain consistent patterns that genealogists can use to trace lineage.\n\n**The Classical Arabic System**\nTraditional Egyptian names follow the pattern: Given name + Ibn/Bint + Father's name + Ibn + Grandfather's name. Legal documents required at least three generations of names to identify an individual uniquely.\n\n**The Kunya Tradition**\nEgyptian parents traditionally took "kunya" — honorific names based on their eldest child. A father named Ahmed with a son named Ibrahim would become "Abu Ibrahim" (father of Ibrahim).\n\n**Modern Egyptian Surnames**\nThe practice of fixed family surnames only became widespread in the 20th century, accelerated by civil registration requirements. Many modern surnames freeze a father's or grandfather's name as the family identifier.\n\n**Coptic Naming Traditions**\nCoptic Christian families often use Biblical Hebrew and Aramaic names alongside Arabic ones. Saints' names in Coptic (like Boulos for Paul, Bishoy for a Coptic saint) help identify Christian families in mixed-community records.`,
    authorName: "Dr. Amr Fouad Al-Said",
    authorId: 3,
    roleLabel: "Researcher",
    createdAt: Date.now() - 2 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-6/800/400",
    categories: ["genealogy", "modern"],
  },
  {
    id: "art-mock-007",
    title: "Researching Ottoman Egypt: A Guide to Istanbul's Archives",
    body: `For any Egyptian family with roots in the Ottoman period (1517–1882), the most important archive in the world is not in Cairo — it is in Istanbul.\n\n**The Başbakanlık Osmanlı Arşivi**\nThe Ottoman imperial archives (BOA) in Istanbul hold millions of documents pertaining to every province of the empire, including Egypt (Eyalet-i Mısır). Key collections for genealogists include:\n- **Mühimme Defterleri**: Imperial council decrees naming Egyptian governors, merchants, and religious figures\n- **Tapu Tahrir Defterleri**: Land surveys listing village-by-village property owners\n- **Cevdet Tasnifi**: A massive miscellaneous collection with salary registers, appointment records, and family petitions\n\n**Cairo Sijill Records**\nThe Islamic courts of Cairo maintained detailed sijill (register) books for every transaction: marriage contracts, divorce records, inheritance settlements, and property disputes. These are held at Dar Al-Wathaeq in Cairo and go back to the 16th century.\n\n**What a Typical Ottoman Record Tells You**\nA marriage contract from 1780s Cairo would include: full name (with nasab chain), father's name, occupation, place of origin, bride's name and father, witnesses with their names and professions, dowry amount, and the signature of the Qadi (judge).\n\n**Getting Access Today**\nThe BOA can be searched remotely via their online catalog. For Cairo records, Dar Al-Wathaeq requires an in-person research permit. Many records are being digitized under the Egyptian National Archives project.`,
    authorName: "Kamel Ibrahim Al-Masry",
    authorId: 1,
    roleLabel: "Admin",
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-7/800/400",
    categories: ["ottoman", "archives"],
  },
  {
    id: "art-mock-008",
    title: "Papyrus and Identity: Finding Your Roman-Era Egyptian Ancestors",
    body: `Egypt under Roman rule (30 BCE – 641 CE) produced one of the most extraordinary archives in human history: papyrus documents preserving the names, relationships, and daily lives of ordinary Egyptians in remarkable detail.\n\n**The Roman Census**\nEvery 14 years, Roman Egypt conducted a household census (kata oikian apographe). Each return listed every member of the household: name, age, relationship to the head of household, and legal status. Over 300 of these returns survive — more than from any other Roman province.\n\n**The Oxyrhynchus Papyri**\nDisovered in 1896-1897 at the ancient city of Oxyrhynchus (modern Bahnasa), over 500,000 papyrus fragments survive covering roughly 30 BCE to 700 CE. The Oxyrhynchus Papyri Project at Oxford has digitized thousands of documents, including:\n- Private letters between family members\n- Birth certificates and death notices\n- Marriage and divorce contracts\n- Land leases and wills with extensive family information\n\n**Mixed Identities**\nRoman Egypt had complex ethnic layers. A person might have a Greek first name, an Egyptian middle name, and a Roman clan name (gentilicium). The Fayyum portrait paintings show us what these individuals looked like — a priceless connection to ancient faces.\n\n**Searching the Records Today**\nThe Papyri.info portal provides free access to thousands of transcribed papyrus documents. Searching by name fragment can reveal family connections across generations. The British Museum, Bodleian Library, and Egyptian Museum all hold significant papyrus collections.`,
    authorName: "Dr. Amr Fouad Al-Said",
    authorId: 3,
    roleLabel: "Researcher",
    createdAt: Date.now() - 7 * 24 * 3600 * 1000,
    coverImage: "https://picsum.photos/seed/article-cover-8/800/400",
    categories: ["roman", "ancient"],
  },
];

export const MOCK_ARTICLE_COMMENTS = [
  {
    id: "cmt-001",
    articleId: "art-mock-001",
    authorName: "Mariam Adel",
    authorId: 4,
    body: "This article helped me find my great-grandmother's records in Dar Al-Wathaeq! Thank you for the detailed steps.",
    createdAt: Date.now() - 25 * 24 * 3600 * 1000,
  },
  {
    id: "cmt-002",
    articleId: "art-mock-001",
    authorName: "Youssef Al-Nubi",
    authorId: 5,
    body: "The Sharia court section is particularly valuable. I found 3 generations of my family in the Alexandria courts.",
    createdAt: Date.now() - 20 * 24 * 3600 * 1000,
  },
  {
    id: "cmt-003",
    articleId: "art-mock-002",
    authorName: "Layla Hassan Nour",
    authorId: 2,
    body: "The Ottoman occupation really did transform our naming system. My family name 'Effendi' traces exactly as described here.",
    createdAt: Date.now() - 18 * 24 * 3600 * 1000,
  },
  {
    id: "cmt-004",
    articleId: "art-mock-003",
    authorName: "Hana Idris",
    authorId: 7,
    body: "As a Nubian, this article means everything to me. My grandmother was one of those displaced in 1964. We are trying to document everything before her memories are gone.",
    createdAt: Date.now() - 12 * 24 * 3600 * 1000,
  },
  {
    id: "cmt-005",
    articleId: "art-mock-004",
    authorName: "Dr. Amr Fouad Al-Said",
    authorId: 3,
    body: "I would add that the diacritics (tashkeel) issue is even more acute for older Mamluk-era documents. A good Arabic calligraphy guide helps enormously.",
    createdAt: Date.now() - 8 * 24 * 3600 * 1000,
  },
  {
    id: "cmt-006",
    articleId: "art-mock-005",
    authorName: "George Khalil Boulos",
    authorId: 8,
    body: "My family is in those Alexandria records. The Greek Orthodox Patriarchate was very helpful when I wrote to them last year — they digitized records back to 1821.",
    createdAt: Date.now() - 4 * 24 * 3600 * 1000,
  },
];

export const MOCK_ARTICLE_LIKE_COUNTS: Record<string, number> = {
  "art-mock-001": 47,
  "art-mock-002": 31,
  "art-mock-003": 68,
  "art-mock-004": 24,
  "art-mock-005": 39,
  "art-mock-006": 15,
  "art-mock-007": 52,
  "art-mock-008": 28,
};

export const MOCK_ARTICLE_SHARE_COUNTS: Record<string, number> = {
  "art-mock-001": 12,
  "art-mock-002": 8,
  "art-mock-003": 22,
  "art-mock-004": 5,
  "art-mock-005": 11,
  "art-mock-006": 3,
  "art-mock-007": 18,
  "art-mock-008": 9,
};

// ─────────────────────────────────────────────
// ADMIN STATS
// ─────────────────────────────────────────────
export const MOCK_STATS = {
  users: 1247,
  books: 89,
  trees: 342,
  people: 4891,
  gallery: 1456,
  articles: 203,
};

// ─────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  {
    id: 1,
    type: "users",
    description: "New user registered: Mariam Adel (Cairo)",
    user: "mariam.adel@gmail.com",
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    type: "trees",
    description: "Family tree uploaded: Idris Nubian Heritage (4 generations)",
    user: "youssef.nubi@hotmail.com",
    date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 3,
    type: "books",
    description:
      "Document downloaded: Ottoman Tax Registers of Egypt 1800-1882",
    user: "researcher@rootsegypt.org",
    date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
  },
  {
    id: 4,
    type: "gallery",
    description: "Heritage image uploaded: Sinai Tribal Gathering 1975",
    user: "layla.hassan@example.com",
    date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 5,
    type: "articles",
    description:
      "Article published: Nubian Families — Preserving Identity After Displacement",
    user: "admin@rootsegypt.org",
    date: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 6,
    type: "users",
    description: "New user registered: Ibrahim Khalil Aziz (Suez)",
    user: "ibrahim.khalil@outlook.com",
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 7,
    type: "trees",
    description:
      "Family tree updated: Al-Said Family — Luxor Lineage (added 2 members)",
    user: "amr.said@research.eg",
    date: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
  {
    id: 8,
    type: "books",
    description:
      "Book downloaded: Coptic Diocese Birth & Death Registry: Cairo 1850-1950",
    user: "mariam.adel@gmail.com",
    date: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 9,
    type: "security",
    description: "Failed login attempt for admin@rootsegypt.org (3 attempts)",
    user: "system",
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 10,
    type: "gallery",
    description: "Gallery image approved: Khalil Family Christmas — Cairo 1963",
    user: "admin@rootsegypt.org",
    date: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
  },
  {
    id: 11,
    type: "users",
    description: "User status updated: George Khalil Boulos → active",
    user: "admin@rootsegypt.org",
    date: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
  {
    id: 12,
    type: "trees",
    description: "New tree created: Khalil Family — Coptic Lineage (Suez)",
    user: "researcher@rootsegypt.org",
    date: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
  },
];

// ─────────────────────────────────────────────
// ADMIN USERS LIST
// ─────────────────────────────────────────────
export const MOCK_USERS_LIST = [
  {
    id: 1,
    email: "admin@rootsegypt.org",
    fullName: "Kamel Ibrahim Al-Masry",
    phone: "+20 10 1234 5678",
    role: 1,
    roleName: "Admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "demo@rootsegypt.org",
    fullName: "Layla Hassan Nour",
    phone: "+20 11 9876 5432",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: 3,
    email: "researcher@rootsegypt.org",
    fullName: "Dr. Amr Fouad Al-Said",
    phone: "+20 12 5555 6666",
    role: 3,
    roleName: "Researcher",
    status: "active",
    createdAt: "2024-04-20T00:00:00Z",
  },
  {
    id: 4,
    email: "mariam.adel@gmail.com",
    fullName: "Mariam Adel",
    phone: "+20 10 2222 3333",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2024-06-10T00:00:00Z",
  },
  {
    id: 5,
    email: "youssef.nubi@hotmail.com",
    fullName: "Youssef Al-Nubi",
    phone: "+20 11 4444 7777",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2024-07-05T00:00:00Z",
  },
  {
    id: 6,
    email: "ibrahim.khalil@outlook.com",
    fullName: "Ibrahim Khalil Aziz",
    phone: "+20 12 8888 9999",
    role: 2,
    roleName: "Member",
    status: "pending",
    createdAt: "2025-04-01T00:00:00Z",
  },
  {
    id: 7,
    email: "hana.idris@nubia.eg",
    fullName: "Hana Idris Mohamed",
    phone: "+20 10 6666 1111",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2024-09-22T00:00:00Z",
  },
  {
    id: 8,
    email: "george.khalil@example.com",
    fullName: "George Khalil Boulos",
    phone: "+20 11 3333 5555",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2024-11-18T00:00:00Z",
  },
  {
    id: 9,
    email: "nour.ibrahim@cairo.eg",
    fullName: "Nour Ibrahim Hassan",
    phone: "+20 12 1111 2222",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2025-01-10T00:00:00Z",
  },
  {
    id: 10,
    email: "amna.khalaf@aswan.eg",
    fullName: "Amna Khalaf Saad",
    phone: "+20 10 9999 4444",
    role: 2,
    roleName: "Member",
    status: "active",
    createdAt: "2025-02-28T00:00:00Z",
  },
];

// ─────────────────────────────────────────────
// ADMIN ROLES
// ─────────────────────────────────────────────
export const MOCK_ROLES = [
  { id: 1, name: "Admin", description: "Full platform access" },
  { id: 2, name: "Member", description: "Standard user access" },
  { id: 3, name: "Researcher", description: "Content management access" },
];

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "New family tree shared",
    body: "Youssef Al-Nubi shared the 'Idris Nubian Heritage' tree with you.",
    read: false,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "New comment on your article",
    body: "Layla Hassan commented on 'Tracing Your Egyptian Roots'.",
    read: false,
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "New book added to library",
    body: "Muhammad Ali Dynasty genealogy book has been added to the library.",
    read: true,
    createdAt: new Date(Date.now() - 86400 * 1000).toISOString(),
  },
  {
    id: 4,
    title: "Welcome to Roots Egypt!",
    body: "Your account is active. Start exploring 5,000 years of Egyptian heritage.",
    read: true,
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
  },
];

// ─────────────────────────────────────────────
// SEARCH SUGGESTIONS
// ─────────────────────────────────────────────
export const MOCK_SEARCH_TREES = [
  { id: 1, title: "Al-Masry Family Tree" },
  { id: 2, title: "Hassan-Ibrahim Family (Alexandria)" },
  { id: 3, title: "Al-Said Family — Luxor Lineage" },
  { id: 4, title: "Idris Family — Nubian Heritage" },
  { id: 5, title: "Khalil Family — Coptic Lineage (Suez)" },
];

export const MOCK_SEARCH_PEOPLE = [
  { id: "I1", name: "Ahmed Al-Masry", tree_title: "Al-Masry Family Tree" },
  { id: "I3", name: "Mahmoud Al-Masry", tree_title: "Al-Masry Family Tree" },
  {
    id: "I1h",
    name: "Abdel-Rahman Hassan",
    tree_title: "Hassan-Ibrahim Family (Alexandria)",
  },
  {
    id: "I3s",
    name: "Saad Al-Said",
    tree_title: "Al-Said Family — Luxor Lineage",
  },
  {
    id: "I1n",
    name: "Mohamed Idris",
    tree_title: "Idris Family — Nubian Heritage",
  },
  {
    id: "I1k",
    name: "Girgis Khalil",
    tree_title: "Khalil Family — Coptic Lineage (Suez)",
  },
  {
    id: "I6h",
    name: "Amr Hassan",
    tree_title: "Hassan-Ibrahim Family (Alexandria)",
  },
  {
    id: "I8a",
    name: "Dr. Amr Al-Said",
    tree_title: "Al-Said Family — Luxor Lineage",
  },
];

// ─────────────────────────────────────────────
// AUDIO / PODCASTS
// ─────────────────────────────────────────────
export const MOCK_AUDIO = [
  {
    id: 1,
    title: "Tracing Your Egyptian Roots: An Introduction",
    description:
      "A comprehensive audio guide for beginners starting their Egyptian genealogy journey. Covers civil registration, Sharia court records, and Ottoman archives.",
    author: "Dr. Hisham Al-Wakil",
    category: "Genealogy Guides",
    duration: 2847,
    durationFormatted: "47:27",
    isPublic: true,
    plays: 3421,
    likes: 287,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-1/400/400",
    createdAt: "2024-09-15T00:00:00Z",
    fileSize: 45600000,
  },
  {
    id: 2,
    title: "The Nubian Oral History Project",
    description:
      "Interviews with Nubian elders documenting family histories before the Aswan High Dam displacement. Featuring stories from Wadi Halfa and Kom Ombo communities.",
    author: "Nubian Heritage Documentation Project",
    category: "Oral History",
    duration: 3621,
    durationFormatted: "1:00:21",
    isPublic: true,
    plays: 2156,
    likes: 412,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-2/400/400",
    createdAt: "2024-10-20T00:00:00Z",
    fileSize: 58200000,
  },
  {
    id: 3,
    title: "Reading Ottoman Arabic Documents",
    description:
      "Learn to decipher Ottoman-era Arabic genealogical documents. Covers sijill records, marriage contracts, and tax registers with practical examples.",
    author: "Prof. Amal Osman",
    category: "Research Skills",
    duration: 1923,
    durationFormatted: "32:03",
    isPublic: true,
    plays: 1834,
    likes: 156,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-3/400/400",
    createdAt: "2024-11-05T00:00:00Z",
    fileSize: 30800000,
  },
  {
    id: 4,
    title: "Alexandria's Cosmopolitan Heritage",
    description:
      "Exploring the genealogical records of Alexandria's Greek, Jewish, Italian, and Armenian communities from the 19th and early 20th centuries.",
    author: "Mona Hilal",
    category: "Social History",
    duration: 2456,
    durationFormatted: "40:56",
    isPublic: true,
    plays: 1567,
    likes: 203,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-4/400/400",
    createdAt: "2024-12-01T00:00:00Z",
    fileSize: 39400000,
  },
  {
    id: 5,
    title: "Coptic Church Records: A Research Guide",
    description:
      "How to access and interpret Coptic Orthodox Church baptismal, marriage, and burial records spanning 2,000 years of continuous tradition.",
    author: "Father Bishoy Marcus",
    category: "Religious Heritage",
    duration: 2134,
    durationFormatted: "35:34",
    isPublic: true,
    plays: 1289,
    likes: 178,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-5/400/400",
    createdAt: "2025-01-10T00:00:00Z",
    fileSize: 34200000,
  },
  {
    id: 6,
    title: "Bedouin Tribal Genealogies of Sinai",
    description:
      "Oral genealogies and documented histories of the 14 major Sinai Bedouin tribes, including the Tarabin, Tiyaha, and Azazma clans.",
    author: "Maj. Ahmad Al-Tarabin",
    category: "Tribal Studies",
    duration: 3012,
    durationFormatted: "50:12",
    isPublic: true,
    plays: 987,
    likes: 134,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-6/400/400",
    createdAt: "2025-02-05T00:00:00Z",
    fileSize: 48300000,
  },
  {
    id: 7,
    title: "The Muhammad Ali Dynasty: A Royal Family History",
    description:
      "Detailed genealogical history of Egypt's ruling dynasty from Muhammad Ali Pasha (1769-1849) to King Farouk, with court records and European diplomatic sources.",
    author: "Dr. Khaled Fahmy",
    category: "Royalty & Politics",
    duration: 4123,
    durationFormatted: "1:08:43",
    isPublic: true,
    plays: 2876,
    likes: 389,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-7/400/400",
    createdAt: "2025-02-20T00:00:00Z",
    fileSize: 66100000,
  },
  {
    id: 8,
    title: "Papyrus and Identity: Roman-Era Egyptian Genealogy",
    description:
      "Exploring the Oxyrhynchus Papyri and Roman census returns to trace ordinary Egyptian families from 30 BCE to 641 CE.",
    author: "Dr. Amr Fouad Al-Said",
    category: "Ancient History",
    duration: 2789,
    durationFormatted: "46:29",
    isPublic: true,
    plays: 1645,
    likes: 221,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-8/400/400",
    createdAt: "2025-03-01T00:00:00Z",
    fileSize: 44700000,
  },
  {
    id: 9,
    title: "Egyptian Naming Conventions Across Eras",
    description:
      "Understanding how Egyptian naming traditions evolved from Pharaonic times through the Arab conquest, Ottoman period, and modern era.",
    author: "Prof. Amal Osman",
    category: "Linguistics",
    duration: 1856,
    durationFormatted: "30:56",
    isPublic: true,
    plays: 1423,
    likes: 167,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-9/400/400",
    createdAt: "2025-03-15T00:00:00Z",
    fileSize: 29700000,
  },
  {
    id: 10,
    title: "Researching Ottoman Egypt: Istanbul Archives Guide",
    description:
      "A practical guide to accessing the Başbakanlık Osmanlı Arşivi in Istanbul for Egyptian genealogical research, covering key collections and search strategies.",
    author: "Dr. Nelly Hanna",
    category: "Archives & Records",
    duration: 2567,
    durationFormatted: "42:47",
    isPublic: true,
    plays: 1789,
    likes: 245,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-10/400/400",
    createdAt: "2025-03-28T00:00:00Z",
    fileSize: 41200000,
  },
  {
    id: 11,
    title: "DNA Testing for Egyptian Ancestry",
    description:
      "Understanding genetic genealogy testing options for Egyptians, including autosomal DNA, Y-DNA, and mitochondrial DNA testing for African and Middle Eastern populations.",
    author: "Dr. Sarah El-Shafei",
    category: "Genetic Genealogy",
    duration: 2234,
    durationFormatted: "37:14",
    isPublic: true,
    plays: 2341,
    likes: 312,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-11/400/400",
    createdAt: "2025-04-05T00:00:00Z",
    fileSize: 35800000,
  },
  {
    id: 12,
    title: "The Fayyum Mummy Portraits: Art and Identity",
    description:
      "Exploring the unique Greco-Egyptian family identity through the Fayyum portrait paintings from the 1st-4th century CE.",
    author: "Prof. Susan Walker",
    category: "Classical History",
    duration: 1678,
    durationFormatted: "27:58",
    isPublic: true,
    plays: 1123,
    likes: 145,
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    coverImage: "https://picsum.photos/seed/audio-cover-12/400/400",
    createdAt: "2025-04-15T00:00:00Z",
    fileSize: 26900000,
  },
];

// ─────────────────────────────────────────────
// CONTACT FORM SUBMISSIONS (Admin view)
// ─────────────────────────────────────────────
export const MOCK_CONTACT_SUBMISSIONS = [
  {
    id: 1,
    name: "Ahmed Mahmoud",
    email: "ahmed.mahmoud@gmail.com",
    subject: "Request for access to Ottoman archives",
    message:
      "I am researching my family history in the Minieh province during the Ottoman period. Could you provide guidance on accessing the tax registers from 1850-1880?",
    status: "pending",
    createdAt: "2025-03-25T14:30:00Z",
  },
  {
    id: 2,
    name: "Fatima Hassan",
    email: "fatima.hassan@outlook.com",
    subject: "Nubian family records",
    message:
      "My grandmother's family was displaced from Wadi Halfa in 1964. I would like to contribute our oral history recordings to your Nubian Heritage Documentation Project.",
    status: "responded",
    createdAt: "2025-03-24T10:15:00Z",
    respondedAt: "2025-03-24T16:45:00Z",
  },
  {
    id: 3,
    name: "George Mikhail",
    email: "george.mikhail@coptic.eg",
    subject: "Coptic church records - Alexandria",
    message:
      "I need help locating baptismal records for the Mikhail family from St. Mark's Church in Alexandria, circa 1890-1920. Can you assist?",
    status: "responded",
    createdAt: "2025-03-23T09:20:00Z",
    respondedAt: "2025-03-23T14:30:00Z",
  },
  {
    id: 4,
    name: "Layla Ibrahim",
    email: "layla.ibrahim@yahoo.com",
    subject: "Partnership opportunity",
    message:
      "I represent the Egyptian Genealogical Society. We would like to discuss a potential partnership for digitizing regional archives. Please contact me at your earliest convenience.",
    status: "pending",
    createdAt: "2025-03-22T16:45:00Z",
  },
  {
    id: 5,
    name: "Mohamed Salah",
    email: "m.salah@research.eg",
    subject: "Technical issue with GEDCOM upload",
    message:
      "I'm experiencing an error when trying to upload my family tree GEDCOM file. The file is 2.3MB and contains 156 individuals. Error message: 'Upload failed - invalid format'.",
    status: "resolved",
    createdAt: "2025-03-21T11:30:00Z",
    respondedAt: "2025-03-21T13:15:00Z",
    resolvedAt: "2025-03-21T15:00:00Z",
  },
  {
    id: 6,
    name: "Nour El-Din",
    email: "nour.eldin@auc.edu.eg",
    subject: "Academic research collaboration",
    message:
      "I am a PhD candidate at AUC studying Egyptian migration patterns 1900-1950. Would it be possible to access anonymized genealogical data for research purposes?",
    status: "pending",
    createdAt: "2025-03-20T08:00:00Z",
  },
  {
    id: 7,
    name: "Hana Youssef",
    email: "hana.youssef@gmail.com",
    subject: "Translation help needed",
    message:
      "I have an Ottoman-era marriage contract in Arabic script that I cannot read. Do you offer translation services or can you recommend someone?",
    status: "responded",
    createdAt: "2025-03-19T13:45:00Z",
    respondedAt: "2025-03-20T09:30:00Z",
  },
  {
    id: 8,
    name: "Karim Abdel-Aziz",
    email: "karim.aziz@hotmail.com",
    subject: "Feature request: DNA matching",
    message:
      "It would be great if the platform could integrate DNA test results to help connect distant relatives. Is this something you're considering?",
    status: "pending",
    createdAt: "2025-03-18T17:20:00Z",
  },
];

// ─────────────────────────────────────────────
// RESEARCH RESOURCES
// ─────────────────────────────────────────────
export const MOCK_RESEARCH_RESOURCES = [
  {
    id: 1,
    title: "Dar Al-Wathaeq Al-Qawmiya (Egyptian National Archives)",
    description:
      "The primary repository for Egyptian historical documents including civil registration records (1839-1957), Ottoman tax registers, Sharia court sijill records, and government administrative files.",
    category: "Archives",
    location: "Cairo, Egypt",
    address: "Corniche El-Nil, Ramlet Boulaq, Cairo",
    website: "http://www.nationalarchives.gov.eg",
    email: "info@nationalarchives.gov.eg",
    phone: "+20 2 2579 4596",
    accessInfo:
      "Research permit required. Apply in person with ID and research proposal. Open Sunday-Thursday, 9:00 AM - 3:00 PM.",
    holdings:
      "Civil registration (1839-1957), Ottoman sijill records (1517-1882), Khedivate administrative files, land deeds, court records",
    isPublic: true,
    rating: 5,
    createdAt: "2024-08-01T00:00:00Z",
  },
  {
    id: 2,
    title: "Başbakanlık Osmanlı Arşivi (Ottoman State Archives)",
    description:
      "Located in Istanbul, Turkey, this archive holds millions of Ottoman imperial documents relevant to Egyptian genealogy research from 1517-1882.",
    category: "Archives",
    location: "Istanbul, Turkey",
    address: "Kağıthane, Istanbul",
    website: "http://www.devletarsivleri.gov.tr",
    email: "basbakanlik@devletarsivleri.gov.tr",
    phone: "+90 212 368 4700",
    accessInfo:
      "Foreign researchers need a letter of introduction from their institution. Online catalog available. Reading room open Monday-Friday.",
    holdings:
      "Mühimme defterleri (imperial decrees), tapu tahrir (land surveys), Egyptian provincial appointment records, tax registers",
    isPublic: true,
    rating: 5,
    createdAt: "2024-08-05T00:00:00Z",
  },
  {
    id: 3,
    title: "Coptic Orthodox Patriarchate Archives",
    description:
      "Central repository for Coptic Christian genealogical records including baptismal registers, marriage records, and burial documentation from parishes across Egypt.",
    category: "Religious Archives",
    location: "Cairo, Egypt",
    address: "St. Mark's Cathedral, Abbassia, Cairo",
    website: "http://www.copticpope.org",
    email: "archives@copticpope.org",
    phone: "+20 2 2482 5374",
    accessInfo:
      "Contact the diocese where your family worshipped. Many records have been digitized. Letter of request required.",
    holdings:
      "Baptismal records (4th century-present), marriage registers, burial records, parish census records",
    isPublic: true,
    rating: 4,
    createdAt: "2024-08-10T00:00:00Z",
  },
  {
    id: 4,
    title: "Oxyrhynchus Papyri Project (Oxford University)",
    description:
      "Digital archive of over 500,000 papyrus fragments from Roman Egypt (30 BCE - 641 CE) including census returns, marriage contracts, and family correspondence.",
    category: "Digital Archives",
    location: "Oxford, United Kingdom (Online)",
    address: "Sackler Library, University of Oxford",
    website: "http://www.papyrology.ox.ac.uk/POxy",
    email: "papyrology@classics.ox.ac.uk",
    phone: "+44 1865 278190",
    accessInfo:
      "Fully digitized and searchable online. Free access. High-resolution images available for most documents.",
    holdings:
      "Roman census returns, marriage contracts, birth certificates, wills, private letters, land leases (30 BCE - 641 CE)",
    isPublic: true,
    rating: 5,
    createdAt: "2024-08-15T00:00:00Z",
  },
  {
    id: 5,
    title: "Cairo Geniza Project",
    description:
      "Digital archive of Jewish community records from the Ben Ezra Synagogue in Old Cairo, covering 1,000 years of Egyptian Jewish family history.",
    category: "Digital Archives",
    location: "Multiple institutions (Online)",
    address: "Princeton University, Cambridge University, others",
    website: "http://www.geniza.org",
    email: "geniza@princeton.edu",
    phone: "+1 609 258 4000",
    accessInfo:
      "Fully digitized. Free online access. Search by name, date, or document type. Transcriptions available in Hebrew and English.",
    holdings:
      "Jewish marriage contracts (ketubah), business records, family correspondence, community registers (882-1800 CE)",
    isPublic: true,
    rating: 5,
    createdAt: "2024-08-20T00:00:00Z",
  },
  {
    id: 6,
    title: "Alexandria Library - Rare Books and Special Collections",
    description:
      "Modern Bibliotheca Alexandrina houses rare Egyptian genealogical manuscripts, family histories, and historical photographs from the 19th-20th centuries.",
    category: "Libraries",
    location: "Alexandria, Egypt",
    address: "El-Shatby, Alexandria",
    website: "http://www.bibalex.org",
    email: "secretariat@bibalex.org",
    phone: "+20 3 483 9999",
    accessInfo:
      "Free library card for researchers. Special collections require advance appointment. Digital catalog available online.",
    holdings:
      "Greek-Egyptian family histories, Italian and Armenian community records, 19th-century photographs, Alexandria municipal records",
    isPublic: true,
    rating: 4,
    createdAt: "2024-08-25T00:00:00Z",
  },
  {
    id: 7,
    title: "American University in Cairo - Rare Books Library",
    description:
      "Extensive collection of Egyptian historical documents, photographs, and manuscripts including family papers donated by prominent Egyptian families.",
    category: "Libraries",
    location: "Cairo, Egypt",
    address: "AUC New Cairo Campus",
    website: "http://www.aucegypt.edu/library",
    email: "rarelib@aucegypt.edu",
    phone: "+20 2 2615 2525",
    accessInfo:
      "Open to external researchers with appointment. Digital collections available online. Photography permitted with permission.",
    holdings:
      "Egyptian family papers, Ottoman-era manuscripts, 19th-20th century photographs, British administration records",
    isPublic: true,
    rating: 4,
    createdAt: "2024-09-01T00:00:00Z",
  },
  {
    id: 8,
    title: "Nubian Heritage Documentation Project",
    description:
      "Community-led initiative documenting Nubian family histories, oral traditions, and genealogies from communities displaced by the Aswan High Dam.",
    category: "Community Archives",
    location: "Aswan, Egypt",
    address: "Nubian General Union, Aswan",
    website: "http://www.nubianheritage.org",
    email: "info@nubianheritage.org",
    phone: "+20 97 231 5678",
    accessInfo:
      "Contact for access to oral history recordings and family tree database. Volunteers welcome. Community events held monthly.",
    holdings:
      "Oral history recordings (1960s-present), family tree database (50,000+ records), photographs, traditional songs and stories",
    isPublic: true,
    rating: 4,
    createdAt: "2024-09-05T00:00:00Z",
  },
  {
    id: 9,
    title: "FamilySearch - Egypt Records",
    description:
      "Free online database from the LDS Church with digitized Egyptian civil registration, church records, and census data.",
    category: "Digital Archives",
    location: "Online",
    address: "Worldwide (Online)",
    website: "http://www.familysearch.org/search/collection/location/1927178",
    email: "support@familysearch.org",
    phone: "+1 866 406 1830",
    accessInfo:
      "Free account required. Fully searchable. Some records restricted to LDS members but most are public.",
    holdings:
      "Civil registration (1900-1960), Coptic church records, British administration census data, passport applications",
    isPublic: true,
    rating: 4,
    createdAt: "2024-09-10T00:00:00Z",
  },
  {
    id: 10,
    title: "Egyptian Museum Archives",
    description:
      "Archaeological and historical archives including Pharaonic genealogical inscriptions, Greco-Roman papyri, and Coptic manuscripts.",
    category: "Museums",
    location: "Cairo, Egypt",
    address: "Tahrir Square, Cairo",
    website: "http://www.egyptianmuseum.gov.eg",
    email: "info@egyptianmuseum.gov.eg",
    phone: "+20 2 2579 6948",
    accessInfo:
      "Museum admission required. Research access to archives by appointment only. Photography restrictions apply.",
    holdings:
      "Pharaonic royal genealogies, Greco-Roman papyri, Coptic manuscripts, funerary inscriptions, temple records",
    isPublic: true,
    rating: 5,
    createdAt: "2024-09-15T00:00:00Z",
  },
  {
    id: 11,
    title: "British Library - Middle East Collections",
    description:
      "Extensive collection of Egyptian documents from the British colonial period including census records, administrative files, and private papers.",
    category: "International Archives",
    location: "London, United Kingdom",
    address: "96 Euston Road, London",
    website: "http://www.bl.uk/subjects/middle-east",
    email: "middle-east@bl.uk",
    phone: "+44 330 333 1144",
    accessInfo:
      "Free reader pass required. Digital collections searchable online. Many documents available for download.",
    holdings:
      "British administration records (1882-1952), census data, military records, diplomatic correspondence, private family papers",
    isPublic: true,
    rating: 4,
    createdAt: "2024-09-20T00:00:00Z",
  },
  {
    id: 12,
    title: "Sinai Tribal Documentation Center",
    description:
      "Repository for Bedouin tribal genealogies, oral histories, and traditional knowledge from the 14 major Sinai tribes.",
    category: "Community Archives",
    location: "El-Arish, Egypt",
    address: "Sinai University, El-Arish",
    website: "http://www.sinaitribes.org",
    email: "info@sinaitribes.org",
    phone: "+20 68 336 5000",
    accessInfo:
      "Contact tribal elders for access. Community permission required for certain records. Researchers must respect tribal protocols.",
    holdings:
      "Tribal genealogies (oral and written), settlement patterns, traditional law (urf), marriage records, conflict resolution documents",
    isPublic: true,
    rating: 3,
    createdAt: "2024-09-25T00:00:00Z",
  },
];

// ─────────────────────────────────────────────
// HISTORICAL PERIODS
// ─────────────────────────────────────────────
export const MOCK_PERIODS = [
  {
    id: 1,
    name: "Pharaonic Egypt",
    nameAr: "مصر الفرعونية",
    startYear: -3100,
    endYear: -332,
    duration: "3100 BCE - 332 BCE",
    description:
      "Ancient Egyptian civilization spanning 31 dynasties, from the unification of Upper and Lower Egypt under Narmer to the conquest by Alexander the Great.",
    genealogicalSources:
      "Royal genealogies inscribed on temple walls, funerary inscriptions, papyrus administrative records, tomb inscriptions listing family members and titles.",
    keyArchives:
      "Egyptian Museum Cairo, Luxor Museum, British Museum, Louvre, Metropolitan Museum",
    notableRecords:
      "Abydos King List, Karnak King List, Turin Royal Canon, Palermo Stone, royal cartouches at Abu Simbel",
    researchChallenges:
      "Limited records for non-royal families, hieroglyphic literacy required, fragmentary documentation, chronological uncertainties.",
    color: "#D4AF37",
    icon: "pyramid",
    isPublic: true,
    createdAt: "2024-07-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Ptolemaic Period",
    nameAr: "العصر البطلمي",
    startYear: -332,
    endYear: -30,
    duration: "332 BCE - 30 BCE",
    description:
      "Greek-Egyptian dynasty founded by Ptolemy I Soter, a general of Alexander the Great. Period of cultural fusion between Greek and Egyptian traditions.",
    genealogicalSources:
      "Demotic and Greek papyri, marriage contracts, census records, temple inscriptions, royal decrees, private correspondence.",
    keyArchives:
      "Oxyrhynchus Papyri Project, British Museum Papyrus Collection, Egyptian Museum, Bibliotheca Alexandrina",
    notableRecords:
      "Bilingual marriage contracts, Rosetta Stone (genealogical context), Fayyum census returns, temple donor inscriptions",
    researchChallenges:
      "Bilingual documents (Greek/Demotic), mixed naming conventions, complex legal systems, fragmentary papyri.",
    color: "#4169E1",
    icon: "scroll",
    isPublic: true,
    createdAt: "2024-07-05T00:00:00Z",
  },
  {
    id: 3,
    name: "Roman Egypt",
    nameAr: "مصر الرومانية",
    startYear: -30,
    endYear: 641,
    duration: "30 BCE - 641 CE",
    description:
      "Egypt as a province of the Roman Empire, later Byzantine Empire. Most documented period of ancient Egypt with extensive papyrus records.",
    genealogicalSources:
      "Census returns (kata oikian apographai), birth certificates, marriage contracts, death notices, military records, tax registers, private letters.",
    keyArchives:
      "Oxyrhynchus Papyri, British Museum, Bodleian Library Oxford, Egyptian Museum, Papyri.info database",
    notableRecords:
      "Roman census returns listing entire households, Fayyum mummy portrait inscriptions, military discharge papers (diplomata), Christian martyrdom records",
    researchChallenges:
      "Greek and Latin literacy required, complex Roman naming (tria nomina), mixed ethnic identities, papyrus preservation varies by region.",
    color: "#8B0000",
    icon: "columns",
    isPublic: true,
    createdAt: "2024-07-10T00:00:00Z",
  },
  {
    id: 4,
    name: "Islamic Conquest & Early Islamic Period",
    nameAr: "الفتح الإسلامي والعصر الإسلامي المبكر",
    startYear: 641,
    endYear: 1250,
    duration: "641 CE - 1250 CE",
    description:
      "Arab conquest of Egypt and establishment of Islamic rule. Includes Rashidun, Umayyad, Abbasid, Fatimid, and Ayyubid periods.",
    genealogicalSources:
      "Nasab manuscripts (genealogical chains), mosque registers, waqf (endowment) deeds, Sharia court records, biographical dictionaries (tabaqat).",
    keyArchives:
      "Egyptian Museum, Dar Al-Wathaeq, Al-Azhar Library, Coptic Patriarchate Archives",
    notableRecords:
      "Fatimid-era nasab manuscripts, Coptic church registers (continuous from Byzantine period), early mosque foundation inscriptions",
    researchChallenges:
      "Early records sparse, oral tradition dominant, Arabic paleography skills needed, many records lost to time.",
    color: "#228B22",
    icon: "mosque",
    isPublic: true,
    createdAt: "2024-07-15T00:00:00Z",
  },
  {
    id: 5,
    name: "Mamluk Sultanate",
    nameAr: "سلطنة المماليك",
    startYear: 1250,
    endYear: 1517,
    duration: "1250 - 1517",
    description:
      "Rule by the Mamluk military caste. Period of architectural and cultural flourishing with extensive administrative documentation.",
    genealogicalSources:
      "Waqf deeds, Sharia court sijill records, biographical dictionaries, military registers, tax records, mosque foundation inscriptions.",
    keyArchives:
      "Dar Al-Wathaeq, Egyptian Museum, Al-Azhar Library, Coptic Patriarchate",
    notableRecords:
      "Extensive waqf documents listing founding families, Mamluk military registers, merchant guild records, Coptic church registers",
    researchChallenges:
      "Mamluk Arabic script challenging, military elite records better preserved than common families, many records in mosque archives.",
    color: "#FFD700",
    icon: "fort",
    isPublic: true,
    createdAt: "2024-07-20T00:00:00Z",
  },
  {
    id: 6,
    name: "Ottoman Egypt",
    nameAr: "مصر العثمانية",
    startYear: 1517,
    endYear: 1882,
    duration: "1517 - 1882",
    description:
      "Egypt as an Ottoman province. Most documented pre-modern period with extensive tax registers, court records, and administrative files.",
    genealogicalSources:
      "Sharia court sijill records, Ottoman tax registers (daftar miri), military conscription lists, land surveys (tapu tahrir), marriage contracts, inheritance records.",
    keyArchives:
      "Dar Al-Wathaeq Cairo, Başbakanlık Osmanlı Arşivi Istanbul, Coptic Patriarchate, Al-Azhar Library",
    notableRecords:
      "Cairo sijill records (1517-1882), Ottoman tax registers listing household heads, military conscription records, extensive marriage contracts",
    researchChallenges:
      "Ottoman Turkish and Arabic required, documents in Istanbul and Cairo, complex administrative terminology, varying preservation quality.",
    color: "#DC143C",
    icon: "crescent",
    isPublic: true,
    createdAt: "2024-07-25T00:00:00Z",
  },
  {
    id: 7,
    name: "Khedivate & British Occupation",
    nameAr: "الخديوية والاحتلال البريطاني",
    startYear: 1882,
    endYear: 1952,
    duration: "1882 - 1952",
    description:
      "Period of British colonial influence and Egyptian modernization. Establishment of comprehensive civil registration system.",
    genealogicalSources:
      "Civil registration (birth, marriage, death certificates), census records, passport applications, military service records, land deeds, British administration files.",
    keyArchives:
      "Dar Al-Wathaeq, Ministry of Interior, British Library London, National Archives UK, Coptic Patriarchate",
    notableRecords:
      "First modern census (1882), comprehensive civil registration from 1900, British military records, passport applications, land registry",
    researchChallenges:
      "Records split between Egypt and UK, some records restricted, Arabic and English documents, bureaucratic reorganizations.",
    color: "#000080",
    icon: "building",
    isPublic: true,
    createdAt: "2024-08-01T00:00:00Z",
  },
  {
    id: 8,
    name: "Modern Egypt",
    nameAr: "مصر الحديثة",
    startYear: 1952,
    endYear: 2026,
    duration: "1952 - Present",
    description:
      "Post-revolution Egypt from the Free Officers Movement to the present day. Comprehensive civil registration and digital records.",
    genealogicalSources:
      "Civil registration (Ministry of Interior), national ID database, passport records, military service records, university records, hospital birth records.",
    keyArchives:
      "Ministry of Interior, Civil Registry Offices (nationwide), Coptic Patriarchate, digital databases",
    notableRecords:
      "Computerized national ID system, comprehensive birth/death/marriage registration, digitized historical records, DNA databases (emerging)",
    researchChallenges:
      "Privacy laws restrict access to recent records (typically 75-100 years), digital records not fully integrated, some records require family member access only.",
    color: "#FF6347",
    icon: "landmark",
    isPublic: true,
    createdAt: "2024-08-05T00:00:00Z",
  },
];
