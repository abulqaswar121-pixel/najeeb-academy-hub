import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { fetchMe, signOutFn } from "./server-fns";

export const AGENCY_URL = "https://agency.ndh.com.ng";
export const ACADEMY_URL = "https://academy.ndh.com.ng";

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const meQueryOptions = {
  queryKey: ["me"] as const,
  queryFn: () => fetchMe(),
};

export function useMe() {
  return useQuery(meQueryOptions);
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => signOutFn(),
    onSuccess: async () => {
      queryClient.setQueryData(meQueryOptions.queryKey, null);
      await queryClient.invalidateQueries();
      navigate({ to: "/" });
    },
  });
}

/** SEO head helper — every route gets unique title/description/og tags. */
export function seo(opts: { title: string; description: string; path?: string }) {
  const title = `${opts.title} | Najeeb Academy`;
  const url = `${ACADEMY_URL}${opts.path ?? ""}`;
  return {
    meta: [
      { title },
      { name: "description", content: opts.description },
      { property: "og:title", content: title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Najeeb Academy" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: opts.description },
    ],
  };
}
