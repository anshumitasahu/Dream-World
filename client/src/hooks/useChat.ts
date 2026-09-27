import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createChatApi, getChatApi, listChatsApi, sendMessageApi } from "../api/chat";
import { getApiErrorMessage } from "../lib/api";

export const CHAT_QUERY_KEY = ["chats"] as const;

export function useCreateChat() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => createChatApi(message),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, "list"] });
      void navigate({ to: "/chat/$chatid", params: { chatid: response.data.id } });
    },
  });
}

export function useChats() {
  return useQuery({
    queryKey: [...CHAT_QUERY_KEY, "list"],
    queryFn: async () => {
      const response = await listChatsApi();
      return response.data;
    },
    retry: false,
    staleTime: 30 * 1000,
  });
}

export function useChat(id: string) {
  return useQuery({
    queryKey: [...CHAT_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getChatApi(id);
      return response.data;
    },
    enabled: !!id,
    retry: false,
  });
}

export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => sendMessageApi(chatId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, chatId] });
    },
  });
}

export function getChatErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, "Failed to send message");
}
