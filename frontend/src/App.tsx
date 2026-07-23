import { Routes, Route, useLocation } from "react-router-dom";
import { Suspense, memo } from "react";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "./i18n";

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
import Library from "./pages/library";
import About from "./pages/about";
import Cookies from "./pages/cookies";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import MyDownloadRequests from "./pages/MyDownloadRequests";
import HelpCenter from "./pages/HelpCenter";
import Subscriptions from "./pages/subscriptions";
import Payment from "./pages/payment";
import Tasks from "./pages/tasks";
import Notes from "./pages/notes";
import Reminders from "./pages/reminders";
import AdminNotes from "./admin/pages/AdminNotes";
import AdminTasks from "./admin/pages/AdminTasks";
import SubscriptionPayments from "./admin/pages/SubscriptionPayments";
import SubscriptionsAdmin from "./admin/pages/Subscriptions";
import TierFeatures from "./admin/pages/TierFeatures";
import UserUpgrade from "./admin/pages/UserUpgrade";
import Home from "./pages/home";
import GalleryPage from "./pages/Gallery";
import GalleryTrees from "./pages/GalleryTrees";
import GalleryImages from "./pages/GalleryImages";
import GalleryAudios from "./pages/GalleryAudios";
import GalleryBooks from "./pages/GalleryBooks";
import GalleryDocuments from "./pages/GalleryDocuments";
import GalleryArticles from "./pages/GalleryArticles";
import GenealogyGallery from "./pages/genealogy-gallery";
import Periods from "./pages/periods";
import Research from "./pages/Research";
import SourcesAndPeriods from "./pages/SourcesAndArchives";
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
import PaymentSettings from "./admin/pages/PaymentSettings";
import Backups from "./admin/pages/Backups";
import ActivityLog from "./admin/pages/ActivityLog";
import FooterSettings from "./admin/pages/FooterSettings";
import HeroImages from "./admin/pages/HeroImages";
import BackgroundImages from "./admin/pages/BackgroundImages";
import ValidationApprovals from "./admin/pages/ValidationApprovals";
import PasswordResetRequests from "./admin/pages/PasswordResetRequests";
import AccountDeletionRequests from "./admin/pages/AccountDeletionRequests";
import RoleDistribution from "./admin/pages/RoleDistribution";
import LegalContent from "./admin/pages/LegalContent";
import DownloadRequests from "./admin/pages/DownloadRequests";

/**
 * Loading Fallback Component
 */
const LoadingFallback = memo(function LoadingFallback() {
  const { t } = useLanguage();
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
          {t("legacy.loading", "Loading...")}
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
        path="/gallery/trees"
        element={
          <PageTransition>
            <GalleryTrees />
          </PageTransition>
        }
      />
      <Route
        path="/gallery/images"
        element={
          <PageTransition>
            <GalleryImages />
          </PageTransition>
        }
      />
      <Route
        path="/gallery/audios"
        element={
          <PageTransition>
            <GalleryAudios />
          </PageTransition>
        }
      />
      <Route
        path="/gallery/documents"
        element={
          <PageTransition>
            <GalleryDocuments />
          </PageTransition>
        }
      />
      <Route
        path="/gallery/books"
        element={
          <PageTransition>
            <GalleryBooks />
          </PageTransition>
        }
      />
      <Route
        path="/gallery/articles"
        element={
          <PageTransition>
            <GalleryArticles />
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
            <Library />
          </PageTransition>
        }
      />
      <Route path="/about" element={<PageTransition><About /></PageTransition>} />
      <Route path="/cookies" element={<PageTransition><Cookies /></PageTransition>} />
      <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
      <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
      <Route path="/my-download-requests" element={<PageTransition><MyDownloadRequests /></PageTransition>} />
      <Route path="/help-center" element={<PageTransition><HelpCenter /></PageTransition>} />
      <Route path="/subscriptions" element={<PageTransition><Subscriptions /></PageTransition>} />
      <Route path="/payment/:tier" element={<PageTransition><Payment /></PageTransition>} />
      <Route path="/tasks" element={<PageTransition><Tasks /></PageTransition>} />
      <Route path="/notes" element={<PageTransition><Notes /></PageTransition>} />
      <Route path="/reminders" element={<PageTransition><Reminders /></PageTransition>} />
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
      {/* Unified Sources & Periods page */}
      <Route
        path="/sources-and-periods"
        element={
          <PageTransition>
            <SourcesAndPeriods />
          </PageTransition>
        }
      />
      <Route
        path="/sources-periods"
        element={
          <PageTransition>
            <SourcesAndPeriods />
          </PageTransition>
        }
      />
      <Route
        path="/archives"
        element={
          <PageTransition>
            <SourcesAndPeriods />
          </PageTransition>
        }
      />
      <Route
        path="/sources"
        element={
          <PageTransition>
            <SourcesAndPeriods />
          </PageTransition>
        }
      />
      <Route path="/access-reliability" element={<SourcesAndPeriods />} />
      <Route path="/sourcesandarchives" element={<SourcesAndPeriods />} />
      <Route
        path="/research"
        element={
          <PageTransition>
            <Research />
          </PageTransition>
        }
      />

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
      <Route
        path="/myprofile"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* ===== ADMIN ROUTES ===== */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<LoadingFallback />}>
            <ProtectedRoute roles={[1, 3]}>
              <AdminLayout />
            </ProtectedRoute>
          </Suspense>
        }
      >
        <Route
          index
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["dashboard"]}>
                <Dashboard />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="trees"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["trees"]}>
                <Trees />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="gallery"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["gallery"]}>
                <AdminGallery />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="books"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["books"]}>
                <AdminBooks />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="users"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["users"]}>
                <UsersPage />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["settings"]}>
                <Settings />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="footer-settings"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["footer-settings", "settings"]}>
                <FooterSettings />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route path="payment-settings" element={<PaymentSettings />} />
        <Route path="backups" element={<Backups />} />
        <Route
          path="legal-content"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <LegalContent />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="hero-images"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["hero-images"]}>
                <HeroImages />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="background-images"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["background-images"]}>
                <BackgroundImages />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="activity"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["activity"]}>
                <ActivityLog />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="audios"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["audios"]}>
                <AdminAudios />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="documents"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["documents"]}>
                <AdminDocuments />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="articles"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["articles"]}>
                <AdminArticles />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="suggestions"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["suggestions"]}>
                <AdminSuggestions />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="validation-approvals"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["validation-approvals"]}>
                <ValidationApprovals />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="download-requests"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["download-requests"]}>
                <DownloadRequests />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="newsletter"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["newsletter"]}>
                <NewsletterSubscribers />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="contact-messages"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["contact-messages"]}>
                <ContactMessages />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="approvals"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <SuperAdminApprovals />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="password-reset-requests"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <PasswordResetRequests />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="account-deletion-requests"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <AccountDeletionRequests />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="role-distribution"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <RoleDistribution />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="admins"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <AdminManagement />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="admin-management"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <AdminManagement />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="notes"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["notes"]}>
                <AdminNotes />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="tasks"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["tasks"]}>
                <AdminTasks />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="subscriptions"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <SubscriptionsAdmin />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="tier-features"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <TierFeatures />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="subscription-payments"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <SubscriptionPayments />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="user-upgrade"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute roles={[3]}>
                <UserUpgrade />
              </ProtectedRoute>
            </Suspense>
          }
        />
        <Route
          path="user-approvals"
          element={
            <Suspense fallback={<AdminLoadingFallback />}>
              <ProtectedRoute privileges={["validation-approvals"]}>
                <UserApprovals />
              </ProtectedRoute>
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
