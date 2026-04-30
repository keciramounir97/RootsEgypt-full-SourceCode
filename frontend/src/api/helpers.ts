import { api } from "./client";

interface TreeRaw {
  id?: string | number;
  title?: string;
  description?: string;
  archive_source?: string;
  archiveSource?: string;
  document_code?: string;
  documentCode?: string;
  is_public?: boolean;
  isPublic?: boolean;
  gedcom_path?: string;
  gedcomPath?: string;
  owner?: unknown;
  owner_name?: unknown;
  created_at?: string;
  createdAt?: string;
  data_format?: string;
  dataFormat?: string;
  [key: string]: unknown;
}

interface OwnerObject {
  full_name?: string;
  fullName?: string;
  email?: string;
}

interface ApiErrorOverrides {
  unauthorized?: string;
  forbidden?: string;
  notFound?: string;
  tooLarge?: string;
  unsupported?: string;
  invalid?: string;
  unavailable?: string;
  network?: string;
}

/** Normalize tree from API (snake_case → camelCase, add hasGedcom, gedcomUrl, owner) */
export const normalizeTree = (tree: TreeRaw, options?: { apiRoot?: string; isPublic?: boolean }) => {
  if (!tree) return tree;
  const baseUrl = options?.apiRoot ?? "";
  const isPublic = options?.isPublic ?? (tree.is_public ?? tree.isPublic ?? false);
  const ownerRaw = tree.owner ?? tree.owner_name ?? "";
  const owner =
    ownerRaw && typeof ownerRaw === "object"
      ? (ownerRaw as OwnerObject).full_name ?? (ownerRaw as OwnerObject).fullName ?? (ownerRaw as OwnerObject).email ?? ""
      : (ownerRaw as string) ?? "";
  const hasGedcom = !!(tree.gedcom_path ?? tree.gedcomPath);
  const gedcomPath = hasGedcom
    ? (isPublic ? `/api/trees/${tree.id}/gedcom` : `/api/my/trees/${tree.id}/gedcom`)
    : null;
  const gedcomUrl = gedcomPath ? (baseUrl ? `${baseUrl}${gedcomPath}` : gedcomPath) : null;
  return {
    ...tree,
    id: tree.id,
    title: tree.title ?? "",
    description: tree.description ?? "",
    archiveSource: tree.archive_source ?? tree.archiveSource ?? "",
    documentCode: tree.document_code ?? tree.documentCode ?? "",
    isPublic: !!isPublic,
    hasGedcom,
    gedcomUrl,
    owner,
    createdAt: tree.created_at ?? tree.createdAt,
    data_format: tree.data_format ?? tree.dataFormat,
  };
};

export const getApiRoot = () => {
  const base = String(api.defaults.baseURL || "");
  return base.replace(/\/api\/?$/, "");
};

export const shouldFallbackRoute = (error: unknown) => {
  const err = error as { response?: { status?: number } };
  const status = err?.response?.status;
  return status === 404 || status === 405 || status === 501;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const requestWithFallback = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requests: Array<() => Promise<any>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shouldFallback: (err: any) => boolean = shouldFallbackRoute
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  let lastError;
  for (const request of requests) {
    try {
      return await request();
    } catch (err) {
      lastError = err;
      if (!shouldFallback(err)) break;
    }
  }
  throw lastError;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Operation failed",
  overrides: ApiErrorOverrides = {}
) => {
  const err = error as { response?: { status?: number; data?: { message?: string; error?: string } | string }; code?: string };
  const status = err?.response?.status;
  let serverMessage: string | undefined;
  const data = err?.response?.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    serverMessage = (data as { message?: string; error?: string }).message || (data as { message?: string; error?: string }).error;
  }
  if (!serverMessage && typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as { message?: string; error?: string };
      serverMessage = parsed?.message || parsed?.error;
    } catch {
      // leave serverMessage falsy
    }
  }

  if (err?.code === "AUTH_MISSING") {
    return overrides.unauthorized || "Please log in to continue.";
  }
  if (status === 401) {
    return (
      overrides.unauthorized ||
      serverMessage ||
      "Session expired. Please log in again."
    );
  }
  if (status === 403) {
    return (
      overrides.forbidden ||
      serverMessage ||
      "You do not have permission to perform this action."
    );
  }
  if (status === 404) {
    return (
      overrides.notFound ||
      serverMessage ||
      "Resource not found. The tree or GEDCOM file may be missing."
    );
  }
  if (status === 413) {
    return overrides.tooLarge || serverMessage || "File is too large.";
  }
  if (status === 415) {
    return overrides.unsupported || serverMessage || "Unsupported file type.";
  }
  if (status === 422) {
    return overrides.invalid || serverMessage || "Invalid data provided.";
  }
  if (status === 503) {
    return (
      overrides.unavailable ||
      serverMessage ||
      "Service unavailable. Please try again later."
    );
  }
  if (err?.code === "ERR_NETWORK") {
    return overrides.network || "Network error. Please try again.";
  }

  return serverMessage || fallback;
};
