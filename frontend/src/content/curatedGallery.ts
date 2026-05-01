export interface CuratedGalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  archiveSource: string;
  location: string;
  year: string;
  imagePath: string;
  createdAt: string;
}

const createdAt = "2026-04-30T00:00:00.000Z";

function buildGalleryItem(
  sequence: string,
  title: string,
  description: string,
  category: string,
  imageFile = `roots-egypt-gallery-${sequence}.jpeg`,
): CuratedGalleryItem {
  return {
    id: `roots-egypt-gallery-${sequence}`,
    title,
    description,
    category,
    archiveSource: "Roots Egypt Photo Collection",
    location: "Egypt",
    year: "2026",
    imagePath: `/assets/gallery/${imageFile}`,
    createdAt,
  };
}

export const curatedGalleryItems: CuratedGalleryItem[] = [
  buildGalleryItem(
    "01",
    "Roots Egypt Family Memory I",
    "A preserved gallery image curated to reflect the personal memory, family continuity, and visual heritage at the heart of Roots Egypt.",
    "Family Memory",
  ),
  buildGalleryItem(
    "02",
    "Roots Egypt Family Memory II",
    "Part of the Roots Egypt visual collection, this image supports the platform's mission to keep Egyptian family stories visible and accessible.",
    "Family Memory",
  ),
  buildGalleryItem(
    "03",
    "Roots Egypt Portrait Study I",
    "An editorial portrait selection prepared for the public gallery to give the collection a warmer, more documentary presentation.",
    "Portrait Archive",
  ),
  buildGalleryItem(
    "04",
    "Roots Egypt Portrait Study II",
    "Integrated into the gallery as a visual record of heritage, identity, and the lived details that shape family history in Egypt.",
    "Portrait Archive",
  ),
  buildGalleryItem(
    "08",
    "Roots Egypt Documentary Frame II",
    "Prepared for display as part of the Roots Egypt gallery, with metadata and presentation aligned to the site's heritage-first experience.",
    "Documentary Frame",
  ),
  buildGalleryItem(
    "09",
    "Roots Egypt Heritage Portrait III",
    "A Roots Egypt visual entry curated to sit naturally beside family trees, books, and archival references across the platform.",
    "Roots Egypt Collection",
  ),
  buildGalleryItem(
    "10",
    "Roots Egypt Heritage Portrait IV",
    "Selected to strengthen the gallery with a more complete and polished Roots Egypt collection built around cultural memory.",
    "Roots Egypt Collection",
  ),
  buildGalleryItem(
    "11",
    "Roots Egypt Archive Glimpse I",
    "A small but meaningful gallery addition that supports the wider archival tone of the Roots Egypt experience.",
    "Archive Glimpse",
  ),
  buildGalleryItem(
    "12",
    "Roots Egypt Archive Glimpse II",
    "Included to give the public gallery more continuity and to present the supplied collection as a complete visual series.",
    "Archive Glimpse",
  ),
  buildGalleryItem(
    "13",
    "Roots Egypt Memory Collection XIII",
    "One of the newly integrated supplied images, presented with consistent metadata and a Roots Egypt-focused documentary tone.",
    "Memory Collection",
  ),
  buildGalleryItem(
    "14",
    "Roots Egypt Memory Collection XIV",
    "A curated image that expands the gallery beyond the original set and helps the public collection feel fuller and more balanced.",
    "Memory Collection",
  ),
  buildGalleryItem(
    "16",
    "Roots Egypt Memory Collection XVI",
    "The final image in the integrated sixteen-photo set, helping complete the Roots Egypt gallery as a polished public collection.",
    "Memory Collection",
  ),
  buildGalleryItem(
    "whatsapp-2026-03-19",
    "Roots Egypt Shared Memory",
    "A supplied image from the current photos folder, included so the public gallery reflects the exact available collection.",
    "Memory Collection",
    "roots-egypt-gallery-whatsapp-2026-03-19.jpeg",
  ),
];
