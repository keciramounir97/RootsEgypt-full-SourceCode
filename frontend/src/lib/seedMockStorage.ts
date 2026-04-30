/**
 * Seeds localStorage with mock articles, comments, like/share counts,
 * and audio tracks for Egyptian heritage content.
 * Runs once per version key — bump SEED_VERSION_KEY to force re-seed.
 */
import {
  ART_KEY,
  CMT_KEY,
  LIKE_CNT_KEY,
  SHARE_CNT_KEY,
  saveArticles,
  saveComments,
  saveLikeCounts,
  saveShareCounts,
} from "../components/articles/articleStorage";
import {
  MOCK_ARTICLES,
  MOCK_ARTICLE_COMMENTS,
  MOCK_ARTICLE_LIKE_COUNTS,
  MOCK_ARTICLE_SHARE_COUNTS,
} from "./mockData";

// ── Audio storage key (must match audio.tsx) ──────────────────────────
const AUDIO_STORAGE_KEY = "rootsegypt_audio_library_v2";

// ── Bump this to force re-seed on next load ───────────────────────────
const SEED_VERSION_KEY = "rootsegypt_mock_seed_v5";

// ── Minimal silent WAV data URL (0.1 s, mono, 8-kHz, 8-bit) ─────────
// The audio element accepts it, sets src, and fires "ended" instantly.
// This gives tracks a presence in the UI without bundling real audio.
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

const COVER_COLORS = [
  "from-teal to-[#0c4a6e]",
  "from-[#d4a843] to-[#8b6914]",
  "from-[#c45c3e] to-[#7a2d1a]",
  "from-[#6366f1] to-[#4338ca]",
  "from-[#ec4899] to-[#be185d]",
  "from-[#10b981] to-[#047857]",
  "from-[#f59e0b] to-[#b45309]",
  "from-[#8b5cf6] to-[#6d28d9]",
];

function pickColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

const MOCK_AUDIO_TRACKS = [
  {
    id: "mock-audio-001",
    title: "Quran Recitation — Surah Al-Fatiha",
    artist: "Sheikh Mahmoud Khalil Al-Husary",
    genre: "Recitation",
    isVerified: true,
    playCount: 4821,
    createdAt: Date.now() - 30 * 86400 * 1000,
  },
  {
    id: "mock-audio-002",
    title: "Poem of the Nile — Ancient Egyptian Ode",
    artist: "Dr. Amr Fouad Al-Said",
    genre: "Poetry",
    isVerified: true,
    playCount: 1234,
    createdAt: Date.now() - 28 * 86400 * 1000,
  },
  {
    id: "mock-audio-003",
    title: "Nubian Elder on Displacement — Interview 1978",
    artist: "Nubian Documentation Project",
    genre: "Interview",
    isVerified: true,
    playCount: 3102,
    createdAt: Date.now() - 25 * 86400 * 1000,
  },
  {
    id: "mock-audio-004",
    title: "Maqam Rast — Egyptian Classical Composition",
    artist: "Cairo Conservatory Ensemble",
    genre: "Music",
    isVerified: false,
    playCount: 2567,
    createdAt: Date.now() - 22 * 86400 * 1000,
  },
  {
    id: "mock-audio-005",
    title: "The Story of Isis and Osiris (Oral Tradition)",
    artist: "Mariam Adel (Storyteller)",
    genre: "Story",
    isVerified: true,
    playCount: 891,
    createdAt: Date.now() - 20 * 86400 * 1000,
  },
  {
    id: "mock-audio-006",
    title: "Ottoman Administration in Egypt — Academic Lecture",
    artist: "Prof. Khaled Fahmy, AUC",
    genre: "Lecture",
    isVerified: true,
    playCount: 445,
    createdAt: Date.now() - 18 * 86400 * 1000,
  },
  {
    id: "mock-audio-007",
    title: "Poetry of Al-Mutanabbi — Complete Reading",
    artist: "Layla Hassan Nour",
    genre: "Poetry",
    isVerified: false,
    playCount: 678,
    createdAt: Date.now() - 15 * 86400 * 1000,
  },
  {
    id: "mock-audio-008",
    title: "Coptic Hymn — Kyrie Eleison (St. Mark's Liturgy)",
    artist: "Choir of the Coptic Orthodox Cathedral",
    genre: "Recitation",
    isVerified: true,
    playCount: 1987,
    createdAt: Date.now() - 12 * 86400 * 1000,
  },
  {
    id: "mock-audio-009",
    title: "Cairo Radio — 1952 Revolution Broadcast (Archive)",
    artist: "Egyptian National Radio Archive",
    genre: "Story",
    isVerified: true,
    playCount: 3410,
    createdAt: Date.now() - 10 * 86400 * 1000,
  },
  {
    id: "mock-audio-010",
    title: "Oud Solo — Maqam Hijaz (Traditional)",
    artist: "Youssef Al-Nubi",
    genre: "Music",
    isVerified: false,
    playCount: 1543,
    createdAt: Date.now() - 8 * 86400 * 1000,
  },
  {
    id: "mock-audio-011",
    title: "Pharaonic Genealogy & Dynasty Records — Lecture",
    artist: "Dr. Saad Abdel-Hakim, Cairo University",
    genre: "Lecture",
    isVerified: true,
    playCount: 729,
    createdAt: Date.now() - 5 * 86400 * 1000,
  },
  {
    id: "mock-audio-012",
    title: "Oral History: Memories of Old Cairo Families",
    artist: "Roots Egypt Heritage Project",
    genre: "Interview",
    isVerified: true,
    playCount: 2204,
    createdAt: Date.now() - 3 * 86400 * 1000,
  },
  {
    id: "mock-audio-013",
    title: "Roman Period in Egypt — Coins & Records Lecture",
    artist: "Prof. Amal Osman, Alexandria University",
    genre: "Lecture",
    isVerified: true,
    playCount: 388,
    createdAt: Date.now() - 2 * 86400 * 1000,
  },
  {
    id: "mock-audio-014",
    title: "Sufi Music — Zikr Ceremony (Upper Egypt)",
    artist: "Al-Ahbash Sufi Brotherhood",
    genre: "Recitation",
    isVerified: false,
    playCount: 1102,
    createdAt: Date.now() - 86400 * 1000,
  },
  {
    id: "mock-audio-015",
    title: "Delta Folk Song — Harvest Season (Traditional)",
    artist: "Hana Idris & Ensemble",
    genre: "Music",
    isVerified: false,
    playCount: 566,
    createdAt: Date.now() - 3600 * 1000,
  },
];

