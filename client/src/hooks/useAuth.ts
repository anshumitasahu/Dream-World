import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { googleAuthApi, loginApi, meApi, signupApi } from "../api/auth";
import { clearToken, getToken, setToken } from "../lib/auth";
import type { authResponse } from "../sharedTypes/auth/auth.model";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useMe() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const response = await meApi();
      return response.data;
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

function useAuthSuccess() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (data: authResponse) => {
    setToken(data.token);
    queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    void navigate({ to: "/chat/new" });
  };
}

export function useLogin() {
  const onAuthSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => onAuthSuccess(data.data),
  });
}

export function useSignup() {
  const onAuthSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => onAuthSuccess(data.data),
  });
}

export function useGoogleAuth() {
  const onAuthSuccess = useAuthSuccess();
  return useMutation({
    mutationFn: (credential: string) => googleAuthApi(credential),
    onSuccess: (data) => onAuthSuccess(data.data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    clearToken();
    queryClient.setQueryData(AUTH_QUERY_KEY, null);
    void navigate({ to: "/auth/login" });
  };
}
