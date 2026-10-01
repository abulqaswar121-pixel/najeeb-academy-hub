# NDH Academy — Course 29

## Course 29: Prompt Engineering
**Track:** AI Engineering | **Pricing:** NGN 50,000 / $69 USD
**Cover Image:** `cover_images/course_29_cover.jpg`

### 1. Course Overview & Target Audience
Prompt engineering in 2026 has evolved from casual trick prompts into rigorous Context Engineering and Cognitive Architecture design. This course teaches how large language models actually process tokens and attention mechanisms, how to eliminate AI hallucination, how to apply the 4 Pillars Prompt Framework (Persona, Context, Task, Constraints), how to direct Claude 3.5 Sonnet for advanced analytical logic, and how to build production-grade prompt harnesses.

**Who This Course Is For:**
- Software developers, AI engineers, and product builders designing LLM-powered applications.
- Data analysts, researchers, and knowledge workers wanting deterministic, hallucination-free AI outputs.
- Content strategists and prompt engineers building enterprise prompt libraries.
- Learners wanting a deep, fundamental understanding of how modern transformer models reason.

**What You Will Produce:**
- A Production Prompt Engineering Framework & System Prompt Library (10 production templates).
- An Advanced Reasoning & Chain-of-Thought (CoT) Prompt Architecture for Claude/ChatGPT.
- A Structured JSON/XML Schema Enforcement Harness with strict validation rules.
- An AI Hallucination & Prompt Testing Benchmark Suite.

### 2. Prerequisites & Required Tools
**Prerequisites:** Basic familiarity with large language models (ChatGPT, Claude) and digital text formats.
**Required Tools & Platforms:**
- Claude 3.5 Sonnet (Anthropic Console / Workbench or Claude.ai).
- ChatGPT Plus / OpenAI Playground (GPT-4o).
- VS Code or text editor for managing prompt template files.
- JSON/XML validator for schema checking.
**Preparation Steps:** Create a workspace: `/prompt-frameworks/`, `/system-prompts/`, `/cot-reasoning/`, `/schema-templates/`, and `/benchmarks/`. Set up accounts on Anthropic Workbench and OpenAI Playground.

