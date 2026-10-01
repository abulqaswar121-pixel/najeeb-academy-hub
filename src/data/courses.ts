export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface CourseSeed {
  slug: string;
  title: string;
  category: string; // category slug from categories.ts
  summary: string;
  priceNgn: number;
  durationHours: number;
  level: CourseLevel;
  featured?: boolean;
  tools: string[];
  project: string;
  lessons: string[];
}

export const courses: CourseSeed[] = [
  // ───────────────────────── Prompt Engineering ─────────────────────────
  {
    slug: "prompt-engineering-fundamentals",
    title: "Prompt Engineering Fundamentals",
    category: "prompt-engineering",
    summary:
      "Master the core prompting techniques — role, context, constraints and examples — that turn ChatGPT, Claude and Gemini into reliable assistants.",
    priceNgn: 12500,
    durationHours: 4,
    level: "Beginner",
    featured: true,
    tools: ["ChatGPT", "Claude", "Gemini"],
    project:
      "Build a personal prompt library of 25 tested, reusable prompts for your own work, each documented with inputs, constraints and expected output.",
    lessons: [
      "How large language models actually respond to prompts",
      "The anatomy of a great prompt: role, task, context, format",
      "Zero-shot vs few-shot: teaching by example",
      "Constraints, tone and output formatting that stick",
      "Iterating on prompts: critique, refine, re-run",
      "Common failure modes and how to debug them",
      "Building your reusable prompt library",
    ],
  },
  {
    slug: "advanced-prompting-techniques",
    title: "Advanced Prompting: Chain-of-Thought to Self-Critique",
    category: "prompt-engineering",
    summary:
      "Go beyond basics with chain-of-thought, decomposition, self-critique loops and structured JSON output for complex, multi-step tasks.",
    priceNgn: 18000,
    durationHours: 5,
    level: "Intermediate",
    tools: ["ChatGPT", "Claude", "OpenAI Playground"],
    project:
      "Design a multi-step prompt pipeline that researches a topic, drafts a report, critiques it and produces a final structured document.",
    lessons: [
      "Chain-of-thought and step-by-step reasoning prompts",
      "Task decomposition: splitting big jobs into prompt chains",
      "Self-critique and reflection loops",
      "Getting strict JSON and structured output every time",
      "Long-context strategies: feeding documents without losing the plot",
      "Temperature, top-p and sampling controls in practice",
      "Evaluating prompt quality with rubrics",
      "Packaging pipelines you can rerun on demand",
    ],
  },
  {
    slug: "prompting-for-business-documents",
    title: "Prompting for Business Documents & Reports",
    category: "prompt-engineering",
    summary:
      "Produce proposals, reports, memos and SOPs in your company's voice using document-grade prompting workflows.",
    priceNgn: 14000,
    durationHours: 4,
    level: "Beginner",
    tools: ["ChatGPT", "Claude", "Google Docs"],
    project:
      "Create a complete business proposal pack — executive summary, scope, pricing and SOP — generated and refined entirely through documented prompts.",
    lessons: [
      "Capturing your company voice in a style guide prompt",
      "Proposals and executive summaries that read human",
      "Turning rough notes into polished reports",
      "SOPs and process documents from recorded walkthroughs",
      "Meeting minutes, action items and follow-up emails",
      "Review prompts: tightening, fact-checking, tone-matching",
      "Document templates you can reuse across clients",
    ],
  },
  {
    slug: "image-prompting-masterclass",
    title: "Image Prompting Masterclass",
    category: "prompt-engineering",
    summary:
      "Learn the visual vocabulary — composition, lens, lighting, style references — that gets consistent results from Midjourney, DALL·E and Ideogram.",
    priceNgn: 16500,
    durationHours: 5,
    level: "Intermediate",
    tools: ["Midjourney", "DALL·E", "Ideogram"],
    project:
      "Produce a 12-image brand visual set — hero images, textures and icons — in one consistent style, with the full prompt recipe documented.",
    lessons: [
      "How diffusion models interpret your words",
      "Composition, framing and camera language",
      "Lighting, mood and color palettes in prompts",
      "Style references, artist studies and consistency tricks",
      "Negative prompts and fixing common artifacts",
      "Character and product consistency across a set",
      "Upscaling, variations and outpainting workflows",
      "Building a brand visual recipe book",
    ],
  },
  {
    slug: "system-prompts-and-custom-gpts",
    title: "System Prompts & Custom GPTs",
    category: "prompt-engineering",
    summary:
      "Design system prompts, custom GPTs and Claude Projects that behave consistently — complete with knowledge files, guardrails and test suites.",
    priceNgn: 19500,
    durationHours: 6,
    level: "Advanced",
    tools: ["Custom GPTs", "Claude Projects", "OpenAI API"],
    project:
      "Ship a working custom GPT for a real business use case, with a hardened system prompt, knowledge base and a 20-case test suite.",
    lessons: [
      "System prompts vs user prompts: who controls what",
      "Writing persona and policy into a system prompt",
      "Knowledge files and retrieval behaviour",
      "Guardrails: refusals, scope limits and jailbreak resistance",
      "Testing assistants with structured test cases",
      "Custom GPT actions and external calls",
      "Versioning and iterating on deployed assistants",
    ],
  },

  // ───────────────────── AI Content & Copywriting ─────────────────────
  {
    slug: "ai-copywriting-essentials",
    title: "AI Copywriting Essentials",
    category: "ai-content-copywriting",
    summary:
      "Write headlines, hooks and product copy with AI that converts — and learn the editing pass that removes the robotic tone.",
    priceNgn: 13500,
    durationHours: 4,
    level: "Beginner",
    featured: true,
    tools: ["ChatGPT", "Claude", "Hemingway"],
    project:
      "Write a full product landing page — headline, subheads, benefits, objections, FAQ and CTA — using an AI-first drafting and human-polish workflow.",
    lessons: [
      "Copywriting frameworks AI understands: AIDA, PAS, 4U",
      "Feeding AI real customer research and voice-of-customer data",
      "Headlines and hooks: generating 50, choosing 1",
      "Benefit-led body copy without the fluff",
      "The de-robotting edit: rhythm, specificity, cuts",
      "Calls to action and microcopy",
      "Your repeatable landing-page copy workflow",
    ],
  },
  {
    slug: "email-marketing-with-ai",
    title: "Email Marketing with AI",
    category: "ai-content-copywriting",
    summary:
      "Plan and write welcome sequences, newsletters and sales campaigns with AI, personalised at scale and measured properly.",
    priceNgn: 15000,
    durationHours: 5,
    level: "Intermediate",
    tools: ["ChatGPT", "Mailchimp", "Brevo"],
    project:
      "Build a complete 7-email welcome-and-sales sequence for a real product, with subject-line variants and a send plan.",
    lessons: [
      "Email strategy: sequences, broadcasts and segments",
      "Subject lines and preview text that get opens",
      "Welcome sequences that build trust fast",
      "Sales emails: urgency without the sleaze",
      "Personalisation tokens and dynamic content with AI",
      "Newsletter systems: from idea bank to scheduled send",
      "Deliverability basics and reading your metrics",
    ],
  },
  {
    slug: "social-media-content-engine",
    title: "The AI Social Media Content Engine",
    category: "ai-content-copywriting",
    summary:
      "Turn one idea into a month of platform-native posts for LinkedIn, X and Instagram with a repeatable AI content system.",
    priceNgn: 14500,
    durationHours: 4,
    level: "Beginner",
    tools: ["ChatGPT", "Canva", "Buffer"],
    project:
      "Produce a 30-day, 3-platform content calendar with every post written, designed and scheduled using your new engine.",
    lessons: [
      "Content pillars and the idea bank",
      "Platform-native writing: LinkedIn vs X vs Instagram",
      "The repurposing chain: one idea, ten assets",
      "Hooks, storytelling and carousel scripts with AI",
      "Visuals at speed with AI design tools",
      "Scheduling, batching and the weekly content hour",
      "Reading analytics to feed the next cycle",
    ],
  },
  {
    slug: "brand-voice-with-ai",
    title: "Building a Brand Voice AI Can Follow",
    category: "ai-content-copywriting",
    summary:
      "Codify a distinctive brand voice into reusable style guides, examples and prompts so every AI draft sounds like you.",
    priceNgn: 16000,
    durationHours: 4,
    level: "Intermediate",
    tools: ["Claude", "ChatGPT", "Notion"],
    project:
      "Create a complete brand voice kit — voice attributes, do/don't examples, lexicon and master prompt — and prove it on five content types.",
    lessons: [
      "Deconstructing voices you admire",
      "Defining voice attributes and tone sliders",
      "Building the do/don't example bank",
      "The master voice prompt and style guide file",
      "Testing voice fidelity across formats",
      "Voice for teams: onboarding writers and AI together",
      "Maintaining voice as your brand evolves",
    ],
  },
  {
    slug: "long-form-writing-with-ai",
    title: "Long-Form Writing with AI: Guides, Ebooks & Whitepapers",
    category: "ai-content-copywriting",
    summary:
      "Co-write substantial long-form pieces — ultimate guides, ebooks, whitepapers — with outlines, research synthesis and chapter-by-chapter drafting.",
    priceNgn: 17500,
    durationHours: 6,
    level: "Intermediate",
    tools: ["Claude", "ChatGPT", "Google Docs"],
    project:
      "Write and format a complete 5,000+ word ultimate guide or short ebook on a topic in your niche, ready to publish as a lead magnet.",
    lessons: [
      "Choosing topics worth 5,000 words",
      "Research synthesis: sources in, structured notes out",
      "Architecting the outline before any drafting",
      "Chapter drafting loops that keep continuity",
      "Weaving in data, examples and stories",
      "The multi-pass edit: structure, clarity, voice",
      "Formatting, design and publishing as a lead magnet",
    ],
  },

  // ─────────────────────── AI Blogging & SEO ───────────────────────
  {
    slug: "ai-blogging-from-zero",
    title: "AI Blogging from Zero",
    category: "ai-blogging-seo",
    summary:
      "Launch a niche blog and publish your first ten search-targeted articles using an AI-assisted research, drafting and editing workflow.",
    priceNgn: 13000,
    durationHours: 5,
    level: "Beginner",
    featured: true,
    tools: ["ChatGPT", "WordPress", "Google Search Console"],
    project:
      "Launch a live blog with ten published, search-targeted articles and Search Console tracking in place.",
    lessons: [
      "Picking a niche with real search demand",
      "Setting up WordPress the lean way",
      "Finding low-competition keywords without paid tools",
      "The article brief: search intent to outline",
      "Drafting with AI, editing like an editor",
      "On-page SEO: titles, headers, internal links",
      "Publishing cadence and tracking first rankings",
    ],
  },
  {
    slug: "seo-content-strategy-with-ai",
    title: "SEO Content Strategy with AI",
    category: "ai-blogging-seo",
    summary:
      "Build topical authority with AI-assisted keyword clustering, content calendars and briefs that writers (human or AI) can execute.",
    priceNgn: 18500,
    durationHours: 6,
    level: "Intermediate",
    tools: ["ChatGPT", "Ahrefs", "Google Sheets"],
    project:
      "Deliver a 90-day SEO content plan: topic clusters, prioritised keyword map, and ten production-ready content briefs.",
    lessons: [
      "Topical authority and the cluster model",
      "Keyword research and clustering with AI",
      "Prioritisation: traffic potential vs difficulty vs fit",
      "Content briefs that control quality",
      "Internal linking architecture",
      "Updating and pruning old content",
      "Reporting: what to show stakeholders monthly",
    ],
  },
  {
    slug: "programmatic-seo-with-ai",
    title: "Programmatic SEO with AI",
    category: "ai-blogging-seo",
    summary:
      "Generate hundreds of useful, templated landing pages from structured data — responsibly — with AI filling the quality gap.",
    priceNgn: 22000,
    durationHours: 6,
    level: "Advanced",
    tools: ["Google Sheets", "ChatGPT API", "Webflow"],
    project:
      "Ship a programmatic page set (25+ pages) from a structured dataset, with unique AI-enriched sections and indexing monitoring.",
    lessons: [
      "Where programmatic SEO works — and where it gets penalised",
      "Finding data-driven page opportunities",
      "Designing the page template and data schema",
      "AI enrichment: making templated pages genuinely useful",
      "Generating pages at scale without duplicate-content traps",
      "Indexing, sitemaps and crawl management",
      "Measuring performance and iterating templates",
    ],
  },
  {
    slug: "local-seo-with-ai",
    title: "Local SEO with AI for Small Businesses",
    category: "ai-blogging-seo",
    summary:
      "Rank local businesses on Google Maps and local search using AI for citations, reviews, location pages and Google Business profiles.",
    priceNgn: 15500,
    durationHours: 4,
    level: "Beginner",
    tools: ["Google Business Profile", "ChatGPT", "Canva"],
    project:
      "Complete a full local SEO setup for a real business: optimised Google Business Profile, three location/service pages and a review engine.",
    lessons: [
      "How local rankings actually work",
      "Optimising a Google Business Profile end to end",
      "Service and location pages written with AI",
      "Citations and directories without the grunt work",
      "The review generation and response system",
      "Local content ideas that earn links",
      "Tracking calls, directions and conversions",
    ],
  },
  {
    slug: "content-refresh-and-rankings-recovery",
    title: "Content Refresh & Rankings Recovery with AI",
    category: "ai-blogging-seo",
    summary:
      "Audit decaying content, diagnose why rankings dropped and systematically refresh articles with AI to recover and grow traffic.",
    priceNgn: 16500,
    durationHours: 4,
    level: "Intermediate",
    tools: ["Google Search Console", "ChatGPT", "Screaming Frog"],
    project:
      "Run a full decay audit on an existing site and refresh five articles with documented before/after targets.",
    lessons: [
      "Finding decaying pages in Search Console",
      "Diagnosis: intent shift, competition, staleness or cannibalisation",
      "The AI-assisted refresh workflow",
      "Rewriting intros, upgrading depth, adding E-E-A-T signals",
      "Consolidating cannibalising articles",
      "Re-promoting refreshed content",
      "Building the quarterly refresh calendar",
    ],
  },

  // ──────────────────── AI Video Generation & Editing ────────────────────
  {
    slug: "ai-video-generation-fundamentals",
    title: "AI Video Generation Fundamentals",
    category: "ai-video",
    summary:
      "Create short cinematic clips from text and images with Runway, Pika and Luma — and learn what today's models can and can't do.",
    priceNgn: 17000,
    durationHours: 5,
    level: "Beginner",
    featured: true,
    tools: ["Runway", "Pika", "Luma Dream Machine"],
    project:
      "Produce a 45–60 second cinematic brand teaser assembled from AI-generated shots, with music and titles.",
    lessons: [
      "The AI video landscape: strengths of each tool",
      "Text-to-video prompting: shots, motion, camera moves",
      "Image-to-video: animating stills with control",
      "Maintaining consistency across generated shots",
      "Fixing artifacts: hands, faces, physics",
      "Assembling clips into a sequence with music",
      "Export settings for social platforms",
    ],
  },
  {
    slug: "faceless-youtube-channels",
    title: "Faceless YouTube Channels with AI",
    category: "ai-video",
    summary:
      "Build a faceless YouTube channel: AI scripts, voiceovers, b-roll, editing and thumbnails — a complete production pipeline.",
    priceNgn: 19500,
    durationHours: 6,
    level: "Intermediate",
    tools: ["ChatGPT", "ElevenLabs", "CapCut"],
    project:
      "Launch a channel with three fully produced faceless videos — script, voiceover, visuals, thumbnail — and a publishing system.",
    lessons: [
      "Niche selection and the retention-first format",
      "Scripts engineered for watch time",
      "AI voiceovers that don't sound synthetic",
      "Sourcing and generating b-roll at scale",
      "Editing rhythm: cuts, captions, sound design",
      "Thumbnails and titles: the click equation",
      "The weekly production pipeline",
      "Monetisation requirements and milestones",
    ],
  },
  {
    slug: "short-form-video-factory",
    title: "The Short-Form Video Factory: Reels, Shorts & TikTok",
    category: "ai-video",
    summary:
      "Batch-produce platform-native short videos with AI scripting, auto-captions and template editing in CapCut.",
    priceNgn: 15000,
    durationHours: 4,
    level: "Beginner",
    tools: ["CapCut", "ChatGPT", "Opus Clip"],
    project:
      "Produce 15 publish-ready short videos in one batch week, from hook bank to scheduled uploads.",
    lessons: [
      "Why short-form rewards systems, not inspiration",
      "The hook bank: 50 openings for your niche",
      "Scripting 30-second videos with AI",
      "Repurposing long videos with AI clipping tools",
      "CapCut editing: captions, effects, templates",
      "Batching: the one-day-a-week production system",
      "Platform metadata and posting strategy",
    ],
  },
  {
    slug: "ai-avatars-and-talking-heads",
    title: "AI Avatars & Talking-Head Videos",
    category: "ai-video",
    summary:
      "Create presenter-style videos with HeyGen and Synthesia avatars for courses, explainers and multilingual sales videos.",
    priceNgn: 18000,
    durationHours: 4,
    level: "Intermediate",
    tools: ["HeyGen", "Synthesia", "Descript"],
    project:
      "Produce a 3-video explainer series fronted by an AI avatar, including one version translated into a second language.",
    lessons: [
      "Avatar platforms compared: HeyGen, Synthesia and beyond",
      "Scripting for a virtual presenter",
      "Creating and customising your avatar",
      "Lip-sync, pacing and gesture settings",
      "Multilingual versions and AI dubbing",
      "Mixing avatars with screen recordings and b-roll",
      "Where avatar video works — and where it backfires",
    ],
  },
  {
    slug: "ai-video-editing-with-descript",
    title: "Edit Video Like a Doc: AI Editing with Descript",
    category: "ai-video",
    summary:
      "Edit interviews, podcasts and tutorials by editing text — remove filler words, fix audio and repurpose clips in minutes.",
    priceNgn: 14500,
    durationHours: 4,
    level: "Beginner",
    tools: ["Descript", "ChatGPT", "YouTube Studio"],
    project:
      "Take one hour of raw footage to a polished 10-minute edit plus three social clips, entirely in Descript.",
    lessons: [
      "The text-based editing mental model",
      "Transcription, speaker labels and corrections",
      "Cutting filler words and dead air automatically",
      "Studio Sound and audio repair",
      "Overdub and fixing mistakes without re-recording",
      "Templates, captions and social clip exports",
      "A repeatable podcast/tutorial edit workflow",
    ],
  },

  // ───────────────── AI Graphic Design & Illustration ─────────────────
  {
    slug: "midjourney-for-designers",
    title: "Midjourney for Designers",
    category: "ai-design",
    summary:
      "Direct Midjourney like an art director: style systems, brand consistency, editing workflows and commercial use.",
    priceNgn: 17500,
    durationHours: 5,
    level: "Intermediate",
    featured: true,
    tools: ["Midjourney", "Photoshop", "Figma"],
    project:
      "Create a cohesive 10-asset visual identity set — hero images, patterns, iconography — for a real or fictional brand.",
    lessons: [
      "Midjourney parameters that matter",
      "Developing a signature style system",
      "Style and character references for consistency",
      "Blending, remixing and iterating on winners",
      "Post-processing in Photoshop: fix, extend, polish",
      "From generations to usable brand assets in Figma",
      "Licensing and commercial use explained",
    ],
  },
  {
    slug: "logo-and-brand-kits-with-ai",
    title: "Logos & Brand Kits with AI",
    category: "ai-design",
    summary:
      "Design client-ready logos and complete brand kits using Ideogram for lettering, Midjourney for marks and Figma for refinement.",
    priceNgn: 16500,
    durationHours: 5,
    level: "Beginner",
    tools: ["Ideogram", "Midjourney", "Figma"],
    project:
      "Deliver a complete brand kit: logo suite, color palette, type pairing and a mini brand guideline document.",
    lessons: [
      "What makes a logo work (AI or not)",
      "Generating wordmarks and lettering with Ideogram",
      "Icon and symbol exploration in Midjourney",
      "Vectorising and refining marks in Figma",
      "Colors and typography chosen like a brand designer",
      "Mockups: showing the brand in the real world",
      "Assembling the brand kit deliverable",
    ],
  },
  {
    slug: "social-graphics-at-scale",
    title: "Social Graphics at Scale with Canva AI",
    category: "ai-design",
    summary:
      "Build template systems in Canva, then use Magic Studio and bulk tools to produce weeks of on-brand graphics in hours.",
    priceNgn: 12500,
    durationHours: 3,
    level: "Beginner",
    tools: ["Canva", "Magic Studio", "ChatGPT"],
    project:
      "Design a 20-template brand system and batch-produce a month of social graphics from a content calendar.",
    lessons: [
      "Setting up a Brand Kit in Canva",
      "Template systems: design once, reuse forever",
      "Magic Studio: text-to-image, Magic Write, Magic Switch",
      "Bulk create: data-driven graphic production",
      "Carousels and infographics that get saved",
      "Resizing across platforms in one click",
      "Organising assets for a content team",
    ],
  },
  {
    slug: "ai-illustration-for-products",
    title: "AI Illustration: Characters, Scenes & Product Art",
    category: "ai-design",
    summary:
      "Develop consistent illustrated characters and scene art for books, apps and packaging using reference-driven AI workflows.",
    priceNgn: 18500,
    durationHours: 6,
    level: "Intermediate",
    tools: ["Midjourney", "Leonardo AI", "Procreate"],
    project:
      "Create an 8-illustration set featuring one consistent character across different scenes, ready for a children's book or app.",
    lessons: [
      "Illustration styles and how to specify them",
      "Designing a character sheet with AI",
      "Keeping characters consistent across scenes",
      "Composition for storytelling panels",
      "Clean-up and detailing by hand",
      "Preparing art for print vs screen",
      "Building a portfolio-ready illustration set",
    ],
  },
  {
    slug: "product-photography-with-ai",
    title: "AI Product Photography & Mockups",
    category: "ai-design",
    summary:
      "Replace expensive photoshoots: generate studio-grade product shots, lifestyle scenes and ad creatives from a few phone photos.",
    priceNgn: 15500,
    durationHours: 4,
    level: "Beginner",
    tools: ["Photoroom", "Flair AI", "Photoshop"],
    project:
      "Produce a 12-image product photography set — white background, lifestyle and seasonal campaign shots — from phone photos of a real product.",
    lessons: [
      "Shooting usable source photos on a phone",
      "Background removal and clean cutouts",
      "AI studio scenes: lighting and surface realism",
      "Lifestyle placements that sell the story",
      "Shadows, reflections and believable compositing",
      "Batch variants for marketplaces and ads",
      "Building a reusable product-shot pipeline",
    ],
  },

  // ───────────────────── AI Automation & Agents ─────────────────────
  {
    slug: "ai-automation-with-make",
    title: "AI Automation with Make.com",
    category: "ai-automation-agents",
    summary:
      "Connect ChatGPT to your apps with Make: build no-code automations that read, reason and act across your tool stack.",
    priceNgn: 18000,
    durationHours: 6,
    level: "Beginner",
    featured: true,
    tools: ["Make.com", "OpenAI API", "Google Sheets"],
    project:
      "Build three working automations for your business, including one AI-powered content or lead-processing scenario.",
    lessons: [
      "Automation thinking: triggers, actions, routers",
      "Your first Make scenario end to end",
      "Adding OpenAI modules: prompts inside workflows",
      "Working with webhooks and JSON",
      "Error handling, filters and routers",
      "Three classic AI automations, built together",
      "Monitoring, costs and operations",
    ],
  },
  {
    slug: "building-ai-agents-n8n",
    title: "Building AI Agents with n8n",
    category: "ai-automation-agents",
    summary:
      "Build agents that plan, use tools and act autonomously — research agents, inbox agents and report writers — on self-hostable n8n.",
    priceNgn: 24000,
    durationHours: 7,
    level: "Advanced",
    tools: ["n8n", "OpenAI API", "Pinecone"],
    project:
      "Deploy a working research-and-report agent that monitors sources, synthesises findings and emails a daily brief.",
    lessons: [
      "Agents vs automations: when each wins",
      "n8n setup: cloud and self-hosted",
      "The AI Agent node: tools, memory, reasoning",
      "Giving agents tools: HTTP, search, databases",
      "Retrieval and vector memory for context",
      "Guardrails: budgets, approvals, human-in-the-loop",
      "Deploying and monitoring a production agent",
      "Scaling to multi-agent workflows",
    ],
  },
  {
    slug: "zapier-ai-for-busy-teams",
    title: "Zapier AI for Busy Teams",
    category: "ai-automation-agents",
    summary:
      "Automate the repetitive 20% of office work — leads, inboxes, CRM hygiene, reporting — with Zapier's AI steps and Copilot.",
    priceNgn: 14000,
    durationHours: 4,
    level: "Beginner",
    tools: ["Zapier", "ChatGPT", "HubSpot"],
    project: "Automate five recurring team tasks, documented so colleagues can maintain them.",
    lessons: [
      "Finding automation candidates in your week",
      "Zaps 101: triggers, actions, paths",
      "AI steps: summarise, extract, classify, draft",
      "Lead capture to CRM, enriched by AI",
      "Inbox triage and draft replies",
      "Weekly report automation",
      "Handover: documenting automations for the team",
    ],
  },
  {
    slug: "whatsapp-business-automation",
    title: "WhatsApp Business Automation with AI",
    category: "ai-automation-agents",
    summary:
      "Build AI-powered WhatsApp flows for sales and support — the channel where African customers actually are.",
    priceNgn: 21000,
    durationHours: 5,
    level: "Intermediate",
    tools: ["WhatsApp Business API", "Make.com", "OpenAI API"],
    project:
      "Launch a WhatsApp assistant for a real business that answers FAQs, qualifies leads and hands off to a human cleanly.",
    lessons: [
      "WhatsApp Business: app vs API vs providers",
      "Designing conversation flows that feel human",
      "Connecting AI replies through Make",
      "FAQ answering from a business knowledge base",
      "Lead qualification and data capture",
      "Human handoff and escalation rules",
      "Compliance, opt-ins and broadcast done right",
    ],
  },
  {
    slug: "api-first-ai-integrations",
    title: "API-First AI: OpenAI & Gemini Integrations",
    category: "ai-automation-agents",
    summary:
      "Go beyond no-code: call OpenAI and Gemini APIs directly, with function calling, structured output and cost control.",
    priceNgn: 26000,
    durationHours: 7,
    level: "Advanced",
    tools: ["OpenAI API", "Gemini API", "Postman"],
    project:
      "Build a small API-powered tool — a classifier, extractor or generator endpoint — with structured output and usage logging.",
    lessons: [
      "API fundamentals: keys, requests, tokens, pricing",
      "Chat completions in Postman and code",
      "Structured output and JSON mode",
      "Function calling: letting models trigger your code",
      "Embeddings and semantic search basics",
      "Streaming, retries and rate limits",
      "Cost control and usage logging",
      "Shipping your first AI endpoint",
    ],
  },

  // ─────────────────────── No-Code AI Apps ───────────────────────
  {
    slug: "build-ai-apps-with-lovable",
    title: "Build AI Web Apps with Lovable",
    category: "no-code-ai-apps",
    summary:
      "Describe, iterate and ship full-stack web apps with Lovable — auth, database and AI features included, no code required.",
    priceNgn: 19000,
    durationHours: 6,
    level: "Beginner",
    featured: true,
    tools: ["Lovable", "Supabase", "OpenAI API"],
    project:
      "Ship a live AI-powered web app with authentication, a database and at least one AI feature, deployed on your own URL.",
    lessons: [
      "Prompt-driven development: how Lovable works",
      "Scoping an MVP you can ship this week",
      "Designing pages and flows through prompts",
      "Adding auth and a database with Lovable Cloud",
      "Wiring in AI features",
      "Debugging and iterating when output isn't right",
      "Custom domains and launch checklist",
    ],
  },
  {
    slug: "bubble-ai-saas",
    title: "Build an AI SaaS on Bubble",
    category: "no-code-ai-apps",
    summary:
      "Design, build and monetise a subscription AI SaaS on Bubble: workflows, API connector, Stripe and usage limits.",
    priceNgn: 25000,
    durationHours: 8,
    level: "Intermediate",
    tools: ["Bubble", "OpenAI API", "Stripe"],
    project:
      "Launch a functioning AI SaaS MVP with signup, a working AI feature, subscription billing and usage limits.",
    lessons: [
      "SaaS anatomy: data types, workflows, privacy rules",
      "Designing the app shell and responsive pages",
      "The API Connector: calling OpenAI from Bubble",
      "Building the core AI feature loop",
      "Stripe subscriptions and plan gating",
      "Usage metering and rate limits",
      "Performance, security and privacy rules",
      "Launch: from test mode to first customers",
    ],
  },
  {
    slug: "internal-tools-with-glide",
    title: "AI Internal Tools with Glide",
    category: "no-code-ai-apps",
    summary:
      "Turn spreadsheets into polished internal apps with AI columns — inventory, field sales and approval tools your team will use.",
    priceNgn: 15000,
    durationHours: 4,
    level: "Beginner",
    tools: ["Glide", "Google Sheets", "OpenAI API"],
    project:
      "Build and roll out one internal tool for a real workflow — with AI-powered fields, roles and a mobile-friendly UI.",
    lessons: [
      "From spreadsheet to app in an afternoon",
      "Data structure: tables, relations, rollups",
      "Screens, components and mobile layouts",
      "AI columns: classify, extract, summarise in-table",
      "Roles, permissions and data visibility",
      "Actions and notifications",
      "Piloting with your team and iterating",
    ],
  },
  {
    slug: "ai-chatbot-products-without-code",
    title: "Sellable AI Chatbots Without Code",
    category: "no-code-ai-apps",
    summary:
      "Build custom-knowledge chatbots with Chatbase and Botpress, embed them anywhere and package them as a sellable service.",
    priceNgn: 17000,
    durationHours: 5,
    level: "Beginner",
    tools: ["Chatbase", "Botpress", "Notion"],
    project:
      "Deliver a trained, branded chatbot for a real website, plus a service package you could sell to local businesses.",
    lessons: [
      "The custom-knowledge chatbot landscape",
      "Preparing a knowledge base that answers well",
      "Building and training your first bot",
      "Brand, tone and persona configuration",
      "Embedding on websites and WhatsApp",
      "Testing, analytics and retraining",
      "Productising: pricing and client onboarding",
    ],
  },
  {
    slug: "mobile-ai-apps-flutterflow",
    title: "Mobile AI Apps with FlutterFlow",
    category: "no-code-ai-apps",
    summary:
      "Design and publish real iOS/Android apps with AI features using FlutterFlow's visual builder and API integrations.",
    priceNgn: 23000,
    durationHours: 7,
    level: "Intermediate",
    tools: ["FlutterFlow", "Firebase", "OpenAI API"],
    project:
      "Build a mobile AI app — camera or chat powered — and produce a signed build ready for store submission.",
    lessons: [
      "FlutterFlow fundamentals and project setup",
      "Screens, navigation and design systems",
      "Firebase: auth and data for your app",
      "Calling AI APIs from FlutterFlow",
      "Building the core AI feature",
      "State management and offline behaviour",
      "Testing on devices",
      "Store submission walkthrough",
    ],
  },

  // ──────────────────── AI for Marketing & Paid Ads ────────────────────
  {
    slug: "meta-ads-with-ai",
    title: "Meta Ads with AI: Creative to Conversion",
    category: "ai-marketing-ads",
    summary:
      "Plan, produce and scale Facebook & Instagram campaigns with AI-generated creatives, copy variants and structured testing.",
    priceNgn: 20000,
    durationHours: 6,
    level: "Intermediate",
    featured: true,
    tools: ["Meta Ads Manager", "ChatGPT", "Canva"],
    project:
      "Launch a complete Meta campaign: offer, audience plan, 9 AI-produced creatives and a testing structure with KPIs.",
    lessons: [
      "Campaign structure that survives algorithm changes",
      "Offers and angles: the strategy before the ads",
      "AI-generated ad creative at volume",
      "Copy variants: hooks, primary text, headlines",
      "Advantage+ and AI features inside Ads Manager",
      "The creative testing system",
      "Reading results: metrics that matter",
      "Scaling winners without burning them out",
    ],
  },
  {
    slug: "google-ads-ai-toolkit",
    title: "The Google Ads AI Toolkit",
    category: "ai-marketing-ads",
    summary:
      "Run profitable Search and Performance Max campaigns using AI for keyword mining, RSA copy and negative-list hygiene.",
    priceNgn: 19000,
    durationHours: 5,
    level: "Intermediate",
    tools: ["Google Ads", "ChatGPT", "Google Sheets"],
    project:
      "Build and launch a Search campaign for a real offer: keyword map, ad groups, RSAs and a weekly optimisation routine.",
    lessons: [
      "Search intent and account structure",
      "Keyword mining and clustering with AI",
      "Writing responsive search ads that stay relevant",
      "Landing page alignment and Quality Score",
      "Performance Max: feeding the machine properly",
      "Negative keywords and budget hygiene",
      "The weekly optimisation checklist",
    ],
  },
  {
    slug: "marketing-analytics-with-ai",
    title: "Marketing Analytics with AI",
    category: "ai-marketing-ads",
    summary:
      "Stop guessing: use GA4, spreadsheets and AI analysis to find what's working, build dashboards and report like a strategist.",
    priceNgn: 17500,
    durationHours: 5,
    level: "Intermediate",
    tools: ["GA4", "Looker Studio", "ChatGPT"],
    project:
      "Build a marketing dashboard for a real business and deliver an AI-assisted monthly insights report with recommendations.",
    lessons: [
      "The metrics tree: from revenue down to channels",
      "GA4 essentials without the overwhelm",
      "Exploring data with AI: questions to insights",
      "Attribution: what you can and can't know",
      "Building a Looker Studio dashboard",
      "The monthly insights narrative",
      "Turning insights into next month's plan",
    ],
  },
  {
    slug: "influencer-ugc-ai-pipeline",
    title: "UGC & Influencer Content with AI",
    category: "ai-marketing-ads",
    summary:
      "Produce UGC-style ad content with AI scripting, creator briefs and AI-generated variations that feel native, not corporate.",
    priceNgn: 16000,
    durationHours: 4,
    level: "Beginner",
    tools: ["ChatGPT", "CapCut", "Arcads"],
    project:
      "Create a UGC campaign kit: 10 scripts, creator brief, shot lists and 3 finished UGC-style videos.",
    lessons: [
      "Why UGC outperforms polished ads",
      "UGC script formulas and AI generation",
      "Briefing human creators (and AI avatars)",
      "AI UGC tools: when synthetic works",
      "Editing UGC for ads: captions, pacing, hooks",
      "Rights, disclosure and platform rules",
      "Testing UGC against studio creative",
    ],
  },
  {
    slug: "launch-marketing-with-ai",
    title: "Product Launch Marketing with AI",
    category: "ai-marketing-ads",
    summary:
      "Orchestrate a complete product launch — waitlist, content, emails, ads and launch-day sequence — with AI handling production.",
    priceNgn: 18500,
    durationHours: 5,
    level: "Intermediate",
    tools: ["ChatGPT", "Mailchimp", "Buffer"],
    project:
      "Produce a full launch kit for a real product: timeline, waitlist page copy, 5 emails, 12 posts and a launch-day runbook.",
    lessons: [
      "Launch anatomy: phases and assets",
      "Positioning and messaging with AI",
      "Waitlist and landing page copy",
      "The pre-launch content drumbeat",
      "Launch emails and countdown sequences",
      "Launch-day runbook and war room",
      "Post-launch: reviews, momentum, retargeting",
    ],
  },

  // ─────────────────── AI for Business Operations ───────────────────
  {
    slug: "ai-productivity-os",
    title: "The AI Productivity OS for Professionals",
    category: "ai-business-operations",
    summary:
      "Rebuild your personal workflow around AI: email, meetings, notes, planning and documents — reclaim 10+ hours a week.",
    priceNgn: 13500,
    durationHours: 4,
    level: "Beginner",
    featured: true,
    tools: ["ChatGPT", "Notion AI", "Fathom"],
    project:
      "Implement your personal AI operating system: triage rules, meeting pipeline, note system and weekly review — documented and running.",
    lessons: [
      "Auditing your week: where time actually goes",
      "Inbox triage and drafting with AI",
      "Meetings: AI notes, summaries and action items",
      "Your second brain: AI-powered notes in Notion",
      "Daily and weekly planning with an AI chief of staff",
      "Documents and decks at double speed",
      "Installing the system as habits",
    ],
  },
  {
    slug: "ai-for-hr-and-recruiting",
    title: "AI for HR & Recruiting",
    category: "ai-business-operations",
    summary:
      "Modernise hiring and people ops: job descriptions, CV screening, interview kits, onboarding and policy drafting with AI — responsibly.",
    priceNgn: 17000,
    durationHours: 5,
    level: "Intermediate",
    tools: ["ChatGPT", "Notion", "Google Forms"],
    project:
      "Build a complete AI-assisted hiring kit for one role: JD, screening rubric, structured interview pack and 30-day onboarding plan.",
    lessons: [
      "Where AI helps HR — and where bias creeps in",
      "Job descriptions that attract the right people",
      "CV screening with structured rubrics",
      "Structured interview kits and scorecards",
      "Onboarding journeys generated and personalised",
      "Policies and handbooks drafted with AI",
      "Fairness, privacy and candidate experience",
    ],
  },
  {
    slug: "ai-for-finance-teams",
    title: "AI for Finance & Accounting Teams",
    category: "ai-business-operations",
    summary:
      "Automate bookkeeping categorisation, invoice processing, cash-flow forecasting and board reporting with AI tools and spreadsheets.",
    priceNgn: 19500,
    durationHours: 5,
    level: "Intermediate",
    tools: ["ChatGPT", "Excel", "QuickBooks"],
    project:
      "Deliver an AI-assisted monthly close pack: categorised transactions, variance commentary, cash-flow forecast and a board summary.",
    lessons: [
      "AI in finance: accuracy, auditability, limits",
      "Transaction categorisation and clean-up",
      "Invoice and receipt data extraction",
      "Spreadsheet copilots: formulas and analysis by prompt",
      "Cash-flow forecasting with AI assistance",
      "Variance analysis and commentary drafting",
      "The monthly close and board pack workflow",
    ],
  },
  {
    slug: "sops-and-knowledge-bases-ai",
    title: "SOPs & Company Knowledge Bases with AI",
    category: "ai-business-operations",
    summary:
      "Turn tribal knowledge into documented processes: record, transcribe and draft SOPs with AI, then build a searchable company wiki.",
    priceNgn: 14500,
    durationHours: 4,
    level: "Beginner",
    tools: ["Loom", "ChatGPT", "Notion"],
    project:
      "Document ten core processes as SOPs and launch a structured, searchable company knowledge base.",
    lessons: [
      "Why businesses stall without documented process",
      "Capturing processes: record first, write later",
      "From transcript to SOP with AI",
      "SOP structure: steps, owners, exceptions",
      "Building the knowledge base architecture",
      "Making it searchable and actually used",
      "The documentation habit and quarterly reviews",
    ],
  },
  {
    slug: "ai-for-sales-teams",
    title: "AI for Sales Teams: Prospecting to Proposal",
    category: "ai-business-operations",
    summary:
      "Compress the sales cycle with AI research, personalised outreach, call summaries, follow-ups and proposal generation.",
    priceNgn: 18000,
    durationHours: 5,
    level: "Intermediate",
    tools: ["ChatGPT", "Apollo", "HubSpot"],
    project:
      "Run a live AI-assisted outbound sprint: 50 researched prospects, personalised sequences, call prep docs and one generated proposal.",
    lessons: [
      "The AI-augmented sales pipeline",
      "Prospect research in minutes, not hours",
      "Personalised cold outreach that gets replies",
      "Call prep briefs and live note-taking",
      "Follow-up sequences that never slip",
      "Proposals and quotes generated from call notes",
      "CRM hygiene on autopilot",
    ],
  },

  // ─────────────────────── AI Customer Support ───────────────────────
  {
    slug: "ai-support-chatbots",
    title: "Customer Support Chatbots That Actually Resolve",
    category: "ai-customer-support",
    summary:
      "Design, train and deploy support chatbots on your docs that deflect 60%+ of tickets without infuriating customers.",
    priceNgn: 18500,
    durationHours: 5,
    level: "Intermediate",
    featured: true,
    tools: ["Intercom Fin", "Chatbase", "Zendesk"],
    project:
      "Deploy a trained support bot for a real product, with escalation rules, a measurement dashboard and a tuning routine.",
    lessons: [
      "Deflection vs resolution: setting the right goal",
      "Auditing your tickets to find bot-able topics",
      "Knowledge bases that bots can answer from",
      "Training, testing and tone configuration",
      "Escalation design: when and how to hand off",
      "Measuring resolution, CSAT and containment",
      "The weekly tuning loop",
    ],
  },
  {
    slug: "helpdesk-copilots",
    title: "Help-Desk Copilots for Human Agents",
    category: "ai-customer-support",
    summary:
      "Make every support agent your best agent: AI-drafted replies, summaries, macros and QA inside Zendesk and Freshdesk.",
    priceNgn: 16500,
    durationHours: 4,
    level: "Intermediate",
    tools: ["Zendesk AI", "Freshdesk Freddy", "ChatGPT"],
    project:
      "Roll out an agent-copilot workflow for a support team: drafted replies, summary macros, QA rubric and measured handle-time impact.",
    lessons: [
      "Copilot vs chatbot: augmenting humans first",
      "AI-drafted replies agents actually trust",
      "Conversation summaries and context on open",
      "Smart macros and intent-based routing",
      "QA at scale: scoring conversations with AI",
      "Coaching agents with AI insights",
      "Measuring handle time and quality shifts",
    ],
  },
  {
    slug: "voice-ai-agents",
    title: "Voice AI Agents for Phone Support",
    category: "ai-customer-support",
    summary:
      "Build phone agents that answer calls, book appointments and route callers using Vapi and Retell — with latency and fallback handled.",
    priceNgn: 23000,
    durationHours: 6,
    level: "Advanced",
    tools: ["Vapi", "Retell AI", "Twilio"],
    project:
      "Launch a working phone agent for a real use case — reception, booking or FAQ line — with call logs and a fallback path.",
    lessons: [
      "The voice agent stack: STT, LLM, TTS, telephony",
      "Designing call flows and conversation states",
      "Building your first agent in Vapi",
      "Latency, interruptions and barge-in handling",
      "Connecting calendars and business systems",
      "Fallbacks, transfers and edge cases",
      "Testing, call analytics and iteration",
    ],
  },
  {
    slug: "multilingual-support-ai",
    title: "Multilingual Customer Support with AI",
    category: "ai-customer-support",
    summary:
      "Serve customers in English, French, Hausa, Yoruba, Swahili and more — AI translation workflows that keep tone and accuracy.",
    priceNgn: 15500,
    durationHours: 4,
    level: "Beginner",
    tools: ["DeepL", "ChatGPT", "Crowdin"],
    project:
      "Stand up a multilingual support workflow: translated macros, a localised FAQ in two languages and a quality-check loop.",
    lessons: [
      "The multilingual support opportunity in Africa",
      "Machine translation: strengths and traps",
      "Tone-preserving translation prompts",
      "Localising your FAQ and help centre",
      "Real-time agent translation workflows",
      "Quality checks with back-translation",
      "Scaling to new languages systematically",
    ],
  },
  {
    slug: "support-analytics-voc",
    title: "Support Analytics & Voice of Customer with AI",
    category: "ai-customer-support",
    summary:
      "Mine thousands of tickets and reviews with AI to find root causes, product insights and the reports leadership actually reads.",
    priceNgn: 17500,
    durationHours: 4,
    level: "Intermediate",
    tools: ["ChatGPT", "Google Sheets", "Dovetail"],
    project:
      "Analyse a real ticket/review dataset, produce a themed insight report with quantified drivers and three recommended fixes.",
    lessons: [
      "From anecdotes to evidence: the VoC pipeline",
      "Collecting and cleaning conversation data",
      "AI tagging: themes, sentiment, root causes",
      "Quantifying drivers: what's costing you most",
      "Insight reports that drive product change",
      "Closing the loop with customers",
      "Automating the monthly VoC report",
    ],
  },

  // ─────────────────────── AI Data Analysis ───────────────────────
  {
    slug: "chatgpt-data-analysis",
    title: "Data Analysis with ChatGPT",
    category: "ai-data-analysis",
    summary:
      "Upload spreadsheets and get real analysis: cleaning, exploration, charts and forecasts with ChatGPT's Advanced Data Analysis.",
    priceNgn: 15000,
    durationHours: 4,
    level: "Beginner",
    featured: true,
    tools: ["ChatGPT", "Excel", "Google Sheets"],
    project:
      "Complete an end-to-end analysis of a real business dataset: cleaned data, five insight charts and a written findings memo.",
    lessons: [
      "What Advanced Data Analysis can and can't do",
      "Preparing and uploading your data safely",
      "Cleaning: duplicates, formats, missing values",
      "Exploratory analysis by conversation",
      "Charts that answer business questions",
      "Trends, cohorts and simple forecasts",
      "Writing the findings memo",
    ],
  },
  {
    slug: "excel-ai-power-user",
    title: "Excel + AI Power User",
    category: "ai-data-analysis",
    summary:
      "Supercharge Excel with Copilot and AI-generated formulas, pivot analysis and automated reporting for everyday business data.",
    priceNgn: 14000,
    durationHours: 4,
    level: "Beginner",
    tools: ["Excel", "Microsoft Copilot", "ChatGPT"],
    project:
      "Transform a messy multi-sheet workbook into an automated monthly report with pivots, charts and a one-click refresh.",
    lessons: [
      "AI inside Excel: Copilot and beyond",
      "Formulas by prompt: lookups, logic, text wrangling",
      "Cleaning messy exports fast",
      "Pivot tables and AI-suggested analyses",
      "Dashboards and conditional formatting",
      "Automating the monthly report",
      "When to graduate to Power Query",
    ],
  },
  {
    slug: "sql-with-ai-copilots",
    title: "SQL with AI Copilots",
    category: "ai-data-analysis",
    summary:
      "Learn practical SQL faster than any bootcamp — with AI writing, explaining and debugging queries against real databases.",
    priceNgn: 18000,
    durationHours: 6,
    level: "Intermediate",
    tools: ["PostgreSQL", "ChatGPT", "DBeaver"],
    project:
      "Answer ten real business questions against a sample commerce database, with documented, optimised queries.",
    lessons: [
      "Databases and tables: the mental model",
      "SELECT, WHERE, ORDER: your first queries",
      "Joins explained until they click",
      "Aggregation: GROUP BY and business metrics",
      "AI as your SQL pair programmer",
      "Debugging and optimising with AI explanations",
      "Window functions for advanced questions",
      "The analyst's query library",
    ],
  },
  {
    slug: "bi-dashboards-ai",
    title: "BI Dashboards with AI: Power BI & Looker Studio",
    category: "ai-data-analysis",
    summary:
      "Build executive dashboards with AI-assisted data modelling, DAX help and natural-language insights in Power BI and Looker Studio.",
    priceNgn: 20000,
    durationHours: 6,
    level: "Intermediate",
    tools: ["Power BI", "Looker Studio", "ChatGPT"],
    project:
      "Ship a live executive dashboard for a real dataset: modelled data, five key visuals, drill-downs and scheduled refresh.",
    lessons: [
      "Dashboard strategy: questions before charts",
      "Connecting and modelling data sources",
      "DAX and calculated fields with AI help",
      "Visual design: hierarchy, color, annotation",
      "Natural-language Q&A and AI visuals",
      "Interactivity: filters, drill-downs, alerts",
      "Publishing, refresh and governance",
    ],
  },
  {
    slug: "forecasting-for-business",
    title: "AI Forecasting for Business Decisions",
    category: "ai-data-analysis",
    summary:
      "Forecast sales, demand and cash flow with AI-assisted methods you can defend — baselines, seasonality and scenario planning.",
    priceNgn: 21000,
    durationHours: 5,
    level: "Advanced",
    tools: ["ChatGPT", "Excel", "Python (no-code use)"],
    project:
      "Build a 12-month forecast for a real metric with baseline, seasonal model, scenarios and a decision memo.",
    lessons: [
      "Forecasting honestly: uncertainty and baselines",
      "Decomposing trend and seasonality",
      "Simple models that beat gut feel",
      "AI-assisted model building without code pain",
      "Scenario planning: best, base, worst",
      "Communicating forecasts to decision makers",
      "Tracking accuracy and re-forecasting",
    ],
  },

  // ─────────────────────── AI Audio & Voice ───────────────────────
  {
    slug: "ai-voiceover-production",
    title: "AI Voiceover Production with ElevenLabs",
    category: "ai-audio-voice",
    summary:
      "Produce broadcast-quality voiceovers for ads, courses and videos — voice selection, direction, pacing and mastering.",
    priceNgn: 14500,
    durationHours: 4,
    level: "Beginner",
    featured: true,
    tools: ["ElevenLabs", "Audacity", "CapCut"],
    project:
      "Produce three finished voiceover assets: a 30-second ad read, a 2-minute explainer and a course module intro — mixed and mastered.",
    lessons: [
      "The AI voice landscape and licensing",
      "Choosing and auditioning voices",
      "Writing for the ear: scripts that speak well",
      "Directing delivery: pacing, emphasis, emotion",
      "Multi-voice productions and dialogue",
      "Cleanup and mastering in Audacity",
      "Syncing voiceover to video",
    ],
  },
  {
    slug: "podcast-production-ai",
    title: "Podcast Production with AI",
    category: "ai-audio-voice",
    summary:
      "Launch and run a podcast with AI handling planning, show notes, editing, clips and distribution — sustainably, every week.",
    priceNgn: 16500,
    durationHours: 5,
    level: "Beginner",
    tools: ["Riverside", "Descript", "ChatGPT"],
    project:
      "Launch a podcast with two published episodes: recorded, edited, show-noted, clipped and distributed with your new pipeline.",
    lessons: [
      "Show strategy: premise, format, audience",
      "Recording setups that sound professional",
      "AI editing: filler removal and Studio Sound",
      "Show notes, titles and chapters with AI",
      "Clips: turning episodes into social content",
      "Publishing and distribution setup",
      "The sustainable weekly pipeline",
    ],
  },
  {
    slug: "ai-dubbing-translation",
    title: "AI Dubbing & Audio Translation",
    category: "ai-audio-voice",
    summary:
      "Translate and dub video content into new languages with voice cloning that keeps the original speaker's character.",
    priceNgn: 18000,
    durationHours: 4,
    level: "Intermediate",
    tools: ["ElevenLabs Dubbing", "HeyGen", "CapCut"],
    project:
      "Dub a real 5-minute video into two target languages with timed, voice-matched audio and corrected subtitles.",
    lessons: [
      "The dubbing opportunity for creators and brands",
      "How AI dubbing and voice cloning work",
      "Preparing source video and clean audio",
      "Running and refining automated dubs",
      "Fixing timing, names and mistranslations",
      "Subtitles and captions alongside dubs",
      "Quality review with native speakers",
    ],
  },
  {
    slug: "voice-cloning-ethics-and-practice",
    title: "Voice Cloning: Practice, Rights & Safety",
    category: "ai-audio-voice",
    summary:
      "Clone voices properly: consent, rights and security — then build a professional voice double for scalable content production.",
    priceNgn: 15500,
    durationHours: 3,
    level: "Intermediate",
    tools: ["ElevenLabs", "Descript Overdub", "Notion"],
    project:
      "Create your own professional voice clone with a documented consent/usage policy, and produce three content pieces with it.",
    lessons: [
      "Voice cloning technology explained",
      "Consent, rights and the legal landscape",
      "Recording training data that clones well",
      "Building and tuning your voice double",
      "Production workflows with a cloned voice",
      "Security: deepfake risks and safeguards",
      "Disclosure and trust with your audience",
    ],
  },
  {
    slug: "music-and-sound-design-ai",
    title: "AI Music & Sound Design for Content",
    category: "ai-audio-voice",
    summary:
      "Create custom music beds, jingles and sound design for videos and podcasts with Suno and Udio — and stay on the right side of licensing.",
    priceNgn: 13500,
    durationHours: 3,
    level: "Beginner",
    tools: ["Suno", "Udio", "CapCut"],
    project:
      "Produce a complete audio brand kit: intro jingle, three music beds, and a sound-design pass on one real video.",
    lessons: [
      "AI music tools and what they're good at",
      "Prompting genres, moods and structures",
      "Jingles and sonic branding",
      "Music beds that sit under voice properly",
      "Sound effects and transitions",
      "Licensing and commercial use rules",
      "Mixing music into your content",
    ],
  },
];

export const featuredCourses = () => courses.filter((c) => c.featured);
export const coursesByCategory = (slug: string) => courses.filter((c) => c.category === slug);
