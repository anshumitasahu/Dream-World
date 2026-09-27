import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDreamApi,
  getDreamWorldApi,
  likeDreamApi,
  listDreamsApi,
  listExploreDreamsApi,
  publishDreamApi,
  unlikeDreamApi,
} from "../api/dream";
import { getApiErrorMessage } from "../lib/api";
import type {
  dreamWorldDetail,
  exploreDream,
  publishDreamParams,
} from "../sharedTypes/dream/dream.model";

export const DREAM_QUERY_KEY = ["dreams"] as const;
export const EXPLORE_QUERY_KEY = ["dreams", "explore"] as const;

export function usePublishDream(chatId: string) {
  return useMutation({
    mutationFn: ({ title, tags }: { title: string; tags: string[] }) =>
      publishDreamApi({ userChatId: chatId, title, tags } satisfies publishDreamParams),
  });
}

export function useDreams() {
  return useQuery({
    queryKey: [...DREAM_QUERY_KEY, "list"],
    queryFn: async () => {
      const response = await listDreamsApi();
      return response.data;
    },
    retry: false,
    staleTime: 30 * 1000,
  });
}

export function useDream(id: string) {
  return useQuery({
    queryKey: [...DREAM_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getDreamApi(id);
      return response.data;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useExploreDreams() {
  return useQuery({
    queryKey: EXPLORE_QUERY_KEY,
    queryFn: async () => {
      const response = await listExploreDreamsApi();
      return response.data;
    },
    retry: false,
    staleTime: 30 * 1000,
  });
}

export function useDreamWorld(id: string) {
  return useQuery({
    queryKey: [...DREAM_QUERY_KEY, "world", id],
    queryFn: async () => {
      const response = await getDreamWorldApi(id);
      return response.data;
    },
    enabled: !!id,
    retry: false,
  });
}

function withLike(dream: exploreDream, liked: boolean): exploreDream {
  if (dream.likedByMe === liked) return dream;
  return { ...dream, likedByMe: liked, likes: Math.max(0, dream.likes + (liked ? 1 : -1)) };
}

/** Like/unlike with an optimistic count so the heart reacts instantly, then refetch to re-sort. */
export function useSetLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dreamId, liked }: { dreamId: string; liked: boolean }) => {
      const response = liked ? await likeDreamApi(dreamId) : await unlikeDreamApi(dreamId);
      return response.data;
    },
    onMutate: async ({ dreamId, liked }) => {
      const worldKey = [...DREAM_QUERY_KEY, "world", dreamId] as const;

      await queryClient.cancelQueries({ queryKey: EXPLORE_QUERY_KEY });
      const previousList = queryClient.getQueryData<exploreDream[]>(EXPLORE_QUERY_KEY);
      if (previousList) {
        queryClient.setQueryData(
          EXPLORE_QUERY_KEY,
          previousList.map((dream) => (dream.id === dreamId ? withLike(dream, liked) : dream)),
        );
      }

      const previousWorld = queryClient.getQueryData<dreamWorldDetail>(worldKey);
      if (previousWorld) {
        queryClient.setQueryData(worldKey, { ...previousWorld, dream: withLike(previousWorld.dream, liked) });
      }

      return { previousList, previousWorld, worldKey };
    },
    onError: (_error, _input, context) => {
      if (context?.previousList) queryClient.setQueryData(EXPLORE_QUERY_KEY, context.previousList);
      if (context?.previousWorld) queryClient.setQueryData(context.worldKey, context.previousWorld);
    },
    onSettled: (_data, _error, { dreamId }) => {
      void queryClient.invalidateQueries({ queryKey: EXPLORE_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: [...DREAM_QUERY_KEY, "world", dreamId] });
    },
  });
}

export function getDreamErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, "Failed to publish dream");
}
