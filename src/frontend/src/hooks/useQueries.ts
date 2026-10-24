/**
 * Shared React Query hooks for the BK PERFORMANCE PRO backend.
 *
 * Every backend operation goes through these hooks. The real actor from
 * `useActor(createActor)` remains the production data layer.
 */

import { createActor } from "@/backend";
import type {
  CreateGameRequest,
  Game,
  GameId,
  GenerateSensitivityRequest,
  GeneratedSensitivity,
  OptimizationProfile,
  SaveOptimizationProfileRequest,
  SaveSensitivityProfileRequest,
  SensitivityProfile,
  UpdateGameRequest,
  UpdateSensitivityProfileRequest,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const queryKeys = {
  games: ["games"] as const,
  optimizationProfiles: ["optimizationProfiles"] as const,
  sensitivityProfiles: ["sensitivityProfiles"] as const,
};

/* ------------------------------- Games ------------------------------- */

export function useGames() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Game[]>({
    queryKey: queryKeys.games,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateGame() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateGameRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createGame(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.games });
    },
  });
}

export function useUpdateGame() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: UpdateGameRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateGame(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.games });
    },
  });
}

export function useDeleteGame() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: GameId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteGame(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.games });
    },
  });
}

/* -------------------------- Optimization ---------------------------- */

export function useOptimizationProfiles() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<OptimizationProfile[]>({
    queryKey: queryKeys.optimizationProfiles,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOptimizationProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveOptimizationProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: SaveOptimizationProfileRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveOptimizationProfile(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.optimizationProfiles,
      });
    },
  });
}

export function useApplyOptimizationProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.applyOptimizationProfile({ id });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.optimizationProfiles,
      });
    },
  });
}

export function useRestoreOptimizationProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.restoreOptimizationProfile({ id });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.optimizationProfiles,
      });
    },
  });
}

export function useDeleteOptimizationProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteOptimizationProfile({ id });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.optimizationProfiles,
      });
    },
  });
}

/* --------------------------- Sensitivity ---------------------------- */

export function useSensitivityProfiles() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<SensitivityProfile[]>({
    queryKey: queryKeys.sensitivityProfiles,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSensitivityProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveSensitivityProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: SaveSensitivityProfileRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.saveSensitivityProfile(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sensitivityProfiles,
      });
    },
  });
}

export function useUpdateSensitivityProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: UpdateSensitivityProfileRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateSensitivityProfile(request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sensitivityProfiles,
      });
    },
  });
}

export function useDeleteSensitivityProfile() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteSensitivityProfile({ id });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.sensitivityProfiles,
      });
    },
  });
}

/**
 * Generate a Free Fire sensitivity from the chosen device, DPI mode and level.
 * Stateless backend query — no cache invalidation needed.
 */
export function useGenerateSensitivity() {
  const { actor } = useActor(createActor);
  return useMutation<GeneratedSensitivity, Error, GenerateSensitivityRequest>({
    mutationFn: async (request: GenerateSensitivityRequest) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.generateSensitivity(request);
    },
  });
}
