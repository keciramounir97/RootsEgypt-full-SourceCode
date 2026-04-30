import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Archive,
  Download,
  Eye,
  FileText,
  Network,
  RefreshCcw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useThemeStore } from "../../store/theme";

import { api } from "../../api/client";
import {
  getApiErrorMessage,
  normalizeTree,
  requestWithFallback,
  shouldFallbackRoute,
} from "../../api/helpers";

import { useTranslation } from "../../context/TranslationContext";

import Toast from "../../components/Toast";
import ErrorBoundary from "../../components/ErrorBoundary";

import TreesBuilder, {
  buildGedcom,
  buildGedcom7,
  parseGedcom,
  parseGedcomX,
  buildGedcomXJson,
  buildGedcomXXml,
} from "../components/TreesBuilder";

import { useAuth } from "../components/AuthContext";

const MAX_GEDCOM_BYTES = 50 * 1024 * 1024;

interface TreeItem {
  id: string | number;
  title?: string;
  description?: string;
  archiveSource?: string;
  documentCode?: string;
  isPublic?: boolean;
  hasGedcom?: boolean;
  data_format?: string;
  owner?: unknown;
  owner_name?: string;
  is_public?: boolean;
  updatedAt?: string;
  [key: string]: unknown;
}

interface PersonItem {
  id?: string | number;
  [key: string]: unknown;
}

const buildMockTrees = () =>
  Array.from({ length: 10 }).map((_, i) => ({
    id: `mock-tree-${i}`,
    title: `Family Tree of Clan ${i + 1}`,
    description: `A mock tree with 20 members for testing.`,
    owner: "kameladmin",
    isPublic: i % 2 === 0,
    hasGedcom: true,
    createdAt: new Date().toISOString(),
  }));

