export interface CategorySeed {
  slug: string;
  name: string;
  shortName: string;
  blurb: string;
  icon: string; // lucide icon name used by the UI
  image: string; // public path to the category artwork
}

export const categories: CategorySeed[] = [
  {
    slug: "prompt-engineering",
    name: "Prompt Engineering",
    shortName: "Prompting",
    blurb:
      "Write prompts that get reliable, production-grade output from ChatGPT, Claude and Gemini.",
    icon: "Terminal",
    image: "/images/categories/prompt-engineering.jpg",
  },
  {
    slug: "ai-content-copywriting",
    name: "AI Content & Copywriting",
    shortName: "Copywriting",
    blurb: "Produce sales pages, emails and social content with AI — without the robotic tone.",
    icon: "PenTool",
    image: "/images/categories/ai-content-copywriting.jpg",
  },
  {
    slug: "ai-blogging-seo",
    name: "AI Blogging & SEO",
    shortName: "Blogging & SEO",
    blurb:
      "Build search-ranked content engines: keyword research, briefs, drafts and optimization with AI.",
    icon: "Search",
    image: "/images/categories/ai-blogging-seo.jpg",
  },
  {
    slug: "ai-video",
    name: "AI Video Generation & Editing",
    shortName: "AI Video",
    blurb: "Create and edit video with Runway, Pika, Sora-class tools, CapCut and AI avatars.",
    icon: "Clapperboard",
    image: "/images/categories/ai-video.jpg",
  },
  {
    slug: "ai-design",
    name: "AI Graphic Design & Illustration",
    shortName: "AI Design",
    blurb:
      "Design logos, brand kits, illustrations and social graphics with Midjourney, Ideogram and Canva AI.",
    icon: "Palette",
    image: "/images/categories/ai-design.jpg",
  },
  {
    slug: "ai-automation-agents",
    name: "AI Automation & Agents",
    shortName: "Automation",
    blurb:
      "Chain models into workflows and agents with Make, n8n, Zapier and function-calling APIs.",
    icon: "Workflow",
    image: "/images/categories/ai-automation-agents.jpg",
  },
  {
    slug: "no-code-ai-apps",
    name: "No-Code AI Apps",
    shortName: "No-Code Apps",
    blurb:
      "Ship real AI products with Lovable, Bubble, Glide and FlutterFlow — no programming degree needed.",
    icon: "Blocks",
    image: "/images/categories/no-code-ai-apps.jpg",
  },
  {
    slug: "ai-marketing-ads",
    name: "AI for Marketing & Paid Ads",
    shortName: "Marketing & Ads",
    blurb: "Plan, create and optimize ad campaigns on Meta, Google and TikTok with AI copilots.",
    icon: "Megaphone",
    image: "/images/categories/ai-marketing-ads.jpg",
  },
  {
    slug: "ai-business-operations",
    name: "AI for Business Operations",
    shortName: "Business Ops",
    blurb: "Automate documents, meetings, HR and finance workflows so your team ships faster.",
    icon: "Briefcase",
    image: "/images/categories/ai-business-operations.jpg",
  },
  {
    slug: "ai-customer-support",
    name: "AI Customer Support",
    shortName: "Support",
    blurb: "Deploy chatbots, help-desk copilots and voice agents that actually resolve tickets.",
    icon: "Headset",
    image: "/images/categories/ai-customer-support.jpg",
  },
  {
    slug: "ai-data-analysis",
    name: "AI Data Analysis",
    shortName: "Data Analysis",
    blurb:
      "Turn spreadsheets and databases into decisions with ChatGPT Code Interpreter, SQL and BI copilots.",
    icon: "BarChart3",
    image: "/images/categories/ai-data-analysis.jpg",
  },
  {
    slug: "ai-audio-voice",
    name: "AI Audio & Voice",
    shortName: "Audio & Voice",
    blurb: "Produce voiceovers, podcasts, dubs and voice agents with ElevenLabs and friends.",
    icon: "AudioLines",
    image: "/images/categories/ai-audio-voice.jpg",
  },
];

export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);
