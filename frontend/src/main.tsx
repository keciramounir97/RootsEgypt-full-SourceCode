import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "react-hot-toast";

import "./index.css";
import "./App.css";
import App from "./App";
import { AuthProvider } from "./admin/components/AuthContext";
import { TranslationProvider } from "./context/TranslationContext";
import { queryClient } from "./lib/queryClient";
import { GlobalProvider } from "./context/GlobalContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { NotificationProvider } from "./context/NotificationContext";
import BackendPanel from "./components/BackendPanel";

import { seedMockStorage } from "./lib/seedMockStorage";
import { isMockMode } from "./lib/mockApi";

// Seed mock articles/comments into localStorage on first load
if (isMockMode()) {
  seedMockStorage();
}

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <GlobalProvider>
            <TranslationProvider>
              <NotificationProvider>
                <FavoritesProvider>
                  <AuthProvider>
                    <App />
                    <Toaster position="top-center" />
                    <BackendPanel />
                  </AuthProvider>
                </FavoritesProvider>
              </NotificationProvider>
            </TranslationProvider>
          </GlobalProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
