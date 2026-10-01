import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, SearchX, ShieldCheck } from "lucide-react";

import { CertificateView } from "../components/academy/CertificateView";
import { EmptyState } from "../components/academy/EmptyState";
import { Button } from "../components/ui/button";
import { seo } from "../lib/academy";
import { verifyCertificateFn } from "../lib/server-fns";

const verifyQuery = (code: string) => ({
  queryKey: ["verify", code],
  queryFn: () => verifyCertificateFn({ data: { code } }),
});

export const Route = createFileRoute("/verify/$code")({
  head: ({ params }) =>
    seo({
      title: `Certificate ${params.code}`,
      description: `Verification result for Najeeb Academy certificate ${params.code} — confirm the graduate, course and issue date.`,
      path: `/verify/${params.code}`,
    }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(verifyQuery(params.code));
  },
  component: VerifyResultPage,
});

function VerifyResultPage() {
  const { code } = Route.useParams();
  const { data: result } = useQuery(verifyQuery(code));

  return (
    <div className="relative px-4 py-16">
      <div className="bg-grid-pattern absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-2xl space-y-8">
        {result ? (
          <>
            <div className="bg-success/10 border-success/30 flex items-center gap-4 rounded-2xl border p-5">
              <div className="bg-success/15 border-success/40 text-success flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border">
                <BadgeCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-foreground text-lg font-black tracking-tight">
                  Certificate verified ✓
                </h1>
                <p className="text-muted-foreground text-xs">
                  This is an authentic Najeeb Academy certificate, signed and issued by Najeeb
                  Digital Hub.
                </p>
              </div>
            </div>
            <CertificateView
              studentName={result.studentName}
              courseTitle={result.courseTitle}
              issuedAt={result.issuedAt}
              code={result.code}
            />
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline" className="rounded-xl font-bold">
                <Link to="/verify">Verify another certificate</Link>
              </Button>
              <Button asChild className="rounded-xl font-bold">
                <Link to="/courses">Explore our courses</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-card border-border mx-auto flex max-w-lg items-center gap-3 rounded-2xl border p-4">
              <ShieldCheck className="text-brand-soft h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-muted-foreground font-mono text-xs tracking-wider">
                Checked code: {code.toUpperCase()}
              </p>
            </div>
            <EmptyState
              icon={SearchX}
              title="No certificate found for this code"
              description="Double-check the code for typos — codes look like NDH-XXXX-XXXX. If you believe this is an error, contact us and we'll investigate."
              action={
                <div className="flex gap-3">
                  <Button asChild variant="outline">
                    <Link to="/verify">Try another code</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/contact">Contact support</Link>
                  </Button>
                </div>
              }
            />
          </>
        )}
      </div>
    </div>
  );
}
