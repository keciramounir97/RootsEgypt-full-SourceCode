/**
 * useTrees - TanStack Query hooks for Trees CRUD
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
 * Fetch public trees
 */
export const usePublicTrees = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.trees.public(),
    queryFn: async () => {
      const { data } = await api.get("/trees");
      return Array.isArray(data) ? data : data?.trees || [];
    },
    ...CACHE_TIMES.SEMI_STATIC,
    ...options,
  });
};

/**
 * Fetch my trees (authenticated user)
 */
export const useMyTrees = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.trees.my(),
    queryFn: async () => {
      const { data } = await api.get("/my/trees");
      return Array.isArray(data) ? data : data?.trees || [];
    },
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch all trees (admin)
 */
export const useAdminTrees = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.trees.admin(),
    queryFn: async () => {
      const { data } = await api.get("/admin/trees");
      return Array.isArray(data) ? data : data?.trees || [];
    },
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch single tree by ID
 */
export const useTree = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.trees.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/trees/${id}`);
      return data;
    },
    enabled: !!id,
    ...CACHE_TIMES.SEMI_STATIC,
    ...options,
  });
};

/**
 * Fetch my tree by ID
 */
export const useMyTree = (id, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.trees.my(), id],
    queryFn: async () => {
      const { data } = await api.get(`/my/trees/${id}`);
      return data;
    },
    enabled: !!id,
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Fetch persons in a tree
 */
export const useTreePersons = (treeId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.trees.persons(treeId),
    queryFn: async () => {
      const { data } = await api.get(`/trees/${treeId}/persons`);
      return Array.isArray(data) ? data : data?.persons || [];
    },
    enabled: !!treeId,
    ...CACHE_TIMES.USER_DATA,
    ...options,
  });
};

/**
 * Create tree mutation
 */
export const useCreateTree = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post("/my/trees", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
    },
    ...options,
  });
};

/**
 * Update tree mutation
 */
export const useUpdateTree = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/my/trees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trees.detail(id) });
      const previousTree = queryClient.getQueryData(queryKeys.trees.detail(id));
      return { previousTree };
    },
    onError: (err, { id }, context) => {
      if (context?.previousTree) {
        queryClient.setQueryData(queryKeys.trees.detail(id), context.previousTree);
      }
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.detail(id) });
    },
    ...options,
  });
};

/**
 * Update tree mutation (admin)
 */
export const useAdminUpdateTree = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await api.put(`/admin/trees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.detail(id) });
    },
    ...options,
  });
};

/**
 * Delete tree mutation
 */
export const useDeleteTree = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/my/trees/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trees.my() });
      const previousTrees = queryClient.getQueryData(queryKeys.trees.my());
      
      queryClient.setQueryData(queryKeys.trees.my(), (old) =>
        old?.filter((tree) => tree.id !== id) || []
      );
      
      return { previousTrees };
    },
    onError: (err, id, context) => {
      if (context?.previousTrees) {
        queryClient.setQueryData(queryKeys.trees.my(), context.previousTrees);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
    },
    ...options,
  });
};

/**
 * Delete tree mutation (admin)
 */
export const useAdminDeleteTree = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/admin/trees/${id}`);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trees.admin() });
      const previousTrees = queryClient.getQueryData(queryKeys.trees.admin());
      
      queryClient.setQueryData(queryKeys.trees.admin(), (old) =>
        old?.filter((tree) => tree.id !== id) || []
      );
      
      return { previousTrees };
    },
    onError: (err, id, context) => {
      if (context?.previousTrees) {
        queryClient.setQueryData(queryKeys.trees.admin(), context.previousTrees);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
    },
    ...options,
  });
};

export default {
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
};
