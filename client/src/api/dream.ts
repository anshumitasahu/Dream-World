import api from "../libs/api";
import type { apiEnvelope } from "./chat";
import type { dream, publishDreamParams } from "../sharedTypes/dream.model";

export async function publishDreamApi(input: publishDreamParams): Promise<apiEnvelope<dream>> {
    const response = await api.post<apiEnvelope<dream>>("/dreams", input);
    return response.data;
}

export async function getDreamApi(id: string): Promise<apiEnvelope<dream>>  {
    const response = await api.get<apiEnvelope<dream>>(`/dreams/${id}`);
    return response.data;
}

export async function listDreansApi(): Promise<apiEnvelope<dream[]>> {
    const rexponse = await api.get<apiEnvelope<dream[]>>("/dreams");
    return rexponse.data;
}