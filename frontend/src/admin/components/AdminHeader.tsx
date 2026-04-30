/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  ExternalLink,
  ChevronDown,
  LogOut,
  Settings,
} from "lucide-react";
import { useThemeStore } from "../../store/theme";
import { api } from "../../api/client";
import { useTranslation } from "../../context/TranslationContext";
import { useAuth } from "./AuthContext";

export default function AdminHeader({
  sidebarOpen,
  onToggleSidebar,
}: {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}) {
  const { theme } = useThemeStore();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<{
    trees: any[];
    people: any[];
  }>({ trees: [], people: [] });
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const suggestTimerRef = useRef<any>(null);
  const latestQueryRef = useRef("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSuggestOpen(false);
    navigate(`/library?q=${encodeURIComponent(search)}`);
  };

  const isDark = theme === "dark";

  // Dynamic Theme Classes
  // Use a glass/translucent background for a modern feel, but tinted with theme colors
  const textColor = isDark ? "text-white" : "text-[#0d1b2a]";

  const searchBg = isDark
    ? "bg-white/5 border-[#d4a843]/15 focus-within:bg-white/10 focus-within:border-[#d4a843]/40"
    : "bg-[#f8f5ef] border-[#d4a843]/15 focus-within:bg-white focus-within:border-[#d4a843]/50";

  const searchInputText = isDark
    ? "text-white placeholder:text-gray-500"
    : "text-[#0d1b2a] placeholder:text-[#0c4a6e]/40";

  useEffect(() => {
    const q = String(search || "").trim();
    latestQueryRef.current = q;

    if (suggestTimerRef.current) {
      clearTimeout(suggestTimerRef.current);
    }

    if (q.length < 2) {
      setSuggestions({ trees: [], people: [] });
      setSuggestOpen(false);
      setSuggestLoading(false);
      setSuggestError("");
      return;
    }

    suggestTimerRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      setSuggestError("");
      try {
        const { data } = await api.get(
          `/search/suggest?q=${encodeURIComponent(q)}`,
        );
        if (latestQueryRef.current !== q) return;
        setSuggestions({
          trees: Array.isArray(data?.trees) ? data.trees : [],
          people: Array.isArray(data?.people) ? data.people : [],
        });
        setSuggestOpen(true);
      } catch (err: any) {
        if (latestQueryRef.current !== q) return;
        setSuggestError(
          err.response?.data?.message ||
            t("suggestions_load_failed", "Failed to load suggestions"),
        );
        setSuggestions({ trees: [], people: [] });
      } finally {
        if (latestQueryRef.current === q) {
          setSuggestLoading(false);
        }
      }
    }, 300);

    return () => {
      if (suggestTimerRef.current) {
        clearTimeout(suggestTimerRef.current);
      }
    };
  }, [search]);

  const handleSuggestFocus = () => {
    if (String(search || "").trim().length >= 2) {
      setSuggestOpen(true);
    }
  };

  const handleSuggestBlur = () => {
    window.setTimeout(() => setSuggestOpen(false), 200);
  };

  const handlePickSuggestion = (value: string) => {
    if (!value) return;
    setSearch(value);
    setSuggestOpen(false);
    navigate(`/library?q=${encodeURIComponent(value)}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <header className="admin-surface-header fixed top-0 left-0 right-0 z-40 transition-all duration-300 shadow-sm">
      <div className="h-20 px-6 flex items-center justify-between gap-6">
        {/* Left: Sidebar Toggle (all screen sizes) */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className={`admin-icon-btn p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-[#0c4a6e]/10 text-[#0d1b2a]"}`}
            aria-label={
              sidebarOpen
                ? t("close_sidebar", "Close sidebar")
                : t("open_sidebar", "Open sidebar")
            }
            title={
              sidebarOpen
                ? t("close_sidebar", "Close sidebar")
                : t("open_sidebar", "Open sidebar")
            }
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb Placeholder or Welcome Text */}
          <div className="hidden md:flex flex-col">
            <span
              className={`text-xs uppercase tracking-widest font-bold opacity-50 ${isDark ? "text-gray-400" : "text-[#0c4a6e]"}`}
            >
              {t("dashboard", "Dashboard")}
            </span>
            <span className={`text-sm font-medium ${textColor}`}>
              {t("welcome_back_prefix", "Welcome back")},{" "}
              {user?.fullName?.split(" ")[0] || t("user", "User")}
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block relative z-[60]">
          <form
            onSubmit={handleSearch}
            className={`relative group rounded-full border transition-all duration-300 shadow-sm hover:shadow-md ${searchBg}`}
          >
            <Search
              className={`w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-gray-500 group-focus-within:text-teal" : "text-[#0c4a6e]/40 group-focus-within:text-teal"}`}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={handleSuggestFocus}
              onBlur={handleSuggestBlur}
              className={`w-full bg-transparent border-none outline-none py-3 pl-12 pr-4 text-sm rounded-full transition-colors ${searchInputText}`}
              placeholder={t(
                "search_placeholder",
                "Search archives, families, or books...",
              )}
            />
          </form>

          {/* Suggestions Dropdown */}
          {suggestOpen && (
            <div
              className={`absolute top-full mt-2 left-0 right-0 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDark ? "bg-[#1e293b] border-white/10" : "bg-white border-[#0c4a6e]/10"}`}
            >
              {/* Search Results */}
              {suggestLoading ? (
                <div className="p-4 text-sm opacity-50 text-center">
                  {t("loading", "Loading...")}
                </div>
              ) : suggestError ? (
                <div className="p-4 text-sm text-red-500 text-center">
                  {suggestError}
                </div>
              ) : suggestions.trees.length || suggestions.people.length ? (
                <div className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                  {suggestions.trees.length > 0 && (
                    <div
                      className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold opacity-50 ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      {t("suggest_trees_heading", "Trees")}
                    </div>
                  )}
                  {suggestions.trees.map((item: any) => (
                    <button
                      key={`tree-${item.id}`}
                      onMouseDown={() => handlePickSuggestion(item.title)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-colors border-b last:border-0 ${isDark ? "hover:bg-white/5 border-white/5 text-gray-200" : "hover:bg-[#0c4a6e]/5 border-[#0c4a6e]/5 text-[#0d1b2a]"}`}
                    >
                      <span className="font-medium text-sm group-hover:text-teal transition-colors">
                        {item.title}
                      </span>
                    </button>
                  ))}

                  {suggestions.people.length > 0 && (
                    <div
                      className={`px-4 py-2 text-[10px] uppercase tracking-wider font-bold opacity-50 ${isDark ? "bg-white/5" : "bg-gray-50"}`}
                    >
                      {t("suggest_people_heading", "People")}
                    </div>
                  )}
                  {suggestions.people.map((item: any) => (
                    <button
                      key={`person-${item.id}`}
                      onMouseDown={() => handlePickSuggestion(item.name)}
                      className={`w-full text-left px-4 py-3 flex flex-col transition-colors border-b last:border-0 ${isDark ? "hover:bg-white/5 border-white/5 text-gray-200" : "hover:bg-[#0c4a6e]/5 border-[#0c4a6e]/5 text-[#0d1b2a]"}`}
                    >
                      <span className="font-medium text-sm group-hover:text-teal transition-colors">
                        {item.name || t("unknown", "Unknown")}
                      </span>
                      <span className="text-xs opacity-50 mt-0.5">
                        {item.tree_title
                          ? `${t("in_prefix", "In")} ${item.tree_title}`
                          : t("person_record", "Person record")}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm opacity-50 text-center flex flex-col items-center">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  {t("no_results_found", "No results found")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/"
            target="_blank"
            className={`hidden lg:flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-full transition-all ${isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-[#0c4a6e]/5 text-[#0c4a6e]/70 hover:text-[#0d1b2a]"}`}
          >
            <span>{t("live_site", "Live Site")}</span>
            <ExternalLink className="w-3 h-3 mb-0.5" />
          </Link>

          <div className="h-6 w-px bg-current opacity-10 hidden md:block"></div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen((o) => !o);
              }}
              className={`pl-1.5 pr-2 py-1.5 rounded-full border flex items-center gap-3 transition-all cursor-pointer hover:shadow-md ${isDark ? "bg-[#1e293b] border-white/10" : "bg-white border-[#0c4a6e]/10"}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4a843] to-[#c45c3e] flex items-center justify-center text-[#f8f5ef] font-bold text-sm shadow-inner">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div className="hidden sm:flex flex-col text-left mr-1">
                <span className={`text-xs font-bold leading-none ${textColor}`}>
                  {user?.fullName?.split(" ")[0] || "Admin"}
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 opacity-50 mr-1 ${textColor} transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 py-1 min-w-[180px] rounded-xl border shadow-xl z-[60] ${isDark ? "bg-[#1e293b] border-white/10" : "bg-white border-[#0c4a6e]/10"}`}
              >
                <div className="px-4 py-2 border-b border-current/10">
                  <p className={`text-sm font-medium ${textColor}`}>
                    {user?.fullName || "User"}
                  </p>
                  <p className="text-xs opacity-60 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/admin/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${isDark ? "hover:bg-white/10 text-gray-200" : "hover:bg-[#0c4a6e]/5 text-[#0d1b2a]"}`}
                >
                  <Settings className="w-4 h-4" />
                  {t("settings", "Settings")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-red-50"}`}
                >
                  <LogOut className="w-4 h-4" />
                  {t("logout", "Log out")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
