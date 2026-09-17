import api from "../lib/api";
import { authResponse, authUser, loginParams, signupParams } from "../sharedTypes/auth/auth.model";

interface apiEnvelope<T> {
    success: boolean;
    message: string;
    data: T;
}

export async function signupApi(body: signupParams): Promise<apiEnvelope<authResponse>> {
    const response = await api.post<apiEnvelope<authResponse>>("/auth/signup", body);
    return response.data;
}

export async function loginApi(body: loginParams): Promise<apiEnvelope<authResponse>> {
    const response = await api.post<apiEnvelope<authResponse>>("/auth/login", body);
    return response.data;
}

export async function googleAuthApi(credential: string): Promise<apiEnvelope<authResponse>> {
    const response = await api.post<apiEnvelope<authResponse>>("/auth/google", { credential })
    return response.data
}

export async function meApi(): Promise<apiEnvelope<authUser>> {
    const response = await api.get<apiEnvelope<authUser>>("/auth/me");
    return response.data
}