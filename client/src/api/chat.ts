import api from "../libs/api";
import type { WorldConfig } from "../components/World/WorldTypes";

export interface apiEnvelope<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ChatHistoryEntry {
    id: string;
    userChatId: string;
    message: WorldConfig | string;
    response: WorldConfig | string;
    createdAt: string;
    updatedAt: string;
}

export interface Chat {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatDetail extends Chat {
    userChatHistories: ChatHistoryEntry[];
    dream: { id: string } | null;
}

export async function createChatApi(message: string): Promise<apiEnvelope<ChatDetail>> {
    const response = await api.post<apiEnvelope<ChatDetail>>('/chats', { message });
    return response.data;
}

export async function sendMessageApi(chatId: string, message: string): Promise<apiEnvelope<ChatHistoryEntry>> {
    const response = await api.post<apiEnvelope<ChatHistoryEntry>>(`/chats/${chatId}/messages`, { message })
    return response.data;
}

export async function getChatApi(chatId: string): Promise<apiEnvelope<ChatDetail>> {
    const response = await api.get<apiEnvelope<ChatDetail>>(`/chats/${chatId}`);
    return response.data
}

export async function listChatApi(): Promise<apiEnvelope<Chat[]>> {
    const response = await api.get<apiEnvelope<Chat[]>>('/chats');
    return response.data;
}