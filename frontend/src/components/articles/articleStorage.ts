/** Client-side article feed persistence (v2) with migration from v1. */

export const ART_KEY_V1 = "rootsegypt_articles_v1";
export const ART_KEY = "rootsegypt_articles_v2";
export const CMT_KEY_V1 = "rootsegypt_article_comments_v1";
export const CMT_KEY = "rootsegypt_article_comments_v2";
export const LIKE_CNT_KEY = "rootsegypt_article_like_counts_v1";
export const LIKE_MINE_KEY = "rootsegypt_article_like_mine_v1";
export const CMT_LIKE_CNT_KEY = "rootsegypt_comment_like_counts_v1";
export const CMT_LIKE_MINE_KEY = "rootsegypt_comment_like_mine_v1";
export const SHARE_CNT_KEY = "rootsegypt_article_share_counts_v1";

export interface ArticlePost {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorId?: number;
  roleLabel: string;
  createdAt: number;
  coverImage?: string | null;
  categories: string[];
}

export interface ArticleComment {
  id: string;
  articleId: string;
  authorName: string;
  authorId?: number;
  body: string;
  createdAt: number;
  parentId?: string | null;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const p = JSON.parse(raw) as T;
    return p ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadArticles(): ArticlePost[] {
  let list = safeParse<ArticlePost[]>(localStorage.getItem(ART_KEY), []);
  if (list.length === 0) {
    const v1 = safeParse<unknown[]>(localStorage.getItem(ART_KEY_V1), []);
    if (Array.isArray(v1) && v1.length) {
      list = v1.map((row: unknown) => {
        const r = row as ArticlePost & { categories?: string[] };
        return {
          ...r,
          categories: Array.isArray(r.categories) ? r.categories : [],
          coverImage: r.coverImage ?? null,
        };
      });
      saveArticles(list);
    }
  }
  if (!Array.isArray(list)) return [];
  return list.map((a) => ({
    ...a,
    categories: Array.isArray(a.categories) ? a.categories : [],
  }));
}

export function saveArticles(a: ArticlePost[]) {
  try {
    localStorage.setItem(ART_KEY, JSON.stringify(a.slice(0, 100)));
  } catch {
    /* ignore */
  }
}

export function loadComments(): ArticleComment[] {
  let list = safeParse<ArticleComment[]>(localStorage.getItem(CMT_KEY), []);
  if (list.length === 0) {
    const v1 = safeParse<ArticleComment[]>(localStorage.getItem(CMT_KEY_V1), []);
    if (Array.isArray(v1) && v1.length) {
      list = v1.map((c) => ({ ...c, parentId: c.parentId ?? null }));
      saveComments(list);
    }
  }
  return Array.isArray(list) ? list : [];
}

export function saveComments(c: ArticleComment[]) {
  try {
    localStorage.setItem(CMT_KEY, JSON.stringify(c.slice(0, 800)));
  } catch {
    /* ignore */
  }
}

export function loadLikeCounts(): Record<string, number> {
  return safeParse<Record<string, number>>(localStorage.getItem(LIKE_CNT_KEY), {});
}

export function saveLikeCounts(m: Record<string, number>) {
  try {
    localStorage.setItem(LIKE_CNT_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function loadLikeMine(): Record<string, boolean> {
  return safeParse<Record<string, boolean>>(localStorage.getItem(LIKE_MINE_KEY), {});
}

export function saveLikeMine(m: Record<string, boolean>) {
  try {
    localStorage.setItem(LIKE_MINE_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function loadCommentLikeCounts(): Record<string, number> {
  return safeParse<Record<string, number>>(localStorage.getItem(CMT_LIKE_CNT_KEY), {});
}

export function saveCommentLikeCounts(m: Record<string, number>) {
  try {
    localStorage.setItem(CMT_LIKE_CNT_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function loadCommentLikeMine(): Record<string, boolean> {
  return safeParse<Record<string, boolean>>(localStorage.getItem(CMT_LIKE_MINE_KEY), {});
}

export function saveCommentLikeMine(m: Record<string, boolean>) {
  try {
    localStorage.setItem(CMT_LIKE_MINE_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function loadShareCounts(): Record<string, number> {
  return safeParse<Record<string, number>>(localStorage.getItem(SHARE_CNT_KEY), {});
}

export function saveShareCounts(m: Record<string, number>) {
  try {
    localStorage.setItem(SHARE_CNT_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export const EGYPTIAN_CATEGORIES: { id: string; label: string; color: string }[] = [
  { id: "pharaonic", label: "Pharaonic", color: "#c9a227" },
  { id: "coptic", label: "Coptic", color: "#5c7cfa" },
  { id: "islamic", label: "Islamic Heritage", color: "#2d6a4f" },
  { id: "nubia", label: "Nubia", color: "#9b59b6" },
  { id: "alexandria", label: "Alexandria", color: "#1e6091" },
  { id: "genealogy", label: "Genealogy", color: "#c45c3e" },
  { id: "modern", label: "Modern Egypt", color: "#0f766e" },
  { id: "archives", label: "Archives & Records", color: "#8b7355" },
];

export function categoryStyle(id: string): { bg: string; text: string } {
  const c = EGYPTIAN_CATEGORIES.find((x) => x.id === id);
  if (!c) return { bg: "rgba(12, 74, 110, 0.15)", text: "#0c4a6e" };
  return { bg: `${c.color}22`, text: c.color };
}
