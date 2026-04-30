/**
 * Centralized Hooks Export
 * 
 * Re-exports all TanStack Query hooks for easy importing
 */

// Books hooks
export {
  usePublicBooks,
  useMyBooks,
  useAdminBooks,
  useBook,
  useCreateBook,
  useAdminCreateBook,
  useUpdateBook,
  useAdminUpdateBook,
  useDeleteBook,
  useAdminDeleteBook,
} from "./useBooks";

// Trees hooks
export {
  usePublicTrees,
  useMyTrees,
  useAdminTrees,
  useTree,
  useMyTree,
  useTreePersons,
  useCreateTree,
  useUpdateTree,
  useAdminUpdateTree,
  useDeleteTree,
  useAdminDeleteTree,
} from "./useTrees";

// Gallery hooks
export {
  usePublicGallery,
  useMyGallery,
  useAdminGallery,
  useGalleryItem,
  useCreateGalleryItem,
  useAdminCreateGalleryItem,
  useUpdateGalleryItem,
  useAdminUpdateGalleryItem,
  useDeleteGalleryItem,
  useAdminDeleteGalleryItem,
} from "./useGallery";

// Re-export query utilities
export { queryKeys, CACHE_TIMES, clearQueryCache, invalidateQueries } from "../lib/queryClient";
