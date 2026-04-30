export interface GedcomxPerson {
    id: string;
    names: Record<string, string>;
    gender: string;
    birthYear: string;
    birthPlace: string;
    deathDate: string;
    deathPlace: string;
    father: string | null;
    mother: string | null;
    spouse: string | null;
    children: string[];
    given?: string;
    surname?: string;
    [key: string]: unknown;
}
export declare function detectGedcomXFormat(content: string, filename?: string): 'json' | 'xml' | null;
export declare function parseGedcomXFromJson(data: {
    persons?: unknown[];
    relationships?: unknown[];
    gedcomx?: {
        persons?: unknown[];
        relationships?: unknown[];
    };
}): GedcomxPerson[];
export declare function parseGedcomXFromXml(text: string): GedcomxPerson[];
export declare function buildGedcomFromPeople(people: GedcomxPerson[]): string;
export declare function convertGedcomXToGedcom(content: string, filename?: string): string | null;
