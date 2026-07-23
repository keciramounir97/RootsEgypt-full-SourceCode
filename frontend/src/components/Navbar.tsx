/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Search,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  Home,
  Image,
  Clock,
  Archive,
  Library,
  Phone,
  LayoutDashboard,
  ChevronRight,
  ChevronDown,
  Trees,
  Headphones,
  Newspaper,
  CheckCircle,
  Download,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useThemeStore } from "../store/theme";
import { useAuth } from "../admin/components/AuthContext";
import { api } from "../api/client";
import { useLanguage } from "../i18n";
import LanguageMenu from "./LanguageMenu";
import EgyptianLogoMark from "./EgyptianLogoMark";

type SearchFormData = { query: string };

interface SuggestionItem {
  id: string | number;
  title?: string;
  name?: string;
  tree_title?: string;
}

interface SuggestionsState {
  trees: SuggestionItem[];
  people: SuggestionItem[];
}

export default function Navbar() {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const searchSchema = useMemo(
    () =>
      z.object({
        query: z.string().min(1, t("legacy.search_empty", "Search cannot be empty")),
      }),
    [t],
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsState>({
    trees: [],
    people: [],
  });
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef("");
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resourceRef = useRef<HTMLDivElement>(null);
  const [resourceMenuOpen, setResourceMenuOpen] = useState(false);

  const {
    register,
    handleSubmit,
    // formState: { errors },
    watch,
    setValue,
  } = useForm<SearchFormData>({ resolver: zodResolver(searchSchema) });
  const searchField = register("query");

  const onSubmit = (data: SearchFormData) => {
    setSuggestOpen(false);
    setSidebarOpen(false);
    navigate(`/gallery?q=${encodeURIComponent(data.query)}`);
  };

  const query = watch("query") || "";

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setResourceMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (resourceRef.current && !resourceRef.current.contains(t)) {
        setResourceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const q = String(query || "").trim();
    latestQueryRef.current = q;

    if (suggestTimerRef.current) {
      clearTimeout(suggestTimerRef.current);
    }

    if (q.length < 1) {
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
            t("legacy.suggestions_load_failed", "Failed to load suggestions"),
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
  }, [query, t]);

  const handleSuggestFocus = () => {
    if (String(query || "").trim().length >= 1) {
      setSuggestOpen(true);
    }
  };

  const handleSuggestBlur = () => {
    window.setTimeout(() => setSuggestOpen(false), 150);
  };

  const handlePickSuggestion = (value: string | undefined) => {
    if (!value) return;
    setValue("query", value, { shouldValidate: true });
    setSuggestOpen(false);
    navigate(`/gallery?q=${encodeURIComponent(value)}`);
  };

  const resourceSub = [
    { to: "/gallery", label: t("legacy.gallery", "Gallery"), icon: Image },
    {
      to: "/gallery/trees",
      label: t("legacy.family_trees", "Family Trees"),
      icon: Trees,
    },
    { to: "/library", label: t("legacy.library", "Library"), icon: Library },
    {
      to: "/audio",
      label: t("legacy.audio_library", "Audio Library"),
      icon: Headphones,
    },
    { to: "/articles", label: t("legacy.articles", "Articles"), icon: Newspaper },
  ];

  const secondaryNav = [
    {
      to: "/sources-and-periods",
      label: t("legacy.sources_and_archives", "Sources & Periods"),
      icon: Archive,
    },
    { to: "/periods", label: t("legacy.periods", "Periods"), icon: Clock },
  ];

  const resourcePaths = [
    "/gallery",
    "/gallery/trees",
    "/genealogy-gallery",
    "/library",
    "/audio",
    "/articles",
  ];
  const resourceActive = resourcePaths.some((p) =>
    location.pathname.startsWith(p),
  );
  const secondaryActivePaths = ["/sources-and-periods", "/sources-periods", "/sources", "/archives", "/sourcesandarchives"];
  const resourceMenuId = "navbar-resources-menu";

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          {/* Left: Hamburger + Logo */}
          <div className="navbar-left">
            {/* Hamburger Button */}
            <button
              type="button"
              className="navbar-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label={t("legacy.menu", "Menu")}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              className="navbar-logo"
              aria-label={`RootsEgypt — ${t("legacy.home", "Home")}`}
            >
              <div className="navbar-logo-icon" aria-hidden>
                <EgyptianLogoMark
                  size={34}
                  className="min-[500px]:w-9 min-[500px]:h-9 w-[34px] h-[34px]"
                />
              </div>
              <div className="navbar-logo-text navbar-logo-text--inline">
                <span className="navbar-logo-brand">
                  <span className="navbar-logo-roots">Roots</span>
                  <span className="navbar-logo-egypt">Egypt</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation (hidden on mobile) */}
          <nav
            className="navbar-nav"
            aria-label={t("legacy.primary_navigation", "Primary navigation")}
          >
            <NavLink
              to="/"
              className={({ isActive }) =>
                `navbar-link${isActive ? " active" : ""}`
              }
            >
              {t("legacy.home", "Home")}
            </NavLink>

            <div className="navbar-dropdown" ref={resourceRef}>
              <button
                type="button"
                className={`navbar-dropdown-trigger${resourceActive ? " active" : ""}`}
                aria-haspopup="menu"
                aria-controls={resourceMenuId}
                aria-expanded={resourceMenuOpen}
                onClick={() => setResourceMenuOpen((o) => !o)}
              >
                {t("legacy.resources", "Resources")}
                <ChevronDown
                  className={`navbar-dropdown-chevron${resourceMenuOpen ? " open" : ""}`}
                />
              </button>
              {resourceMenuOpen ? (
                <div
                  className="navbar-dropdown-panel"
                  id={resourceMenuId}
                  role="menu"
                >
                  {resourceSub.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      className={`navbar-dropdown-link${location.pathname.startsWith(to) ? " active" : ""}`}
                      onClick={() => setResourceMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 opacity-80" />
                      {label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            {secondaryNav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `navbar-link${isActive || (to === "/sources-and-periods" && secondaryActivePaths.some((path) => location.pathname.startsWith(path))) ? " active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
            {user && (
              <span className="inline-flex items-center gap-1.5">
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                >
                  {user?.role === 1 || user?.role === 3
                    ? t("legacy.admin", "Admin")
                    : t("legacy.dashboard", "Dashboard")}
                </NavLink>
                {(user.status === "validated" || user.status === "approved") && (
                  <span title={t("validated_account", "Validated Account")}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </span>
                )}
                <NavLink
                  to="/my-download-requests"
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                >
                  {t("my_download_requests", "My Requests")}
                </NavLink>
              </span>
            )}
          </nav>

          {/* Right: Search, Theme, Language, Login */}
          <div className="navbar-right">
            {/* Search - Desktop */}
            <form className="navbar-search" onSubmit={handleSubmit(onSubmit)}>
              <Search className="navbar-search-icon" />
              <input
                {...searchField}
                type="search"
                placeholder={t("legacy.search", "Search...")}
                onFocus={handleSuggestFocus}
                onBlur={handleSuggestBlur}
                aria-label={t("legacy.search", "Search")}
                className="navbar-search-input"
              />
              {suggestOpen && (
                <div className="navbar-suggestions">
                  {suggestLoading ? (
                    <p className="navbar-suggest-item">
                      {t("legacy.loading", "Loading...")}
                    </p>
                  ) : suggestError ? (
                    <p className="navbar-suggest-item text-red-500">
                      {suggestError}
                    </p>
                  ) : suggestions.trees.length || suggestions.people.length ? (
                    <>
                      {suggestions.trees.map((item) => (
                        <button
                          key={`tree-${item.id}`}
                          type="button"
                          className="navbar-suggest-item"
                          onMouseDown={() => handlePickSuggestion(item.title)}
                        >
                          <strong>{item.title}</strong>
                          <span>{t("legacy.suggest_trees_heading", "Trees")}</span>
                        </button>
                      ))}
                      {suggestions.people.map((item) => (
                        <button
                          key={`person-${item.id}`}
                          type="button"
                          className="navbar-suggest-item"
                          onMouseDown={() =>
                            handlePickSuggestion(item.name || "")
                          }
                        >
                          <strong>
                            {item.name || t("legacy.unknown", "Unknown")}
                          </strong>
                          <span>
                            {item.tree_title
                              ? `${t("legacy.tree_prefix_colon", "Tree:")} ${item.tree_title}`
                              : t("legacy.person_singular", "Person")}
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className="navbar-suggest-item">
                      {t("legacy.no_results", "No suggestions")}
                    </p>
                  )}
                </div>
              )}
            </form>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="navbar-icon-btn"
              aria-label={t("legacy.toggle_theme", "Toggle color theme")}
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Language Menu */}
            <LanguageMenu buttonClassName="navbar-icon-btn navbar-lang-btn" />

            <Link
              to="/contact"
              className="navbar-icon-btn"
              aria-label={t("legacy.contact", "Contact")}
              title={t("legacy.contact", "Contact")}
            >
              <Phone className="w-5 h-5" />
            </Link>

            {/* Login/Logout - Desktop */}
            <div className="navbar-auth">
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="navbar-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("legacy.logout", "Logout")}</span>
                </button>
              ) : (
                <Link to="/login" className="navbar-login-btn">
                  <User className="w-4 h-4" />
                  <span>{t("legacy.login", "Login")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label={t("legacy.navigation_sidebar", "Side menu")}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={closeSidebar}>
            <EgyptianLogoMark size={36} className="text-[#d4a843]" />
            <div className="sidebar-logo-wordmark">
              <span className="sidebar-logo-main">Roots</span>
              <span className="sidebar-logo-sub">Egypt</span>
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label={t("legacy.close_menu", "Close menu")}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Search */}
        <form className="sidebar-search" onSubmit={handleSubmit(onSubmit)}>
          <Search className="sidebar-search-icon" />
          <input
            {...searchField}
            type="search"
            placeholder={t("legacy.search", "Search...")}
            className="sidebar-search-input"
          />
        </form>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">{t("legacy.menu", "Menu")}</div>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
            onClick={closeSidebar}
          >
            <Home className="sidebar-link-icon" />
            <span>{t("legacy.home", "Home")}</span>
            <ChevronRight className="sidebar-link-arrow" />
          </NavLink>

          <div className="sidebar-nav-label">{t("legacy.resources", "Resources")}</div>
          {resourceSub.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <Icon className="sidebar-link-icon" />
              <span>{label}</span>
              <ChevronRight className="sidebar-link-arrow" />
            </NavLink>
          ))}

          {secondaryNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <Icon className="sidebar-link-icon" />
              <span>{label}</span>
              <ChevronRight className="sidebar-link-arrow" />
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <LayoutDashboard className="sidebar-link-icon" />
              <span className="inline-flex items-center gap-1.5">
                {user?.role === 1 || user?.role === 3
                  ? t("legacy.admin", "Admin Panel")
                  : t("legacy.dashboard", "My Dashboard")}
                {(user.status === "validated" || user.status === "approved") && (
                  <span title={t("validated_account", "Validated Account")}>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </span>
                )}
              </span>
              <ChevronRight className="sidebar-link-arrow" />
            </NavLink>
          )}
          {user && (
            <NavLink
              to="/my-download-requests"
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <Download className="sidebar-link-icon" />
              <span>{t("my_download_requests", "My Requests")}</span>
              <ChevronRight className="sidebar-link-arrow" />
            </NavLink>
          )}
        </nav>

        {/* Sidebar Actions */}
        <div className="sidebar-actions">
          <div className="sidebar-nav-label">{t("legacy.settings", "Settings")}</div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
            }}
            className="sidebar-action-btn"
          >
            {theme === "dark" ? (
              <Sun className="sidebar-link-icon" />
            ) : (
              <Moon className="sidebar-link-icon" />
            )}
            <span>
              {theme === "dark"
                ? t("legacy.light_mode", "Light Mode")
                : t("legacy.dark_mode", "Dark Mode")}
            </span>
          </button>

          {/* Language */}
          <LanguageMenu
            buttonClassName="sidebar-action-btn w-full"
            align="left"
          />

          <Link
            to="/contact"
            className="sidebar-action-btn w-full"
            onClick={closeSidebar}
          >
            <Phone className="sidebar-link-icon" />
            <span>{t("legacy.contact", "Contact")}</span>
          </Link>
        </div>

        {/* Sidebar Footer - Auth */}
        <div className="sidebar-footer">
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                closeSidebar();
              }}
              className="sidebar-logout"
            >
              <LogOut className="w-5 h-5" />
              <span>{t("legacy.logout", "Logout")}</span>
            </button>
          ) : (
            <Link to="/login" className="sidebar-login" onClick={closeSidebar}>
              <User className="w-5 h-5" />
              <span>{t("legacy.login", "Login")}</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
