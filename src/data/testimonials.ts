export interface TestimonialSeed {
  name: string;
  role: string;
  quote: string;
  courseSlug: string | null;
}

export const testimonials: TestimonialSeed[] = [
  {
    name: "Adaeze Okonkwo",
    role: "Freelance Copywriter, Lagos",
    quote:
      "I finished AI Copywriting on a Saturday and closed my first retainer client the following week. The editing pass that removes the robotic tone was worth the fee on its own — my drafts finally sound like me, just faster.",
    courseSlug: "ai-copywriting",
  },
  {
    name: "Ibrahim Musa",
    role: "Operations Manager, Kano",
    quote:
      "The workflow automation course paid for itself in the first month. We automated our order confirmations and lead follow-ups in n8n, and I didn't write a single line of code. My capstone project is now running live in our business.",
    courseSlug: "ai-workflow-automation",
  },
  {
    name: "Funmilayo Adeyemi",
    role: "Content Creator, Ibadan",
    quote:
      "AI YouTube Growth gave me an actual production system, not motivation fluff. Three months after my capstone, my channel crossed 8,000 subscribers and I run everything in about six hours a week.",
    courseSlug: "ai-youtube-growth-management",
  },
  {
    name: "Chidi Nwankwo",
    role: "Data Analyst, Abuja",
    quote:
      "AI Data Entry & Analysis is how analysis should be taught. The ChatGPT pair-working approach meant I was never stuck for more than a minute, and the certificate verification link went straight on my CV.",
    courseSlug: "ai-data-entry-and-analysis",
  },
  {
    name: "Amina Bello",
    role: "Customer Success Lead, Port Harcourt",
    quote:
      "We deployed the support chatbot from my capstone project and our ticket volume dropped by half. My manager asked where I learned it — I just sent her the certificate verification link.",
    courseSlug: "ai-customer-support",
  },
  {
    name: "Tunde Bakare",
    role: "Founder, Lagos",
    quote:
      "I built and launched my first no-code AI app in under two weeks. As a non-technical founder, shipping something real — auth, database and all — felt impossible before this course.",
    courseSlug: "no-code-ai-apps",
  },
  {
    name: "Ngozi Eze",
    role: "Digital Marketer, Enugu",
    quote:
      "The AI Paid Ads course is clearly taught from real campaigns. The creative testing system cut our cost per lead by 40%, and the AI creative pipeline means we never run out of fresh angles.",
    courseSlug: "ai-paid-ads",
  },
  {
    name: "Suleiman Abdullahi",
    role: "Voiceover Artist, Kaduna",
    quote:
      "I was afraid AI would replace my voice work. The voice cloning course showed me how to scale it instead — I now deliver projects in three languages and my turnaround went from days to hours.",
    courseSlug: "ai-voice-cloning-and-dubbing",
  },
];