export default function Trees() {
  const { theme } = useThemeStore();

  const { locale, t } = useTranslation();

  const { user } = useAuth();

  const isDark = theme === "dark";

  const isAdmin = user?.role === 1 || user?.role === 3;

  const pageBg = isDark ? "bg-[#0d1b2a]" : "bg-[#f5f1e8]";
  const text = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";
  const card = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const border = isDark ? "border-white/10" : "border-[#e8dfca]";
  const metaPanel = isDark
    ? "bg-white/5 border-white/10"
    : "bg-[#0c4a6e]/5 border-[#e8dfca]/80";

  const hoverRow = isDark ? "hover:bg-white/5" : "hover:bg-black/[0.02]";

  const inputBg = isDark ? "bg-[#0d1b2a]" : "bg-white";
  const inputText = isDark ? "text-[#f8f5ef]" : "text-[#0d1b2a]";

  const [tab, setTab] = useState("my"); // my | public

  const [q, setQ] = useState("");

  const [myTrees, setMyTrees] = useState<TreeItem[]>([]);

  const [publicTrees, setPublicTrees] = useState<TreeItem[]>([]);

  const [loadingTrees, setLoadingTrees] = useState(true);

  const [treesError, setTreesError] = useState("");

  const [selectedTree, setSelectedTree] = useState<TreeItem | null>(null);

  const [selectedScope, setSelectedScope] = useState<string | null>(null); // "my" | "public" | null

  const [loadingGedcom, setLoadingGedcom] = useState(false);

  const [gedcomError, setGedcomError] = useState("");

  const [people, setPeople] = useState<PersonItem[]>([]);

  const [saveFormat, setSaveFormat] = useState("gedcom"); // 'gedcom' | 'gedcomx_json' | 'gedcomx_xml' | 'gedcomx_gedx'
  const [treeForm, setTreeForm] = useState({
    title: "",

    description: "",

    archiveSource: "",

    documentCode: "",

    isPublic: false,
  });

  const [saving, setSaving] = useState(false);

  const [saveError, setSaveError] = useState("");

  const [saveSuccess, setSaveSuccess] = useState("");

  const [autoSaveNotice, setAutoSaveNotice] = useState("");

  const [autoSaving, setAutoSaving] = useState(false);

  const [deletingTree, setDeletingTree] = useState(false);

  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const autoSavePeopleRef = useRef<unknown>(null);

  const autoSaveInFlightRef = useRef(false);

  const peopleDirtyRef = useRef(false);

  const refreshLists = useCallback(async ({ notify = false } = {}) => {
    setLoadingTrees(true);

    setTreesError("");
    setSaveError("");

    const isMock =
      import.meta.env.DEV &&
      localStorage.getItem("mockupDataActive") === "true";

    const mockTrees = isMock ? buildMockTrees() : [];

    const mergeById = (list: TreeItem[]) => {
      const map = new Map();

      list.forEach((item) => {
        if (!item) return;

        map.set(String(item.id), item);
      });

      return Array.from(map.values()) as TreeItem[];
    };

    let loadError = "";

    try {
      const shouldFallbackAdminRead = (err: { response?: { status?: number } }) =>
        shouldFallbackRoute(err) ||
        err?.response?.status === 401 ||
        err?.response?.status === 403 ||
        err?.response?.status === 500;

      const myRequest = isAdmin
        ? () =>
            requestWithFallback(
              [() => api.get("/admin/trees"), () => api.get("/my/trees")],
              shouldFallbackAdminRead
            )
        : () => api.get("/my/trees");

      const [mineRes, pubRes] = await Promise.allSettled([
        myRequest(),
        api.get("/trees"),
      ]);

      if (mineRes.status === "fulfilled") {
        const mine = mineRes.value?.data;

        const myList = mergeById([
          ...(Array.isArray(mine) ? mine.map((t) => normalizeTree(t, { isPublic: !!t?.is_public || !!t?.isPublic })) : []),
          ...mockTrees,
        ]);

        setMyTrees(myList);
      } else if (isMock) {
        setMyTrees((prev) =>
          Array.isArray(prev) && prev.length ? prev : mockTrees
        );
      }

      if (pubRes.status === "fulfilled") {
        const pub = pubRes.value?.data;

        const publicList = mergeById([
          ...(Array.isArray(pub) ? pub.map((t) => normalizeTree(t, { isPublic: true })) : []),
          ...mockTrees.filter((t) => t.isPublic),
        ]);

        setPublicTrees(publicList);
      } else if (isMock) {
        setPublicTrees((prev) =>
          Array.isArray(prev) && prev.length
            ? prev
            : mockTrees.filter((t) => t.isPublic)
        );
      }

      const err =
        mineRes.status === "rejected"
          ? mineRes.reason
          : pubRes.status === "rejected"
          ? pubRes.reason
          : null;

      if (err) {
        loadError = getApiErrorMessage(err, "Failed to load trees");
        setTreesError(loadError);
        setSaveError(loadError);
      } else if (notify) {
        setSaveSuccess(t("trees_loaded", "Trees loaded."));
      }
    } finally {
      setLoadingTrees(false);
    }
  }, [isAdmin, t]);

  useEffect(() => {
    void refreshLists({ notify: true });
  }, [refreshLists]);

  useEffect(() => {
    if (!saveSuccess) return;

    const timer = setTimeout(() => setSaveSuccess(""), 3500);

    return () => clearTimeout(timer);
  }, [saveSuccess]);

  useEffect(() => {
    if (!saveError) return;

    const timer = setTimeout(() => setSaveError(""), 5000);

    return () => clearTimeout(timer);
  }, [saveError]);

  useEffect(() => {
    if (!autoSaveNotice) return;

    const timer = setTimeout(() => setAutoSaveNotice(""), 2500);

    return () => clearTimeout(timer);
  }, [autoSaveNotice]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedTree) {
      setTreeForm({
        title: "",
        description: "",
        archiveSource: "",
        documentCode: "",
        isPublic: false,
      });

      setSelectedScope(null);

      return;
    }

    setTreeForm({
      title: selectedTree.title || "",

      description: selectedTree.description || "",

      archiveSource: selectedTree.archiveSource || "",

      documentCode: selectedTree.documentCode || "",

      isPublic: !!selectedTree.isPublic,
    });
  }, [selectedTree]);

  useEffect(() => {
    autoSavePeopleRef.current = null;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);

      autoSaveTimerRef.current = null;
    }

    peopleDirtyRef.current = false;
  }, [selectedTree?.id, tab]);

  const trees = tab === "public" ? publicTrees : myTrees;

  const canUpdateSelected =
    selectedTree &&
    !String(selectedTree.id).startsWith("mock-") &&
    (selectedScope === "my" || isAdmin);

  const builderReadOnly = !!selectedTree && !canUpdateSelected;

  const filteredTrees = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) return trees;

    return trees.filter((tree) => {
      const title = String(tree.title || "").toLowerCase();

      const ownerRaw = tree.owner ?? tree.owner_name ?? "";

      const ownerValue =
        ownerRaw && typeof ownerRaw === "object"
          ? (ownerRaw as { fullName?: string; email?: string }).fullName || (ownerRaw as { fullName?: string; email?: string }).email || ""
          : ownerRaw || "";

      const owner = String(ownerValue).toLowerCase();

      return title.includes(query) || owner.includes(query);
    });
  }, [trees, q]);

  const upsertTree = (list: TreeItem[], patch: TreeItem) => {
    const id = String(patch?.id);

    const existing = list.find((t) => String(t?.id) === id) || null;

    const merged = existing ? { ...existing, ...patch } : patch;

    return [merged, ...list.filter((t) => String(t?.id) !== id)];
  };

  const applyTreeUpdate = ({
    id,
    title,
    description,
    isPublic,
    hasGedcom,
    archiveSource,
    documentCode,
    data_format,
  }: {
    id: string | number;
    title?: string;
    description?: string;
    isPublic?: boolean;
    hasGedcom?: boolean;
    archiveSource?: string;
    documentCode?: string;
    data_format?: string;
  }) => {
    const patch: TreeItem = {
      id,
      title,
      description: description ?? "",
      archiveSource: archiveSource ?? "",
      documentCode: documentCode ?? "",
      isPublic: !!isPublic,
      updatedAt: new Date().toISOString(),
    };
    if (hasGedcom !== undefined) patch.hasGedcom = !!hasGedcom;
    if (data_format !== undefined) patch.data_format = data_format;

    setMyTrees((prev) => upsertTree(prev, patch));

    setPublicTrees((prev) => {
      const without = prev.filter((t) => String(t.id) !== String(id));

      if (!isPublic) return without;

      const existing = prev.find((t) => String(t.id) === String(id)) || {};

      return upsertTree(without, { ...existing, ...patch });
    });

    setSelectedTree((prev) => {
      if (!prev) return prev;

      if (String(prev.id) !== String(id)) return prev;

      return { ...prev, ...patch };
    });
  };

  const openTree = async (tree: TreeItem) => {
    setSelectedScope(tab);

    setSelectedTree(tree);

    peopleDirtyRef.current = false;

    setGedcomError("");

    setLoadingGedcom(true);

    try {
    if (!tree?.hasGedcom) {
      setPeople([]);

      peopleDirtyRef.current = false;

      setSaveSuccess(t("tree_loaded", "Tree loaded."));

      return;
    }

      if (String(tree.id).startsWith("mock-")) {
        // GENERATE REALISTIC ARABIC FAMILY MEMBERS

        const familyName = (tree.title || "").split(" ").pop(); // e.g., "Al-Fulan"

        const mockPeople = [
          // Grandfather (Gen 0)

          {
            id: "m1",
            names: { en: `Ahmed ${familyName}`, ar: `أحمد ${familyName}` },
            gender: "Male",
            birthYear: "1920",
            details: "The patriarch.",
            color: "#f8f5ef",
            children: ["m3", "m4"],
            spouse: "m2",
          },

          {
            id: "m2",
            names: { en: `Fatima ${familyName}`, ar: `فاطمة ${familyName}` },
            gender: "Female",
            birthYear: "1925",
            details: "Matriarch.",
            color: "#f8f5ef",
            children: ["m3", "m4"],
            spouse: "m1",
          },

          // Children (Gen 1)

          {
            id: "m3",
            names: { en: `Omar ${familyName}`, ar: `عمر ${familyName}` },
            gender: "Male",
            birthYear: "1950",
            details: "Eldest son.",
            color: "#f8f5ef",
            father: "m1",
            mother: "m2",
            children: ["m5", "m6"],
            spouse: "s1",
          },

          {
            id: "m4",
            names: { en: `Layla ${familyName}`, ar: `ليلى ${familyName}` },
            gender: "Female",
            birthYear: "1955",
            details: "Daughter.",
            color: "#f8f5ef",
            father: "m1",
            mother: "m2",
            children: ["m7"],
            spouse: "s2",
          },

          // Spouses (Gen 1)

          {
            id: "s1",
            names: { en: "Amina Al-Jazairi", ar: "آمنة الجزائري" },
            gender: "Female",
            birthYear: "1952",
            details: "Wife of Omar.",
            color: "#f8f5ef",
            spouse: "m3",
            children: ["m5", "m6"],
          },

          {
            id: "s2",
            names: { en: "Youssef Al-Tunisi", ar: "يوسف التونسي" },
            gender: "Male",
            birthYear: "1950",
            details: "Husband of Layla.",
            color: "#f8f5ef",
            spouse: "m4",
            children: ["m7"],
          },

          // Grandchildren (Gen 2)

          {
            id: "m5",
            names: { en: `Khaled ${familyName}`, ar: `خالد ${familyName}` },
            gender: "Male",
            birthYear: "1980",
            details: "Grandson.",
            color: "#f8f5ef",
            father: "m3",
            mother: "s1",
          },

          {
            id: "m6",
            names: { en: `Zainab ${familyName}`, ar: `زينب ${familyName}` },
            gender: "Female",
            birthYear: "1985",
            details: "Granddaughter.",
            color: "#f8f5ef",
            father: "m3",
            mother: "s1",
          },

          {
            id: "m7",
            names: { en: `Hassan Al-Tunisi`, ar: `حسن التونسي` },
            gender: "Male",
            birthYear: "1982",
            details: "Grandson.",
            color: "#f8f5ef",
            father: "s2",
            mother: "m4",
          },
        ];

        setPeople(mockPeople);

        peopleDirtyRef.current = false;

        setSaveSuccess(t("tree_loaded", "Tree loaded."));

        setLoadingGedcom(false);

        return;
      }

      const opts = { responseType: "text" as const };
      const tryAdmin = () => api.get(`/admin/trees/${tree.id}/gedcom`, opts);
      const tryMy = () => api.get(`/my/trees/${tree.id}/gedcom`, opts);
      const tryPublic = () => api.get(`/trees/${tree.id}/gedcom`, opts);
      const fallbackGedcom = (err: { response?: { status?: number } }) =>
        err?.response?.status === 404 ||
        err?.response?.status === 403 ||
        err?.response?.status === 401 ||
        shouldFallbackRoute(err);

      const res = await requestWithFallback(
        tab === "public"
          ? [tryAdmin, tryPublic, tryMy]
          : [tryAdmin, tryMy, tryPublic],
        fallbackGedcom
      );

      const raw = typeof res?.data === "string" ? res.data : (res?.data && (res.data as any).data != null ? String((res.data as any).data) : "");
      const isGedcomX = tree.data_format === "gedcomx";
      setPeople(isGedcomX ? parseGedcomX(raw) : parseGedcom(raw));

      peopleDirtyRef.current = false;

      setSaveSuccess(t("tree_loaded", "Tree loaded."));
    } catch (err) {
      setPeople([]);

      setGedcomError(getApiErrorMessage(err, "Failed to load tree file"));

      peopleDirtyRef.current = false;
      setSaveError(getApiErrorMessage(err, "Failed to load tree file"));
    } finally {
      setLoadingGedcom(false);
    }
  };

  const shouldFallbackTreeWrite = (err: { response?: { status?: number } }) =>
    shouldFallbackRoute(err) || err?.response?.status === 500;

  const submitTree = async ({
    treeId,
    title,
    description,
    archiveSource,
    documentCode,
    isPublic,
    people = [] as PersonItem[],
    includeFile = true,
  }: {
    treeId?: string | number;
    title?: string;
    description?: string;
    archiveSource?: string;
    documentCode?: string;
    isPublic?: boolean;
    people?: PersonItem[];
    includeFile?: boolean;
  }) => {
    const safeTitle = String(title || "").trim();

    if (!safeTitle) throw new Error("Title is required");

    const fd = new FormData();

    fd.append("title", safeTitle);

    fd.append("description", String(description || ""));

    const archiveValue = String(archiveSource || "").trim();
    if (archiveValue) fd.append("archiveSource", archiveValue);

    const documentValue = String(documentCode || "").trim();
    if (documentValue) fd.append("documentCode", documentValue);

    fd.append("isPublic", String(!!isPublic));

    if (includeFile) {
      const safePeople = Array.isArray(people) ? people : [];
      let content = "";
      let mime = "text/plain";
      let ext = "ged";
      try {
        if (saveFormat === "gedcom") {
          content = buildGedcom(safePeople, locale, t);
          mime = "text/plain";
          ext = "ged";
        } else if (saveFormat === "gedcom7") {
          content = buildGedcom7(safePeople, locale, t);
          mime = "text/plain";
          ext = "ged";
        } else {
          if (saveFormat === "gedcomx_json") {
            content = buildGedcomXJson(safePeople, locale, t);
            mime = "application/json";
            ext = "json";
          } else {
            content = buildGedcomXXml(safePeople, locale, t);
            mime = saveFormat === "gedcomx_gedx" ? "application/xml" : "application/xml";
            ext = saveFormat === "gedcomx_gedx" ? "gedx" : "xml";
          }
        }
      } catch (err) {
        throw new Error(
          (err instanceof Error ? err.message : "") ||
            (saveFormat === "gedcom7"
              ? t("gedcom7_build_failed", "Failed to build GEDCOM 7.0")
              : saveFormat === "gedcom"
                ? t("gedcom_build_failed", "Failed to build GEDCOM")
                : t("gedcomx_build_failed", "Failed to build GEDCOM X"))
        );
      }
      const blob = new Blob([content], { type: mime });
      if (blob.size > MAX_GEDCOM_BYTES) {
        throw new Error(t("file_too_large", "File is too large (max 50MB)."));
      }
      const fileName = `${safeTitle}.${ext}`;
      if (typeof File === "function") {
        const file = new File([blob], fileName, { type: mime });
        fd.append("file", file);
      } else {
        fd.append("file", blob, fileName);
      }
      if (saveFormat === "gedcom7") fd.append("dataFormat", "gedcom7");
      else if (saveFormat === "gedcom") fd.append("dataFormat", "gedcom");
      else if (saveFormat.startsWith("gedcomx")) fd.append("dataFormat", "gedcomx");
    }

    if (treeId) {
      await requestWithFallback(
        [
          () => api.put(`/my/trees/${treeId}`, fd),
          () => api.post(`/my/trees/${treeId}/save`, fd),
        ],
        shouldFallbackTreeWrite
      );
      return treeId;
    }

    const { data } = await requestWithFallback(
      [() => api.post("/my/trees", fd)],
      shouldFallbackTreeWrite
    );

    return data?.id;
  };

  const downloadTreeFile = async (tree: TreeItem, scope: string) => {
    if (!tree?.id) return;
    const endpoint =
      scope === "public"
        ? `/trees/${tree.id}/gedcom`
        : `/my/trees/${tree.id}/gedcom`;

    try {
      const res = await api.get(endpoint, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      let fileName = String(tree.title || "tree").trim() || "tree";
      fileName = fileName.replace(/[^\w.-]+/g, "_");
      const disp = res.headers?.["content-disposition"];
      if (disp && /filename[*]?=(?:UTF-8'')?"?([^";\n]+)"?/i.test(disp)) {
        const match = disp.match(/filename[*]?=(?:UTF-8'')?"?([^";\n]+)"?/i);
        if (match && match[1]) fileName = match[1].trim();
      } else {
        const ext = tree.data_format === "gedcomx" ? "gedx" : "ged";
        fileName = `${fileName}.${ext}`;
      }
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setSaveError(
        getApiErrorMessage(err, t("download_failed", "Download failed"))
      );
    }
  };

  const runAutoSave = async () => {
    if (!canUpdateSelected) return;

    const pending = autoSavePeopleRef.current;

    if (!Array.isArray(pending)) return;

    if (autoSaveInFlightRef.current || saving) return;

    const tree = selectedTree;

    if (!tree) return;

    const nextTitle = String(treeForm.title || tree.title || "").trim();

    if (!nextTitle) return;

    const nextDescription =
      treeForm.description !== undefined && treeForm.description !== null
        ? String(treeForm.description)
        : String(tree.description || "");

    const nextIsPublic =
      treeForm.isPublic !== undefined && treeForm.isPublic !== null
        ? !!treeForm.isPublic
        : !!tree.isPublic;

    autoSaveInFlightRef.current = true;

    setAutoSaving(true);

    setSaveError("");

    try {
      const treeId = await submitTree({
        treeId: tree.id,

        title: nextTitle,

        description: nextDescription,

        archiveSource: treeForm.archiveSource || "",

        documentCode: treeForm.documentCode || "",

        isPublic: nextIsPublic,

        people: pending,

        includeFile: true,
      });

      if (treeId) {
        applyTreeUpdate({
          id: treeId,
          title: nextTitle,
          description: nextDescription,
          archiveSource: treeForm.archiveSource || "",
          documentCode: treeForm.documentCode || "",
          isPublic: nextIsPublic,
          hasGedcom: true,
          data_format: selectedTree?.data_format,
        });

        setAutoSaveNotice(t("auto_saved", "Auto-saved."));

        peopleDirtyRef.current = false;

        autoSavePeopleRef.current = null;

        refreshLists();
      }
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Auto-save failed"));
    } finally {
      autoSaveInFlightRef.current = false;

      setAutoSaving(false);
    }
  };

  const scheduleAutoSave = (nextPeople: PersonItem[]) => {
    if (!canUpdateSelected) return;

    peopleDirtyRef.current = true;

    autoSavePeopleRef.current = nextPeople;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      void runAutoSave();
    }, 800);
  };

  const clearCanvas = () => {
    setSelectedTree(null);

    setSelectedScope(null);

    setPeople([]);

    setGedcomError("");

    peopleDirtyRef.current = false;
  };

  const saveCurrentAsTree = async () => {
    setSaveError("");

    setSaveSuccess("");

    const isUpdateMode = Boolean(canUpdateSelected && selectedTree?.id);

    const hasPeople = people.length > 0;

    const title = String(treeForm.title || "").trim();

    if (!title) {
      setSaveError(t("tree_title_required", "Tree title is required."));

      return;
    }

    if (!hasPeople && !isUpdateMode) {
      const confirmed = window.confirm(
        t("save_empty_tree_confirm", "Save this tree without any people yet?")
      );

      if (!confirmed) return;
    }

    const description = String(treeForm.description || "");

    const isPublic = !!treeForm.isPublic;

    setSaving(true);

    try {
      const includeFile = isUpdateMode ? peopleDirtyRef.current : hasPeople;

      const nextHasGedcom = includeFile
        ? true
        : isUpdateMode
        ? selectedTree?.hasGedcom
        : false;

      const treeId = await submitTree({
        treeId: canUpdateSelected ? selectedTree?.id : null,

        title,

        description,

        archiveSource: treeForm.archiveSource || "",

        documentCode: treeForm.documentCode || "",

        isPublic,

        people,

        includeFile,
      });

      if (treeId) {
        const nextDataFormat = includeFile
          ? (saveFormat === "gedcom" ? "gedcom" : saveFormat === "gedcom7" ? "gedcom7" : "gedcomx")
          : selectedTree?.data_format;
        applyTreeUpdate({
          id: treeId,
          title,
          description,
          archiveSource: treeForm.archiveSource || "",
          documentCode: treeForm.documentCode || "",
          isPublic,
          hasGedcom: nextHasGedcom,
          data_format: nextDataFormat,
        });

        setTab("my");

        setSaveSuccess(
          t(
            isUpdateMode ? "tree_updated" : "tree_saved",

            isUpdateMode ? "Tree updated." : "Tree saved."
          )
        );

        if (!canUpdateSelected) {
          const nextDataFormat = includeFile
            ? (saveFormat === "gedcom" ? "gedcom" : saveFormat === "gedcom7" ? "gedcom7" : "gedcomx")
            : undefined;
          setSelectedTree({
            id: treeId,
            title,
            description,
            archiveSource: treeForm.archiveSource || "",
            documentCode: treeForm.documentCode || "",
            isPublic,
            hasGedcom: nextHasGedcom,
            data_format: nextDataFormat,
          });
          setSelectedScope("my");
        }

        peopleDirtyRef.current = false;
      }

      await refreshLists();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const deleteTree = async () => {
    if (!canUpdateSelected || !selectedTree) return;

    const shouldDelete = window.confirm(
      t(
        "confirm_delete_tree",

        "Delete this tree? This action cannot be undone."
      )
    );

    if (!shouldDelete) return;

    const deletedId = selectedTree.id;

    setDeletingTree(true);

    setSaveError("");

    setSaveSuccess("");

    try {
      await requestWithFallback(
        [
          () => api.delete(`/admin/trees/${selectedTree.id}`),
          () => api.delete(`/my/trees/${selectedTree.id}`),
        ],
        (e) => e?.response?.status === 403 || e?.response?.status === 404
      );

      setMyTrees((prev) =>
        prev.filter((t) => String(t.id) !== String(deletedId))
      );

      setPublicTrees((prev) =>
        prev.filter((t) => String(t.id) !== String(deletedId))
      );

      setSelectedTree(null);

      setSelectedScope(null);

      setPeople([]);

      peopleDirtyRef.current = false;

      await refreshLists();

      setTab("my");

      setSaveSuccess(t("tree_deleted", "Tree deleted."));
    } catch (err) {
      const deleteErr = err as { response?: { status?: number } };
      if (deleteErr?.response?.status === 404) {
        setMyTrees((prev) =>
          prev.filter((t) => String(t.id) !== String(deletedId))
        );

        setPublicTrees((prev) =>
          prev.filter((t) => String(t.id) !== String(deletedId))
        );

        setSelectedTree(null);
        setSelectedScope(null);
        setPeople([]);
        peopleDirtyRef.current = false;
        await refreshLists();
        setTab("my");
        setSaveSuccess(t("tree_deleted", "Tree deleted."));
        return;
      }
      setSaveError(
        getApiErrorMessage(err, t("delete_failed", "Delete failed"))
      );
    } finally {
      setDeletingTree(false);
    }
  };

  const saveToast = saveError || saveSuccess;

  const saveToastTone = saveError ? "error" : "success";

  return (
    <div className={`p-4 min-h-screen ${pageBg} ${text} heritage-page-root`}>
      <Toast message={saveToast} tone={saveToastTone} />

      <div
        className={`rounded-lg p-5 mb-6 border ${border}

        bg-gradient-to-r from-[#0d1b2a]/10 to-[#556b2f]/10 heritage-panel heritage-panel--accent`}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Network className={`w-6 h-6 ${isDark ? 'text-teal' : 'text-[#0c4a6e]'}`} />

            <div>
              <h3 className="text-2xl font-bold">
                {t("trees_builder", "Family Tree Builder")}
              </h3>

              <p className="opacity-70">
                {t(
                  "trees_builder_desc",
                  "Public trees are visible to everyone; private trees are only for you."
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-md border ${border} hover:opacity-90 inline-flex items-center gap-2`}
              onClick={() => void refreshLists({ notify: true })}
              disabled={loadingTrees}
            >
              <RefreshCcw className="w-4 h-4" />

              {t("refresh", "Refresh")}
            </button>
          </div>
        </div>

        {treesError || gedcomError ? (
          <div
            className={`mt-4 rounded-lg border ${border} ${card} p-4 heritage-panel`}
          >
            {treesError ? (
              <div className="text-[#a0552a] font-semibold">{treesError}</div>
            ) : null}

            {gedcomError ? (
              <div className="text-[#a0552a] font-semibold">{gedcomError}</div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-6">
          <div
            className={`rounded-xl border ${border} ${card} p-5 shadow-md heritage-panel`}
          >
            <div className={`text-lg font-bold mb-4 ${isDark ? 'text-[#f8f5ef]' : 'text-[#0d1b2a]'}`}>
              {selectedTree
                ? t("tree_details", "Tree Details")
                : t("new_tree", "New Tree")}
            </div>

            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("tree_title", "Tree title")} <span className="text-red-500">*</span>
                </label>
                <input
                  value={treeForm.title}
                  onChange={(e) =>
                    setTreeForm((s) => ({ ...s, title: e.target.value }))
                  }
                  placeholder={t("tree_title", "Tree title")}
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${border} ${inputBg} ${inputText}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("description", "Description")} <span className="text-xs opacity-60">({t("optional", "Optional")})</span>
                </label>
                <textarea
                  value={treeForm.description}
                  onChange={(e) =>
                    setTreeForm((s) => ({ ...s, description: e.target.value }))
                  }
                  placeholder={t("description", "Description (optional)")}
                  rows={3}
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${border} ${inputBg} ${inputText}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all resize-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("archive_source", "Archive Source")} <span className="text-xs opacity-60">({t("optional", "Optional")})</span>
                </label>
                <input
                  value={treeForm.archiveSource}
                  onChange={(e) =>
                    setTreeForm((s) => ({ ...s, archiveSource: e.target.value }))
                  }
                  placeholder={t("archive_source", "Archive Source (optional)")}
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${border} ${inputBg} ${inputText}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {t("document_code", "Document Code")} <span className="text-xs opacity-60">({t("optional", "Optional")})</span>
                </label>
                <input
                  value={treeForm.documentCode}
                  onChange={(e) =>
                    setTreeForm((s) => ({ ...s, documentCode: e.target.value }))
                  }
                  placeholder={t("document_code", "Document Code (optional)")}
                  className={`heritage-input w-full px-4 py-2.5 rounded-lg border ${border} ${inputBg} ${inputText}
                  focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50 transition-all`}
                />
              </div>

              <label className={`flex items-center gap-3 p-3 rounded-lg border ${border} 
              ${isDark ? 'bg-white/5' : 'bg-[#f8f5ef]/50'} cursor-pointer transition-all hover:opacity-90`}>
                <input
                  type="checkbox"
                  checked={treeForm.isPublic}
                  onChange={(e) =>
                    setTreeForm((s) => ({ ...s, isPublic: e.target.checked }))
                  }
                  className={`h-5 w-5 rounded border-2 ${border} 
                  ${isDark ? 'accent-teal' : 'accent-[#0c4a6e]'} cursor-pointer`}
                />
                <span className={`text-sm font-semibold ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`}>
                  {treeForm.isPublic
                    ? t("public", "Public")
                    : t("private", "Private")}
                </span>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <span className={isDark ? "text-[#e8dfca]" : "text-[#0c4a6e]"}>{t("save_file_as", "Save file as")}:</span>
                <select
                  value={saveFormat}
                  onChange={(e) => setSaveFormat(e.target.value)}
                  className={`rounded-lg border ${border} px-3 py-2 text-sm ${inputBg} ${inputText}`}
                >
                  <option value="gedcom">{t("gedcom_format_551", "GEDCOM 5.5.1")}</option>
                  <option value="gedcom7">{t("format_gedcom7", "GEDCOM 7.0")}</option>
                  <option value="gedcomx_json">{t("gedcomx_format_json", "GEDCOM X (JSON)")}</option>
                  <option value="gedcomx_xml">{t("gedcomx_format_xml", "GEDCOM X (XML)")}</option>
                  <option value="gedcomx_gedx">{t("gedcomx_format_gedx", "GEDCOM X (.gedx)")}</option>
                </select>
              </label>
              <button
                type="button"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60
                ${isDark 
                  ? 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white' 
                  : 'bg-[#0c4a6e] hover:bg-[#0c4a6e]/90 text-white'
                }`}
                onClick={() => void saveCurrentAsTree()}
                disabled={saving || loadingGedcom || deletingTree}
              >
                <Save className="w-4 h-4" />
                {saving
                  ? t("saving", "Saving...")
                  : canUpdateSelected
                  ? t("update_tree", "Update Tree")
                  : t("save_tree", "Save Tree")}
              </button>

              <button
                type="button"
                className={`px-4 py-2.5 rounded-lg border ${border} inline-flex items-center gap-2 font-medium transition-all
                ${isDark 
                  ? 'bg-white/10 hover:bg-white/15 text-white' 
                  : 'bg-white hover:bg-[#f8f5ef] text-[#0c4a6e]'
                }`}
                onClick={clearCanvas}
                disabled={saving || loadingGedcom}
                title={t("clear_canvas", "Clear canvas")}
              >
                <Trash2 className="w-4 h-4" />
                {t("clear", "Clear")}
              </button>

              {canUpdateSelected && selectedTree ? (
                <button
                  type="button"
                  className={`px-4 py-2.5 rounded-lg border ${border} text-sm font-semibold inline-flex items-center gap-2 transition-all
                  ${isDark 
                    ? 'bg-red-600/80 hover:bg-red-600 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                  onClick={() => void deleteTree()}
                  disabled={
                    deletingTree || saving || loadingGedcom || autoSaving
                  }
                >
                  <X className="w-4 h-4" />
                  {deletingTree
                    ? t("deleting", "Deleting...")
                    : t("delete_tree", "Delete Tree")}
                </button>
              ) : null}
            </div>

            {autoSaving ? (
              <div className="text-xs opacity-70 mt-2">
                {t("auto_saving", "Auto-saving...")}
              </div>
            ) : autoSaveNotice ? (
              <div className="text-xs opacity-70 mt-2">{autoSaveNotice}</div>
            ) : null}
          </div>

          <div
            className={`rounded-xl border ${border} ${card} p-5 shadow-md heritage-panel`}
          >
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                  tab === "my"
                    ? `${isDark ? 'bg-[#0c4a6e] text-white border-[#0c4a6e] shadow-md' : 'bg-[#0c4a6e] text-white border-[#0c4a6e] shadow-md'}`
                    : `${border} ${hoverRow} ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`
                }`}
                onClick={() => setTab("my")}
              >
                {t("my_trees", "My Trees")}
              </button>

              <button
                type="button"
                className={`px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                  tab === "public"
                    ? `${isDark ? 'bg-[#0c4a6e] text-white border-[#0c4a6e] shadow-md' : 'bg-[#0c4a6e] text-white border-[#0c4a6e] shadow-md'}`
                    : `${border} ${hoverRow} ${isDark ? 'text-[#e8dfca]' : 'text-[#0c4a6e]'}`
                }`}
                onClick={() => setTab("public")}
              >
                {t("public_trees", "Public Trees")}
              </button>
            </div>

            <div className="relative mb-4">
              <Search className={`w-4 h-4 absolute rtl:right-3 rtl:left-auto ltr:left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-teal/60' : 'text-[#0c4a6e]/60'}`} />

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className={`heritage-input w-full rtl:pr-9 rtl:pl-3 ltr:pl-9 ltr:pr-3 py-2.5 rounded-lg border
                focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/25 focus:border-[#0c4a6e]/50
                transition-all ${inputBg} ${inputText} ${border}`}
                placeholder={t("search_trees", "Search trees...")}
              />
            </div>

            {loadingTrees ? (
              <div className="py-8 text-center opacity-70">
                {t("loading", "Loading...")}
              </div>
            ) : filteredTrees.length === 0 ? (
              <div className="py-8 text-center opacity-70">
                {t("no_trees_found", "No trees found.")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredTrees.map((tree) => {
                  const active = selectedTree?.id === tree.id;
                  const canDownload =
                    Number.isFinite(Number(tree.id)) && tree.hasGedcom;

                  return (
                    <div
                      key={tree.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => void openTree(tree)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          void openTree(tree);
                        }
                      }}
                      className={`${card} border ${border} rounded-xl shadow-md overflow-hidden transition-all 
                      focus:outline-none focus:ring-2 focus:ring-[#0c4a6e]/40 cursor-pointer
                      ${
                        active
                          ? `ring-2 ring-[#0c4a6e]/50 border-[#0c4a6e] ${isDark ? 'bg-[#0c4a6e]/20' : 'bg-[#0c4a6e]/10'} shadow-lg scale-[1.02]`
                          : `hover:shadow-lg hover:border-[#0c4a6e]/30 ${hoverRow}`
                      }`}
                    >
                      <div className="p-4 border-b border-white/5 bg-gradient-to-r from-primary-brown/10 via-teal/5 to-terracotta/5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-[#0c4a6e] opacity-70">
                              {t("trees", "Family Trees")}
                            </p>
                            <h3 className="text-xl font-bold truncate">
                              {tree.title}
                            </h3>
                            <p className="text-sm opacity-70">
                              {String(tree.owner || t("unknown", "Unknown"))}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${border}`}
                          >
                            {tree.isPublic
                              ? t("public", "Public")
                              : t("private", "Private")}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        <p className="text-sm opacity-80 line-clamp-3">
                          {tree.description ||
                            t("no_description", "No description.")}
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div
                            className={`${metaPanel} border rounded-xl p-3 flex items-start gap-2`}
                          >
                            <Archive className="w-4 h-4 text-terracotta mt-0.5" />
                            <div>
                              <p className="text-[10px] uppercase opacity-60">
                                {t("archive_source", "Archive Source")}
                              </p>
                              <p className="text-xs font-semibold break-words">
                                {tree.archiveSource ||
                                  t("not_provided", "Not provided")}
                              </p>
                            </div>
                          </div>
                          <div
                            className={`${metaPanel} border rounded-xl p-3 flex items-start gap-2`}
                          >
                            <FileText className="w-4 h-4 text-teal mt-0.5" />
                            <div>
                              <p className="text-[10px] uppercase opacity-60">
                                {t("document_code", "Document Code")}
                              </p>
                              <p className="text-xs font-semibold font-mono break-words">
                                {tree.documentCode ||
                                  t("not_provided", "Not provided")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="text-xs opacity-70 flex items-center gap-2 flex-wrap">
                          <Users className="w-4 h-4" />
                          {tree.hasGedcom
                            ? t("has_file", "Has file")
                            : t("no_file", "No file")}
                          {tree.hasGedcom && tree.data_format === "gedcomx" ? (
                            <span className="px-2 py-0.5 rounded bg-[#0c4a6e]/20 text-[#0c4a6e] dark:text-teal font-medium">
                              {t("saved_with_gedcomx", "Saved with GEDCOM X")}
                            </span>
                          ) : null}
                          {tree.hasGedcom && tree.data_format === "gedcom7" ? (
                            <span className="px-2 py-0.5 rounded bg-[#0c4a6e]/20 text-[#0c4a6e] dark:text-teal font-medium">
                              {t("saved_with_gedcom7", "Saved with GEDCOM 7.0")}
                            </span>
                          ) : null}
                          {tree.hasGedcom && tree.data_format !== "gedcomx" && tree.data_format !== "gedcom7" ? (
                            <span className="px-2 py-0.5 rounded bg-[#0c4a6e]/10 text-[#0c4a6e]/80 dark:text-[#e8dfca]/80 font-medium">
                              {t("saved_with_gedcom551", "Saved with GEDCOM 5.5.1")}
                            </span>
                          ) : null}
                          {loadingGedcom && active ? (
                            <span className="ml-auto">
                              {t("loading", "Loading...")}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void openTree(tree);
                            }}
                            className={`px-4 py-2 rounded-md border ${border} hover:opacity-90 inline-flex items-center gap-2`}
                          >
                            <Eye className="w-4 h-4" />
                            {t("view_tree", "View Tree")}
                          </button>
                        {canDownload ? (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                void downloadTreeFile(tree, tab);
                              }}
                              className="interactive-btn btn-neu btn-neu--primary px-4 py-2 inline-flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              {tree.data_format === "gedcomx"
                                ? t("download_gedcomx", "Download GEDCOM X")
                                : tree.data_format === "gedcom7"
                                  ? t("download_gedcom7", "Download GEDCOM 7.0")
                                  : t("download_gedcom551", "Download GEDCOM 5.5.1")}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div
          className={`rounded-xl border ${border} ${card} p-6 w-full shadow-md heritage-panel`}
        >
          <div className="mb-4">
            <div className={`text-xl font-bold mb-1 ${isDark ? 'text-[#f8f5ef]' : 'text-[#0d1b2a]'}`}>
              {selectedTree ? selectedTree.title : t("canvas", "Canvas")}
            </div>

            <div className={`text-sm ${isDark ? 'text-[#e8dfca]/70' : 'text-[#6c5249]'}`}>
              {selectedTree
                ? selectedTree.description || ""
                : t("canvas_hint", "Import a file or add people to start.")}
            </div>
          </div>

          <ErrorBoundary
            fallback={({ error, reset }) => (
              <div className={`rounded-lg border ${border} ${metaPanel} p-4`}>
                <div className="font-semibold">
                  {t("tree_builder_error", "Tree builder failed to load.")}
                </div>
                <div className="text-sm opacity-70">
                  {error?.message ||
                    t("tree_builder_try_again", "Please try again.")}
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className={`mt-3 inline-flex items-center rounded-md border ${border} px-3 py-1 text-xs font-semibold uppercase tracking-wide`}
                >
                  {t("retry", "Retry")}
                </button>
              </div>
            )}
          >
            <TreesBuilder
              people={people}
              setPeople={setPeople}
              dataFormat={selectedTree?.data_format === "gedcomx" ? "gedcomx" : selectedTree?.data_format === "gedcom7" ? "gedcom7" : "gedcom"}
              onAutoSave={scheduleAutoSave}
              readOnly={builderReadOnly}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
