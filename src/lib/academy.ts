import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { fetchMe, signOutFn } from "./server-fns";

export const AGENCY_URL = "https://agency.ndh.com.ng";
export const ACADEMY_URL = "https://academy.ndh.com.ng";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Deterministic ₦ formatter — identical output on the server and in the browser. */
export function formatNaira(amount: number): string {
  const rounded = Math.round(amount);
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${rounded < 0 ? "-" : ""}₦${grouped}`;
}

/**
 * Course descriptions were written when each course had its own price. The
 * academy now sells passes, so strip any per-course fee mention before it is
 * rendered (the catalog data itself stays untouched).
 */
export function sanitizeCourseCopy(text: string): string {
  return text
    .replace(
      /Lifetime access, learn at your own pace, and all future updates to the course are included in the one-time ₦[\d,]+ fee\./gi,
      "Lifetime access and all future updates are included with any course pass.",
    )
    .replace(/one-time ₦[\d,]+ fee/gi, "course pass")
    .replace(/₦[\d,]+/g, "pass credit");
}

/** Deterministic date formatter (UTC) — avoids SSR/client hydration drift. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${date.getUTCDate()} ${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
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
