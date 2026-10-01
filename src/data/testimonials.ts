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
      "I finished AI Copywriting Essentials on a Saturday and closed my first retainer client the following week. The de-robotting edit lesson alone was worth the fee — my drafts finally sound like me, just faster.",
    courseSlug: "ai-copywriting-essentials",
  },
  {
    name: "Ibrahim Musa",
    role: "Operations Manager, Kano",
    quote:
      "The Make.com course paid for itself in the first month. We automated our order confirmations and lead follow-ups, and I didn't write a single line of code. The capstone project is now running live in our business.",
    courseSlug: "ai-automation-with-make",
  },
  {
    name: "Funmilayo Adeyemi",
    role: "Content Creator, Ibadan",
    quote:
      "Faceless YouTube Channels gave me an actual production system, not motivation fluff. Three months after my capstone, my channel crossed 8,000 subscribers and I run everything in about six hours a week.",
    courseSlug: "faceless-youtube-channels",
  },
  {
    name: "Chidi Nwankwo",
    role: "Data Analyst, Abuja",
    quote:
      "SQL with AI Copilots is how SQL should be taught. The AI pair-programming approach meant I was never stuck for more than a minute, and the certificate verification link went straight on my CV.",
    courseSlug: "sql-with-ai-copilots",
  },
  {
    name: "Amina Bello",
    role: "Customer Success Lead, Port Harcourt",
    quote:
      "We deployed the support chatbot from my capstone project and our ticket volume dropped by half. My manager asked where I learned it — I just sent her the certificate verification link.",
    courseSlug: "ai-support-chatbots",
  },
  {
    name: "Tunde Bakare",
    role: "Founder, Lagos",
    quote:
      "I built and launched my first AI web app with the Lovable course in under two weeks. As a non-technical founder, shipping something real — auth, database and all — felt impossible before this.",
    courseSlug: "build-ai-apps-with-lovable",
  },
  {
    name: "Ngozi Eze",
    role: "Digital Marketer, Enugu",
    quote:
      "The Meta Ads course is taught by people who clearly run ads. The creative testing system cut our cost per lead by 40%, and the AI creative pipeline means we never run out of fresh angles.",
    courseSlug: "meta-ads-with-ai",
  },
  {
    name: "Suleiman Abdullahi",
    role: "Voiceover Artist, Kaduna",
    quote:
      "I was afraid AI would replace my voice work. The ElevenLabs course showed me how to scale it instead — I now deliver projects in three languages and my turnaround went from days to hours.",
    courseSlug: "ai-voiceover-production",
  },
];
