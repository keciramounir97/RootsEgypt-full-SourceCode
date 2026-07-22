import { Injectable, Inject, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { ActivityService } from '../activity/activity.service';
import { UpdateLegalDocumentDto, LEGAL_SLUGS, LEGAL_LOCALES } from './dto/legal.dto';

type LegalSection = { heading: string; body: string };

type LegalDocument = {
    slug: string;
    locale: string;
    title: string;
    intro: string;
    sections: LegalSection[];
    updatedAt?: string;
    translated?: boolean;
};

const SEED_DOCUMENTS: Record<(typeof LEGAL_SLUGS)[number], { title: string; intro: string; sections: LegalSection[] }> = {
    terms: {
        title: 'Terms of Service',
        intro:
            'These Terms of Service ("Terms") govern your access to and use of Roots Egypt. By creating an account or using our services, you agree to these Terms.',
        sections: [
            {
                heading: '1. Acceptance of Terms',
                body: 'By accessing or using Roots Egypt, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, please discontinue use of the service.',
            },
            {
                heading: '2. Eligibility & Accounts',
                body: 'You must be at least 16 years old to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.',
            },
            {
                heading: '3. User-Generated Content & Intellectual Property',
                body: 'You retain ownership of family trees, documents, photographs, and narratives you upload. By submitting content, you grant Roots Egypt a limited, non-exclusive license to host, display, and process that content solely to provide the service to you and, where you choose to share it, to other users you designate.',
            },
            {
                heading: '4. Acceptable Use',
                body: 'You agree not to upload unlawful, infringing, or harmful content, misrepresent your identity, attempt to breach system security, or use the service to harass or defame others. We may suspend or terminate accounts that violate this policy.',
            },
            {
                heading: '5. Subscriptions & Payments',
                body: 'Certain features may require a paid subscription. Fees, billing cycles, and cancellation terms are disclosed at the point of purchase. Except where required by EU consumer-protection law (which grants a statutory withdrawal period for online purchases) or other applicable law, fees are non-refundable once a billing period has started.',
            },
            {
                heading: '6. Accuracy of Genealogical Information',
                body: 'Roots Egypt provides research tools and archival access but cannot guarantee the completeness or accuracy of user-submitted data, third-party archives, or historical records. Genealogical conclusions are provided for informational purposes only.',
            },
            {
                heading: '7. Limitation of Liability',
                body: 'To the maximum extent permitted by law, Roots Egypt and its affiliates are not liable for indirect, incidental, or consequential damages arising from your use of the service. Nothing in these Terms limits liability that cannot be excluded under applicable law, including certain consumer protections in the EU/EEA and US states.',
            },
            {
                heading: '8. Indemnification',
                body: 'You agree to indemnify and hold Roots Egypt harmless from claims arising out of your breach of these Terms or misuse of the service, to the extent permitted by applicable law.',
            },
            {
                heading: '9. Governing Law & Dispute Resolution',
                body: 'These Terms are governed by the laws applicable in your place of residence for consumer-protection purposes; otherwise, by the governing law designated in your service agreement. EU/EEA and UK residents retain any mandatory rights under local consumer law, including access to local courts or applicable ODR platforms. US residents may be subject to additional state-specific consumer arbitration disclosures where applicable.',
            },
            {
                heading: '10. Changes to These Terms',
                body: 'We may update these Terms from time to time. Material changes will be communicated via the service or by email, and continued use after the effective date constitutes acceptance of the revised Terms.',
            },
            {
                heading: '11. Contact Us',
                body: 'Questions about these Terms can be directed to our support team through the Contact page.',
            },
        ],
    },
    privacy: {
        title: 'Privacy Policy',
        intro:
            'This Privacy Policy explains how Roots Egypt collects, uses, shares, and protects your personal data, and describes your rights under applicable data protection laws, including the EU General Data Protection Regulation (GDPR) and US state privacy laws such as the California Consumer Privacy Act (CCPA/CPRA).',
        sections: [
            {
                heading: '1. Scope',
                body: 'This policy applies to personal data processed when you use Roots Egypt\'s website, admin panel, and related services, regardless of where you access them from.',
            },
            {
                heading: '2. Data We Collect',
                body: 'We collect information you provide directly (name, email, phone number, family tree and genealogical data, uploaded documents/photos), information generated by your use of the service (activity logs, preferences), and limited technical data (IP address, device/browser information) needed to operate the service securely.',
            },
            {
                heading: '3. How We Use Your Data',
                body: 'We process your data to provide and improve the service, authenticate accounts, communicate with you, and comply with legal obligations. Under GDPR, our legal bases include performance of a contract, legitimate interests, consent (e.g. for optional communications), and legal compliance.',
            },
            {
                heading: '4. Sharing & Disclosure',
                body: 'We do not sell your personal data. We may share data with service providers who process it on our behalf (e.g. hosting, email delivery) under contractual confidentiality obligations, with other users you explicitly choose to share family tree content with, or where required by law.',
            },
            {
                heading: '5. International Data Transfers',
                body: 'Where data is transferred outside your jurisdiction (for example, to hosting infrastructure in another country), we rely on appropriate safeguards such as standard contractual clauses or equivalent mechanisms recognized under GDPR and comparable frameworks.',
            },
            {
                heading: '6. Data Retention',
                body: 'We retain personal data for as long as your account is active or as needed to provide the service, comply with legal obligations, resolve disputes, and enforce agreements. You may request deletion of your account and associated data at any time, subject to legal retention requirements.',
            },
            {
                heading: '7. Your Rights (EU/EEA/UK Residents)',
                body: 'If you are located in the EU/EEA or UK, you have the right to access, rectify, erase, or restrict processing of your personal data, the right to data portability, the right to object to processing based on legitimate interests, the right to withdraw consent at any time, and the right to lodge a complaint with your local data protection supervisory authority.',
            },
            {
                heading: '8. Your Rights (US State Residents)',
                body: 'If you are a resident of California or another US state with a comprehensive privacy law, you have the right to know what personal information we collect, request deletion or correction of your data, opt out of the sale or sharing of personal information (we do not sell personal data), limit the use of sensitive personal information, and not be discriminated against for exercising these rights. You may exercise these rights yourself or through an authorized agent.',
            },
            {
                heading: '9. Cookies & Tracking Technologies',
                body: 'We use cookies and similar technologies as described in our Cookie Policy, which forms part of this Privacy Policy.',
            },
            {
                heading: '10. Children\'s Privacy',
                body: 'Roots Egypt is not directed at children under 16, and we do not knowingly collect personal data from children without appropriate parental consent where required by law.',
            },
            {
                heading: '11. Data Security',
                body: 'We implement technical and organizational measures designed to protect personal data against unauthorized access, alteration, disclosure, or destruction, appropriate to the sensitivity of the data involved.',
            },
            {
                heading: '12. Changes to This Policy',
                body: 'We may update this Privacy Policy periodically. Material changes will be communicated through the service or by email prior to taking effect.',
            },
            {
                heading: '13. Contact Us',
                body: 'For privacy-related questions or to exercise your rights, please contact us through the Contact page.',
            },
        ],
    },
    cookies: {
        title: 'Cookie Policy',
        intro:
            'This Cookie Policy explains how Roots Egypt uses cookies and similar technologies, and the choices available to you under applicable EU ePrivacy/GDPR rules and US state privacy laws.',
        sections: [
            {
                heading: '1. What Are Cookies',
                body: 'Cookies are small text files stored on your device by your web browser. They help websites remember your preferences, keep you signed in, and understand how the site is used.',
            },
            {
                heading: '2. Types of Cookies We Use',
                body: 'Essential cookies are required for authentication and core site functionality and cannot be disabled. Preference cookies remember your language and theme settings. Analytics cookies help us understand usage patterns to improve the service. We do not use cookies for third-party advertising.',
            },
            {
                heading: '3. Consent (EU/EEA/UK Visitors)',
                body: 'Where required by the ePrivacy Directive and GDPR, non-essential cookies are only set after you provide consent through our cookie banner. You can withdraw consent at any time by adjusting your preferences or browser settings.',
            },
            {
                heading: '4. Opt-Out Signals (US Visitors)',
                body: 'We honor recognized opt-out preference signals, such as the Global Privacy Control, where legally required, as an exercise of your right to opt out of the sale or sharing of personal information under applicable US state laws.',
            },
            {
                heading: '5. Managing Cookies',
                body: 'Most browsers let you control or delete cookies through their settings. Disabling non-essential cookies will not affect core functionality, but disabling essential cookies may prevent sign-in and other features from working correctly.',
            },
            {
                heading: '6. Third-Party Cookies',
                body: 'Some features may rely on third-party service providers (e.g. infrastructure or analytics partners) that set their own cookies subject to their respective privacy policies.',
            },
            {
                heading: '7. Changes to This Policy',
                body: 'We may update this Cookie Policy from time to time to reflect changes in technology or applicable law. The "last updated" date on this page reflects the most recent revision.',
            },
        ],
    },
};

@Injectable()
export class LegalService implements OnModuleInit {
    constructor(
        @Inject('KnexConnection') private readonly knex,
        private readonly activityService: ActivityService,
    ) { }

    async onModuleInit() {
        try {
            await this.ensureSchema();
            await this.seedDefaults();
        } catch (err: any) {
            console.warn(`Legal schema init skipped: ${err?.message || err}`);
        }
    }

    private async ensureSchema() {
        if (!(await this.knex.schema.hasTable('legal_documents'))) {
            await this.knex.schema.createTable('legal_documents', (table) => {
                table.increments('id').primary();
                table.string('slug', 40).notNullable();
                table.string('locale', 5).notNullable();
                table.string('title', 255).notNullable();
                table.text('intro').nullable();
                table.text('sections').notNullable();
                table.integer('updated_by').nullable();
                table.dateTime('updated_at').defaultTo(this.knex.fn.now());
                table.unique(['slug', 'locale']);
            });
        }
    }

    private async seedDefaults() {
        for (const slug of LEGAL_SLUGS) {
            const existing = await this.knex('legal_documents').where({ slug, locale: 'en' }).first();
            if (existing) continue;
            const seed = SEED_DOCUMENTS[slug];
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
            await this.knex('legal_documents').insert({
                slug,
                locale: 'en',
                title: seed.title,
                intro: seed.intro,
                sections: JSON.stringify(seed.sections),
                updated_at: now,
            });
        }
    }

    private formatDocument(row: any, translated = true): LegalDocument {
        let sections: LegalSection[] = [];
        try {
            sections = JSON.parse(row.sections || '[]');
        } catch {
            sections = [];
        }
        return {
            slug: row.slug,
            locale: row.locale,
            title: row.title,
            intro: row.intro || '',
            sections,
            updatedAt: row.updated_at,
            translated,
        };
    }

    private assertValidSlug(slug: string) {
        if (!LEGAL_SLUGS.includes(slug as any)) {
            throw new BadRequestException(`Unknown legal document: ${slug}`);
        }
    }

    async listDocuments() {
        return LEGAL_SLUGS.map((slug) => ({ slug, title: SEED_DOCUMENTS[slug].title }));
    }

    async getPublicDocument(slug: string, locale?: string) {
        this.assertValidSlug(slug);
        const normalizedLocale = LEGAL_LOCALES.includes(locale as any) ? locale : 'en';

        let row = await this.knex('legal_documents').where({ slug, locale: normalizedLocale }).first();
        if (!row && normalizedLocale !== 'en') {
            row = await this.knex('legal_documents').where({ slug, locale: 'en' }).first();
        }
        if (!row) throw new NotFoundException('Legal document not found');
        return this.formatDocument(row, row.locale === normalizedLocale);
    }

    async getAdminDocument(slug: string, locale?: string) {
        this.assertValidSlug(slug);
        const normalizedLocale = LEGAL_LOCALES.includes(locale as any) ? locale : 'en';

        const row = await this.knex('legal_documents').where({ slug, locale: normalizedLocale }).first();
        if (row) return this.formatDocument(row, true);

        // No translation saved yet for this locale — return the English version as a starting
        // point so the super admin can translate from it, flagged as not-yet-translated.
        const fallback = await this.knex('legal_documents').where({ slug, locale: 'en' }).first();
        if (!fallback) throw new NotFoundException('Legal document not found');
        return this.formatDocument({ ...fallback, locale: normalizedLocale }, false);
    }

    async updateDocument(slug: string, dto: UpdateLegalDocumentDto, actorId: number) {
        this.assertValidSlug(slug);
        const locale = LEGAL_LOCALES.includes(dto.locale as any) ? dto.locale! : 'en';

        const existing = await this.knex('legal_documents').where({ slug, locale }).first();
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        const payload = {
            title: dto.title ?? existing?.title ?? SEED_DOCUMENTS[slug as keyof typeof SEED_DOCUMENTS].title,
            intro: dto.intro ?? existing?.intro ?? '',
            sections: JSON.stringify(dto.sections ?? (existing ? JSON.parse(existing.sections || '[]') : [])),
            updated_by: actorId,
            updated_at: now,
        };

        if (existing) {
            await this.knex('legal_documents').where({ slug, locale }).update(payload);
        } else {
            await this.knex('legal_documents').insert({ slug, locale, ...payload });
        }

        await this.activityService.log(actorId, 'legal', `Updated ${slug} (${locale}) legal document`);
        return this.getAdminDocument(slug, locale);
    }
}
