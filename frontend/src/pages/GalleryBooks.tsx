import { useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../store/theme";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  Heart,
  MessageCircle,
  Share2,
  Upload,
  Search,
  BookOpen,
  X,
  Download,
  Send,
  User,
  Bookmark,
  Archive,
} from "lucide-react";
import { api } from "../api/client";
import { getApiErrorMessage, getApiRoot } from "../api/helpers";
import { useLanguage } from "../i18n";
import RootsPageShell from "../components/RootsPageShell";

interface Book {
  id: number | string;
  title: string;
  author?: string;
  description?: string;
  category?: string;
  filePath?: string;
  coverImage?: string;
  pages?: number;
  year?: number;
  createdAt?: string;
  likes?: number;
  comments?: Comment[];
  isLiked?: boolean;
}

interface Comment {
  id: number | string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

const sortByDateDesc = (items: Book[]) =>
  [...items].sort((a, b) => {
    const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

export default function GalleryBooks() {
  const { theme } = useThemeStore();
  const { t } = useLanguage();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newComment, setNewComment] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    year: "",
  });

  const apiRoot = useMemo(() => getApiRoot(), []);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const booksRes = await api.get("/books").catch(() => ({ data: [] }));

        if (!mounted) return;

        const booksData = booksRes.data;
        let nextBooks: Book[] = [];

        if (booksData?.data && Array.isArray(booksData.data)) {
          nextBooks = booksData.data;
        } else if (Array.isArray(booksData)) {
          nextBooks = booksData;
        }

        nextBooks = nextBooks.map((book) => ({
          ...book,
          likes: book.likes || 0,
          comments: book.comments || [],
          isLiked: false,
        }));

