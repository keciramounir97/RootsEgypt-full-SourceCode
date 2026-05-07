import { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../store/theme";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Search,
  Image as ImageIcon,
  X,
  MapPin,
  Archive,
  Download,
  Send,
} from "lucide-react";
import { api } from "../api/client";
import {
  getApiErrorMessage,
  getApiRoot,
  requestWithFallback,
  shouldFallbackRoute,
} from "../api/helpers";
import { useTranslation } from "../context/TranslationContext";
import RootsPageShell from "../components/RootsPageShell";
import { useAuth } from "../admin/components/AuthContext";
import {
  emitGalleryChanged,
  listenForGalleryChanges,
  normalizeGalleryItem,
  unwrapGalleryResponse,
  withLocalGalleryFallback,
  type GalleryComment,
  type GalleryDataItem,
} from "../utils/galleryData";


type GalleryItem = GalleryDataItem;
type Comment = GalleryComment;

const IMAGE_FALLBACK =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='650'%3E%3Crect width='100%25' height='100%25' fill='%23f3f7fa'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23637786' font-family='Arial' font-size='26'%3EImage unavailable%3C/text%3E%3C/svg%3E";

const sortByDateDesc = (items: GalleryItem[]) =>
  [...items].sort((a, b) => {
    const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

export default function GalleryImages() {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    category: "",
    description: "",
  });

  const apiRoot = useMemo(() => getApiRoot(), []);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get("/gallery");
      const nextImages = withLocalGalleryFallback(
        unwrapGalleryResponse(data).map(normalizeGalleryItem),
      );

      setImages(sortByDateDesc(nextImages));
      setSelectedImage((current) => {
        if (!current) return current;
        return nextImages.find((item) => item.id === current.id) || null;
      });
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load images");
      const fallbackImages = withLocalGalleryFallback([]);
      setError(message);
      setImages(sortByDateDesc(fallbackImages));
      setSelectedImage((current) => {
        if (!current) return current;
        return fallbackImages.find((item) => item.id === current.id) || null;
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!mounted) return;
      await loadImages();
    };

    run();
    const stopListening = listenForGalleryChanges(run);

    return () => {
      mounted = false;
      stopListening();
    };
  }, [loadImages]);

  const fileUrl = (path: string | undefined) => {
    if (!path) return "";
    const raw = String(path).trim();
    // Already a full URL or assets path (from Vite imports)
    if (
      raw.startsWith("http") ||
      raw.startsWith("data:") ||
      raw.startsWith("/assets/") ||
      raw.startsWith("/src/assets/") ||
      raw.startsWith("assets/") ||
      raw.startsWith("blob:")
    )
      return raw;
    let p = raw.startsWith("/") ? raw : `/${raw}`;
    if (!p.startsWith("/uploads/")) {
      p = `/uploads/gallery/${raw.replace(/^\/+/, "")}`;
    }
    return `${apiRoot.replace(/\/+$/, "")}${p}`;
  };

  const filteredImages = useMemo(() => {
    let result = images;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q) ||
          item.archiveSource?.toLowerCase().includes(q) ||
          item.location?.toLowerCase().includes(q),
      );
    }

    return sortByDateDesc(result);
  }, [images, query]);

  const maxImageBytes = 10 * 1024 * 1024;
  const validateImageFile = (file: File | null, required = false) => {
    if (!file) {
      return required ? t("image_required", "Please select an image") : "";
    }
    if (file.size > maxImageBytes) {
      return t("file_too_large", "File is too large (max 10MB).");
    }
    if (!file.type.startsWith("image/")) {
      return t("invalid_image_type", "Only image files are allowed.");
    }
    return "";
  };

  const resetUploadForm = () => {
    setUploadForm({ file: null, title: "", category: "", description: "" });
    setUploadError("");
  };

  const handleUpload = async () => {
    if (!user) {
      setUploadError(t("please_login_upload", "Please log in to upload images."));
      return;
    }
    if (!uploadForm.title.trim()) {
      setUploadError(t("fill_required_fields", "Please fill all required fields"));
      return;
    }
    const fileError = validateImageFile(uploadForm.file, true);
    if (fileError) {
      setUploadError(fileError);
      return;
    }

    const formData = new FormData();
    formData.append("image", uploadForm.file as File);
    formData.append("title", uploadForm.title.trim());
    formData.append("category", uploadForm.category.trim());
    if (uploadForm.description.trim()) {
      formData.append("description", uploadForm.description.trim());
    }
    formData.append("isPublic", "true");

    const shouldFallbackWrite = (err: any) =>
      shouldFallbackRoute(err) ||
      err?.response?.status === 401 ||
      err?.response?.status === 403 ||
      err?.response?.status === 500;

    try {
      setUploading(true);
      setUploadError("");
      const { data } = await requestWithFallback(
        [() => api.post("/my/gallery", formData), () => api.post("/admin/gallery", formData)],
        shouldFallbackWrite,
      );

      const created = data?.data || data;
      const createdItem: GalleryItem = {
        ...(created || {}),
        id: created?.id || `upload-${Date.now()}`,
        title: created?.title || uploadForm.title.trim(),
        category: created?.category || uploadForm.category.trim(),
        description: created?.description || uploadForm.description.trim(),
        imagePath: created?.image_path ?? created?.imagePath,
        archiveSource: created?.archive_source ?? created?.archiveSource,
        date: created?.year ? String(created.year) : undefined,
        likes: 0,
        comments: [],
        isLiked: false,
        createdAt: created?.created_at ?? created?.createdAt ?? new Date().toISOString(),
      };

      setImages((prev) => sortByDateDesc([createdItem, ...prev]));
      emitGalleryChanged(createdItem);
      setShowUploadModal(false);
      resetUploadForm();
    } catch (err) {
      setUploadError(getApiErrorMessage(err, t("upload_failed", "Upload failed")));
    } finally {
      setUploading(false);
    }
  };

  const handleLike = (imageId: number | string) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? {
              ...img,
              isLiked: !img.isLiked,
              likes: img.isLiked ? (img.likes || 0) - 1 : (img.likes || 0) + 1,
            }
          : img,
      ),
    );
    if (selectedImage?.id === imageId) {
      setSelectedImage((prev) =>
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

  const handleComment = (imageId: number | string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: "user",
      userName: "You",
      text: newComment,
      createdAt: new Date().toISOString(),
    };

    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, comments: [...(img.comments || []), comment] }
          : img,
      ),
    );

    if (selectedImage?.id === imageId) {
      setSelectedImage((prev) =>
        prev
          ? { ...prev, comments: [...(prev.comments || []), comment] }
          : null,
      );
    }

    setNewComment("");
  };

  const isDark = theme === "dark";
  const borderColor = isDark ? "border-[#1a3048]" : "border-[#e8e4dc]";
  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ImageIcon className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("family_collections", "Family Collections")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("images", "Images Gallery")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t(
              "images_intro",
              "Explore historical photographs, documents, and family portraits. Like, comment, and share your favorite finds.",
            )}
          </p>
        </div>
      }
    >
      <section className="roots-section roots-section-alt" data-aos="fade-up">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-3 text-[#24766f] opacity-80 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search_images_placeholder", "Search images...")}
              className={`w-full pl-10 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                isDark
                  ? "text-white placeholder-white/50"
                  : "text-[#162238] placeholder-[#162238]/50"
              }`}
            />
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors shadow-lg"
          >
            <Upload className="w-5 h-5" />
            {t("upload_image", "Upload Image")}
          </button>
        </div>
      </section>

      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg opacity-70">{t("loading", "Loading...")}</p>
          </div>
        </section>
      ) : (
        <section className="roots-section" data-aos="fade-up">
          {error ? (
            <div className="mb-5 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-300">
              {error} -{" "}
              {t("showing_local_assets", "Showing local asset images.")}
            </div>
          ) : null}
          <h2 className="text-3xl font-bold border-l-8 border-[#d9a441] pl-4 mb-8">
            {t("images", "Images")}{" "}
            <span className="text-[#24766f]">({filteredImages.length})</span>
          </h2>

          {filteredImages.length === 0 ? (
            <div
              className={`${cardBg} p-12 rounded-2xl shadow-xl border ${borderColor} text-center`}
            >
              <ImageIcon className="w-16 h-16 mx-auto text-[#24766f]/50 mb-4" />
              <p className="text-xl opacity-70">
                {t("no_images_found", "No images found.")}
              </p>
            </div>
          ) : (
            <div className="gallery-masonry">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className={`gallery-masonry-item group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${cardBg} border ${borderColor}`}
                  data-aos="fade-up"
                  data-aos-delay={index * 30}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={fileUrl(image.imagePath)}
                      alt=""
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src !== IMAGE_FALLBACK) {
                          target.src = IMAGE_FALLBACK;
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate group-hover:text-[#d9a441] transition-colors">
                      {image.title}
                    </h3>
                    {image.category && (
                      <span className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-[#24766f]/10 text-[#24766f] text-xs font-semibold">
                        {image.category}
                      </span>
                    )}
                    {(image.showDetails ?? image.show_details ?? true) && (
                      <>
                        {image.location && (
                          <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {image.location}
                          </p>
                        )}
                        {image.date && (
                          <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                            <Archive className="w-3 h-3" />
                            {image.date}
                          </p>
                        )}
                        {image.archiveSource && (
                          <p className="text-xs opacity-60 mt-1 truncate">
                            <Archive className="w-3 h-3 inline mr-1" />
                            {image.archiveSource}
                          </p>
                        )}
                      </>
                    )}

                    <div
                      className={`flex items-center justify-between mt-3 pt-3 border-t ${borderColor}`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(image.id);
                          }}
                          className={`flex items-center gap-1 transition-colors ${
                            image.isLiked
                              ? "text-red-500"
                              : "opacity-70 hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${image.isLiked ? "fill-current" : ""}`}
                          />
                          <span className="text-xs">{image.likes || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 opacity-70">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">
                            {image.comments?.length || 0}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Share functionality
                        }}
                        className="opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Image Detail Modal - Pinterest Style */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className={`w-full max-w-7xl h-[88vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Image */}
            <div className="md:w-[62%] bg-black flex items-center justify-center overflow-hidden min-h-[42vh]">
              <img
                src={fileUrl(selectedImage.imagePath)}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== IMAGE_FALLBACK) {
                    target.src = IMAGE_FALLBACK;
                  }
                }}
              />
            </div>

            {/* Right: Details */}
            <div className="md:w-[38%] flex flex-col max-h-[88vh]">
              {/* Header */}
              <div
                className={`p-6 border-b ${borderColor} flex items-start justify-between`}
              >
                <div>
                  <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                  {selectedImage.category && (
                    <span className="mt-2 inline-flex px-2.5 py-1 rounded-full bg-[#24766f]/10 text-[#24766f] text-xs font-semibold">
                      {selectedImage.category}
                    </span>
                  )}
                  {selectedImage.archiveSource && (
                    <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                      <Archive className="w-4 h-4" />
                      {selectedImage.archiveSource}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {selectedImage.description && (
                  <p className="opacity-80">{selectedImage.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {selectedImage.location && (
                    <div
                      className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}
                    >
                      <p className="text-xs uppercase opacity-60 mb-1">
                        {t("location", "Location")}
                      </p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-[#24766f]" />
                        {selectedImage.location}
                      </p>
                    </div>
                  )}
                  {selectedImage.date && (
                    <div
                      className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}
                    >
                      <p className="text-xs uppercase opacity-60 mb-1">
                        {t("date", "Date")}
                      </p>
                      <p className="font-medium flex items-center gap-1">
                        <Archive className="w-4 h-4 text-[#24766f]" />
                        {selectedImage.date}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div
                  className={`flex items-center gap-3 py-4 border-y ${borderColor}`}
                >
                  <button
                    onClick={() => handleLike(selectedImage.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                      selectedImage.isLiked
                        ? "bg-red-500/20 text-red-500"
                        : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${selectedImage.isLiked ? "fill-current" : ""}`}
                    />
                    <span>{selectedImage.likes || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5" />
                    {t("share", "Share")}
                  </button>
                  <a
                    href={fileUrl(selectedImage.imagePath)}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  <h4 className="font-semibold">{t("comments", "Comments")}</h4>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {(selectedImage.comments || []).map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}
                      >
                        <p className="text-sm font-medium">
                          {comment.userName}
                        </p>
                        <p className="text-sm opacity-80">{comment.text}</p>
                      </div>
                    ))}
                    {(!selectedImage.comments ||
                      selectedImage.comments.length === 0) && (
                      <p className="text-sm opacity-50">
                        {t("no_comments", "No comments yet.")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Comment Input */}
              <div className={`p-4 border-t ${borderColor}`}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t("write_comment", "Write a comment...")}
                    className={`flex-1 px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                      isDark
                        ? "text-white placeholder-white/50"
                        : "text-[#162238] placeholder-[#162238]/50"
                    }`}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleComment(selectedImage.id)
                    }
                  />
                  <button
                    onClick={() => handleComment(selectedImage.id)}
                    className="p-2 rounded-xl bg-[#24766f] text-white hover:bg-[#24766f]/90 transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setShowUploadModal(false);
            resetUploadForm();
          }}
        >
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {t("upload_image", "Upload Image")}
              </h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
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
                {t("drag_drop_image", "Drag and drop an image here")}
              </p>
              <p className="text-sm opacity-50">
                {t("or_click_to_browse", "or click to browse")}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setUploadForm((prev) => ({
                    ...prev,
                    file,
                    title:
                      prev.title || file?.name?.replace(/\.[^/.]+$/, "") || "",
                  }));
                }}
                className="mt-4 block w-full text-sm"
              />
              {uploadForm.file ? (
                <p className="text-xs mt-2 opacity-70">
                  {uploadForm.file.name}
                </p>
              ) : null}
            </div>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) =>
                  setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={t("title", "Title")}
                className={`w-full px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="text"
                value={uploadForm.category}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                placeholder={t("custom_category_placeholder", "Name this category...")}
                className={`w-full px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <textarea
                value={uploadForm.description}
                onChange={(e) =>
                  setUploadForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder={t("description", "Description")}
                rows={3}
                className={`w-full px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] resize-none`}
              />
              {uploadError ? (
                <p className="text-sm text-red-500">{uploadError}</p>
              ) : null}
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors disabled:opacity-60"
              >
                {uploading
                  ? t("uploading", "Uploading...")
                  : t("upload", "Upload")}
              </button>
            </div>
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}