### 3. Video Access & Playback Modes
- **Full Course Video URL:** [https://www.youtube.com/watch?v=k7vL0mP9xQ1](https://www.youtube.com/watch?v=k7vL0mP9xQ1)
- **YouTube Video ID:** `k7vL0mP9xQ1`
- **Player Mode Support:** Continuous Full-Course Playback & Reference Lesson Jump Modes

### 4. Detailed Learning Objectives (Assessment Ready)
1. Master modern LLM token prediction mechanics, attention mechanisms, and the crucial distinction between prompt wording and context engineering.
2. Identify and systematically eliminate the top causes of AI hallucination, ambiguity, and drift in production prompts.
3. Apply the 4 Pillars Prompt Framework: Persona, Context, Detailed Task, and Strict Constraints (PCTC).
4. Implement advanced reasoning techniques: Few-Shot In-Context Learning, Chain-of-Thought (CoT), Step-Back Prompting, and Output Schema Enforcement (JSON/XML).
5. Build complex, multi-step production prompt architectures for research, code generation, and marketing automation.
6. Assemble a completely free AI productivity stack, testing harness, and systematic prompt evaluation suite.

### 5. Structured Lesson Breakdown (6 Lessons)
#### Lesson 1: Next-Generation Context Engineering & Modern LLM Mechanics
- **Timestamp:** `00:00` - `01:45` (0s to 105s)
- **Summary & Notes:** Deconstructs how modern transformer models operate: next-token probability distribution, attention mechanisms, and context window dynamics. Dispels the myth that AI 'thinks like a human' and establishes why context architecture determines output quality far more than clever phrasing.
- **Practical Activity:** Map out the context architecture for a customer service AI, detailing system instructions, reference documents, and user state.
- **Knowledge Check / Reflection:** Why does understanding token probability prediction prevent engineers from expecting human common sense from an LLM?

#### Lesson 2: Deconstructing Common Prompt Failures & Hallucination Vectors
- **Timestamp:** `01:45` - `05:12` (105s to 312s)
- **Summary & Notes:** Analyzes why 90% of people use AI incorrectly. Explores the 5 major prompt failure modes: ambiguous task framing, missing context, conflicting constraints, lack of output structure, and leading questions that trigger hallucinations.
- **Practical Activity:** Take 3 failed, ambiguous prompts from your past work and diagnose their specific failure mechanisms.
- **Knowledge Check / Reflection:** How does an LLM's desire to please the user cause it to invent plausible-sounding false information when under-constrained?

#### Lesson 3: The 4 Pillars of a Production-Grade Prompt (Persona & Context)
- **Timestamp:** `05:12` - `12:30` (312s to 750s)
- **Summary & Notes:** Masterclass on the PCTC Framework: (1) Defining an authoritative Persona, (2) Providing rich, unambiguous Context and source material, (3) Specifying granular Task steps, and (4) Enforcing negative Constraints (what NOT to do).
- **Practical Activity:** Draft a production prompt using the complete PCTC framework for an enterprise legal document analysis task.
- **Knowledge Check / Reflection:** Why are negative constraints (e.g., 'Never use passive voice; do not mention competitor names') more effective at guiding models than positive instructions alone?

#### Lesson 4: Advanced Reasoning & Logic Architectures with Claude
- **Timestamp:** `12:30` - `18:15` (750s to 1095s)
- **Summary & Notes:** Deep dive into advanced cognitive prompting techniques with Claude 3.5 Sonnet. Covers Chain-of-Thought (CoT) reasoning tags (`<thinking>...</thinking>`), Step-Back prompting, multi-perspective evaluation, and enforcing XML/JSON schema compliance.
- **Practical Activity:** Construct a Chain-of-Thought prompt using XML tags that forces the model to evaluate financial balance sheets before outputting a credit score recommendation.
- **Knowledge Check / Reflection:** How does forcing the model to write out its reasoning inside `<thinking>` tags dramatically reduce mathematical and logical errors?

#### Lesson 5: Hands-on Project Build: End-to-End System Prompt Engineering
- **Timestamp:** `18:15` - `28:40` (1095s to 1720s)
- **Summary & Notes:** Live build of a complete enterprise prompt system from scratch. Demonstrates creating few-shot demonstration blocks, dynamic variable slots, fallback handling, and schema validation for a complex multi-turn business application.
- **Practical Activity:** Build and test a 3-shot prompt template that converts messy customer support emails into structured JSON tickets with sentiment, priority, and category.
- **Knowledge Check / Reflection:** Why does providing 3 precise few-shot examples improve output consistency more than 5 paragraphs of descriptive rules?

#### Lesson 6: Free AI Productivity Stack, Testing Harnesses & Evaluation Frameworks
- **Timestamp:** `28:40` - `34:58` (1720s to 2098s)
- **Summary & Notes:** Covers prompt evaluation and testing workflows. Teaches how to build a prompt benchmarking spreadsheet, evaluate prompt variations across 20 test inputs, score outputs on accuracy and consistency, and maintain a version-controlled prompt repository.
- **Practical Activity:** Set up a Prompt Benchmark Evaluation Sheet and score 2 prompt variations across 10 diverse test cases.
- **Knowledge Check / Reflection:** Why is systematic benchmarking essential before deploying prompt changes into production software?

### 6. Written Learning Materials & Quality Assurance
**Actionable Verification Checklist:**
- [ ] PCTC framework applied across all prompt templates.
- [ ] Persona, context, task, and constraints clearly demarcated.
- [ ] Chain-of-Thought thinking tags (`<thinking>`) implemented for complex logic.
- [ ] At least 2 few-shot input/output examples included.
- [ ] Output schema defined in valid JSON or XML syntax.
- [ ] Prompt benchmarked against 10 diverse test cases with 0 hallucinations.

**Common Pitfalls & Fixes:**
- **Mistake:** Writing conversational, chatty prompts for production systems
  - **Correction:** Saying 'Hey could you please help me write...'. Fix: Use structured, declarative command language with clear headings.
- **Mistake:** Failing to specify output formatting schemas
  - **Correction:** Leaving output format open, causing the model to return markdown one time and paragraphs the next. Fix: Demand exact JSON/XML schemas.
- **Mistake:** Omitting negative constraints
  - **Correction:** Allowing the model to assume unstated facts. Fix: Add: 'If the answer is not explicitly stated in the context, output ONLY: Information not found.'
- **Mistake:** Changing multiple prompt variables simultaneously during testing
  - **Correction:** Modifying persona, instructions, and temperature all at once. Fix: Test one variable change at a time to isolate performance drivers.

### 7. Capstone Portfolio Project & Grading Rubric
**Project Title:** Enterprise System Prompt Architecture & Evaluation Suite

**Scenario:**
An enterprise B2B SaaS company requires a standardized, production-grade System Prompt Architecture for its AI Analytics Assistant. The assistant must process unstructured customer feedback data, extract actionable bugs and feature requests, calculate sentiment scores, and output strictly formatted, machine-readable JSON tickets with zero hallucinations. You are hired as Lead Prompt Engineer to design, test, benchmark, and document the complete system.

**Required Deliverables:**
1. Production System Prompt Architecture Dossier (complete PCTC structure with XML tags and few-shot examples).
2. Structured Output Schema Specification (strict JSON Schema with data validation rules).
3. Advanced Chain-of-Thought Reasoning Harness for complex sentiment and priority calculations.
4. Comprehensive Prompt Benchmark Evaluation Suite (tested across 20 diverse edge-case customer inputs with scoring logs).
5. Hallucination Prevention & Guardrail Protocol Document.
6. Prompt Versioning & Maintenance Standard Operating Procedure (SOP).

**Submission Instructions:** Submit a single PDF Technical Architecture & Benchmark Report containing full prompt source texts, JSON schemas, evaluation spreadsheets, and test execution logs.
**File Requirements:** Single comprehensive PDF report (`.pdf`), prompt text archives (`.txt`/`.md`), and benchmark data spreadsheets (`.xlsx`/`.csv`).
**Completion Standard:** Passing submissions must deliver an exhaustive, battle-tested System Prompt Architecture that produces 100% valid JSON across 20 test inputs with zero hallucinated data.

**Grading Rubric Matrix:**

| Criterion | Weight | Required Standard & Observable Evidence |
| :--- | :--- | :--- |
| Prompt Architecture & Structural Rigor | 30% | Prompts exhibit mastery of PCTC framework, XML modularity, and deterministic instruction framing. |
| Schema Compliance & Machine Readability | 25% | Output is 100% valid JSON adhering strictly to the schema specification with zero formatting drift. |
| Reasoning Quality & Edge-Case Handling | 20% | Chain-of-thought logic correctly resolves ambiguous, conflicting, and edge-case inputs without hallucination. |
| Benchmark Rigor & Evaluation Methodology | 15% | Benchmark suite tests 20 realistic edge cases with objective scoring and documented version comparisons. |
| Engineering Documentation Polish | 10% | Dossier meets senior AI engineer standards with crystal-clear implementation guidelines. |


---
