import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useThemeStore } from "../store/theme";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ListMusic,
  MessageCircle,
  Mic,
  Music,
  Pause,
  Play,
  Plus,
  Repeat,
  Search,
  Share2,
  Shield,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useTranslation } from "../context/TranslationContext";
import { useFavorites } from "../context/FavoritesContext";
import { dispatchAppNotification } from "../context/NotificationContext";
import RootsPageShell from "../components/RootsPageShell";
import ScrollReveal from "../components/motion/ScrollReveal";
import {
  StaggerContainer,
  StaggerItem,
} from "../components/motion/StaggerChildren";

/* ------------------------------------------------------------------ */
/*  Types & storage                                                    */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "rootsegypt_audio_library_v2";
const MAX_ITEMS = 50;
const MAX_BYTES = 10 * 1024 * 1024;

export interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  name: string;
  mime: string;
  dataUrl: string;
  coverColor: string;
  duration: number;
  genre: string;
  isVerified: boolean;
  playCount: number;
  createdAt: number;
}

function loadTracks(): AudioTrack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AudioTrack[];
  } catch {
    return [];
  }
}

function saveTracks(items: AudioTrack[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    /* quota */
  }
}

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

const GENRES = ["All", "Recitation", "Poetry", "Interview", "Story", "Music", "Lecture", "Other"];

function pickColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return COVER_COLORS[Math.abs(hash) % COVER_COLORS.length];
}

