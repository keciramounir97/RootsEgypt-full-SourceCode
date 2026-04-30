/**
 * useGallery - TanStack Query hooks for Gallery CRUD
 * 
 * Features:
 * - Automatic caching & deduplication
 * - Optimistic updates for mutations
 * - Automatic cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { queryKeys, CACHE_TIMES } from "../lib/queryClient";

/**
 * Fetch public gallery
 */
export const usePublicGallery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.gallery.public(),
    queryFn: async () => {
      const { data } = await api.get("/gallery");
      return Array.isArray(data) ? data : data?.images || [];
    },
    ...CACHE_TIMES.SEMI_STATIC,
    ...options,
  });
};

/**
 * Fetch my gallery (authenticated user)
 */
export const useMyGallery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.gallery.my(),
    queryFn: async () => {
      const { data } = await api.get("/my/gallery");
      return Array.isArray(data) ? data : data?.images || [];
    },
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch all gallery items (admin)
 */
export const useAdminGallery = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.gallery.admin(),
    queryFn: async () => {
      const { data } = await api.get("/admin/gallery");
      return Array.isArray(data) ? data : data?.images || [];
    },
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch single gallery item by ID
 */
export const useGalleryItem = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.gallery.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/gallery/${id}`);
      return data;
    },
    enabled: !!id,
    ...CACHE_TIMES.SEMI_STATIC,
    ...options,
  });
};

/**
 * Create gallery item mutation
 */
export const useCreateGalleryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post("/my/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    ...options,
  });
};

/**
 * Create gallery item mutation (admin)
 */
export const useAdminCreateGalleryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post("/admin/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    ...options,
  });
};

/**
 * Update gallery item mutation
 */
export const useUpdateGalleryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/my/gallery/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.gallery.detail(id) });
      const previousItem = queryClient.getQueryData(queryKeys.gallery.detail(id));
      return { previousItem };
    },
    onError: (err, { id }, context) => {
      if (context?.previousItem) {
        queryClient.setQueryData(queryKeys.gallery.detail(id), context.previousItem);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.detail(id) });
    },
    ...options,
  });
};

/**
 * Update gallery item mutation (admin)
 */
export const useAdminUpdateGalleryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/admin/gallery/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.detail(id) });
    },
    ...options,
  });
};

/**
 * Delete gallery item mutation
 */
export const useDeleteGalleryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/my/gallery/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.gallery.my() });
      const previousItems = queryClient.getQueryData(queryKeys.gallery.my());
      
      queryClient.setQueryData(queryKeys.gallery.my(), (old) =>
        old?.filter((item) => item.id !== id) || []
      );
      
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.gallery.my(), context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    ...options,
  });
};

/**
 * Delete gallery item mutation (admin)
 */
export const useAdminDeleteGalleryItem = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/gallery/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.gallery.admin() });
      const previousItems = queryClient.getQueryData(queryKeys.gallery.admin());
      
      queryClient.setQueryData(queryKeys.gallery.admin(), (old) =>
        old?.filter((item) => item.id !== id) || []
      );
      
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.gallery.admin(), context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery.all });
    },
    ...options,
  });
};

export default {
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
};
