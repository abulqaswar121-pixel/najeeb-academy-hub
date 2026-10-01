# NDH Academy — Course 25

## Course 25: AI Workflow Automation
**Track:** AI Engineering | **Pricing:** NGN 50,000 / $69 USD
**Cover Image:** `cover_images/course_25_cover.jpg`

### 1. Course Overview & Target Audience
Workflow automation has transitioned from rigid linear triggers to autonomous, self-directing AI agent pipelines. This course teaches how to build, deploy, and self-host autonomous AI workflows in n8n: connecting large language model brains, equipping agents with conversational memory and tools, scheduling automated cron executions, integrating Gmail and Google Sheets, eliminating duplicates with knowledge bases, and hardening production automations.

**Who This Course Is For:**
- Automation specialists, developers, and agency builders wanting to build autonomous agentic workflows.
- Operations managers and business owners seeking to automate repetitive data synthesis and customer communications.
- No-code / low-code developers expanding from Zapier/Make into powerful, self-hosted n8n systems.
- Learners wanting to master agentic tool calling, memory management, and webhook architectures.

**What You Will Produce:**
- A functioning autonomous AI Agent Workflow in n8n with tool invocation and memory nodes.
- An automated Daily Executive Briefing pipeline integrated with Gmail and Google Sheets.
- A Deduplication & Knowledge Base architecture preventing repetitive agent executions.
- A Production Deployment & Self-Hosting Configuration Guide.

### 2. Prerequisites & Required Tools
**Prerequisites:** Basic understanding of APIs, JSON data structures, and webhook concepts.
**Required Tools & Platforms:**
- n8n (n8n Cloud, Docker, or self-hosted server).
- OpenAI API key or Anthropic API key.
- Google Workspace account (Gmail & Google Sheets API credentials).
- Postman or curl for webhook testing.
**Preparation Steps:** Create a project workspace: `/n8n-workflows/`, `/system-prompts/`, `/api-credentials/`, `/test-payloads/`, and `/production-docs/`. Set up an active n8n instance and configure API credentials before starting.

