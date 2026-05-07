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
export const usePublicTrees = (options: any = {}) => {
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
export const useMyTrees = (options: any = {}) => {
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
export const useAdminTrees = (options: any = {}) => {
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
export const useTree = (id: any, options: any = {}) => {
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
export const useMyTree = (id: any, options: any = {}) => {
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
export const useTreePersons = (treeId: any, options: any = {}) => {
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
export const useCreateTree = (options: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: any) => {
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
export const useUpdateTree = (options: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: any) => {
      const { data } = await api.put(`/my/trees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onMutate: async ({ id }: any) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trees.detail(id) });
      const previousTree = queryClient.getQueryData(queryKeys.trees.detail(id));
      return { previousTree };
    },
    onError: (err: any, { id }: any, context: any) => {
      if (context?.previousTree) {
        queryClient.setQueryData(queryKeys.trees.detail(id), context.previousTree);
      }
    },
    onSettled: (data: any, error: any, { id }: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.detail(id) });
    },
    ...options,
  });
};

/**
 * Update tree mutation (admin)
 */
export const useAdminUpdateTree = (options: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: any) => {
      const { data } = await api.put(`/admin/trees/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: (data: any, { id }: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.trees.detail(id) });
    },
    ...options,
  });
};

/**
 * Delete tree mutation
 */
export const useDeleteTree = (options: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: any) => {
      await api.delete(`/my/trees/${id}`);
      return id;
    },
    onMutate: async (id: any) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trees.my() });
      const previousTrees = queryClient.getQueryData(queryKeys.trees.my());
      
      queryClient.setQueryData(queryKeys.trees.my(), (old: any[] | undefined) =>
        old?.filter((tree) => tree.id !== id) || []
      );
      
      return { previousTrees };
    },
    onError: (err: any, id: any, context: any) => {
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
export const useAdminDeleteTree = (options: any = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: any) => {
      await api.delete(`/admin/trees/${id}`);
      return id;
    },
    onMutate: async (id: any) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.trees.admin() });
      const previousTrees = queryClient.getQueryData(queryKeys.trees.admin());
      
      queryClient.setQueryData(queryKeys.trees.admin(), (old: any[] | undefined) =>
        old?.filter((tree) => tree.id !== id) || []
      );
      
      return { previousTrees };
    },
    onError: (err: any, id: any, context: any) => {
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
