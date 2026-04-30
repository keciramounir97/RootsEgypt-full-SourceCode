export const classNames = (...args: unknown[]) => args.filter(Boolean).join(" ");

export const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString();
  } catch {
    return iso;
  }
};
