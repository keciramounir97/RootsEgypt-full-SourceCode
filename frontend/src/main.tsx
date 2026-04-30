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

try {
  localStorage.removeItem("mockupDataActive");
  localStorage.removeItem("rootsegypt_mock_mode");
  localStorage.removeItem("rootsegypt_mock_logged_user");
  localStorage.removeItem("rootsegypt_api_url");
} catch {
  // ignore storage cleanup failures
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
