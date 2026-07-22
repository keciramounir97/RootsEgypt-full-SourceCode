import { useEffect, useMemo, useState, useRef } from "react";
import { useThemeStore } from "../store/theme";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Upload,
  Search,
  Music,
  X,
  Clock,
  ListMusic,
  Plus,
  Send,
  Lightbulb,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot } from "../api/helpers";
import { useLanguage } from "../i18n";
import RootsPageShell from "../components/RootsPageShell";

interface AudioItem {
  id: number | string;
  title: string;
  description?: string;
  audioPath?: string;
  duration?: number;
  category?: string;
  archiveSource?: string;
  createdAt?: string;
  likes?: number;
  comments?: Comment[];
  isLiked?: boolean;
  isPlaying?: boolean;
}

interface Comment {
  id: number | string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

interface Playlist {
  id: number | string;
  name: string;
  audios: AudioItem[];
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const sortByDateDesc = (items: AudioItem[]) =>
  [...items].sort((a, b) => {
    const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

export default function GalleryAudios() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audios, setAudios] = useState<AudioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentAudio, setCurrentAudio] = useState<AudioItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestionForm, setSuggestionForm] = useState({
    category: "",
    message: "",
  });
  const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [newComment, setNewComment] = useState("");
  const apiRoot = useMemo(() => getApiRoot(), []);
  const playlists = useMemo<Playlist[]>(
    () => [
      { id: 1, name: t("legacy.oral_histories", "Oral Histories"), audios: [] },
      { id: 2, name: t("legacy.family_stories", "Family Stories"), audios: [] },
      { id: 3, name: t("legacy.traditional_songs", "Traditional Songs"), audios: [] },
    ],
    [t],
  );

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/audios");
        if (!mounted) return;
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.audios)
            ? data.audios
            : Array.isArray(data)
              ? data
              : [];
        setAudios(
          sortByDateDesc(
            items.map((item: any) => ({
              ...item,
              audioPath: item.audio_path ?? item.audioPath,
              likes: item.likes || 0,
              comments: item.comments || [],
              isLiked: false,
            })),
          ),
        );
      } catch (err) {
        if (!mounted) return;
        setError(
          getApiErrorMessage(
            err,
            t("legacy.audio_load_failed", "Failed to load audio"),
          ),
        );
        setAudios([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [t]);

  const fileUrl = (path: string | undefined) => {
    if (!path) return "";
    const raw = String(path).trim();
    if (raw.startsWith("http")) return raw;
    const p = raw.startsWith("/") ? raw : `/${raw}`;
    return `${apiRoot.replace(/\/+$/, "")}${p}`;
  };

  // Keep the hidden <audio> element in sync with the selected track.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !currentAudio) return;
    const src = fileUrl(currentAudio.audioPath);
    if (!src) return;
    if (el.src !== src) {
      el.src = src;
      el.load();
    }
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio?.id]);

  // Keep actual playback in sync with the isPlaying toggle.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !currentAudio) return;
    if (isPlaying) {
      el.play().catch(() => setIsPlaying(false));
    } else {
      el.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  // Keep actual volume/mute in sync with the volume controls.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = isMuted;
  }, [volume, isMuted]);

  const filteredAudios = useMemo(() => {
    let result = audios;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (audio) =>
          audio.title?.toLowerCase().includes(q) ||
          audio.description?.toLowerCase().includes(q) ||
          audio.category?.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((audio) => audio.category === categoryFilter);
    }

    return sortByDateDesc(result);
  }, [audios, query, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(audios.map((a) => a.category).filter(Boolean));
    return ["all", ...Array.from(cats)] as string[];
  }, [audios]);

  const handlePlayPause = (audio: AudioItem) => {
    if (currentAudio?.id === audio.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentAudio(audio);
      setIsPlaying(true);
      setDuration(audio.duration || 0);
      setCurrentTime(0);
    }
  };

  const handleLike = (audioId: number | string) => {
    setAudios((prev) =>
      prev.map((audio) =>
        audio.id === audioId
          ? {
              ...audio,
              isLiked: !audio.isLiked,
              likes: audio.isLiked
                ? (audio.likes || 0) - 1
                : (audio.likes || 0) + 1,
            }
          : audio,
      ),
    );
    if (currentAudio?.id === audioId) {
      setCurrentAudio((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likes: prev.isLiked
                ? (prev.likes || 0) - 1
                : (prev.likes || 0) + 1,
            }
          : null,
      );
    }
  };

  const handleComment = (audioId: number | string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: "user",
      userName: t("legacy.you", "You"),
      text: newComment,
      createdAt: new Date().toISOString(),
    };

    setAudios((prev) =>
      prev.map((audio) =>
        audio.id === audioId
          ? { ...audio, comments: [...(audio.comments || []), comment] }
          : audio,
      ),
    );

    setNewComment("");
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const isDark = theme === "dark";
  const borderColor = isDark ? "border-[#1a3048]" : "border-[#e8e4dc]";
  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";
  const accentBg = isDark ? "bg-[#24766f]/20" : "bg-[#24766f]/10";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Music className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.family_collections", "Family Collections")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("legacy.audio_archives", "Audio Archives")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t("legacy.audios_intro",
              "Listen to oral histories, traditional songs, and family recordings. Save your favorites and build your heritage playlist.",
            )}
          </p>
        </div>
      }
    >
      {/* Search and Filter */}
      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-3 text-[#24766f] opacity-80 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("legacy.search_audios_placeholder",
                "Search audio archives...",
              )}
              className={`w-full pl-10 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                isDark
                  ? "text-white placeholder-white/50"
                  : "text-[#162238] placeholder-[#162238]/50"
              }`}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none ${
                isDark ? "text-white" : "text-[#162238]"
              }`}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? t("legacy.all_categories", "All Categories") : cat}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors shadow-lg"
            >
              <Upload className="w-5 h-5" />
              {t("legacy.upload", "Upload")}
            </button>
            <button
              onClick={() => setShowSuggestionModal(true)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border ${borderColor} font-semibold hover:bg-[#d9a441]/10 transition-colors`}
            >
              <Lightbulb className="w-5 h-5 text-[#d9a441]" />
              {t("legacy.suggest_category", "Suggest Category")}
            </button>
          </div>
        </div>
      </section>

      {/* Main Player - Spotify Style */}
      {currentAudio && (
        <section
          className={`sticky bottom-4 z-40 mx-auto max-w-4xl ${cardBg} rounded-2xl shadow-2xl border ${borderColor} overflow-hidden`}
          data-aos="fade-up"
        >
          <div className="p-4 flex items-center gap-4">
            {/* Album Art Placeholder */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#24766f] to-[#d9a441] flex items-center justify-center shrink-0">
              <Music className="w-8 h-8 text-white" />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold truncate">{currentAudio.title}</h4>
              <p className="text-sm opacity-70 truncate">
                {currentAudio.category}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 rounded-full bg-[#24766f] text-white hover:bg-[#24766f]/90 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Progress */}
            <div className="hidden md:flex items-center gap-2 w-48">
              <span className="text-xs opacity-70">
                {formatDuration(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 rounded-full appearance-none bg-white/20 cursor-pointer"
              />
              <span className="text-xs opacity-70">
                {formatDuration(duration)}
              </span>
            </div>

            {/* Volume */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 rounded-full appearance-none bg-white/20 cursor-pointer"
              />
            </div>

            {/* Like */}
            <button
              onClick={() => handleLike(currentAudio.id)}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                currentAudio.isLiked ? "text-red-500" : ""
              }`}
            >
              <Heart
                className={`w-5 h-5 ${currentAudio.isLiked ? "fill-current" : ""}`}
              />
            </button>
          </div>
        </section>
      )}

      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg opacity-70">{t("legacy.loading", "Loading...")}</p>
          </div>
        </section>
      ) : error ? (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold py-10">
            {error}
          </div>
        </section>
      ) : (
        <section className="roots-section" data-aos="fade-up">
          <h2 className="text-3xl font-bold border-l-8 border-[#d9a441] pl-4 mb-8">
            {t("legacy.audios", "Audio Archives")}{" "}
            <span className="text-[#24766f]">({filteredAudios.length})</span>
          </h2>

          {filteredAudios.length === 0 ? (
            <div
              className={`${cardBg} p-12 rounded-2xl shadow-xl border ${borderColor} text-center`}
            >
              <Music className="w-16 h-16 mx-auto text-[#24766f]/50 mb-4" />
              <p className="text-xl opacity-70">
                {t("legacy.no_audios_found", "No audio archives found.")}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAudios.map((audio, index) => (
                <div
                  key={audio.id}
                  className={`group flex items-center gap-4 p-4 rounded-xl ${cardBg} border ${borderColor} hover:shadow-lg transition-all cursor-pointer ${
                    currentAudio?.id === audio.id ? accentBg : ""
                  }`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  onClick={() => handlePlayPause(audio)}
                >
                  {/* Play Button */}
                  <button
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      currentAudio?.id === audio.id && isPlaying
                        ? "bg-[#24766f] text-white"
                        : "bg-white/10 hover:bg-[#24766f] hover:text-white"
                    }`}
                  >
                    {currentAudio?.id === audio.id && isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5" />
                    )}
                  </button>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate group-hover:text-[#d9a441] transition-colors">
                      {audio.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm opacity-70">
                      <span>{audio.category}</span>
                      {audio.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(audio.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(audio.id);
                      }}
                      className={`p-2 rounded-full hover:bg-white/10 transition-colors ${
                        audio.isLiked ? "text-red-500" : "opacity-70"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${audio.isLiked ? "fill-current" : ""}`}
                      />
                    </button>
                    <span className="text-sm opacity-70">
                      {audio.likes || 0}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentAudio(audio);
                        setShowDetailModal(true);
                      }}
                      className="p-2 rounded-full hover:bg-white/10 opacity-70 hover:opacity-100 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Playlists Sidebar */}
      <section className="roots-section" data-aos="fade-up">
        <h2 className="text-2xl font-bold border-l-8 border-[#24766f] pl-4 mb-6">
          {t("legacy.your_playlists", "Your Playlists")}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className={`p-5 rounded-xl ${cardBg} border ${borderColor} hover:shadow-lg transition-all cursor-pointer`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#d9a441] to-[#24766f] flex items-center justify-center">
                  <ListMusic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">{playlist.name}</h4>
                  <p className="text-sm opacity-70">
                    {playlist.audios.length} {t("legacy.tracks", "tracks")}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <button
            className={`p-5 rounded-xl border-2 border-dashed ${borderColor} flex items-center justify-center gap-2 opacity-70 hover:opacity-100 transition-opacity`}
          >
            <Plus className="w-5 h-5" />
            {t("legacy.create_playlist", "Create Playlist")}
          </button>
        </div>
      </section>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Detail Modal */}
      {showDetailModal && currentAudio && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{currentAudio.title}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="opacity-80 mb-4">{currentAudio.description}</p>
            <div className="space-y-3">
              <h4 className="font-semibold">{t("legacy.comments", "Comments")}</h4>
              <div className="max-h-40 overflow-auto space-y-2">
                {(currentAudio.comments || []).map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}
                  >
                    <p className="text-sm font-medium">{comment.userName}</p>
                    <p className="text-sm opacity-80">{comment.text}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("legacy.write_comment", "Write a comment...")}
                  className={`flex-1 px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none`}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleComment(currentAudio.id)
                  }
                />
                <button
                  onClick={() => handleComment(currentAudio.id)}
                  className="p-2 rounded-xl bg-[#24766f] text-white"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {t("legacy.upload_audio", "Upload Audio")}
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div
              className={`border-2 border-dashed ${borderColor} rounded-xl p-8 text-center`}
            >
              <Upload className="w-12 h-12 mx-auto text-[#24766f] mb-4" />
              <p className="opacity-70 mb-2">
                {t("legacy.drag_drop_audio", "Drag and drop an audio file here")}
              </p>
              <p className="text-sm opacity-50">
                {t("legacy.audio_file_formats_short", "MP3, WAV, M4A supported")}
              </p>
              <input type="file" accept="audio/*" className="hidden" />
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder={t("legacy.title", "Title")}
                className={`w-full px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none`}
              />
              <input
                type="text"
                placeholder={t("legacy.custom_category_placeholder", "Name this category...")}
                className={`w-full px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none`}
              />
              <textarea
                placeholder={t("legacy.description", "Description")}
                rows={3}
                className={`w-full px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none resize-none`}
              />
              <button className="w-full py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors">
                {t("legacy.upload", "Upload")}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Suggestion Modal */}
      {showSuggestionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowSuggestionModal(false);
            setSuggestionSuccess(false);
            setSuggestionForm({ category: "", message: "" });
          }}
        >
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#d9a441]" />
                {t("legacy.suggest_category", "Suggest a Category")}
              </h3>
              <button
                onClick={() => {
                  setShowSuggestionModal(false);
                  setSuggestionSuccess(false);
                  setSuggestionForm({ category: "", message: "" });
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {suggestionSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-lg font-semibold mb-2">
                  {t("legacy.suggestion_sent", "Suggestion Sent!")}
                </p>
                <p className="text-sm opacity-70">
                  {t("legacy.suggestion_pending_review",
                    "An admin will review your suggestion. If approved, it will appear in the category list.",
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t("legacy.category_name", "Category Name")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={suggestionForm.category}
                    onChange={(e) =>
                      setSuggestionForm({
                        ...suggestionForm,
                        category: e.target.value,
                      })
                    }
                    placeholder={t("legacy.category_placeholder",
                      "e.g., Nile Delta oral history",
                    )}
                    className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    {t("legacy.description", "Description")}
                  </label>
                  <textarea
                    value={suggestionForm.message}
                    onChange={(e) =>
                      setSuggestionForm({
                        ...suggestionForm,
                        message: e.target.value,
                      })
                    }
                    placeholder={t("legacy.why_category",
                      "Why would this category be useful?",
                    )}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] resize-none`}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!suggestionForm.category.trim()) return;
                    setSuggestionSubmitting(true);
                    try {
                      await api.post("/suggestions", {
                        type: "audio_category",
                        category: suggestionForm.category,
                        message: suggestionForm.message,
                      });
                    } catch {
                      // Demo mode - still show success
                    }
                    setSuggestionSubmitting(false);
                    setSuggestionSuccess(true);
                  }}
                  disabled={
                    suggestionSubmitting || !suggestionForm.category.trim()
                  }
                  className={`w-full py-3 rounded-xl bg-[#d9a441] text-[#071827] font-semibold hover:bg-[#d9a441]/90 transition-colors ${
                    suggestionSubmitting || !suggestionForm.category.trim()
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {suggestionSubmitting
                    ? t("legacy.sending", "Sending...")
                    : t("legacy.send_suggestion", "Send Suggestion")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}