        setBooks(nextBooks);
      } catch (err) {
        if (!mounted) return;
        const message = getApiErrorMessage(
          err,
          t("legacy.books_load_failed", "Failed to load books"),
        );
        setError(message);
        setBooks([]);
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
    let p = raw.startsWith("/") ? raw : `/${raw}`;
    return `${apiRoot.replace(/\/+$/, "")}${p}`;
  };

  const downloadBookUrl = (id: number | string) => {
    return `${apiRoot}/api/books/${id}/download`;
  };

  const filteredBooks = useMemo(() => {
    let result = books;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (book) =>
          book.title?.toLowerCase().includes(q) ||
          book.author?.toLowerCase().includes(q) ||
          book.description?.toLowerCase().includes(q) ||
          book.category?.toLowerCase().includes(q),
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((book) => book.category === categoryFilter);
    }

    return sortByDateDesc(result);
  }, [books, query, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(books.map((b) => b.category).filter(Boolean));
    return ["all", ...Array.from(cats)] as string[];
  }, [books]);

  const handleLike = (bookId: number | string) => {
    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? {
              ...book,
              isLiked: !book.isLiked,
              likes: book.isLiked ? (book.likes || 0) - 1 : (book.likes || 0) + 1,
            }
          : book
      )
    );
    if (selectedBook?.id === bookId) {
      setSelectedBook((prev) =>
        prev
          ? {
              ...prev,
              isLiked: !prev.isLiked,
              likes: prev.isLiked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1,
            }
          : null
      );
    }
  };

  const handleComment = (bookId: number | string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      userId: "user",
      userName: t("legacy.you", "You"),
      text: newComment,
      createdAt: new Date().toISOString(),
    };

    setBooks((prev) =>
      prev.map((book) =>
        book.id === bookId
          ? { ...book, comments: [...(book.comments || []), comment] }
          : book
      )
    );

    if (selectedBook?.id === bookId) {
      setSelectedBook((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), comment] } : null
      );
    }

    setNewComment("");
  };

  const handleUpload = () => {
    // Mock upload - in production, send to API
    const newBook: Book = {
      id: Date.now(),
      title: uploadForm.title,
      author: uploadForm.author,
      description: uploadForm.description,
      category: uploadForm.category,
      year: parseInt(uploadForm.year) || undefined,
      likes: 0,
      comments: [],
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    setBooks((prev) => [newBook, ...prev]);
    setShowUploadModal(false);
    setUploadForm({ title: "", author: "", description: "", category: "", year: "" });
  };

  const isDark = theme === "dark";
  const borderColor = isDark ? "border-[#1a3048]" : "border-[#e8e4dc]";
  const cardBg = isDark ? "bg-[#0f1f33]" : "bg-white";

  return (
    <RootsPageShell
      hero={
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-12 h-12 text-[#d9a441]" />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#d9a441]">
            {t("legacy.family_collections", "Family Collections")}
          </p>
          <h1 className="text-5xl font-bold">
            {t("legacy.books", "Books Library")}
          </h1>
          <p className="max-w-4xl mx-auto text-lg opacity-90">
            {t("legacy.books_intro",
              "Explore yizkor books, family histories, and genealogical publications. Upload, share, and connect through written heritage.",
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
              placeholder={t("legacy.search_books_placeholder", "Search books, authors, topics...")}
              className={`w-full pl-10 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors ${
                isDark ? "text-white placeholder-white/50" : "text-[#162238] placeholder-[#162238]/50"
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
              {t("legacy.upload_book", "Upload Book")}
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="roots-section">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#d9a441] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg opacity-70">{t("legacy.loading", "Loading...")}</p>
          </div>
        </section>
      ) : error ? (
        <section className="roots-section">
          <div className="text-center text-red-500 font-semibold py-10">{error}</div>
        </section>
      ) : (
        <section className="roots-section" data-aos="fade-up">
          <h2 className="text-3xl font-bold border-l-8 border-[#d9a441] pl-4 mb-8">
            {t("legacy.books", "Books")} <span className="text-[#24766f]">({filteredBooks.length})</span>
          </h2>

          {filteredBooks.length === 0 ? (
            <div className={`${cardBg} p-12 rounded-2xl shadow-xl border ${borderColor} text-center`}>
              <BookOpen className="w-16 h-16 mx-auto text-[#24766f]/50 mb-4" />
              <p className="text-xl opacity-70">{t("legacy.no_books_found", "No books found.")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <div
                  key={book.id}
                  className={`group ${cardBg} border ${borderColor} rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer`}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  onClick={() => setSelectedBook(book)}
                >
                  {/* Cover */}
                  <div className="h-48 bg-gradient-to-br from-[#24766f]/20 via-[#d9a441]/10 to-[#0f2742]/20 flex items-center justify-center relative overflow-hidden">
                    {book.coverImage ? (
                      <img
                        src={fileUrl(book.coverImage)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <BookOpen className="w-16 h-16 text-[#d9a441]/50 mx-auto mb-2" />
                        <p className="text-sm opacity-50">{book.category || t("legacy.book", "Book")}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg truncate group-hover:text-[#d9a441] transition-colors">
                      {book.title}
                    </h3>
                    {book.author && (
                      <p className="text-sm opacity-70 flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {book.author}
                      </p>
                    )}
                    {book.year && (
                      <p className="text-xs opacity-50 flex items-center gap-1 mt-1">
                        <Archive className="w-3 h-3" />
                        {book.year}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t ${borderColor}">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(book.id);
                          }}
                          className={`flex items-center gap-1 transition-colors ${
                            book.isLiked ? "text-red-500" : "opacity-70 hover:text-red-500"
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${book.isLiked ? "fill-current" : ""}`} />
                          <span className="text-xs">{book.likes || 0}</span>
                        </button>
                        <div className="flex items-center gap-1 opacity-70">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{book.comments?.length || 0}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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

      {/* Book Detail Modal */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col ${cardBg} border ${borderColor}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b ${borderColor} flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-[#24766f]/20 to-[#d9a441]/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-8 h-8 text-[#d9a441]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedBook.title}</h3>
                  {selectedBook.author && (
                    <p className="opacity-70 flex items-center gap-1 mt-1">
                      <User className="w-4 h-4" />
                      {selectedBook.author}
                    </p>
                  )}
                  {selectedBook.category && (
                    <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs bg-[#24766f]/20 text-[#24766f]">
                      {selectedBook.category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedBook(null)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {selectedBook.description && (
                <p className="opacity-80">{selectedBook.description}</p>
              )}

              <div className="grid grid-cols-3 gap-3">
                {selectedBook.year && (
                  <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.year", "Year")}</p>
                    <p className="font-medium">{selectedBook.year}</p>
                  </div>
                )}
                {selectedBook.pages && (
                  <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.pages", "Pages")}</p>
                    <p className="font-medium">{selectedBook.pages}</p>
                  </div>
                )}
                <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                  <p className="text-xs uppercase opacity-60 mb-1">{t("legacy.likes", "Likes")}</p>
                  <p className="font-medium">{selectedBook.likes || 0}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 py-4 border-y ${borderColor}">
                <button
                  onClick={() => handleLike(selectedBook.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    selectedBook.isLiked
                      ? "bg-red-500/20 text-red-500"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Heart className={`w-5 h-5 ${selectedBook.isLiked ? "fill-current" : ""}`} />
                  <span>{selectedBook.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                  {t("legacy.share", "Share")}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Bookmark className="w-5 h-5" />
                  {t("legacy.save", "Save")}
                </button>
                {selectedBook.filePath && (
                  <a
                    href={downloadBookUrl(selectedBook.id)}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#24766f] text-white hover:bg-[#24766f]/90 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    {t("legacy.download", "Download")}
                  </a>
                )}
              </div>

              {/* Comments */}
              <div className="space-y-3">
                <h4 className="font-semibold">{t("legacy.comments", "Comments")}</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {(selectedBook.comments || []).map((comment) => (
                    <div key={comment.id} className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                      <p className="text-sm font-medium">{comment.userName}</p>
                      <p className="text-sm opacity-80">{comment.text}</p>
                    </div>
                  ))}
                  {(!selectedBook.comments || selectedBook.comments.length === 0) && (
                    <p className="text-sm opacity-50">{t("legacy.no_comments", "No comments yet.")}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t ${borderColor}">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t("legacy.write_comment", "Write a comment...")}
                  className={`flex-1 px-4 py-2 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] transition-colors`}
                  onKeyDown={(e) => e.key === "Enter" && handleComment(selectedBook.id)}
                />
                <button
                  onClick={() => handleComment(selectedBook.id)}
                  className="p-2 rounded-xl bg-[#24766f] text-white hover:bg-[#24766f]/90 transition-colors"
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
              <h3 className="text-xl font-bold">{t("legacy.upload_book", "Upload Book")}</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder={t("legacy.title", "Title")}
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="text"
                placeholder={t("legacy.author", "Author")}
                value={uploadForm.author}
                onChange={(e) => setUploadForm({ ...uploadForm, author: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="text"
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                placeholder={t("legacy.custom_category_placeholder", "Name this category...")}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <input
                type="number"
                placeholder={t("legacy.year", "Year")}
                value={uploadForm.year}
                onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441]`}
              />
              <textarea
                placeholder={t("legacy.description", "Description")}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl bg-transparent border ${borderColor} outline-none focus:border-[#d9a441] resize-none`}
              />
              <div className={`border-2 border-dashed ${borderColor} rounded-xl p-6 text-center`}>
                <Upload className="w-8 h-8 mx-auto text-[#24766f] mb-2" />
                <p className="text-sm opacity-70">
                  {t("legacy.upload_book_file", "Upload PDF or eBook file")}
                </p>
                <input type="file" accept=".pdf,.epub,.mobi" className="hidden" />
              </div>
              <button
                onClick={handleUpload}
                className="w-full py-3 rounded-xl bg-[#24766f] text-white font-semibold hover:bg-[#24766f]/90 transition-colors"
              >
                {t("legacy.upload", "Upload")}
              </button>
            </div>
          </div>
        </div>
      )}
    </RootsPageShell>
  );
}
