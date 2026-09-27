import { useMutation, useQuery } from "@tanstack/react-query";
import { getDreamApi, listDreamsApi, publishDreamApi } from "../api/dream";
import { getApiErrorMessage } from "../lib/api";
import type { publishDreamParams } from "../sharedTypes/dream/dream.model";

export const DREAM_QUERY_KEY = ["dreams"] as const;

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

export function getDreamErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, "Failed to publish dream");
}
