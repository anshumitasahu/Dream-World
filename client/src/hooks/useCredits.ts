import { useQuery } from "@tanstack/react-query";
import { getCreditsApi } from "../api/credit";
import { getToken } from "../lib/auth";

export const CREDIT_QUERY_KEY = ["credits"] as const;

export function useCredits() {
  return useQuery({
    queryKey: CREDIT_QUERY_KEY,
    queryFn: async () => {
      const response = await getCreditsApi();
      return response.data;
    },
    enabled: !!getToken(),
    retry: false,
    staleTime: 30 * 1000,
  });
}
