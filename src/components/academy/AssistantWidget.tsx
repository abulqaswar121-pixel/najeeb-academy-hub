import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bot, ExternalLink, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { categories } from "../../data/categories";
import { AGENCY_URL, formatNaira } from "../../lib/academy";
import { fetchCourses } from "../../lib/server-fns";
import type { CourseRecord } from "../../server/types";

interface ChatLink {
  label: string;
  to?: string;
  href?: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  courses?: CourseRecord[];
  links?: ChatLink[];
  quickActions?: string[];
}

const QUICK_ACTIONS = [
  "Recommend a course",
  "How do certificates work?",
  "What do courses cost?",
  "Talk to a human",
];

const coursesQuery = { queryKey: ["courses"], queryFn: () => fetchCourses() };

let msgCounter = 0;
const nextId = () => `m-${Date.now()}-${msgCounter++}`;

/**
 * NDH Scholar — the academy's floating AI study advisor. Rule-based concierge
 * (mirrors the agency site's assistant widget) that answers academy questions
 * and recommends courses from the live catalog.
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hi! I'm NDH Scholar, the Najeeb Academy study advisor. Tell me what you want to learn — or what you do for work — and I'll point you to the right course. You can also ask about certificates, pricing, refunds or how the academy works.",
      quickActions: QUICK_ACTIONS,
    },
  ]);
  const { data: courses = [] } = useQuery({ ...coursesQuery, enabled: open });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const respond = (query: string) => {
    const reply = buildReply(query, courses);
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        setMessages((prev) => [...prev, { ...reply, id: nextId() }]);
      },
      550 + Math.random() * 450,
    );
  };

  const send = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query) return;
    setMessages((prev) => [...prev, { id: nextId(), sender: "user", text: query }]);
    setInput("");
    respond(query);
  };

  return (
    <>
      {/* Floating hover button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant — NDH Scholar"}
        className="group fixed right-4 bottom-4 z-[90] flex items-center gap-2 sm:right-6 sm:bottom-6"
      >
        {!open && (
          <span className="bg-card border-primary/40 text-foreground hidden items-center rounded-full border px-3 py-1.5 text-xs font-bold shadow-lg sm:flex">
            Ask AI
          </span>
        )}
        <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-active:scale-95">
          <span
            className="bg-gradient-brand animate-pulse-glow absolute inset-0 rounded-2xl blur-md"
            aria-hidden="true"
          />
          <span className="bg-gradient-cta border-primary/40 shadow-glow-primary relative flex h-full w-full items-center justify-center rounded-2xl border">
            {open ? (
              <X className="text-primary-foreground h-6 w-6" aria-hidden="true" />
            ) : (
              <Bot className="text-primary-foreground h-6 w-6" aria-hidden="true" />
            )}
          </span>
          {!open && (
            <span
              className="bg-success border-background absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2"
              aria-hidden="true"
            />
          )}
        </span>
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="bg-card border-border fixed right-4 bottom-24 left-4 z-[85] flex max-h-[min(75vh,620px)] flex-col overflow-hidden rounded-3xl border shadow-2xl sm:left-auto sm:w-[400px]"
          role="dialog"
          aria-label="NDH Scholar AI assistant"
        >
          {/* Header */}
          <div className="bg-brand-subtle/60 border-border flex items-center gap-3 border-b px-5 py-4">
            <div className="relative">
              <div className="bg-gradient-cta border-primary/40 flex h-10 w-10 items-center justify-center rounded-xl border">
                <Bot className="text-primary-foreground h-5 w-5" aria-hidden="true" />
              </div>
              <span
                className="bg-success border-card absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2"
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-foreground flex items-center gap-1.5 text-sm font-black">
                NDH Scholar
                <Sparkles className="text-brand-soft h-3.5 w-3.5" aria-hidden="true" />
              </p>
              <p className="text-muted-foreground text-[11px]">Academy AI study advisor · online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={msg.sender === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed"
                      : "bg-background/60 border-border text-muted-foreground max-w-[90%] rounded-2xl rounded-bl-md border px-4 py-3 text-sm leading-relaxed"
                  }
                >
                  <p>{msg.text}</p>

                  {msg.courses && msg.courses.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.courses.map((c) => (
                        <Link
                          key={c.id}
                          to="/courses/$slug"
                          params={{ slug: c.slug }}
                          onClick={() => setOpen(false)}
                          className="bg-card border-border hover:border-primary/50 flex items-center gap-3 rounded-xl border p-2.5 transition-colors"
                        >
                          <img
                            src={c.image}
                            alt=""
                            className="h-10 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="text-foreground block truncate text-xs font-bold">
                              {c.title}
                            </span>
                            <span className="text-brand-soft font-mono text-[10px] font-bold">
                              {formatNaira(c.priceNgn)} · {c.lessonCount} lessons
                            </span>
                          </span>
                          <ArrowRight
                            className="text-brand-soft h-3.5 w-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      ))}
                    </div>
                  )}

                  {msg.links && msg.links.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.links.map((link) =>
                        link.href ? (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-brand-subtle border-primary/30 text-brand-soft flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors hover:border-primary/60"
                          >
                            {link.label} <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <Link
                            key={link.label}
                            to={link.to!}
                            onClick={() => setOpen(false)}
                            className="bg-brand-subtle border-primary/30 text-brand-soft flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors hover:border-primary/60"
                          >
                            {link.label} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          </Link>
                        ),
                      )}
                    </div>
                  )}

                  {msg.quickActions && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.quickActions.map((qa) => (
                        <button
                          key={qa}
                          type="button"
                          onClick={() => send(qa)}
                          className="bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors"
                        >
                          {qa}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start" aria-live="polite">
                <div className="bg-background/60 border-border rounded-2xl rounded-bl-md border px-4 py-3">
                  <span className="flex gap-1">
                    <span className="bg-brand-soft h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
                    <span className="bg-brand-soft h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:120ms]" />
                    <span className="bg-brand-soft h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            className="border-border flex items-center gap-2 border-t px-4 py-3"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, certificates, pricing…"
              aria-label="Message NDH Scholar"
              className="bg-background/60 border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 h-10 flex-1 rounded-xl border px-3 text-sm outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              disabled={!input.trim()}
              className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105 disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// ───────────────────────── rule-based brain ─────────────────────────

const topicKeywords: Record<string, string[]> = {
  "video-media": [
    "video",
    "youtube",
    "reels",
    "tiktok",
    "shorts",
    "film",
    "animation",
    "avatar",
    "capcut",
    "runway",
    "audio",
    "voice",
    "voiceover",
    "podcast",
    "music",
    "dub",
    "elevenlabs",
    "suno",
    "thumbnail",
  ],
  "design-brand": [
    "design",
    "logo",
    "brand",
    "graphic",
    "illustration",
    "midjourney",
    "canva",
    "photo",
    "figma",
    "ui",
    "ux",
    "packaging",
    "mockup",
    "interior",
    "staging",
    "presentation",
  ],
  "writing-content": [
    "copy",
    "copywriting",
    "writing",
    "writer",
    "blog",
    "seo",
    "article",
    "ebook",
    "e-book",
    "newsletter",
    "script",
    "ghostwrit",
    "linkedin",
    "translation",
    "repurpos",
    "cv",
    "resume",
    "cover letter",
    "grant",
  ],
  "marketing-growth": [
    "marketing",
    "ads",
    "advert",
    "meta",
    "facebook",
    "google ads",
    "campaign",
    "funnel",
    "influencer",
    "outreach",
    "local seo",
    "google business",
    "listing",
    "conversion",
    "social media",
    "email marketing",
    "lead",
  ],
  "business-operations": [
    "business",
    "operations",
    "crm",
    "hubspot",
    "support",
    "customer service",
    "chatbot",
    "helpdesk",
    "data",
    "excel",
    "finance",
    "accounting",
    "legal",
    "contract",
    "meeting",
    "transcription",
    "virtual assistant",
    "project management",
    "notion",
    "recruit",
    "resume screen",
    "interview",
    "fitness",
  ],
  "ai-engineering": [
    "agent",
    "automat",
    "workflow",
    "n8n",
    "make.com",
    "crewai",
    "langchain",
    "no-code",
    "nocode",
    "flutterflow",
    "app",
    "saas",
    "api",
    "deploy",
    "cursor",
    "copilot",
    "code",
    "prompt engineering",
    "custom gpt",
    "gpt store",
    "whatsapp bot",
    "botpress",
  ],
};

function buildReply(query: string, courses: CourseRecord[]): Omit<ChatMessage, "id"> {
  const q = query.toLowerCase();

  // certificates
  if (/(certificat|verify|credential|diploma)/.test(q)) {
    return {
      sender: "assistant",
      text: "Every course ends with a final assessment (70% pass mark, unlimited retakes) and a capstone project. Pass, and a signed certificate with a unique code like NDH-XXXX-XXXX is issued instantly. Anyone can verify it publicly — no account needed.",
      links: [
        { label: "Verify a certificate", to: "/verify" },
        { label: "Certificates FAQ", to: "/faq" },
      ],
    };
  }

  // pricing
  if (/(price|cost|pay|fee|naira|₦|how much|cheap|expensive)/.test(q)) {
    return {
      sender: "assistant",
      text: "Courses are one-time fees in Naira — from ₦15,000 for core essentials up to ₦50,000 for the AI engineering flagship tracks. That includes the full course video, all guided lessons, the final assessment, project review, a signed certificate and lifetime access. No subscriptions, ever.",
      links: [
        { label: "See pricing", to: "/pricing" },
        { label: "Browse courses", to: "/courses" },
      ],
    };
  }

  // refunds
  if (/(refund|money back|cancel)/.test(q)) {
    return {
      sender: "assistant",
      text: "If a course isn't what you expected, contact us within 7 days of enrolling (and before completing more than 20% of the lessons) and we'll refund you in full — back to your original payment method within 5–10 business days.",
      links: [
        { label: "Refunds FAQ", to: "/faq" },
        { label: "Contact us", to: "/contact" },
      ],
    };
  }

  // how it works
  if (
    /(how (does|do|it) work|how the academy|method|assessment|project|capstone|pace|how long)/.test(
      q,
    )
  ) {
    return {
      sender: "assistant",
      text: "Every course follows the same arc: Learn (3–8 hours of hands-on lessons) → Assess (a practical final exam) → Build (a real capstone project) → Certify (signed, verifiable certificate). Entirely self-paced — most students finish within a week.",
      links: [
        { label: "How learning works", to: "/about" },
        { label: "Pacing FAQ", to: "/faq" },
      ],
    };
  }

  // agency
  if (/(agency|build it for me|hire|client work)/.test(q)) {
    return {
      sender: "assistant",
      text: "Need something built rather than taught? Our sister company NDH Agency ships software, brands and growth systems with dedicated delivery teams. Same Najeeb Digital Hub family — the academy teaches the exact workflows the agency bills for.",
      links: [{ label: "Visit NDH Agency", href: AGENCY_URL }],
    };
  }

  // human / contact
  if (/(human|person|talk to|speak|contact|whatsapp|call)/.test(q)) {
    return {
      sender: "assistant",
      text: "Of course — a real human from the academy team replies to every message within one business day. You can reach us through the contact page or at hello@academy.ndh.com.ng.",
      links: [{ label: "Contact the team", to: "/contact" }],
    };
  }

  // dashboard / account
  if (/(dashboard|login|log in|sign in|account|enroll|progress|resume)/.test(q)) {
    return {
      sender: "assistant",
      text: "Your dashboard holds your enrollments, lesson progress and earned certificates. Accounts are free — you only pay for courses you take.",
      links: [
        { label: "Go to dashboard", to: "/dashboard" },
        { label: "Create free account", to: "/signup" },
      ],
    };
  }

  // beginner / where to start
  if (
    /(beginner|start|new to ai|first course|recommend|which course|best course|learn ai)/.test(q) &&
    !matchTopic(q)
  ) {
    const starter = courses.filter((c) => c.isFeatured).slice(0, 3);
    const base: Omit<ChatMessage, "id"> = {
      sender: "assistant",
      text: "Great place to be! If you're new to AI, start with the Prompt Engineering course — every other track builds on prompting. Here are the courses students start with most:",
    };
    if (starter.length > 0) return { ...base, courses: starter };
    return {
      ...base,
      links: [{ label: "Browse the catalog", to: "/courses" }],
      quickActions: QUICK_ACTIONS,
    };
  }

  // topic-matched course recommendation
  const topic = matchTopic(q);
  if (topic) {
    const matched = scoreCourses(q, courses, topic).slice(0, 3);
    const cat = categories.find((c) => c.slug === topic);
    if (matched.length > 0) {
      return {
        sender: "assistant",
        text: `That's our ${cat?.name ?? topic} track — ${cat?.blurb ?? ""} These courses fit best:`,
        courses: matched,
        links: [{ label: `All ${cat?.shortName ?? ""} courses`, to: "/courses" }],
      };
    }
  }

  // free-text search over the catalog
  const found = scoreCourses(q, courses, null).slice(0, 3);
  if (found.length > 0) {
    return {
      sender: "assistant",
      text: "Here's what I found in the catalog for that:",
      courses: found,
      links: [{ label: "See the full catalog", to: "/courses" }],
    };
  }

  return {
    sender: "assistant",
    text: "I can help you pick from our 60 AI courses, or answer questions about certificates, pricing, refunds and how the academy works. What would you like to know?",
    quickActions: QUICK_ACTIONS,
  };
}

function matchTopic(q: string): string | null {
  let best: string | null = null;
  let bestHits = 0;
  for (const [slug, words] of Object.entries(topicKeywords)) {
    const hits = words.filter((w) => q.includes(w)).length;
    if (hits > bestHits) {
      bestHits = hits;
      best = slug;
    }
  }
  return best;
}

function scoreCourses(q: string, courses: CourseRecord[], topic: string | null): CourseRecord[] {
  const words = q.split(/[^a-z0-9₦]+/).filter((w) => w.length > 2);
  return courses
    .map((c) => {
      const hay = `${c.title} ${c.summary} ${c.tools.join(" ")} ${c.category}`.toLowerCase();
      let score = words.filter((w) => hay.includes(w)).length;
      if (topic && c.category === topic) score += 2;
      if (c.isFeatured) score += 0.5;
      return { c, score };
    })
    .filter((x) => x.score >= (topic ? 2 : 2))
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);
}
