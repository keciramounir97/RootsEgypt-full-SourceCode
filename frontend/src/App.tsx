import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Suspense, memo } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "./context/TranslationContext";

// ===== EAGERLY LOADED (Critical Path) =====
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/motion/PageTransition";

/** Wrapper that uses useLocation so App stays a valid hook boundary. */
function AppWithRouter() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoadingFallback />} key={location.pathname}>
          <AppRoutes />
        </Suspense>
      </AnimatePresence>
      {!isAdminRoute && <Footer />}
    </>
  );
}

// ===== EAGER-LOAD ALL ROUTE COMPONENTS =====
import Home from "./pages/home";
import GalleryPage from "./pages/Gallery";
import LibraryPage from "./pages/library";
import GenealogyGallery from "./pages/genealogy-gallery";
import Periods from "./pages/periods";
import SourcesAndArchives from "./pages/SourcesAndArchives";
import AudioPage from "./pages/audio";
import ArticlesPage from "./pages/articles";
import ContactPage from "./pages/contactUs";
import Login from "./pages/login";
import Signup from "./pages/signup";
import ResetPassword from "./pages/resetpassword";
import ErrorPage from "./pages/error";
import AdminLayout from "./admin/AdminLayout";
import ProtectedRoute from "./admin/components/protectedRoute";
import Dashboard from "./admin/pages/Dashboard";
import Trees from "./admin/pages/Trees";
import AdminGallery from "./admin/pages/Gallery";
import AdminBooks from "./admin/pages/Books";
import AdminAudios from "./admin/pages/Audios";
import AdminDocuments from "./admin/pages/Documents";
import AdminArticles from "./admin/pages/Articles";
import AdminSuggestions from "./admin/pages/Suggestions";
import NewsletterSubscribers from "./admin/pages/NewsletterSubscribers";
import ContactMessages from "./admin/pages/ContactMessages";
import SuperAdminApprovals from "./admin/pages/SuperAdminApprovals";
import AdminManagement from "./admin/pages/AdminManagement";
import UserApprovals from "./admin/pages/UserApprovals";
import UsersPage from "./admin/pages/Users";
import Settings from "./admin/pages/Settings";
import ActivityLog from "./admin/pages/ActivityLog";

/**
 * Loading Fallback Component
 */
const LoadingFallback = memo(function LoadingFallback() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-beige dark:bg-[#060e1c]">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-primary-brown/20 dark:border-teal/25 rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-teal rounded-full animate-spin" />
          <div
            className="absolute inset-2 border-2 border-transparent border-b-primary-brown/40 dark:border-b-teal/50 rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
        <p className="text-primary-brown dark:text-teal font-cinzel text-lg tracking-widest">
          {t("loading", "Loading...")}
        </p>
      </div>
    </div>
  );
});

/**
 * Admin Loading Fallback (smaller, for nested routes)
 */
const AdminLoadingFallback = memo(function AdminLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="w-8 h-8 border-3 border-teal border-t-transparent rounded-full animate-spin" />
    </div>
  );
});

/**
 * Route definitions with page transitions
 */
function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route
        path="/"
        element={
          <PageTransition>
            <Home />
          </PageTransition>
        }
      />
      <Route
        path="/gallery"
        element={
          <PageTransition>
            <GalleryPage />
          </PageTransition>
        }
      />
      <Route
        path="/genealogy-gallery"
        element={
          <PageTransition>
            <GenealogyGallery />
          </PageTransition>
        }
      />
      <Route
        path="/library"
        element={
          <PageTransition>
            <LibraryPage />
          </PageTransition>
        }
      />
      <Route
        path="/audio"
        element={
          <PageTransition>
            <AudioPage />
          </PageTransition>
        }
      />
      <Route
        path="/articles"
        element={
          <PageTransition>
            <ArticlesPage />
          </PageTransition>
        }
      />
      <Route
        path="/periods"
        element={
          <PageTransition>
            <Periods />
          </PageTransition>
        }
      />
      <Route
        path="/contact"
        element={
          <PageTransition>
            <ContactPage />
          </PageTransition>
        }
      />
      {/* Unified Sources & Archives page */}
      <Route
        path="/archives"
        element={
          <PageTransition>
            <SourcesAndArchives />
          </PageTransition>
        }
      />
      <Route
        path="/sources"
        element={
          <PageTransition>
            <SourcesAndArchives />
          </PageTransition>
        }
      />
      <Route path="/access-reliability" element={<SourcesAndArchives />} />
      <Route path="/sourcesandarchives" element={<SourcesAndArchives />} />
      <Route path="/research" element={<Navigate to="/" replace />} />

      {/* ===== AUTH ROUTES ===== */}
      <Route
        path="/login"
        element={
          <PageTransition>
            <Login />
          </PageTransition>
        }
      />
      <Route
        path="/signup"
        element={
          <PageTransition>
            <Signup />
          </PageTransition>
        }
      />
      <Route
        path="/resetpassword"
        element={
          <PageTransition>
            <ResetPassword />
          </PageTransition>
        }
      />

      {/* ===== ADMIN ROUTES ===== */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="trees"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <Trees />
            </Suspense>
          }
        />
        <Route
          path="gallery"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminGallery />
            </Suspense>
          }
        />
        <Route
          path="books"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminBooks />
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <UsersPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <Settings />
            </Suspense>
          }
        />
        <Route
          path="activity"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ActivityLog />
            </Suspense>
          }
        />
        <Route
          path="audios"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminAudios />
            </Suspense>
          }
        />
        <Route
          path="documents"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminDocuments />
            </Suspense>
          }
        />
        <Route
          path="articles"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminArticles />
            </Suspense>
          }
        />
        <Route
          path="suggestions"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminSuggestions />
            </Suspense>
          }
        />
        <Route
          path="newsletter"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <NewsletterSubscribers />
            </Suspense>
          }
        />
        <Route
          path="contact-messages"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ContactMessages />
            </Suspense>
          }
        />
        <Route
          path="approvals"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <SuperAdminApprovals />
            </Suspense>
          }
        />
        <Route
          path="admin-management"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <AdminManagement />
            </Suspense>
          }
        />
        <Route
          path="user-approvals"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <UserApprovals />
            </Suspense>
          }
        />
      </Route>

      {/* ===== FALLBACK ===== */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

/**
 * Main App Component
 */
function App() {
  return <AppWithRouter />;
}

export default App;
