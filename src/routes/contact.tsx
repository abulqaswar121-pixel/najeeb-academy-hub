import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Mail, MapPin, MessageSquare, Send } from "lucide-react";
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
import { Textarea } from "../components/ui/textarea";
import { seo } from "../lib/academy";
import { submitContactForm } from "../lib/server-fns";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Contact Us",
      description:
        "Questions about courses, certificates or group enrollments? Contact the Najeeb Academy team — we reply within one business day.",
      path: "/contact",
    }),
  component: ContactPage,
});

const formSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Please tell us a bit more (at least 10 characters)"),
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitting(true);
    try {
      await submitContactForm({ data: values });
      setSent(true);
      toast.success("Message sent — we'll get back to you within one business day.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <div
        className="bg-grid-pattern absolute inset-x-0 top-0 h-80 opacity-40"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8">
        {/* Info column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-brand-subtle border-primary/30 text-brand-soft inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold">
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Contact
          </div>
          <h1 className="text-foreground text-4xl font-black tracking-tight sm:text-5xl">
            Talk to the <span className="text-gradient-brand">academy team</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Questions about a course, your certificate, refunds, or enrolling a whole team? Send a
            message — a real person replies within one business day.
          </p>
          <div className="space-y-4 pt-2">
            <div className="bg-card border-border flex items-center gap-4 rounded-2xl border p-5">
              <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                <Mail className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">Email</p>
                <p className="text-muted-foreground text-xs">hello@academy.ndh.com.ng</p>
              </div>
            </div>
            <div className="bg-card border-border flex items-center gap-4 rounded-2xl border p-5">
              <div className="bg-brand-subtle border-primary/30 text-brand-soft flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-foreground text-sm font-bold">Office</p>
                <p className="text-muted-foreground text-xs">
                  14B Karimu Kotun St, Victoria Island, Lagos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form column */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="bg-card border-success/30 flex h-full flex-col items-center justify-center rounded-3xl border p-12 text-center shadow-2xl">
              <div className="bg-success/15 border-success/40 text-success flex h-16 w-16 items-center justify-center rounded-2xl border">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="text-foreground mt-6 text-2xl font-black">Message received!</h2>
              <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
                Thanks for reaching out. Your message is safely in our inbox and we'll reply within
                one business day.
              </p>
              <Button
                variant="outline"
                className="mt-8 rounded-xl font-bold"
                onClick={() => {
                  form.reset();
                  setSent(false);
                }}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <div className="bg-card border-border rounded-3xl border p-8 shadow-2xl sm:p-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Tunde Bakare"
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
                              className="h-11 rounded-xl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us what you need — course questions, certificates, team enrollments…"
                            className="min-h-40 rounded-xl"
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
                    className="bg-gradient-cta shadow-glow-primary w-full rounded-xl font-extrabold sm:w-auto sm:px-10"
                    disabled={submitting}
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                    {submitting ? "Sending…" : "Send message"}
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
