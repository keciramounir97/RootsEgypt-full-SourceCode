import toast from "react-hot-toast";

export type AdminToastTone = "success" | "error";

export const ADMIN_TOAST_EVENT = "admin:toast";

export const notifyAdmin = (message: string, tone: AdminToastTone = "success") => {
  if (typeof window === "undefined" || !message) return;
  window.dispatchEvent(
    new CustomEvent(ADMIN_TOAST_EVENT, {
      detail: { message, tone },
    }),
  );
  if (tone === "error") toast.error(message);
  else toast.success(message);
};

export const notifyAdminSaved = (message = "Saved.") => {
  notifyAdmin(message, "success");
};
