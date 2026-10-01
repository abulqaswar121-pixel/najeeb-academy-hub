/** Minimum score to pass the final assessment and earn the certificate. */
export const PASS_MARK = 0.7;

export interface AssessmentQuestion {
  question: string;
  options: string[];
  answerIndex: number;
}

/**
 * Final assessment question banks, one per category track.
 * Pass mark is 70% (4 of 5). Questions test the practical judgement the
 * track's courses teach, not trivia.
 */
export const assessments: Record<string, AssessmentQuestion[]> = {
  "video-media": [
    {
      question:
        "A client needs a 30-second product video but your AI generation keeps producing inconsistent shots. The professional fix is to…",
      options: [
        "Generate 100 random clips and hope some match",
        "Lock a reference image/style frame first, then generate shots against it and grade them to match in the edit",
        "Tell the client AI video can't do consistency",
        "Use a different AI tool for every shot",
      ],
      answerIndex: 1,
    },
    {
      question: "When repurposing a long video into short clips, what matters most for retention?",
      options: [
        "Keeping the original intro on every clip",
        "Adding as many effects as possible",
        "Opening each clip on a strong hook moment and cutting dead air aggressively",
        "Making every clip exactly 60 seconds",
      ],
      answerIndex: 2,
    },
    {
      question: "You cloned a voice with AI for a client project. Before publishing, you must…",
      options: [
        "Nothing — published audio is always fine",
        "Have written consent from the voice owner and disclose AI use where the platform requires it",
        "Only lower the pitch so nobody recognizes it",
        "Delete the source samples",
      ],
      answerIndex: 1,
    },
    {
      question: "AI-generated music for a commercial client should be checked first for…",
      options: [
        "The license terms of the generation platform and commercial-use rights",
        "Whether it sounds like a famous song (that's a bonus)",
        "File size only",
        "Number of instruments",
      ],
      answerIndex: 0,
    },
    {
      question: "The correct export discipline for client video work is…",
      options: [
        "One master file, whatever settings the editor defaults to",
        "Match the delivery spec: platform aspect ratios, bitrate, captions file and a named, versioned export set",
        "Always maximum resolution regardless of platform",
        "Let the client transcode it themselves",
      ],
      answerIndex: 1,
    },
  ],
  "design-brand": [
    {
      question:
        "A Midjourney logo concept looks great but the client needs it for print and signage. Your next step is…",
      options: [
        "Send the PNG as-is — it's high resolution",
        "Vectorize and rebuild it cleanly (e.g. in Illustrator), then test at multiple sizes and in one colour",
        "Generate 50 more versions",
        "Screenshot it at higher zoom",
      ],
      answerIndex: 1,
    },
    {
      question: "A complete brand identity deliverable includes…",
      options: [
        "Just the logo file",
        "Logo system, colour palette, typography, usage rules and application mockups",
        "A single Instagram post template",
        "Whatever the AI generated in the first pass",
      ],
      answerIndex: 1,
    },
    {
      question:
        "When AI-generated product imagery shows a warped label or extra fingers, you should…",
      options: [
        "Ship it — clients rarely zoom in",
        "Regenerate or retouch until the artefact is gone; commercial work ships artefact-free",
        "Add a filter to hide it",
        "Lower the resolution so it's less visible",
      ],
      answerIndex: 1,
    },
    {
      question: "In UI/UX work, AI tools like Figma AI are best used to…",
      options: [
        "Replace user research entirely",
        "Draft layouts and variants fast, which you then refine against real user needs and design-system rules",
        "Pick the brand colours for you",
        "Export production code with no review",
      ],
      answerIndex: 1,
    },
    {
      question:
        "Before presenting AI-assisted design work to a client, the professional checklist includes…",
      options: [
        "Checking licensing/usage rights of generated assets and doing a human quality pass",
        "Removing all mention of the brief",
        "Compressing everything to one JPEG",
        "Nothing — speed is the only deliverable",
      ],
      answerIndex: 0,
    },
  ],
  "writing-content": [
    {
      question: "An AI draft reads fluent but generic. The highest-leverage edit is to…",
      options: [
        "Run it through another AI model",
        "Inject specifics only you know: audience pain points, concrete examples, numbers and your brand voice",
        "Make it longer",
        "Add more adjectives",
      ],
      answerIndex: 1,
    },
    {
      question: "For SEO content written with AI, ranking durably requires…",
      options: [
        "Publishing as many AI articles per day as possible",
        "Search-intent match, original insight/experience, and clean on-page structure — then human fact-checking",
        "Stuffing the exact keyword 50 times",
        "Copying the #1 result with synonyms",
      ],
      answerIndex: 1,
    },
    {
      question: "Sales copy's single most important element is…",
      options: [
        "Clever wordplay",
        "A clear, specific promise to the right audience, backed by proof",
        "Length — longer always converts better",
        "Emojis",
      ],
      answerIndex: 1,
    },
    {
      question:
        "When using AI for client ghostwriting (e.g. LinkedIn), you protect the client's voice by…",
      options: [
        "Letting the model freestyle from a topic",
        "Training your prompts on their past posts, phrases and stories, then editing drafts against that voice guide",
        "Using the same template for every client",
        "Posting drafts without review",
      ],
      answerIndex: 1,
    },
    {
      question: "AI-written factual claims (stats, quotes, dates) must be…",
      options: [
        "Trusted — modern models don't hallucinate",
        "Verified against a primary source before publishing",
        "Deleted entirely",
        "Marked in italics",
      ],
      answerIndex: 1,
    },
  ],
  "marketing-growth": [
    {
      question:
        "Your AI-generated ad creatives got cheap clicks but no sales. The first thing to examine is…",
      options: [
        "The font on the ad",
        "Message-to-offer match and the landing page — clicks without conversion usually mean a promise mismatch",
        "Posting time",
        "Adding more hashtags",
      ],
      answerIndex: 1,
    },
    {
      question: "A sound creative-testing system looks like…",
      options: [
        "Changing five variables at once so you learn faster",
        "Structured variants (hook, visual, offer), enough spend per variant to read results, kill losers, scale winners",
        "Running one ad until it dies",
        "Copying competitors exactly",
      ],
      answerIndex: 1,
    },
    {
      question: "For local SEO, the highest-impact foundation is…",
      options: [
        "A complete, active Google Business Profile with reviews, categories, photos and consistent NAP data",
        "Buying backlinks in bulk",
        "A hashtag strategy",
        "Daily blog posts about anything",
      ],
      answerIndex: 0,
    },
    {
      question: "AI personalization in cold outreach works when…",
      options: [
        "Every email starts with 'I love your website'",
        "The AI references real, specific context about the prospect and leads with their problem, not your pitch",
        "You blast the same message to 10,000 people",
        "Subject lines are in all caps",
      ],
      answerIndex: 1,
    },
    {
      question: "A funnel is underperforming. The professional diagnostic order is…",
      options: [
        "Rebuild everything from scratch immediately",
        "Measure each stage's conversion, find the biggest drop-off, fix that stage first, then re-measure",
        "Double the ad budget",
        "Change the brand colours",
      ],
      answerIndex: 1,
    },
  ],
  "business-operations": [
    {
      question: "Before automating a business process with AI, you should first…",
      options: [
        "Automate it immediately — speed wins",
        "Map the current process, standardize it, then automate the stable, repetitive parts",
        "Fire the person doing it",
        "Buy every AI tool available",
      ],
      answerIndex: 1,
    },
    {
      question: "AI meeting notes and transcriptions in a company must be handled with…",
      options: [
        "No special care",
        "Consent where required, access controls, and review before sharing — they often contain sensitive data",
        "Public links so everyone can find them",
        "Automatic posting to social media",
      ],
      answerIndex: 1,
    },
    {
      question: "When AI drafts a legal document (contract, NDA), the non-negotiable step is…",
      options: [
        "Send it unsigned and unread",
        "Human review — ideally qualified — of parties, terms, jurisdiction and liabilities before any use",
        "Changing the font to look official",
        "Adding more pages",
      ],
      answerIndex: 1,
    },
    {
      question: "A financial model built with AI + Excel is trustworthy when…",
      options: [
        "The spreadsheet looks professional",
        "Assumptions are explicit and sourced, formulas are auditable, and outputs are sanity-checked against reality",
        "It predicts exactly what the boss wants",
        "It has many tabs",
      ],
      answerIndex: 1,
    },
    {
      question: "The right way to deploy an AI support chatbot for a business is…",
      options: [
        "Let it answer everything with no guardrails",
        "Ground it on your real docs/FAQs, give it escalation paths to humans, and review conversations regularly",
        "Train it to never admit uncertainty",
        "Hide the option to reach a human",
      ],
      answerIndex: 1,
    },
  ],
  "ai-engineering": [
    {
      question:
        "A single mega-prompt agent keeps failing a complex multi-step task. The engineering fix is to…",
      options: [
        "Make the prompt longer",
        "Decompose the task across specialized agents/steps with clear roles, handoffs and validated outputs",
        "Raise the temperature",
        "Switch models randomly until it works",
      ],
      answerIndex: 1,
    },
    {
      question: "In n8n/automation workflows that call AI, production reliability requires…",
      options: [
        "Hoping the API never fails",
        "Error handling, retries, output validation and alerting on failure paths",
        "Running everything manually as backup",
        "Only testing in production",
      ],
      answerIndex: 1,
    },
    {
      question: "API keys in a deployed app belong…",
      options: [
        "In the frontend code so it's simpler",
        "In server-side environment variables/secrets — never shipped to the client",
        "In a public GitHub README for the team",
        "Hard-coded but base64-encoded",
      ],
      answerIndex: 1,
    },
    {
      question: "Before charging users for an AI SaaS, the launch checklist must include…",
      options: [
        "Auth, payment webhooks verified, usage limits/cost controls on AI calls, and error monitoring",
        "A logo animation",
        "At least 50 features",
        "Removing all logging for speed",
      ],
      answerIndex: 0,
    },
    {
      question: "AI coding assistants like Cursor are used professionally by…",
      options: [
        "Accepting every suggestion to maximize speed",
        "Reviewing, testing and understanding generated code before it ships — you own what you merge",
        "Letting them push directly to production",
        "Disabling tests so suggestions pass",
      ],
      answerIndex: 1,
    },
  ],
};
