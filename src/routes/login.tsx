import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { meQueryOptions, seo } from "../lib/academy";
import { signInFn } from "../lib/server-fns";

const searchSchema = z.object({ redirect: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Log In",
      description:
        "Log in to your Najeeb Academy account to continue your courses, track progress and access your certificates.",
      path: "/login",
    }),
  component: LoginPage,
});

const formSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const user = await signInFn({ data: values });
      queryClient.setQueryData(meQueryOptions.queryKey, user);
      await queryClient.invalidateQueries();
      toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
      navigate({ to: redirect ?? "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="bg-grid-pattern absolute inset-0 opacity-40" aria-hidden="true" />
      <div
        className="hero-glow top-10 left-1/2 h-[250px] w-[500px] -translate-x-1/2"
        aria-hidden="true"
      />
      <div className="bg-card border-border relative z-10 w-full max-w-md rounded-3xl border p-8 shadow-2xl">
        <div className="bg-brand-subtle border-primary/30 text-brand-soft mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-foreground mt-5 text-center text-2xl font-black tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Log in to continue where you left off.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your password"
                      autoComplete="current-password"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold"
              disabled={submitting}
            >
              {submitting ? "Logging in…" : "Log in"}
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          New to the academy?{" "}
          <Link
            to="/signup"
            search={{ redirect }}
            className="text-brand-soft font-bold hover:underline"
          >
            Create a free account
          </Link>
        </p>
      </div>
    </div>
  );
}
