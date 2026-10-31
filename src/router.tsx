import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // SSR query integration: loader-prefetched queries are dehydrated into the
  // router stream and hydrated on the client before React hydrates, so the
  // first client render matches the server HTML exactly (no flicker, no
  // hydration mismatches).
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