function formatTime(sec: number) {
  if (!sec || !isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Horizontal scroll section                                          */
/* ------------------------------------------------------------------ */
function AudioShelf({
  title,
  icon,
  tracks,
  onPlay,
  currentId,
  isPlaying,
  renderCard,
}: {
  title: string;
  icon: React.ReactNode;
  tracks: AudioTrack[];
  onPlay: (track: AudioTrack) => void;
  currentId: string | null;
  isPlaying: boolean;
  renderCard: (track: AudioTrack) => React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  if (tracks.length === 0) return null;

  return (
    <ScrollReveal className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => scroll("left")} className="p-2 rounded-full hover:bg-white/10 transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scroll("right")} className="p-2 rounded-full hover:bg-white/10 transition">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-2 sm:gap-3 lg:gap-4 overflow-x-auto scroll-smooth pb-3 snap-x"
        style={{ scrollbarWidth: "none" }}
      >
        {tracks.map((track) => (
          <div key={track.id} className="snap-start shrink-0">
            {renderCard(track)}
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

/* ------------------------------------------------------------------ */
/*  CSS Equalizer bars                                                 */
/* ------------------------------------------------------------------ */
function EqualizerBars() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-teal rounded-full"
          animate={{ height: ["4px", "16px", "8px", "14px", "4px"] }}
          transition={{
            duration: 0.8 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

/* ================================================================== */
/*  Main Audio Page                                                    */
/* ================================================================== */
export default function AudioPage() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isDark = theme === "dark";

  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadArtist, setUploadArtist] = useState("");
  const [uploadGenre, setUploadGenre] = useState("Other");
  const [busy, setBusy] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setTracks(loadTracks());
  }, []);

  /* Player controls */
  const playTrack = useCallback((track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // increment play count
    setTracks((prev) => {
      const next = prev.map((t) =>
        t.id === track.id ? { ...t, playCount: t.playCount + 1 } : t
      );
      saveTracks(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.dataUrl;
    if (isPlaying) audio.play().catch(() => {});
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setProgress(audio.currentTime);
    const onDur = () => setDuration(audio.duration);
    const onEnd = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        skipNext();
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ended", onEnd);
    };
  }, [repeat, currentTrack, tracks, shuffle]);

  const skipNext = useCallback(() => {
    if (!tracks.length) return;
    if (shuffle) {
      const idx = Math.floor(Math.random() * tracks.length);
      playTrack(tracks[idx]);
    } else {
      const idx = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : -1;
      playTrack(tracks[(idx + 1) % tracks.length]);
    }
  }, [tracks, currentTrack, shuffle, playTrack]);

  const skipPrev = useCallback(() => {
    if (!tracks.length) return;
    const idx = currentTrack ? tracks.findIndex((t) => t.id === currentTrack.id) : 0;
    playTrack(tracks[(idx - 1 + tracks.length) % tracks.length]);
  }, [tracks, currentTrack, playTrack]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
  };

  /* Upload handler */
  const onFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;
      setBusy(true);
      try {
        const added: AudioTrack[] = [];
        for (let i = 0; i < fileList.length; i++) {
          const file = fileList[i];
          if (!file.type.startsWith("audio/")) continue;
          if (file.size > MAX_BYTES) {
            dispatchAppNotification(t("audio_file_too_large", "File too large (max 10MB)"), file.name);
            continue;
          }
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result || ""));
            r.onerror = () => reject(new Error("read"));
            r.readAsDataURL(file);
          });
          const id = crypto.randomUUID?.() || `a-${Date.now()}-${i}`;
          const defaultName = file.name.replace(/\.[^/.]+$/, "");
          added.push({
            id,
            title: (fileList.length === 1 && uploadTitle.trim()) ? uploadTitle.trim() : defaultName,
            artist: uploadArtist.trim() || t("unknown_artist", "Unknown Artist"),
            name: file.name,
            mime: file.type || "audio/mpeg",
            dataUrl,
            coverColor: pickColor(id),
            duration: 0,
            genre: uploadGenre,
            isVerified: false,
            playCount: 0,
            createdAt: Date.now(),
          });
        }
        if (!added.length) return;
        setTracks((prev) => {
          const next = [...added, ...prev].slice(0, MAX_ITEMS);
          saveTracks(next);
          return next;
        });
        setUploadTitle("");
        setUploadArtist("");
        setShowUpload(false);
        dispatchAppNotification(t("audio_added", "Audio added to library"));
      } finally {
        setBusy(false);
      }
    },
    [uploadTitle, uploadArtist, uploadGenre, t]
  );

  const removeTrack = (id: string) => {
    setTracks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTracks(next);
      return next;
    });
    if (currentTrack?.id === id) {
      setCurrentTrack(null);
      setIsPlaying(false);
    }
  };

  const shareTrack = (track: AudioTrack) => {
    const url = `${window.location.origin}/audio`;
    const text = `${track.title} — ${track.artist}`;
    if (navigator.share) navigator.share({ title: track.title, text, url }).catch(() => {});
    else void navigator.clipboard.writeText(url);
  };

  /* Filtering */
  const queryLower = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    return tracks.filter((t) => {
      if (genreFilter !== "All" && t.genre !== genreFilter) return false;
      if (!queryLower) return true;
      return [t.title, t.artist, t.genre].join(" ").toLowerCase().includes(queryLower);
    });
  }, [tracks, genreFilter, queryLower]);

  const popular = useMemo(
    () => [...tracks].sort((a, b) => b.playCount - a.playCount).slice(0, 10),
    [tracks]
  );
  const recent = useMemo(
    () => [...tracks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10),
    [tracks]
  );

  const cardBg = isDark ? "bg-[#151a21]" : "bg-white";
  const borderColor = isDark ? "border-[#24304A]" : "border-[#d8c7b0]";
  const surfaceBg = isDark ? "bg-[#0f1923]" : "bg-[#faf8f4]";

  /* ------------------------------------------------------------------ */
  /*  Audio card                                                        */
  /* ------------------------------------------------------------------ */
  const renderAudioCard = (track: AudioTrack) => {
    const isCurrent = currentTrack?.id === track.id;
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={`w-[170px] cursor-pointer group`}
        onClick={() => playTrack(track)}
      >
        {/* Cover art */}
        <div
          className={`relative aspect-square rounded-xl overflow-hidden shadow-lg ${
            isCurrent ? "ring-2 ring-teal ring-offset-2 ring-offset-transparent" : ""
          }`}
        >
          <div className={`w-full h-full bg-gradient-to-br ${track.coverColor} flex items-center justify-center`}>
            <Music className="w-10 h-10 text-white/40" />
          </div>
          {/* Play overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
            isCurrent && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}>
            {isCurrent && isPlaying ? (
              <EqualizerBars />
            ) : (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-teal flex items-center justify-center shadow-xl"
              >
                <Play className="w-5 h-5 text-white ml-0.5" />
              </motion.div>
            )}
          </div>
          {/* Duration badge */}
          {track.duration > 0 && (
            <span className="absolute bottom-2 right-2 text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
              {formatTime(track.duration)}
            </span>
          )}
          {/* Verified badge */}
          {track.isVerified && (
            <div className="absolute top-2 right-2 p-1 rounded-full bg-[#d4a843]">
              <Shield className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="mt-2.5 space-y-0.5 px-0.5">
          <h3 className="text-sm font-semibold truncate">{track.title}</h3>
          <p className="text-xs opacity-50 truncate">{track.artist}</p>
        </div>
      </motion.div>
    );
  };

  /* ------------------------------------------------------------------ */
  /*  List row (for filtered results)                                   */
  /* ------------------------------------------------------------------ */
  const renderListRow = (track: AudioTrack, index: number) => {
    const isCurrent = currentTrack?.id === track.id;
    return (
      <motion.div
        key={track.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        onClick={() => playTrack(track)}
        className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition group ${
          isCurrent
            ? isDark ? "bg-teal/10" : "bg-teal/5"
            : "hover:bg-white/5"
        }`}
      >
        <span className="w-6 text-center text-xs opacity-40 group-hover:hidden">
          {index + 1}
        </span>
        <span className="w-6 text-center hidden group-hover:block">
          {isCurrent && isPlaying ? (
            <Pause className="w-4 h-4 text-teal mx-auto" />
          ) : (
            <Play className="w-4 h-4 text-teal mx-auto" />
          )}
        </span>

        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${track.coverColor} flex items-center justify-center shrink-0`}>
          {isCurrent && isPlaying ? <EqualizerBars /> : <Music className="w-4 h-4 text-white/40" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrent ? "text-teal" : ""}`}>{track.title}</p>
          <p className="text-xs opacity-50 truncate">{track.artist}</p>
        </div>

        <span className="text-xs opacity-40 hidden sm:block">{track.genre}</span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFavorite("audio", track.id); }}
            className="p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <Heart className={`w-4 h-4 ${isFavorite("audio", track.id) ? "fill-pink-500 text-pink-500" : ""}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); shareTrack(track); }}
            className="p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); removeTrack(track.id); }}
            className="p-1.5 rounded-full hover:bg-red-500/10 text-red-500 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs opacity-30 w-12 text-right">
          {track.playCount > 0 ? `${track.playCount} plays` : ""}
        </span>
      </motion.div>
    );
  };

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm uppercase tracking-[0.3em] text-teal"
          >
            {t("audio_library", "Audio Library")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold"
          >
            {t("audio_library_title", "Voices & Oral Histories")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto text-lg opacity-90"
          >
            {t(
              "audio_intro",
              "Listen to interviews, poetry, recitations and family stories from Egypt's heritage."
            )}
          </motion.p>
        </div>
      }
    >
      {/* Search + Filters + Upload Button */}
      <ScrollReveal>
        <section className="roots-section">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search_audio", "Search audio...")}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-teal transition ${
                  isDark ? "text-white placeholder-white/40" : "text-[#091326] placeholder-black/40"
                }`}
              />
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(true)}
              className="px-6 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-teal to-[#0c4a6e] text-white flex items-center gap-2 shadow-lg shadow-teal/20"
            >
              <Upload className="w-5 h-5" />
              {t("upload", "Upload")}
            </motion.button>
          </div>

          {/* Genre pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  genreFilter === g
                    ? "bg-teal text-white"
                    : isDark
                      ? "bg-white/5 hover:bg-white/10 text-white/70"
                      : "bg-black/5 hover:bg-black/10 text-black/70"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Featured section (if enough tracks) */}
      {tracks.length >= 3 && (
        <section className="roots-section">
          <ScrollReveal>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tracks.slice(0, 3).map((track) => (
                <StaggerItem key={track.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => playTrack(track)}
                    className={`relative overflow-hidden rounded-2xl cursor-pointer h-48 ${cardBg} border ${borderColor}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${track.coverColor} opacity-20`} />
                    <div className="relative h-full flex items-center gap-5 p-6">
                      <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${track.coverColor} flex items-center justify-center shrink-0 shadow-lg`}>
                        <Music className="w-8 h-8 text-white/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-widest text-teal mb-1">
                          {t("featured", "Featured")}
                        </p>
                        <h3 className="text-xl font-bold truncate">{track.title}</h3>
                        <p className="text-sm opacity-60 truncate">{track.artist}</p>
                        <p className="text-xs opacity-40 mt-1">{track.genre}</p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </ScrollReveal>
        </section>
      )}

      {/* Horizontal shelves */}
      {!queryLower && genreFilter === "All" && (
        <section className="roots-section space-y-8">
          <AudioShelf
            title={t("recently_added", "Recently Added")}
            icon={<Mic className="w-5 h-5 text-teal" />}
            tracks={recent}
            onPlay={playTrack}
            currentId={currentTrack?.id || null}
            isPlaying={isPlaying}
            renderCard={renderAudioCard}
          />
          <AudioShelf
            title={t("most_played", "Most Played")}
            icon={<ListMusic className="w-5 h-5 text-[#d4a843]" />}
            tracks={popular}
            onPlay={playTrack}
            currentId={currentTrack?.id || null}
            isPlaying={isPlaying}
            renderCard={renderAudioCard}
          />
        </section>
      )}

      {/* Filtered list or full library */}
      <section className="roots-section">
        <ScrollReveal>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Music className="w-6 h-6 text-teal" />
            {queryLower || genreFilter !== "All"
              ? `${t("results", "Results")} (${filtered.length})`
              : `${t("all_tracks", "All Tracks")} (${tracks.length})`}
          </h2>
          {filtered.length === 0 ? (
            <div className={`${cardBg} p-10 rounded-2xl border ${borderColor} text-center opacity-70`}>
              {tracks.length === 0
                ? t("audio_empty", "No audio yet — upload a file to get started.")
                : t("no_results", "No matching tracks.")}
            </div>
          ) : (
            <div className={`${cardBg} rounded-2xl border ${borderColor} overflow-hidden divide-y ${
              isDark ? "divide-white/5" : "divide-black/5"
            }`}>
              {filtered.map((track, i) => renderListRow(track, i))}
            </div>
          )}
        </ScrollReveal>
      </section>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowUpload(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25 }}
              className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${surfaceBg} border ${borderColor}`}
            >
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-[#0c4a6e] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">{t("upload_audio", "Upload Audio")}</h2>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder={t("title", "Title")}
                  className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-teal transition`}
                />
                <input
                  type="text"
                  value={uploadArtist}
                  onChange={(e) => setUploadArtist(e.target.value)}
                  placeholder={t("artist", "Artist")}
                  className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-teal transition`}
                />
                <select
                  value={uploadGenre}
                  onChange={(e) => setUploadGenre(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none`}
                >
                  {GENRES.filter((g) => g !== "All").map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-teal/40 rounded-2xl py-10 cursor-pointer hover:border-teal/70 transition">
                  <Mic className="w-10 h-10 text-teal" />
                  <span className="text-sm font-semibold uppercase tracking-widest">
                    {t("audio_tap_to_upload", "Choose or record audio")}
                  </span>
                  <span className="text-xs opacity-50">{t("max_10mb", "Max 10MB per file")}</span>
                  <input
                    type="file"
                    accept="audio/*"
                    capture="user"
                    className="hidden"
                    disabled={busy}
                    multiple
                    onChange={(e) => void onFiles(e.target.files)}
                  />
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotify-style Player Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25 }}
            className={`fixed bottom-0 left-0 right-0 z-40 border-t ${borderColor} ${
              isDark ? "bg-[#0a1018]/95" : "bg-white/95"
            } backdrop-blur-xl`}
          >
            <div className="max-w-screen-xl mx-auto px-4 py-3">
              {/* Progress bar */}
              <div
                className="w-full h-1 rounded-full bg-white/10 mb-3 cursor-pointer group"
                onClick={seek}
              >
                <motion.div
                  className="h-full bg-teal rounded-full relative"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition" />
                </motion.div>
              </div>

              <div className="flex items-center gap-4">
                {/* Track info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${currentTrack.coverColor} flex items-center justify-center shrink-0`}>
                    {isPlaying ? <EqualizerBars /> : <Music className="w-5 h-5 text-white/40" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{currentTrack.title}</p>
                    <p className="text-xs opacity-50 truncate">{currentTrack.artist}</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite("audio", currentTrack.id)}
                    className="p-1.5 shrink-0 hidden sm:block"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite("audio", currentTrack.id) ? "fill-pink-500 text-pink-500" : "opacity-50"}`} />
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setShuffle(!shuffle)}
                    className={`p-2 rounded-full transition hidden sm:block ${shuffle ? "text-teal" : "opacity-50 hover:opacity-80"}`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button onClick={skipPrev} className="p-2 rounded-full hover:bg-white/10 transition">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </motion.button>
                  <button onClick={skipNext} className="p-2 rounded-full hover:bg-white/10 transition">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setRepeat(!repeat)}
                    className={`p-2 rounded-full transition hidden sm:block ${repeat ? "text-teal" : "opacity-50 hover:opacity-80"}`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Time + Volume */}
                <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
                  <span className="text-xs opacity-40 font-mono hidden sm:block">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full hover:bg-white/10 transition hidden sm:block"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 opacity-50" /> : <Volume2 className="w-4 h-4 opacity-50" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => { setVolume(Number(e.target.value)); setIsMuted(false); }}
                    className="w-20 accent-teal hidden sm:block"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      {/* Spacer for fixed player */}
      {currentTrack && <div className="h-24" />}
    </RootsPageShell>
  );
}
