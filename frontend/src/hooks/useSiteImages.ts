import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { getApiRoot } from "../api/helpers";

const heroBackground = "/assets/egypt-bg.jpeg";
const fondBackground = "/assets/roots-page-bg.jpg";

export type SiteImageRecord = {
  id: number;
  imagePath: string;
  sortOrder?: number;
  title?: string | null;
  caption?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type SiteImageSettings = {
  heroUseDefault: boolean;
  backgroundUseDefault: boolean;
  heroImages: SiteImageRecord[];
  backgroundImages: SiteImageRecord[];
  backgroundImage: SiteImageRecord | null;
};

const DEFAULT_SITE_IMAGES: SiteImageSettings = {
  heroUseDefault: true,
  backgroundUseDefault: true,
  heroImages: [],
  backgroundImages: [],
  backgroundImage: null,
};

const unwrapSiteImages = (payload: unknown): SiteImageSettings => {
  const data = payload as Partial<SiteImageSettings> | undefined;
  const backgroundImages = Array.isArray(data?.backgroundImages)
    ? data.backgroundImages
    : data?.backgroundImage
      ? [data.backgroundImage]
      : [];
  return {
    heroUseDefault:
      typeof data?.heroUseDefault === "boolean"
        ? data.heroUseDefault
        : DEFAULT_SITE_IMAGES.heroUseDefault,
    backgroundUseDefault:
      typeof data?.backgroundUseDefault === "boolean"
        ? data.backgroundUseDefault
        : DEFAULT_SITE_IMAGES.backgroundUseDefault,
    heroImages: Array.isArray(data?.heroImages) ? data.heroImages : [],
    backgroundImages,
    backgroundImage:
      data?.backgroundImage ||
      backgroundImages[backgroundImages.length - 1] ||
      null,
  };
};

export const resolveSiteImageUrl = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("blob:")
  ) {
    return raw;
  }
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  if (path.startsWith("/uploads/")) {
    return `${getApiRoot().replace(/\/+$/, "")}${path}`;
  }
  return raw;
};

export function useSiteImages() {
  const [settings, setSettings] =
    useState<SiteImageSettings>(DEFAULT_SITE_IMAGES);
  const [loading, setLoading] = useState(true);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [backgroundSlideIndex, setBackgroundSlideIndex] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/site-images");
      setSettings(unwrapSiteImages(data));
    } catch {
      setSettings(DEFAULT_SITE_IMAGES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const heroSlides = useMemo(() => {
    const uploaded = settings.heroImages
      .map((image) => resolveSiteImageUrl(image.imagePath))
      .filter(Boolean);
    const slides = settings.heroUseDefault
      ? [heroBackground, ...uploaded]
      : uploaded;
    return slides.length ? slides : [heroBackground];
  }, [settings.heroImages, settings.heroUseDefault]);

  useEffect(() => {
    setHeroSlideIndex(0);
    if (heroSlides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroSlides]);

  const backgroundSlides = useMemo(() => {
    const uploaded = settings.backgroundImages
      .map((image) => resolveSiteImageUrl(image.imagePath))
      .filter(Boolean);
    const slides = settings.backgroundUseDefault
      ? [fondBackground, ...uploaded]
      : uploaded;
    return slides.length ? slides : [fondBackground];
  }, [settings.backgroundImages, settings.backgroundUseDefault]);

  useEffect(() => {
    setBackgroundSlideIndex(0);
    if (backgroundSlides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setBackgroundSlideIndex(
        (current) => (current + 1) % backgroundSlides.length,
      );
    }, 5000);
    return () => window.clearInterval(timer);
  }, [backgroundSlides]);

  return {
    loading,
    settings,
    heroSlides,
    heroImage: heroSlides[heroSlideIndex % heroSlides.length] || heroBackground,
    backgroundSlides,
    backgroundImage:
      backgroundSlides[backgroundSlideIndex % backgroundSlides.length] ||
      fondBackground,
    refresh,
  };
}
