/**
 * NDH Agency Assignments — every course capstone is framed as real work
 * Najeeb Digital Hub (NDH) hands to the student. Built from the course title,
 * tools and track so each brief is specific without hand-writing 60 files.
 */

export interface SubmissionFormat {
  id: "video" | "design" | "document" | "deck" | "workflow" | "code";
  label: string;
  accepts: string;
  howTo: string;
  placeholder: string;
}

export const FORMATS: Record<SubmissionFormat["id"], SubmissionFormat> = {
  video: {
    id: "video",
    label: "Video file",
    accepts: "MP4 on Google Drive, or an unlisted YouTube / Vimeo link",
    howTo: "Upload the final video, set sharing to 'Anyone with the link', then paste the link.",
    placeholder: "https://drive.google.com/… or https://youtu.be/…",
  },
  design: {
    id: "design",
    label: "Design files",
    accepts: "Figma or Canva view link, or a PDF / PNG folder on Google Drive",
    howTo: "Share the Figma/Canva file as 'Can view', or put exports in one Drive folder.",
    placeholder: "https://www.figma.com/… or https://www.canva.com/…",
  },
  document: {
    id: "document",
    label: "Written document",
    accepts: "Google Doc, Word (DOCX) or PDF on Google Drive",
    howTo: "Put everything in one document, allow comments, then paste the link.",
    placeholder: "https://docs.google.com/document/…",
  },
  deck: {
    id: "deck",
    label: "Presentation deck",
    accepts: "Google Slides, PowerPoint (PPTX) or Canva presentation link",
    howTo: "Make it 8–15 slides, set sharing to 'Anyone with the link', then paste the link.",
    placeholder: "https://docs.google.com/presentation/… or Canva link",
  },
  workflow: {
    id: "workflow",
    label: "Working system + walkthrough",
    accepts: "Google Doc / Sheet with your setup, plus a Loom or screen-recording link",
    howTo: "Put the Loom link inside your document so NDH can see it running.",
    placeholder: "https://docs.google.com/… (include your Loom link inside)",
  },
  code: {
    id: "code",
    label: "Live demo + code",
    accepts: "Live demo URL plus a public GitHub repository",
    howTo: "Paste the live demo link here and the GitHub link in the notes box.",
    placeholder: "https://your-demo.app or https://github.com/…",
  },
};

const TRACK_FORMAT: Record<string, SubmissionFormat["id"]> = {
  "video-media": "video",
  "design-brand": "design",
  "writing-content": "document",
  "marketing-growth": "deck",
  "business-operations": "workflow",
  "ai-engineering": "code",
};

/** Realistic NDH client types the agency "has signed". */
const CLIENTS: Record<string, string[]> = {
  "video-media": [
    "a fast-growing Lagos skincare brand launching a new product line",
    "a Kano fashion house preparing its Sallah collection campaign",
    "a fintech startup in Abuja that needs explainer content for new users",
  ],
  "design-brand": [
    "a new Abuja restaurant chain opening its first three branches",
    "a Port Harcourt logistics company rebranding for national expansion",
    "a women-led agro business moving its products into supermarkets",
  ],
  "writing-content": [
    "a Nigerian edtech platform that needs to rank on Google",
    "a real-estate developer in Lekki selling off-plan homes",
    "a health clinic group building trust with new patients online",
  ],
  "marketing-growth": [
    "an online electronics store that wants more sales from Instagram and WhatsApp",
    "a fitness studio chain launching a membership drive",
    "a local bakery brand going from one shop to delivery across the city",
  ],
  "business-operations": [
    "a growing retail business drowning in manual orders and spreadsheets",
    "an event-planning company that loses leads in WhatsApp chats",
    "a small accounting firm that wants to save 10 hours a week",
  ],
  "ai-engineering": [
    "an e-commerce client whose support team cannot keep up with messages",
    "a school group that wants a smart assistant for parents' questions",
    "a property agency that needs leads captured and sorted automatically",
  ],
};

export const NDH_PROMO_OPTION =
  "Bonus (optional): NDH may also use strong work on its own channels. Add one extra piece made for NDH itself — for example a short promo post, design or script for NDH Academy — and tell us in the notes.";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface NdhBrief {
  title: string;
  client: string;
  brief: string;
  tasks: string[];
  format: SubmissionFormat;
}

export function ndhBriefFor(course: {
  slug: string;
  title: string;
  category: string;
  tools?: string[];
}): NdhBrief {
  const track = TRACK_FORMAT[course.category] ? course.category : "business-operations";
  const clients = CLIENTS[track]!;
  const client = clients[hash(course.slug) % clients.length]!;
  const tools = (course.tools ?? []).slice(0, 3).join(", ") || "the AI tools from this course";
  const skill = course.title;
  const format = FORMATS[TRACK_FORMAT[track]!];

  return {
    title: `NDH Agency Assignment: ${skill}`,
    client,
    brief: `Najeeb Digital Hub (NDH) has signed ${client}. NDH is assigning you to this client as a junior ${skill} specialist. Using ${tools}, deliver work the client can use right away. Treat this like a paid job — NDH reviews it before it goes to the client.`,
    tasks: [
      `A short plan (half a page): who the client's customers are and what your ${skill.toLowerCase()} work must achieve.`,
      `The main deliverable, finished and ready to hand over to the client.`,
      `Before-and-after notes: what the AI produced first and what you fixed by hand.`,
      `One paragraph telling NDH how you would improve it with more time or budget.`,
    ],
    format,
  };
}
