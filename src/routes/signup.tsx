import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
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
import { signUpFn } from "../lib/server-fns";

const searchSchema = z.object({ redirect: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  head: () =>
    seo({
      title: "Create Your Free Account",
      description:
        "Sign up for Najeeb Academy to enroll in practical AI courses, track your progress and earn signed, verifiable certificates.",
      path: "/signup",
      noIndex: true,
    }),
  component: SignupPage,
});

const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function SignupPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      const user = await signUpFn({ data: values });
      queryClient.setQueryData(meQueryOptions.queryKey, user);
      await queryClient.invalidateQueries();
      toast.success(`Welcome to Najeeb Academy, ${user.name.split(" ")[0]}!`);
      navigate({ to: redirect ?? "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign up failed. Please try again.");
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
          <GraduationCap className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-foreground mt-5 text-center text-2xl font-black tracking-tight">
          Create your account
        </h1>
        <p className="text-muted-foreground mt-2 text-center text-sm">
          Free to join. Pay only for the courses you take.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Amina Bello"
                      autoComplete="name"
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
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="h-11 rounded-xl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-muted-foreground text-xs leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-brand-soft underline-offset-2 hover:underline">
                Terms
              </Link>{" "}
              and acknowledge our{" "}
              <Link to="/privacy" className="text-brand-soft underline-offset-2 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold"
              disabled={submitting}
            >
              {submitting ? "Creating account…" : "Create free account"}
            </Button>
          </form>
        </Form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            search={{ redirect }}
            className="text-brand-soft font-bold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