### 3. Video Access & Playback Modes
- **Full Course Video URL:** [https://www.youtube.com/watch?v=r7vP9kL0mQ1](https://www.youtube.com/watch?v=r7vP9kL0mQ1)
- **YouTube Video ID:** `r7vP9kL0mQ1`
- **Player Mode Support:** Continuous Full-Course Playback & Reference Lesson Jump Modes

### 4. Detailed Learning Objectives (Assessment Ready)
1. Understand the core principles of node-based workflow automation and how to architect autonomous AI agents using n8n.
2. Connect large language model APIs (OpenAI, Anthropic, local models) to n8n AI Agent nodes to serve as the cognitive reasoning engine.
3. Equip AI agents with conversational memory buffers, system instructions, and dynamic external tool nodes (web scrapers, APIs, database connectors).
4. Configure event-driven webhooks, scheduled cron triggers, and conditional routing logic for hands-free workflow execution.
5. Integrate Gmail, Google Sheets, and Slack to automate executive daily intelligence briefings, lead scoring, and data logging.
6. Implement knowledge base lookups and database vector checks to eliminate duplicate actions and prevent hallucinations.
7. Deploy, test, error-handle, and self-host production-grade n8n automation instances with full data sovereignty and cost control.

### 5. Structured Lesson Breakdown (8 Lessons)
#### Lesson 1: Workflow Automation Fundamentals & n8n Architecture
- **Timestamp:** `00:00` - `01:40` (0s to 100s)
- **Summary & Notes:** Introduces the n8n canvas, node ecosystem, and execution lifecycle. Compares traditional deterministic automation (if-this-then-that) with probabilistic agentic automation where the AI model decides the execution path dynamically based on context.
- **Practical Activity:** Create a new blank workflow in n8n, add a manual trigger, and test sending a simple JSON payload across two nodes.
- **Knowledge Check / Reflection:** Why is agentic workflow automation vastly more flexible than static deterministic Zapier workflows?

#### Lesson 2: Building Your First AI Agent Node & LLM Model Connection
- **Timestamp:** `01:40` - `04:11` (100s to 251s)
- **Summary & Notes:** Step-by-step connection of the AI Agent node. Demonstrates configuring OpenAI / Anthropic chat model credentials, selecting model versions (GPT-4o / Claude 3.5 Sonnet), setting temperature parameters, and defining system instructions.
- **Practical Activity:** Connect an OpenAI Chat Model node to an AI Agent node in n8n and execute a basic query to verify API handshakes.
- **Knowledge Check / Reflection:** How does temperature tuning (e.g., 0.2 vs 0.7) impact deterministic reliability in business workflow automations?

#### Lesson 3: Equipping Agents with System Prompts, Memory & External Tools
- **Timestamp:** `04:11` - `06:22` (251s to 382s)
- **Summary & Notes:** Deep dive into agent sub-nodes. Covers attaching Window Buffer Memory for state retention, attaching Calculator and HTTP Request tool nodes, and engineering the agent system prompt to enforce strict output schemas and tool invocation rules.
- **Practical Activity:** Attach a Window Buffer Memory node and a custom tool node to your AI agent, testing multi-turn conversation memory.
- **Knowledge Check / Reflection:** Why must an agent's memory window be capped to prevent token exhaustion and unexpected API cost spikes?

#### Lesson 4: Configuring Autonomous Triggers & Scheduled Cron Automation
- **Timestamp:** `06:22` - `07:51` (382s to 471s)
- **Summary & Notes:** Teaches how to automate execution without human intervention. Covers setting up Cron Triggers for scheduled morning execution, configuring Webhook Triggers for real-time external events, and managing execution error branches.
- **Practical Activity:** Configure a Cron Trigger node set to execute every weekday at 08:00 AM UTC and verify scheduled firing.
- **Knowledge Check / Reflection:** What are the essential error-notification safeguards required when running fully autonomous scheduled cron workflows?

#### Lesson 5: Prompt Engineering for Deterministic Tool Execution & Logic
- **Timestamp:** `07:51` - `09:49` (471s to 589s)
- **Summary & Notes:** Focuses on prompt hardening. Demonstrates how to write system instructions that force the AI agent to follow exact execution protocols, handle missing data gracefully, format markdown tables, and avoid looping errors.
- **Practical Activity:** Engineer a 5-step system prompt that forces the agent to search for data, format it into Markdown, and return a strict JSON payload.
- **Knowledge Check / Reflection:** How do negative prompt constraints prevent AI agents from calling external tools in an infinite loop?

#### Lesson 6: Integrating Gmail for Automated Delivery & Markdown Formatting
- **Timestamp:** `09:49` - `13:13` (589s to 793s)
- **Summary & Notes:** Walks through integrating the Gmail node. Covers OAuth2 authentication, converting agent Markdown output into rich HTML email bodies, setting dynamic subject lines, and routing messages to specific stakeholder distribution lists.
- **Practical Activity:** Connect the Gmail node to your AI agent output and verify that a formatted HTML morning briefing is delivered to your inbox.
- **Knowledge Check / Reflection:** Why is converting Markdown to formatted HTML essential for executive-facing email automations?

#### Lesson 7: Google Sheets Data Logging & Deduplication via Knowledge Bases
- **Timestamp:** `13:13` - `18:16` (793s to 1096s)
- **Summary & Notes:** Covers persistent data storage and duplicate prevention. Demonstrates reading from and appending to Google Sheets, using Google Sheets as a historical log, and prompting the agent to compare incoming news/leads against the sheet to skip duplicates.
- **Practical Activity:** Build a Google Sheets logging step that records every processed item and checks for duplicate IDs before sending emails.
- **Knowledge Check / Reflection:** Why is historical deduplication the single most important reliability feature in automated briefing and scraping pipelines?

#### Lesson 8: Production Hardening, Template Deployment & Self-Hosting n8n
- **Timestamp:** `18:16` - `23:33` (1096s to 1413s)
- **Summary & Notes:** Covers production operations. Teaches error workflows (Error Trigger node), backing up workflows to GitHub, exporting workflow JSON templates, and setting up a self-hosted n8n instance on a Docker/VPS server for data sovereignty.
- **Practical Activity:** Export your complete workflow JSON, set up an Error Trigger notification branch, and document deployment steps.
- **Knowledge Check / Reflection:** What are the significant cost and data privacy advantages of self-hosting n8n compared to proprietary cloud automation tools?

### 6. Written Learning Materials & Quality Assurance
**Actionable Verification Checklist:**
- [ ] n8n instance running and API credentials connected.
- [ ] AI Agent configured with system prompt, chat model, and memory.
- [ ] Tools connected and tested with sample queries.
- [ ] Cron trigger scheduled and tested.
- [ ] Gmail HTML output verified in inbox.
- [ ] Google Sheets deduplication logic tested with repeated data.
- [ ] Error handling and notification workflow active.

**Common Pitfalls & Fixes:**
- **Mistake:** Connecting chat model directly to canvas instead of AI Agent sub-node
  - **Correction:** Placing the model node standalone. Fix: Always drag the model node into the designated 'Model' port of the AI Agent.
- **Mistake:** Omitting deduplication checks
  - **Correction:** Sending the same 5 news articles every morning. Fix: Implement Google Sheets lookup node before the final email dispatch.
- **Mistake:** Failing to handle API rate limits
  - **Correction:** Allowing rapid tool calls to hit 429 rate limits. Fix: Add retry-on-fail parameters to HTTP nodes.
- **Mistake:** Exposing raw API keys in workflow JSON
  - **Correction:** Hardcoding keys into headers. Fix: Always use n8n's encrypted Credentials manager.

### 7. Capstone Portfolio Project & Grading Rubric
**Project Title:** Autonomous Executive Intelligence Agent & Multi-Tool Workflow

**Scenario:**
A venture capital firm requires an automated Daily Market Intelligence Agent. Every morning at 7:00 AM, the agent must autonomously scrape 3 top tech news feeds, extract AI-related startup funding announcements, check a Google Sheet to eliminate duplicates, synthesize a structured Markdown executive memo, log the new entries to the database, and email a beautiful HTML briefing to the investment partners.

**Required Deliverables:**
1. Complete Exported n8n Workflow JSON file (`.json`) with all nodes, credentials placeholders, and routing logic.
2. Visual Workflow Architecture Diagram showing trigger, agent, tools, sheets, and email nodes.
3. Master AI Agent System Prompt & Tool Invocation Documentation.
4. Live Production Test Log demonstrating successful execution, deduplication, and email delivery.
5. Google Sheets Database Schema & Logging Archive Template.
6. Self-Hosting & Maintenance SOP Document (Docker deployment, environment variables, error monitoring).

**Submission Instructions:** Submit a single PDF Technical Architecture Dossier containing the exported JSON, workflow diagrams, prompt documentation, execution logs, and live email screenshots.
**File Requirements:** Single comprehensive PDF dossier (`.pdf`), workflow JSON file (`.json`), and sample data spreadsheets.
**Completion Standard:** Passing submissions must deliver a fully functioning, importable n8n workflow JSON that executes autonomously, logs to Google Sheets, eliminates duplicates, and sends formatted email briefings.

**Grading Rubric Matrix:**

| Criterion | Weight | Required Standard & Observable Evidence |
| :--- | :--- | :--- |
| Agentic Architecture & Node Design | 30% | Workflow correctly implements AI Agent nodes, chat model bindings, memory buffers, and tool calling. |
| Deduplication & Data Integrity | 25% | Google Sheets lookup and deduplication logic flawlessly prevents repetitive logging and duplicate email dispatches. |
| Output Formatting & Email Delivery | 20% | Email is rendered in clean, responsive HTML with structured tables, high-signal summaries, and direct source links. |
| Error Handling & Production Hardening | 15% | Includes robust error branches, retry parameters, and credential security best practices. |
| Documentation Polish & SOP Completeness | 10% | Architecture dossier meets enterprise engineering standards with clear deployment instructions. |


---
