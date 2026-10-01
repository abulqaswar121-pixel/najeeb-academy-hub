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
  "prompt-engineering": [
    {
      question:
        "A prompt keeps producing vague, generic output. What's the highest-leverage first fix?",
      options: [
        "Increase the temperature setting",
        "Add specific context, constraints and a concrete example of the desired output",
        "Switch to a different model immediately",
        "Make the prompt shorter so the model focuses",
      ],
      answerIndex: 1,
    },
    {
      question: "When is few-shot prompting (showing examples) most useful?",
      options: [
        "When you need the model to follow a specific format or style it keeps getting wrong",
        "Only when using image models",
        "When you want faster responses",
        "Never — examples confuse modern models",
      ],
      answerIndex: 0,
    },
    {
      question: "You need strictly valid JSON from a model for an automation. Best practice is to…",
      options: [
        "Ask politely and hope for the best",
        "Specify the exact schema, request JSON-only output, and validate/retry on failure",
        "Copy-paste the output manually each time",
        "Use the highest temperature for creativity",
      ],
      answerIndex: 1,
    },
    {
      question: "What does a system prompt control that a user prompt doesn't?",
      options: [
        "The model's training data",
        "The persistent persona, policies and boundaries applied across the whole conversation",
        "The server the model runs on",
        "Nothing — they're interchangeable",
      ],
      answerIndex: 1,
    },
    {
      question: "A chain-of-thought approach helps most when…",
      options: [
        "The task needs multi-step reasoning, like analysis or planning",
        "You want shorter answers",
        "The task is a single-word classification",
        "You need the model to respond faster",
      ],
      answerIndex: 0,
    },
  ],
  "ai-content-copywriting": [
    {
      question: "The most reliable way to make AI copy sound like your brand is to…",
      options: [
        "Tell it 'write in a friendly tone'",
        "Provide a voice guide with attributes, lexicon and real do/don't examples",
        "Always use the same model",
        "Write everything at temperature 0",
      ],
      answerIndex: 1,
    },
    {
      question: "In the PAS framework, what follows 'Problem' and 'Agitate'?",
      options: ["Summary", "Solution", "Social proof", "Scarcity"],
      answerIndex: 1,
    },
    {
      question: "The 'de-robotting' editing pass primarily targets…",
      options: [
        "Spelling errors",
        "Generic phrasing, uniform rhythm and lack of specific detail",
        "Keyword density",
        "Image placement",
      ],
      answerIndex: 1,
    },
    {
      question: "What should you feed AI before asking it to write sales copy?",
      options: [
        "Nothing — it knows your market",
        "Real customer research: reviews, objections, voice-of-customer language",
        "Your competitor's logo",
        "Only the product name",
      ],
      answerIndex: 1,
    },
    {
      question: "Best practice for AI-generated headlines is to…",
      options: [
        "Use the first one generated",
        "Generate many variants, then select and refine against your hook criteria",
        "Always include the word 'revolutionary'",
        "Keep them over 20 words for detail",
      ],
      answerIndex: 1,
    },
  ],
  "ai-blogging-seo": [
    {
      question: "Search intent matters because…",
      options: [
        "Google ranks pages that best satisfy what the searcher actually wants",
        "It determines your hosting costs",
        "Longer articles always win",
        "It only applies to paid ads",
      ],
      answerIndex: 0,
    },
    {
      question: "A topic cluster strategy means…",
      options: [
        "Writing about random trending topics",
        "Building interlinked content around one core topic to earn topical authority",
        "Publishing the same article on many sites",
        "Only targeting one keyword forever",
      ],
      answerIndex: 1,
    },
    {
      question: "Before publishing an AI-drafted article you should always…",
      options: [
        "Add more keywords to every paragraph",
        "Fact-check claims, add first-hand insight and edit for your audience",
        "Delete all headings",
        "Make it at least 5,000 words",
      ],
      answerIndex: 1,
    },
    {
      question: "A page's rankings decayed over 12 months. Your first diagnostic step is to…",
      options: [
        "Delete the page",
        "Check Search Console: queries, competitors and whether intent has shifted",
        "Republish it unchanged with today's date",
        "Buy backlinks",
      ],
      answerIndex: 1,
    },
    {
      question: "Programmatic SEO is appropriate when…",
      options: [
        "You want hundreds of thin doorway pages",
        "Structured data lets you generate genuinely useful, unique pages at scale",
        "You can't be bothered writing articles",
        "Your site has no data at all",
      ],
      answerIndex: 1,
    },
  ],
  "ai-video": [
    {
      question: "For consistent shots across an AI-generated video sequence you should…",
      options: [
        "Use a fresh random prompt per shot",
        "Reuse style keywords, seeds/references and consistent camera language across prompts",
        "Generate everything at the lowest resolution",
        "Avoid describing the camera at all",
      ],
      answerIndex: 1,
    },
    {
      question: "The single biggest driver of YouTube watch time is…",
      options: [
        "Video resolution",
        "A script and edit engineered for retention from the first seconds",
        "Upload frequency alone",
        "Using trending hashtags",
      ],
      answerIndex: 1,
    },
    {
      question: "Text-based editing in Descript lets you…",
      options: [
        "Cut video by deleting words in the transcript",
        "Change the actor's face",
        "Increase the frame rate",
        "Rank higher on YouTube automatically",
      ],
      answerIndex: 0,
    },
    {
      question: "AI avatar presenters work best for…",
      options: [
        "Emotional brand films",
        "Scalable explainers, training and multilingual versions of talking-head content",
        "Live event coverage",
        "Replacing all human presenters everywhere",
      ],
      answerIndex: 1,
    },
    {
      question: "Short-form video thrives on…",
      options: [
        "A strong hook in the first two seconds and tight pacing throughout",
        "Long intros that build context",
        "Horizontal 16:9 framing",
        "Minimal captions",
      ],
      answerIndex: 0,
    },
  ],
  "ai-design": [
    {
      question: "To keep a character consistent across Midjourney images you'd use…",
      options: [
        "A different art style each time",
        "Character/style references and a repeatable prompt recipe",
        "Only black-and-white generations",
        "Random seeds on purpose",
      ],
      answerIndex: 1,
    },
    {
      question: "Ideogram is particularly strong at…",
      options: [
        "3D rendering",
        "Legible text and lettering inside images",
        "Video generation",
        "Audio mixing",
      ],
      answerIndex: 1,
    },
    {
      question: "Before delivering an AI-generated logo to a client you should…",
      options: [
        "Send the raw generation untouched",
        "Vectorise and refine it, and verify the licence permits commercial use",
        "Add a watermark",
        "Lower the resolution",
      ],
      answerIndex: 1,
    },
    {
      question: "A template system in Canva exists so that…",
      options: [
        "Every post is designed from scratch",
        "On-brand graphics can be produced quickly and consistently by anyone on the team",
        "Only designers can make posts",
        "Posts look different every day",
      ],
      answerIndex: 1,
    },
    {
      question: "For print deliverables, AI-generated art must be…",
      options: [
        "Exported at high resolution/DPI in the right colour profile",
        "Kept at 72dpi screen resolution",
        "Saved as a GIF",
        "Compressed as much as possible",
      ],
      answerIndex: 0,
    },
  ],
  "ai-automation-agents": [
    {
      question: "The difference between an automation and an agent is…",
      options: [
        "Agents are always more expensive",
        "Automations follow fixed steps; agents plan and choose tools to reach a goal",
        "Automations require coding",
        "There is no difference",
      ],
      answerIndex: 1,
    },
    {
      question: "A webhook is…",
      options: [
        "A type of password",
        "A URL that receives data to trigger or continue a workflow",
        "A spreadsheet formula",
        "An AI model",
      ],
      answerIndex: 1,
    },
    {
      question: "Human-in-the-loop design means…",
      options: [
        "Humans approve or review critical agent actions before they execute",
        "A person retypes everything the AI writes",
        "Removing all automation",
        "Hiring more staff",
      ],
      answerIndex: 0,
    },
    {
      question: "Function calling lets a model…",
      options: [
        "Make phone calls",
        "Return structured requests that trigger your tools and code",
        "Train itself on new data",
        "Bypass API rate limits",
      ],
      answerIndex: 1,
    },
    {
      question: "Before deploying an automation that sends messages to customers, you should…",
      options: [
        "Test with real customers immediately",
        "Run it on test data, add error handling and set up monitoring/alerts",
        "Disable all logs for privacy",
        "Remove the off switch",
      ],
      answerIndex: 1,
    },
  ],
  "no-code-ai-apps": [
    {
      question: "The right scope for a no-code MVP is…",
      options: [
        "Every feature you can imagine",
        "The one core loop that proves the product's value",
        "A clone of a mature SaaS",
        "No features until the design is perfect",
      ],
      answerIndex: 1,
    },
    {
      question: "In Bubble, privacy rules exist to…",
      options: [
        "Control which users can see which data",
        "Make the app load faster",
        "Change the colour scheme",
        "Translate the app",
      ],
      answerIndex: 0,
    },
    {
      question: "To call OpenAI from a no-code tool you typically need…",
      options: [
        "A printed contract",
        "An API key sent securely in the request headers",
        "OpenAI's source code",
        "A custom GPU server",
      ],
      answerIndex: 1,
    },
    {
      question: "Usage limits in an AI SaaS protect you from…",
      options: [
        "Having too many customers",
        "Runaway API costs from heavy or abusive usage",
        "Search engines",
        "App store review",
      ],
      answerIndex: 1,
    },
    {
      question: "A custom-knowledge chatbot answers from…",
      options: [
        "Only its base model training",
        "The documents and content you train/ground it on",
        "Random web pages at answer time",
        "Your competitors' websites",
      ],
      answerIndex: 1,
    },
  ],
  "ai-marketing-ads": [
    {
      question: "Creative testing on Meta works best when you…",
      options: [
        "Change everything at once",
        "Test distinct angles/hooks systematically and scale the winners",
        "Run one ad forever",
        "Copy a competitor's ad exactly",
      ],
      answerIndex: 1,
    },
    {
      question: "Performance Max performs best when you feed it…",
      options: [
        "One image and no text",
        "Strong, varied creative assets and accurate conversion signals",
        "Only brand keywords",
        "Nothing — it's fully automatic",
      ],
      answerIndex: 1,
    },
    {
      question: "The metric that ultimately decides if ads are 'working' is…",
      options: [
        "Impressions",
        "Return relative to spend (ROAS/CPA against your unit economics)",
        "Number of ad variations",
        "Clicks alone",
      ],
      answerIndex: 1,
    },
    {
      question: "UGC-style ads outperform polished ads mostly because…",
      options: [
        "They cost more to make",
        "They read as native, trusted content rather than advertising",
        "Platforms boost them artificially",
        "They're always longer",
      ],
      answerIndex: 1,
    },
    {
      question: "Before scaling a winning ad set you should…",
      options: [
        "Delete all other campaigns",
        "Confirm the result is statistically meaningful and your funnel can absorb the volume",
        "Double the budget hourly",
        "Change the creative completely",
      ],
      answerIndex: 1,
    },
  ],
  "ai-business-operations": [
    {
      question: "The first step to automating your workweek is…",
      options: [
        "Buying every AI tool",
        "Auditing where your time actually goes and finding repetitive patterns",
        "Deleting your calendar",
        "Hiring an assistant",
      ],
      answerIndex: 1,
    },
    {
      question: "AI meeting assistants are most valuable when they…",
      options: [
        "Replace attending meetings entirely",
        "Produce summaries and action items that feed your task system",
        "Record without consent",
        "Transcribe but never summarise",
      ],
      answerIndex: 1,
    },
    {
      question: "When using AI for CV screening, you must…",
      options: [
        "Let it auto-reject without review",
        "Use structured rubrics, monitor for bias and keep humans in the decision",
        "Only screen by university name",
        "Hide the criteria from candidates",
      ],
      answerIndex: 1,
    },
    {
      question: "A good SOP includes…",
      options: [
        "Steps, owner, tools and how to handle exceptions",
        "Only a video with no text",
        "Just the job title",
        "Legal disclaimers only",
      ],
      answerIndex: 0,
    },
    {
      question: "AI-drafted financial commentary should always be…",
      options: [
        "Sent straight to the board",
        "Verified against the underlying numbers before sharing",
        "Rounded to the nearest million",
        "Written at high temperature",
      ],
      answerIndex: 1,
    },
  ],
  "ai-customer-support": [
    {
      question: "A support bot's success should be measured primarily by…",
      options: [
        "How many tickets it touches",
        "Resolution rate and customer satisfaction, not just deflection",
        "How long its answers are",
        "How rarely it escalates",
      ],
      answerIndex: 1,
    },
    {
      question: "Escalation design matters because…",
      options: [
        "Customers with complex or sensitive issues need a clean path to a human",
        "It increases ticket volume",
        "Bots get tired",
        "It's required by Google",
      ],
      answerIndex: 0,
    },
    {
      question: "Before launching a bot, your knowledge base should be…",
      options: [
        "Whatever's lying around",
        "Audited and rewritten to answer real top ticket topics clearly",
        "Deleted to keep answers short",
        "Written only in legal language",
      ],
      answerIndex: 1,
    },
    {
      question: "In a voice agent stack, STT, LLM and TTS refer to…",
      options: [
        "Billing tiers",
        "Speech-to-text, the reasoning model, and text-to-speech",
        "Three competing vendors",
        "Telephone network protocols",
      ],
      answerIndex: 1,
    },
    {
      question: "Voice-of-customer analysis with AI is most useful for…",
      options: [
        "Decorating slide decks",
        "Quantifying the themes and root causes driving tickets, then fixing them",
        "Replacing all surveys forever",
        "Generating marketing slogans",
      ],
      answerIndex: 1,
    },
  ],
  "ai-data-analysis": [
    {
      question: "Before analysing any dataset, you should…",
      options: [
        "Build charts immediately",
        "Clean it: handle duplicates, missing values and inconsistent formats",
        "Delete outliers without checking",
        "Convert everything to text",
      ],
      answerIndex: 1,
    },
    {
      question: "A JOIN in SQL is used to…",
      options: [
        "Combine rows from related tables via matching keys",
        "Delete tables",
        "Encrypt a column",
        "Speed up the database",
      ],
      answerIndex: 0,
    },
    {
      question: "When ChatGPT's data analysis produces a surprising result you should…",
      options: [
        "Publish it immediately",
        "Verify the logic and spot-check against the raw data before trusting it",
        "Assume the data is wrong",
        "Increase the temperature",
      ],
      answerIndex: 1,
    },
    {
      question: "A good executive dashboard starts from…",
      options: [
        "Every chart you can build",
        "The specific business questions it must answer",
        "The prettiest colour palette",
        "Whatever data loads fastest",
      ],
      answerIndex: 1,
    },
    {
      question: "An honest forecast always includes…",
      options: [
        "A single exact number",
        "Assumptions and a range/scenarios reflecting uncertainty",
        "Only the best case",
        "No historical baseline",
      ],
      answerIndex: 1,
    },
  ],
  "ai-audio-voice": [
    {
      question: "Writing a script 'for the ear' means…",
      options: [
        "Short sentences, natural rhythm and words that are easy to say aloud",
        "Long academic paragraphs",
        "Maximum jargon",
        "All capital letters",
      ],
      answerIndex: 0,
    },
    {
      question: "Before cloning anyone's voice you must…",
      options: [
        "Have their informed consent and documented permission",
        "Just credit them later",
        "Use only 5 seconds of audio",
        "Nothing — voices aren't protected",
      ],
      answerIndex: 0,
    },
    {
      question: "A music bed under a voiceover should be…",
      options: [
        "Louder than the voice",
        "Ducked and EQ'd so the voice stays clearly intelligible",
        "Removed in all cases",
        "In a different tempo every bar",
      ],
      answerIndex: 1,
    },
    {
      question: "AI dubbing quality checks should include…",
      options: [
        "Timing, names/terminology and review by a native speaker",
        "Only the file size",
        "Checking the thumbnail",
        "Nothing if the AI sounded confident",
      ],
      answerIndex: 0,
    },
    {
      question: "Using AI music commercially requires…",
      options: [
        "Checking the tool's licence terms for commercial use",
        "Nothing — all AI music is public domain",
        "A radio licence",
        "Registering with a record label",
      ],
      answerIndex: 0,
    },
  ],
};

export const PASS_MARK = 0.7;
