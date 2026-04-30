/**
 * useBooks - TanStack Query hooks for Books CRUD
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
 * Fetch public books
 */
export const usePublicBooks = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.books.public(),
    queryFn: async () => {
      const { data } = await api.get("/books");
      return Array.isArray(data) ? data : data?.books || [];
    },
    ...CACHE_TIMES.SEMI_STATIC,
    ...options,
  });
};

/**
 * Fetch my books (authenticated user)
 */
export const useMyBooks = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.books.my(),
    queryFn: async () => {
      const { data } = await api.get("/my/books");
      return Array.isArray(data) ? data : data?.books || [];
    },
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch all books (admin)
 */
export const useAdminBooks = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.books.admin(),
    queryFn: async () => {
      const { data } = await api.get("/admin/books");
      return Array.isArray(data) ? data : data?.books || [];
    },
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch single book by ID
 */
export const useBook = (id: string | number | undefined, options = {}) => {
  return useQuery({
    queryKey: queryKeys.books.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/books/${id}`);
      return data;
    },
    enabled: !!id,
    ...CACHE_TIMES.SEMI_STATIC,
    ...options,
  });
};

/**
 * Create book mutation
 */
export const useCreateBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post("/my/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate all book lists to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
    ...options,
  });
};

/**
 * Create book mutation (admin)
 */
export const useAdminCreateBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post("/admin/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
    ...options,
  });
};

/**
 * Update book mutation
 */
export const useUpdateBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: string | number; formData: FormData }) => {
      const { data } = await api.put(`/my/books/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    // Optimistic update
    onMutate: async ({ id, formData }: { id: string | number; formData: FormData }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.detail(id) });
      const previousBook = queryClient.getQueryData(queryKeys.books.detail(id));
      
      // Optimistically update the detail
      if (previousBook) {
        queryClient.setQueryData(queryKeys.books.detail(id), (old) => ({
          ...old,
          ...Object.fromEntries(formData.entries()),
        }));
      }
      
      return { previousBook };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousBook) {
        queryClient.setQueryData(queryKeys.books.detail(id), context.previousBook);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(id) });
    },
    ...options,
  });
};

/**
 * Update book mutation (admin)
 */
export const useAdminUpdateBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/admin/books/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.books.detail(id) });
    },
    ...options,
  });
};

/**
 * Delete book mutation
 */
export const useDeleteBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/my/books/${id}`);
      return id;
    },
    // Optimistic delete
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.my() });
      const previousBooks = queryClient.getQueryData(queryKeys.books.my());
      
      // Remove from list optimistically
      queryClient.setQueryData(queryKeys.books.my(), (old) =>
        old?.filter((book) => book.id !== id) || []
      );
      
      return { previousBooks };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousBooks) {
        queryClient.setQueryData(queryKeys.books.my(), context.previousBooks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
    ...options,
  });
};

/**
 * Delete book mutation (admin)
 */
export const useAdminDeleteBook = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/books/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.books.admin() });
      const previousBooks = queryClient.getQueryData(queryKeys.books.admin());
      
      queryClient.setQueryData(queryKeys.books.admin(), (old) =>
        old?.filter((book) => book.id !== id) || []
      );
      
      return { previousBooks };
    },
    onError: (err, id, context) => {
      if (context?.previousBooks) {
        queryClient.setQueryData(queryKeys.books.admin(), context.previousBooks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
    },
    ...options,
  });
};

export default {
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
};