export function seedMockStorage() {
  if (localStorage.getItem(SEED_VERSION_KEY)) return;

  // ── Articles ────────────────────────────────────────────────────────
  const existingRaw = localStorage.getItem(ART_KEY);
  let existing: any[] = [];
  try { existing = existingRaw ? JSON.parse(existingRaw) : []; } catch { existing = []; }
  const existingIds = new Set(existing.map((a: any) => a.id));
  const toAdd = MOCK_ARTICLES.filter((a) => !existingIds.has(a.id));
  saveArticles([...existing, ...toAdd]);

  // ── Comments ────────────────────────────────────────────────────────
  const existingCmtRaw = localStorage.getItem(CMT_KEY);
  let existingCmts: any[] = [];
  try { existingCmts = existingCmtRaw ? JSON.parse(existingCmtRaw) : []; } catch { existingCmts = []; }
  const existingCmtIds = new Set(existingCmts.map((c: any) => c.id));
  const cmtsToAdd = MOCK_ARTICLE_COMMENTS.filter((c) => !existingCmtIds.has(c.id));
  saveComments([...existingCmts, ...cmtsToAdd]);

  // ── Like counts ─────────────────────────────────────────────────────
  const existingLikes: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem(LIKE_CNT_KEY) || "{}"); } catch { return {}; }
  })();
  saveLikeCounts({ ...MOCK_ARTICLE_LIKE_COUNTS, ...existingLikes });

  // ── Share counts ────────────────────────────────────────────────────
  const existingShares: Record<string, number> = (() => {
    try { return JSON.parse(localStorage.getItem(SHARE_CNT_KEY) || "{}"); } catch { return {}; }
  })();
  saveShareCounts({ ...MOCK_ARTICLE_SHARE_COUNTS, ...existingShares });

  // ── Audio tracks ────────────────────────────────────────────────────
  const existingAudioRaw = localStorage.getItem(AUDIO_STORAGE_KEY);
  let existingAudio: any[] = [];
  try { existingAudio = existingAudioRaw ? JSON.parse(existingAudioRaw) : []; } catch { existingAudio = []; }

  const existingAudioIds = new Set(existingAudio.map((t: any) => t.id));
  const audioToAdd = MOCK_AUDIO_TRACKS
    .filter((t) => !existingAudioIds.has(t.id))
    .map((t) => ({
      ...t,
      name: `${t.title}.mp3`,
      mime: "audio/mpeg",
      dataUrl: SILENT_WAV,
      coverColor: pickColor(t.id),
      duration: 0,
    }));

  if (audioToAdd.length > 0) {
    const merged = [...existingAudio, ...audioToAdd].slice(0, 50);
    try {
      localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // localStorage quota — try fewer
      try {
        localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(merged.slice(0, 10)));
      } catch {
        /* skip */
      }
    }
  }

  localStorage.setItem(SEED_VERSION_KEY, "1");
}
