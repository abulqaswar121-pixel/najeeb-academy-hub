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
    slug: "video-media",
    name: "Video, Audio & Media",
    shortName: "Video & Audio",
    blurb:
      "Generate, edit and ship commercial video, music and voice with Runway, CapCut, HeyGen, Suno and ElevenLabs.",
    icon: "Clapperboard",
    image: "/images/categories/ai-video.jpg",
  },
  {
    slug: "design-brand",
    name: "Design & Brand",
    shortName: "Design",
    blurb:
      "Build logos, brand identities, product visuals and UI with Midjourney, Figma, Illustrator and Photoshop AI.",
    icon: "Palette",
    image: "/images/categories/ai-design.jpg",
  },
  {
    slug: "writing-content",
    name: "Writing & Content",
    shortName: "Writing",
    blurb:
      "Write copy, blogs, e-books, newsletters and scripts that convert — with AI drafting and a human editorial finish.",
    icon: "PenTool",
    image: "/images/categories/ai-content-copywriting.jpg",
  },
  {
    slug: "marketing-growth",
    name: "Marketing & Growth",
    shortName: "Marketing",
    blurb:
      "Run ads, SEO, funnels, social and outreach systems powered by AI — built to measure and scale what works.",
    icon: "Megaphone",
    image: "/images/categories/ai-marketing-ads.jpg",
  },
  {
    slug: "business-operations",
    name: "Business & Operations",
    shortName: "Business Ops",
    blurb:
      "Automate CRM, support, finance, legal, data and admin workflows so your business runs on systems, not stress.",
    icon: "Briefcase",
    image: "/images/categories/ai-business-operations.jpg",
  },
  {
    slug: "ai-engineering",
    name: "AI Engineering",
    shortName: "Engineering",
    blurb:
      "Build agents, chatbots, no-code apps and full AI SaaS products with n8n, CrewAI, LangChain, FlutterFlow and Cursor.",
    icon: "Cpu",
    image: "/images/categories/ai-automation-agents.jpg",
  },
];

export function categoryBySlug(slug: string): CategorySeed | undefined {
  return categories.find((c) => c.slug === slug);
}
