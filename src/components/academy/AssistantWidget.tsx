import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, LoaderCircle, Minus, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import assistantAvatar from "../../assets/ndh-ai-assistant.png";
import { categories } from "../../data/categories";
import { NDH_EMAIL_HELLO, NDH_PHONE_DISPLAY, NDH_WHATSAPP_URL } from "../../lib/contact";
import { formatPrice, useCurrency } from "../../lib/currency";
import { fetchCourses } from "../../lib/server-fns";
import type { CourseRecord } from "../../server/types";
import { Button } from "../ui/button";

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

const STORAGE_KEY = "ndh-academy-scholar-chat";
const WELCOME_ID = "welcome";

const coursesQuery = { queryKey: ["courses"], queryFn: () => fetchCourses() };

let msgCounter = 0;
const nextId = () => `m-${Date.now()}-${msgCounter++}`;

function readStoredMessages(): ChatMessage[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChatMessage[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    /* unreadable storage is not a reason to break the chat */
  }
  return null;
}

/**
 * NDH Scholar — the academy's floating AI study advisor. Chrome is the
 * official NDH assistant design shared with the parent gateway (avatar,
 * orbital halo launcher, live status, dialog styling); the brain stays the
 * academy's rule-based concierge that answers academy questions and
 * recommends courses from the live catalog.
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const { currency } = useCurrency();
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const welcome = useMemo<ChatMessage>(
    () => ({
      id: WELCOME_ID,
      sender: "assistant",
      text: "Hi! I'm NDH Scholar, the Najeeb Academy study advisor. Tell me what you want to learn — or what you do for work — and I'll point you to the right course. You can also ask about certificates, pricing, refunds or how the academy works.",
      quickActions: QUICK_ACTIONS,
    }),
    [],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const { data: courses = [] } = useQuery({ ...coursesQuery, enabled: open });
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Restore this tab's conversation once, after hydration. */
  useEffect(() => {
    const stored = readStoredMessages();
    if (stored) setMessages(stored);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  /* Focus the composer on open; Escape closes, as the gateway chat does. */
  useEffect(() => {
    if (!open) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const respond = (query: string) => {
    const reply = buildReply(query, courses);
    setTyping(true);
    timerRef.current = setTimeout(
      () => {
        setTyping(false);
        setMessages((prev) => [...prev, { ...reply, id: nextId() }]);
      },
      550 + Math.random() * 450,
    );
  };

  const send = (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || typing) return;
    setMessages((prev) => [...prev, { id: nextId(), sender: "user", text: query }]);
    setInput("");
    respond(query);
  };

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([welcome]);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const avatarState = typing ? "thinking" : "idle";

  return (
    <>
      {/* Floating launcher — avatar + orbital halo + live status */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close NDH Scholar" : "Open NDH Scholar — academy AI study advisor"}
        aria-expanded={open}
        className={`ai-assistant-launcher is-${avatarState}`}
      >
        {open ? (
          <X aria-hidden="true" />
        ) : (
          <>
            <span className="ai-assistant-orbit" aria-hidden="true" />
            <img
              className="ai-assistant-avatar"
              src={assistantAvatar}
              alt=""
              width={816}
              height={816}
            />
            <span className="ai-assistant-status" aria-hidden="true" />
          </>
        )}
      </button>

      {/* Chat dialog */}
      {open && (
        <div role="dialog" aria-label="NDH Scholar AI assistant" className="ai-assistant-dialog">
          <header className="ai-assistant-header">
            <span className={`gw-chat-avatar is-${avatarState}`}>
              <img src={assistantAvatar} alt="" width={816} height={816} />
              <i aria-hidden="true" />
            </span>
            <div className="ai-assistant-title">
              <p>NDH Scholar</p>
              <span>
                <i aria-hidden="true" /> {typing ? "Thinking…" : "Online"}
                <em className="gw-chat-mode">Academy advisor</em>
              </span>
            </div>
            <div className="gw-chat-header-actions">
              {messages.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Reset conversation"
                  title="Reset conversation"
                  onClick={reset}
                >
                  <RotateCcw aria-hidden="true" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Minimise assistant"
                title="Minimise assistant"
                onClick={() => setOpen(false)}
              >
                <Minus aria-hidden="true" />
              </Button>
            </div>
          </header>

          <div
            role="log"
            aria-live="polite"
            className="ai-assistant-conversation ai-assistant-messages"
          >
            {messages.map((msg) => (
              <div className={`ai-assistant-message is-${msg.sender}`} key={msg.id}>
                {msg.text ? <p>{msg.text}</p> : null}

                {msg.courses && msg.courses.length > 0 ? (
                  <div className="gw-chat-cards">
                    {msg.courses.map((c) => (
                      <Link
                        key={c.id}
                        to="/courses/$slug"
                        params={{ slug: c.slug }}
                        onClick={() => setOpen(false)}
                        className="gw-chat-card"
                      >
                        <span className="gw-chat-card-kind">
                          <Sparkles size={12} aria-hidden="true" /> Recommended course
                        </span>
                        <span className="gw-chat-card-course">
                          <img src={c.image} alt="" />
                          <span>
                            <strong>{c.title}</strong>
                            <small className="gw-chat-card-meta">
                              {formatPrice(c.priceNgn, currency)} · {c.lessonCount} lessons
                            </small>
                          </span>
                        </span>
                        <span className="gw-chat-card-cta">
                          View course <ArrowUpRight size={13} aria-hidden="true" />
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}

                {msg.links && msg.links.length > 0 ? (
                  <div className="ai-assistant-chips gw-chat-followups">
                    {msg.links.map((link) =>
                      link.href ? (
                        <Button key={link.label} asChild variant="outline" size="sm">
                          <a href={link.href} target="_blank" rel="noreferrer">
                            {link.label} <ArrowUpRight aria-hidden="true" />
                          </a>
                        </Button>
                      ) : (
                        <Button key={link.label} asChild variant="outline" size="sm">
                          <Link to={link.to!} onClick={() => setOpen(false)}>
                            {link.label} <ArrowUpRight aria-hidden="true" />
                          </Link>
                        </Button>
                      ),
                    )}
                  </div>
                ) : null}

                {msg.quickActions ? (
                  <div className="gw-chat-starters">
                    <p className="gw-chat-starters-label">Quick questions</p>
                    <div className="ai-assistant-chips">
                      {msg.quickActions.map((qa) => (
                        <Button
                          key={qa}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => send(qa)}
                        >
                          {qa}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            {typing ? (
              <p className="ai-assistant-thinking">
                <LoaderCircle aria-hidden="true" /> Thinking…
              </p>
            ) : null}
            <div ref={endRef} />
          </div>

          <div className="ai-assistant-composer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    if (!typing && input.trim()) send();
                  }
                }}
                maxLength={1000}
                placeholder="Ask about courses, certificates, pricing…"
                aria-label="Message NDH Scholar"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                aria-label="Send message"
                disabled={typing || input.trim().length === 0}
              >
                {typing ? (
                  <LoaderCircle className="animate-spin" aria-hidden="true" />
                ) : (
                  <Send aria-hidden="true" />
                )}
              </Button>
            </form>
            <p className="gw-chat-footnote">
              NDH Scholar answers from the live 60-course catalog. A human replies within one
              business day via the contact page.
            </p>
          </div>
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

  // build-for-me / hire
  if (/(agency|build it for me|hire|client work)/.test(q)) {
    return {
      sender: "assistant",
      text: "Najeeb Academy is purely a learning platform — we teach the skills through project-based courses and assessments rather than take on client builds. Want to talk it through with a human? The team is one WhatsApp message away.",
      links: [
        { label: "Chat on WhatsApp", href: NDH_WHATSAPP_URL },
        { label: "Contact the team", to: "/contact" },
      ],
    };
  }

  // human / contact
  if (/(human|person|talk to|speak|contact|whatsapp|call)/.test(q)) {
    return {
      sender: "assistant",
      text: `Of course — a real human from the academy team replies to every message. The fastest channel is WhatsApp (${NDH_PHONE_DISPLAY}); you can also email us at ${NDH_EMAIL_HELLO} or use the contact page.`,
      links: [
        { label: "Chat on WhatsApp", href: NDH_WHATSAPP_URL },
        { label: "Contact the team", to: "/contact" },
      ],
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
