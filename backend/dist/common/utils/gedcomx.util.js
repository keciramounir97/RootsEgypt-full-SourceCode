"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectGedcomXFormat = detectGedcomXFormat;
exports.parseGedcomXFromJson = parseGedcomXFromJson;
exports.parseGedcomXFromXml = parseGedcomXFromXml;
exports.buildGedcomFromPeople = buildGedcomFromPeople;
exports.convertGedcomXToGedcom = convertGedcomXToGedcom;
const GEDCOM_X_COUPLE = 'http://gedcomx.org/Couple';
const GEDCOM_X_PARENT_CHILD = 'http://gedcomx.org/ParentChild';
const GEDCOM_X_BIRTH = 'http://gedcomx.org/Birth';
const GEDCOM_X_DEATH = 'http://gedcomx.org/Death';
const GEDCOM_X_MALE = 'http://gedcomx.org/Male';
const GEDCOM_X_FEMALE = 'http://gedcomx.org/Female';
const GEDCOM_X_GIVEN = 'http://gedcomx.org/Given';
const GEDCOM_X_SURNAME = 'http://gedcomx.org/Surname';
function normalizeSpaces(s) {
    return String(s !== null && s !== void 0 ? s : '').replace(/\s+/g, ' ').trim();
}
function splitName(raw) {
    const cleaned = normalizeSpaces(raw);
    if (!cleaned)
        return { full: '', given: '', surname: '' };
    const slashMatch = cleaned.match(/^(.*?)\/([^/]+)\/?(.*)$/);
    if (slashMatch) {
        const given = normalizeSpaces(slashMatch[1]);
        const surname = normalizeSpaces(slashMatch[2]);
        const suffix = normalizeSpaces(slashMatch[3]);
        const full = normalizeSpaces([given, surname, suffix].filter(Boolean).join(' '));
        return { full: full || cleaned.replace(/\//g, ' '), given, surname };
    }
    if (cleaned.includes(',')) {
        const [surnameRaw, givenRaw] = cleaned.split(',', 2);
        const surname = normalizeSpaces(surnameRaw);
        const given = normalizeSpaces(givenRaw);
        const full = normalizeSpaces([given, surname].filter(Boolean).join(' '));
        return { full: full || cleaned, given, surname };
    }
    const parts = cleaned.split(' ').filter(Boolean);
    if (parts.length > 1) {
        const surname = parts[parts.length - 1];
        const given = parts.slice(0, -1).join(' ');
        return { full: cleaned, given, surname };
    }
    return { full: cleaned, given: cleaned, surname: '' };
}
function uid() {
    return String(Date.now() + Math.floor(Math.random() * 10000));
}
function detectGedcomXFormat(content, filename) {
    var _a;
    const trimmed = String(content || '').trim();
    const ext = filename ? filename.toLowerCase().split('.').pop() : '';
    if (ext === 'json' || (trimmed.startsWith('{') && (trimmed.includes('"persons"') || trimmed.includes('"gedcomx"')))) {
        try {
            const data = JSON.parse(trimmed);
            const root = (_a = data === null || data === void 0 ? void 0 : data.gedcomx) !== null && _a !== void 0 ? _a : data;
            if (Array.isArray(root === null || root === void 0 ? void 0 : root.persons))
                return 'json';
        }
        catch (_b) {
        }
    }
    if (ext === 'xml' || ext === 'gedx' || (trimmed.startsWith('<?xml') && /Gedcomx|gedcomx|person\s+id=/i.test(trimmed))) {
        return 'xml';
    }
    return null;
}
function parseGedcomXFromJson(data) {
    var _a, _b, _c, _d, _e, _f, _g;
    const root = (_a = data === null || data === void 0 ? void 0 : data.gedcomx) !== null && _a !== void 0 ? _a : data;
    const persons = new Map();
    const list = Array.isArray(root === null || root === void 0 ? void 0 : root.persons) ? root.persons : [];
    for (const per of list) {
        const id = per.id != null ? String(per.id) : uid();
        let fullText = '';
        const names = per.names;
        if (Array.isArray(names) && names.length > 0) {
            const n = names[0];
            const forms = n === null || n === void 0 ? void 0 : n.nameForms;
            if (Array.isArray(forms) && forms[0]) {
                fullText = normalizeSpaces(forms[0].fullText || '');
                if (!fullText && Array.isArray(forms[0].parts)) {
                    const given = ((_b = forms[0].parts.find((x) => (x === null || x === void 0 ? void 0 : x.type) === GEDCOM_X_GIVEN)) === null || _b === void 0 ? void 0 : _b.value) || '';
                    const surname = ((_c = forms[0].parts.find((x) => (x === null || x === void 0 ? void 0 : x.type) === GEDCOM_X_SURNAME)) === null || _c === void 0 ? void 0 : _c.value) || '';
                    fullText = normalizeSpaces([given, surname].filter(Boolean).join(' '));
                }
            }
            if (!fullText && (n === null || n === void 0 ? void 0 : n.value))
                fullText = normalizeSpaces(n.value);
        }
        const genderType = ((_d = per.gender) === null || _d === void 0 ? void 0 : _d.type) || '';
        let gender = '';
        if (typeof genderType === 'string') {
            if (genderType.includes('Male') || genderType.endsWith('/M'))
                gender = 'M';
            else if (genderType.includes('Female') || genderType.endsWith('/F'))
                gender = 'F';
        }
        let birthYear = '';
        let birthPlace = '';
        let deathDate = '';
        let deathPlace = '';
        const facts = Array.isArray(per.facts) ? per.facts : [];
        for (const f of facts) {
            const type = (f.type || '').toLowerCase();
            const dateOrig = ((_e = f.date) === null || _e === void 0 ? void 0 : _e.original) != null ? String(f.date.original).trim() : '';
            const placeOrig = ((_f = f.place) === null || _f === void 0 ? void 0 : _f.original) != null ? String(f.place.original).trim() : (((_g = f.place) === null || _g === void 0 ? void 0 : _g.description) != null ? String(f.place.description) : '');
            if (type.includes('birth')) {
                birthYear = dateOrig || birthYear;
                birthPlace = placeOrig || birthPlace;
            }
            else if (type.includes('death')) {
                deathDate = dateOrig || deathDate;
                deathPlace = placeOrig || deathPlace;
            }
        }
        const parsed = splitName(fullText || 'Unknown');
        persons.set(id, {
            id,
            names: fullText ? { en: fullText } : {},
            gender,
            birthYear,
            birthPlace,
            deathDate,
            deathPlace,
            profession: '',
            archiveSource: '',
            documentCode: '',
            reliability: '',
            details: '',
            color: '',
            father: null,
            mother: null,
            spouse: null,
            children: [],
            given: parsed.given,
            surname: parsed.surname,
        });
    }
    const resolveId = (ref) => {
        if (!ref)
            return '';
        const r = ref.resource != null ? ref.resource : ref;
        const s = String(r);
        return s.startsWith('#') ? s.slice(1) : s;
    };
    const rels = Array.isArray(root === null || root === void 0 ? void 0 : root.relationships) ? root.relationships : [];
    for (const rel of rels) {
        const type = (rel.type || '').toString();
        const p1 = resolveId(rel.person1);
        const p2 = resolveId(rel.person2);
        if (!p1 || !p2 || !persons.has(p1) || !persons.has(p2))
            continue;
        if (type === GEDCOM_X_PARENT_CHILD || type.includes('ParentChild')) {
            const parent = p1;
            const child = p2;
            const childRec = persons.get(child);
            const parentRec = persons.get(parent);
            if (childRec && parentRec) {
                const g = String(parentRec.gender || '').toUpperCase();
                if (g.startsWith('M'))
                    childRec.father = parent;
                else if (g.startsWith('F'))
                    childRec.mother = parent;
                else {
                    if (!childRec.father)
                        childRec.father = parent;
                    else if (!childRec.mother)
                        childRec.mother = parent;
                }
                if (!parentRec.children.includes(child))
                    parentRec.children.push(child);
            }
        }
        else if (type === GEDCOM_X_COUPLE || type.includes('Couple')) {
            const a = persons.get(p1);
            const b = persons.get(p2);
            if (a && !a.spouse)
                a.spouse = p2;
            if (b && !b.spouse)
                b.spouse = p1;
        }
    }
    return Array.from(persons.values());
}
function parseGedcomXFromXml(text) {
    const str = String(text || '').trim();
    if (!str)
        return [];
    const persons = new Map();
    const personBlockRegex = /<(?:\w+:)?person\s+[^>]*id\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:\w+:)?person>/gi;
    let match;
    while ((match = personBlockRegex.exec(str)) !== null) {
        const id = match[1];
        const block = match[2];
        let fullText = '';
        const fullTextMatch = block.match(/<(?:\w+:)?fullText[^>]*>([\s\S]*?)<\/(?:\w+:)?fullText>/i);
        if (fullTextMatch)
            fullText = normalizeSpaces(fullTextMatch[1].replace(/<[^>]+>/g, ''));
        if (!fullText) {
            const partRegex = /<(?:\w+:)?part\s+[^>]*type\s*=\s*["'][^"']*Given[^"']*["'][^>]*>([\s\S]*?)<\/(?:\w+:)?part>/gi;
            const surnRegex = /<(?:\w+:)?part\s+[^>]*type\s*=\s*["'][^"']*Surname[^"']*["'][^>]*>([\s\S]*?)<\/(?:\w+:)?part>/gi;
            const g = partRegex.exec(block);
            const s = surnRegex.exec(block);
            const given = g ? normalizeSpaces(g[1].replace(/<[^>]+>/g, '')) : '';
            const surname = s ? normalizeSpaces(s[1].replace(/<[^>]+>/g, '')) : '';
            fullText = normalizeSpaces([given, surname].filter(Boolean).join(' '));
        }
        let gender = '';
        const genderMatch = block.match(/<(?:\w+:)?gender\s+[^>]*type\s*=\s*["'][^"']*([^"']+)["'][^>]*\/?>/i);
        if (genderMatch) {
            const t = genderMatch[1].toLowerCase();
            if (t.includes('male'))
                gender = 'M';
            else if (t.includes('female'))
                gender = 'F';
        }
        let birthYear = '';
        let birthPlace = '';
        let deathDate = '';
        let deathPlace = '';
        const factRegex = /<(?:\w+:)?fact\s+[^>]*type\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:\w+:)?fact>/gi;
        let factMatch;
        while ((factMatch = factRegex.exec(block)) !== null) {
            const type = factMatch[1].toLowerCase();
            const inner = factMatch[2];
            const dateMatch = inner.match(/<(?:\w+:)?date\s+[^>]*original\s*=\s*["']([^"']*)["'][^>]*\/?>/i) || inner.match(/<(?:\w+:)?date[^>]*>([\s\S]*?)<\/(?:\w+:)?date>/i);
            const placeMatch = inner.match(/<(?:\w+:)?place\s+[^>]*original\s*=\s*["']([^"']*)["'][^>]*\/?>/i) || inner.match(/<(?:\w+:)?place[^>]*>([\s\S]*?)<\/(?:\w+:)?place>/i);
            const dateOrig = dateMatch ? normalizeSpaces(dateMatch[1].replace(/<[^>]+>/g, '')) : '';
            const placeOrig = placeMatch ? normalizeSpaces(placeMatch[1].replace(/<[^>]+>/g, '')) : '';
            if (type.includes('birth')) {
                birthYear = dateOrig || birthYear;
                birthPlace = placeOrig || birthPlace;
            }
            else if (type.includes('death')) {
                deathDate = dateOrig || deathDate;
                deathPlace = placeOrig || deathPlace;
            }
        }
        const parsed = splitName(fullText || 'Unknown');
        persons.set(id, {
            id,
            names: fullText ? { en: fullText } : {},
            gender,
            birthYear,
            birthPlace,
            deathDate,
            deathPlace,
            profession: '',
            archiveSource: '',
            documentCode: '',
            reliability: '',
            details: '',
            color: '',
            father: null,
            mother: null,
            spouse: null,
            children: [],
            given: parsed.given,
            surname: parsed.surname,
        });
    }
    const relRegex = /<(?:\w+:)?relationship\s+[^>]*type\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/(?:\w+:)?relationship>/gi;
    while ((match = relRegex.exec(str)) !== null) {
        const type = match[1];
        const inner = match[2];
        const p1Match = inner.match(/<(?:\w+:)?person1\s+[^>]*resource\s*=\s*["']#?([^"']*)["'][^>]*\/?>/i);
        const p2Match = inner.match(/<(?:\w+:)?person2\s+[^>]*resource\s*=\s*["']#?([^"']*)["'][^>]*\/?>/i);
        const p1 = p1Match ? p1Match[1].trim() : '';
        const p2 = p2Match ? p2Match[1].trim() : '';
        if (!p1 || !p2 || !persons.has(p1) || !persons.has(p2))
            continue;
        if (type === GEDCOM_X_PARENT_CHILD || type.includes('ParentChild')) {
            const parent = p1;
            const child = p2;
            const childRec = persons.get(child);
            const parentRec = persons.get(parent);
            if (childRec && parentRec) {
                const g = String(parentRec.gender || '').toUpperCase();
                if (g.startsWith('M'))
                    childRec.father = parent;
                else if (g.startsWith('F'))
                    childRec.mother = parent;
                else {
                    if (!childRec.father)
                        childRec.father = parent;
                    else if (!childRec.mother)
                        childRec.mother = parent;
                }
                if (!parentRec.children.includes(child))
                    parentRec.children.push(child);
            }
        }
        else if (type === GEDCOM_X_COUPLE || type.includes('Couple')) {
            const a = persons.get(p1);
            const b = persons.get(p2);
            if (a && !a.spouse)
                a.spouse = p2;
            if (b && !b.spouse)
                b.spouse = p1;
        }
    }
    return Array.from(persons.values());
}
function buildGedcomFromPeople(people) {
    const t = (_key, fallback) => fallback;
    const byId = new Map();
    for (const p of people)
        byId.set(String(p.id), p);
    const idMap = new Map();
    let indiIndex = 1;
    for (const p of people)
        idMap.set(String(p.id), `@I${indiIndex++}@`);
    const families = new Map();
    const pairIndex = new Map();
    let famIndex = 1;
    const ensureFamily = (key) => {
        if (!families.has(key)) {
            families.set(key, { id: `@F${famIndex++}@`, husbId: '', wifeId: '', children: [] });
        }
        return families.get(key);
    };
    const pairKey = (a, b) => (a && b ? [a, b].sort().join('|') : null);
    const parentKey = (fatherId, motherId) => `P:${fatherId}|${motherId}`;
    const spouseKey = (a, b) => `S:${[a, b].sort().join('|')}`;
    const famcByPerson = new Map();
    const famsByPerson = new Map();
    const addFams = (pid, fid) => {
        if (!pid || !fid)
            return;
        if (!famsByPerson.has(pid))
            famsByPerson.set(pid, new Set());
        famsByPerson.get(pid).add(fid);
    };
    const resolveSpouseRoles = (aId, bId) => {
        const pa = byId.get(aId);
        const pb = byId.get(bId);
        const ag = String((pa === null || pa === void 0 ? void 0 : pa.gender) || '').toUpperCase();
        const bg = String((pb === null || pb === void 0 ? void 0 : pb.gender) || '').toUpperCase();
        if (ag.startsWith('F') && bg.startsWith('M'))
            return { husbId: bId, wifeId: aId };
        if (ag.startsWith('M') && bg.startsWith('F'))
            return { husbId: aId, wifeId: bId };
        const sorted = [aId, bId].sort();
        return { husbId: sorted[0], wifeId: sorted[1] };
    };
    for (const p of people) {
        const fatherId = p.father ? String(p.father) : '';
        const motherId = p.mother ? String(p.mother) : '';
        if (!fatherId && !motherId)
            continue;
        const key = parentKey(fatherId, motherId);
        let fam = pairKey(fatherId, motherId) && pairIndex.get(pairKey(fatherId, motherId))
            ? families.get(pairIndex.get(pairKey(fatherId, motherId)))
            : null;
        if (!fam) {
            fam = ensureFamily(key);
            if (pairKey(fatherId, motherId))
                pairIndex.set(pairKey(fatherId, motherId), key);
        }
        if (fatherId && idMap.has(fatherId))
            fam.husbId = fam.husbId || fatherId;
        if (motherId && idMap.has(motherId))
            fam.wifeId = fam.wifeId || motherId;
        const childId = String(p.id);
        if (idMap.has(childId) && !fam.children.includes(childId))
            fam.children.push(childId);
        famcByPerson.set(childId, fam.id);
        if (fatherId)
            addFams(fatherId, fam.id);
        if (motherId)
            addFams(motherId, fam.id);
    }
    for (const p of people) {
        const pid = String(p.id);
        const ch = Array.isArray(p.children) ? p.children : [];
        for (const childIdRaw of ch) {
            const childId = String(childIdRaw);
            if (!childId || !idMap.has(childId))
                continue;
            const spouseId = p.spouse ? String(p.spouse) : '';
            let husbId = '';
            let wifeId = '';
            if (spouseId) {
                const roles = resolveSpouseRoles(pid, spouseId);
                husbId = roles.husbId;
                wifeId = roles.wifeId;
            }
            else {
                const g = String(p.gender || '').toUpperCase();
                if (g.startsWith('F'))
                    wifeId = pid;
                else
                    husbId = pid;
            }
            const key = parentKey(husbId || pid, wifeId || spouseId);
            let fam = pairKey(husbId || pid, wifeId || spouseId) && pairIndex.get(pairKey(husbId || pid, wifeId || spouseId))
                ? families.get(pairIndex.get(pairKey(husbId || pid, wifeId || spouseId)))
                : null;
            if (!fam) {
                fam = ensureFamily(key);
                if (pairKey(husbId || pid, wifeId || spouseId))
                    pairIndex.set(pairKey(husbId || pid, wifeId || spouseId), key);
            }
            if (husbId && idMap.has(husbId))
                fam.husbId = fam.husbId || husbId;
            if (wifeId && idMap.has(wifeId))
                fam.wifeId = fam.wifeId || wifeId;
            if (!fam.children.includes(childId))
                fam.children.push(childId);
            famcByPerson.set(childId, fam.id);
            if (husbId)
                addFams(husbId, fam.id);
            if (wifeId)
                addFams(wifeId, fam.id);
        }
    }
    for (const p of people) {
        if (!p.spouse)
            continue;
        const a = String(p.id);
        const b = String(p.spouse);
        if (!idMap.has(a) || !idMap.has(b))
            continue;
        const roles = resolveSpouseRoles(a, b);
        const key = spouseKey(a, b);
        let fam = families.get(pairIndex.get(key) || key);
        if (!fam) {
            fam = ensureFamily(key);
            pairIndex.set(key, key);
        }
        if (!fam.husbId && !fam.wifeId) {
            fam.husbId = roles.husbId;
            fam.wifeId = roles.wifeId;
        }
        addFams(a, fam.id);
        addFams(b, fam.id);
    }
    const lines = [];
    lines.push('0 HEAD');
    lines.push('1 SOUR RootsMaghreb');
    lines.push('1 GEDC');
    lines.push('2 VERS 5.5.1');
    lines.push('2 FORM LINEAGE-LINKED');
    lines.push('1 CHAR UTF-8');
    for (const p of people) {
        const pid = String(p.id);
        const indiId = idMap.get(pid);
        if (!indiId)
            continue;
        lines.push(`0 ${indiId} INDI`);
        const raw = normalizeSpaces((p.names && p.names.en) || [p.given, p.surname].filter(Boolean).join(' ') || 'Unknown');
        const nameParts = (p.given || p.surname) ? { full: raw, given: String(p.given || ''), surname: String(p.surname || '') } : splitName(raw);
        const nameLine = nameParts.surname ? `${nameParts.given} /${nameParts.surname}/`.trim() : nameParts.full;
        lines.push(`1 NAME ${nameLine || t('unknown', 'Unknown')}`);
        if (nameParts.given)
            lines.push(`1 GIVN ${nameParts.given}`);
        if (nameParts.surname)
            lines.push(`1 SURN ${nameParts.surname}`);
        if (p.gender)
            lines.push(`1 SEX ${String(p.gender).slice(0, 1)}`);
        if (p.birthYear || p.birthPlace) {
            lines.push('1 BIRT');
            if (p.birthYear)
                lines.push(`2 DATE ${String(p.birthYear)}`);
            if (p.birthPlace)
                lines.push(`2 PLAC ${String(p.birthPlace)}`);
        }
        if (p.deathDate || p.deathPlace) {
            lines.push('1 DEAT');
            if (p.deathDate)
                lines.push(`2 DATE ${p.deathDate}`);
            if (p.deathPlace)
                lines.push(`2 PLAC ${String(p.deathPlace)}`);
        }
        const famc = famcByPerson.get(pid);
        if (famc)
            lines.push(`1 FAMC ${famc}`);
        const fams = famsByPerson.get(pid);
        if (fams && fams.size) {
            for (const famId of Array.from(fams).sort())
                lines.push(`1 FAMS ${famId}`);
        }
    }
    for (const fam of families.values()) {
        lines.push(`0 ${fam.id} FAM`);
        if (fam.husbId && idMap.has(fam.husbId))
            lines.push(`1 HUSB ${idMap.get(fam.husbId)}`);
        if (fam.wifeId && idMap.has(fam.wifeId))
            lines.push(`1 WIFE ${idMap.get(fam.wifeId)}`);
        for (const childId of fam.children) {
            if (idMap.has(childId))
                lines.push(`1 CHIL ${idMap.get(childId)}`);
        }
    }
    lines.push('0 TRLR');
    return `${lines.join('\r\n')}\r\n`;
}
function convertGedcomXToGedcom(content, filename) {
    const format = detectGedcomXFormat(content, filename);
    if (!format)
        return null;
    let people;
    if (format === 'json') {
        try {
            const data = JSON.parse(content);
            people = parseGedcomXFromJson(data);
        }
        catch (_a) {
            return null;
        }
    }
    else {
        people = parseGedcomXFromXml(content);
    }
    if (!people.length)
        return null;
    return buildGedcomFromPeople(people);
}
//# sourceMappingURL=gedcomx.util.js.map