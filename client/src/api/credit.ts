import api from "../lib/api";
import type { creditSummary } from "../sharedTypes/credit/credit.model";

interface apiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getCreditsApi(): Promise<apiEnvelope<creditSummary>> {
  const response = await api.get<apiEnvelope<creditSummary>>("/credits");
  return response.data;
}
