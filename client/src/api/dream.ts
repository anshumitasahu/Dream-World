import api from "../lib/api";
import type { apiEnvelope } from "./chat";
import type {
  dream,
  dreamLikeResult,
  dreamWorldDetail,
  exploreDream,
  publishDreamParams,
} from "../sharedTypes/dream/dream.model";

export async function publishDreamApi(input: publishDreamParams): Promise<apiEnvelope<dream>> {
  const response = await api.post<apiEnvelope<dream>>("/dreams", input);
  return response.data;
}

export async function getDreamApi(id: string): Promise<apiEnvelope<dream>> {
  const response = await api.get<apiEnvelope<dream>>(`/dreams/${id}`);
  return response.data;
}

export async function listDreamsApi(): Promise<apiEnvelope<dream[]>> {
  const response = await api.get<apiEnvelope<dream[]>>("/dreams");
  return response.data;
}

export async function listExploreDreamsApi(): Promise<apiEnvelope<exploreDream[]>> {
  const response = await api.get<apiEnvelope<exploreDream[]>>("/dreams/explore");
  return response.data;
}

export async function getDreamWorldApi(id: string): Promise<apiEnvelope<dreamWorldDetail>> {
  const response = await api.get<apiEnvelope<dreamWorldDetail>>(`/dreams/${id}/world`);
  return response.data;
}

export async function likeDreamApi(id: string): Promise<apiEnvelope<dreamLikeResult>> {
  const response = await api.post<apiEnvelope<dreamLikeResult>>(`/dreams/${id}/like`);
  return response.data;
}

export async function unlikeDreamApi(id: string): Promise<apiEnvelope<dreamLikeResult>> {
  const response = await api.delete<apiEnvelope<dreamLikeResult>>(`/dreams/${id}/like`);
  return response.data;
}
