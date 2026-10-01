import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { seo } from "../lib/academy";

export const Route = createFileRoute("/verify/")({
  head: () =>
    seo({
      title: "Verify a Certificate",
      description:
        "Verify any Najeeb Academy certificate. Enter the certificate code to confirm the graduate's name, course and issue date.",
      path: "/verify",
    }),
  component: VerifyPage,
});

function VerifyPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="bg-grid-pattern absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="hero-glow top-10 left-1/2 h-[250px] w-[500px] -translate-x-1/2"
        aria-hidden="true"
      />
      <div className="bg-card border-border relative z-10 w-full max-w-lg rounded-3xl border p-8 text-center shadow-2xl sm:p-10">
        <div className="bg-brand-subtle border-primary/30 text-brand-soft mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border">
          <ShieldCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="text-foreground mt-5 text-3xl font-black tracking-tight">
          Verify a certificate
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Every Najeeb Academy certificate carries a unique code. Enter it below to confirm the
          graduate's name, the course completed and the issue date.
        </p>
        <form
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = code.trim().toUpperCase();
            if (trimmed) navigate({ to: "/verify/$code", params: { code: trimmed } });
          }}
        >
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. NDH-A7K2-M9P4"
            className="h-12 rounded-xl text-center font-mono tracking-wider uppercase sm:text-left"
            aria-label="Certificate code"
          />
          <Button
            type="submit"
            size="lg"
            className="h-12 rounded-xl px-6 font-extrabold"
            disabled={!code.trim()}
          >
            Verify
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-xs">
          Codes look like <span className="text-brand-soft font-mono">NDH-XXXX-XXXX</span> and
          appear on every certificate.
        </p>
      </div>
    </div>
  );
}
