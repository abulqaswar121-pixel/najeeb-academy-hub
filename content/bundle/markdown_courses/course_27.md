# NDH Academy — Course 27

## Course 27: Build AI Agents
**Track:** AI Engineering | **Pricing:** NGN 50,000 / $69 USD
**Cover Image:** `cover_images/course_27_cover.jpg`

### 1. Course Overview & Target Audience
Autonomous AI agents represent the frontier of generative AI engineering. This course teaches developers, technical operators, and software engineers how to architect, configure, and tune autonomous multi-step AI agents: setting up system prompts, binding external tools and search APIs, managing conversational memory, implementing reasoning loops (ReAct/Plan-and-Solve), and fine-tuning agent behavior for deterministic production reliability.

**Who This Course Is For:**
- Software developers and engineers building autonomous agentic applications.
- AI engineers looking to master tool calling, ReAct reasoning loops, and prompt guardrails.
- Technical product managers designing agentic features and multi-step workflows.
- Learners wanting to build custom AI agents with Python, TypeScript, or modern agent frameworks.

**What You Will Produce:**
- A functioning autonomous AI Agent with custom tool calling and search capabilities.
- A System Prompt Configuration Matrix defining role, tools, memory, and output constraints.
- An Agent Evaluation & Tuning Test Suite benchmarking task completion across 10 complex scenarios.
- A Production Guardrails & Error-Handling Protocol preventing hallucination and recursion loops.

### 2. Prerequisites & Required Tools
**Prerequisites:** Familiarity with basic programming concepts (Python or JavaScript), API requests, and JSON.
**Required Tools & Platforms:**
- OpenAI API, Anthropic API, or local Ollama LLM endpoint.
- Python 3.10+ or Node.js runtime environment.
- Agent framework (LangChain, CrewAI, or raw OpenAI Assistant API).
- Tavily / Serper API for web search retrieval.
**Preparation Steps:** Create a development directory: `/agent-core/`, `/tools/`, `/prompts/`, `/test-harness/`, and `/logs/`. Set up your virtual environment and configure API keys in a `.env` file.

### 3. Video Access & Playback Modes
- **Full Course Video URL:** [https://www.youtube.com/watch?v=x7vP0kL9mQ4](https://www.youtube.com/watch?v=x7vP0kL9mQ4)
- **YouTube Video ID:** `x7vP0kL9mQ4`
- **Player Mode Support:** Continuous Full-Course Playback & Reference Lesson Jump Modes

### 4. Detailed Learning Objectives (Assessment Ready)
1. Factual / MCQ: Define the foundational operational concepts, industry terminology, and technical toolsets specific to Build AI Agents.
2. Factual / MCQ: Identify key performance indicators, formatting constraints, and standard architectural requirements in AI Engineering.
3. Applied / Short Answer: Demonstrate proficiency in configuring tools and executing hands-on workflows directly taught in the verified video.
4. Applied / Short Answer: Formulate structured prompt sequences and multi-step parameters to generate high-quality outputs for commercial use.
5. Applied / Short Answer: Execute pre-flight verification, troubleshooting, and error-handling steps to resolve common production bottlenecks.
6. Reasoning / Essay: Analyze the ethical considerations, commercial trade-offs, and quality-control standards governing human oversight of AI workflows in Build AI Agents.
7. Reasoning / Essay: Formulate an end-to-end implementation roadmap justifying strategic decisions for an enterprise or client project.

### 5. Structured Lesson Breakdown (4 Lessons)
#### Lesson 1: Agentic Architecture: LLMs, Tools, Planning & Memory Loops
- **Timestamp:** `00:00` - `00:34` (0s to 34s)
- **Summary & Notes:** Introduces the theoretical and practical foundation of autonomous AI agents. Contrasts traditional single-turn chatbots with multi-turn agentic systems. Deconstructs the 4 core components of an agent: (1) Cognitive Brain (LLM), (2) Perception/Input, (3) Tool Registry, and (4) Working Memory.
- **Practical Activity:** Draw an architecture diagram showing the cyclic flow between User Request -> Agent Reasoning -> Tool Invocation -> Observation -> Final Answer.
- **Knowledge Check / Reflection:** Why is tool calling capability the fundamental breakthrough that turned LLMs from passive text generators into active software agents?

#### Lesson 2: Core Configuration: System Prompts, Tool Bindings & API Connections
- **Timestamp:** `00:34` - `04:37` (34s to 277s)
- **Summary & Notes:** Detailed walkthrough of configuring an agent runtime. Teaches how to structure system prompts that define agent capabilities, format function signatures as JSON Schema definitions, pass tool definitions to the LLM API, and parse model tool-call requests.
- **Practical Activity:** Write the JSON Schema definition for 2 custom tools: (1) a Web Search tool, and (2) a Mathematical Calculation tool.
- **Knowledge Check / Reflection:** Why is strict JSON Schema typing essential for preventing runtime errors during agent tool execution?

#### Lesson 3: Building an End-to-End Autonomous Agent Workflow
- **Timestamp:** `04:37` - `10:32` (277s to 632s)
- **Summary & Notes:** Step-by-step implementation of an end-to-end working agent. Demonstrates the agent handling a complex multi-step request (e.g., researching a company, calculating financial ratios, and drafting an executive memo). Shows the execution trace, tool dispatch loop, and observation handling in real time.
- **Practical Activity:** Run your agent on a multi-step query that requires at least 3 sequential tool calls, logging each Thought-Action-Observation step.
- **Knowledge Check / Reflection:** How does the ReAct framework enable the model to recover when a tool call returns an error or empty result?

#### Lesson 4: Agent Fine-Tuning, Error Handling & Production Guardrails
- **Timestamp:** `10:32` - `13:25` (632s to 805s)
- **Summary & Notes:** Covers production hardening. Teaches how to prevent infinite recursion loops by setting max_iterations, implementing structured timeout handlers, designing fallback prompts, and evaluating agent accuracy across edge cases.
- **Practical Activity:** Inject intentional tool failures into your test suite and verify that the agent catches the error and attempts an alternative strategy.
- **Knowledge Check / Reflection:** What are the most critical safety guardrails required before deploying an autonomous AI agent in a corporate environment?

### 6. Written Learning Materials & Quality Assurance
**Actionable Verification Checklist:**
- [ ] Agent runtime initialized with valid API key.
- [ ] System prompt includes strict role, constraints, and formatting rules.
- [ ] At least 2 functional tools defined with JSON Schema and implemented in code.
- [ ] Message history maintains sequential User/Assistant/Tool message roles.
- [ ] Recursion guardrail (max 5 iterations) active.
- [ ] Error handling catches failed API calls gracefully.

**Common Pitfalls & Fixes:**
- **Mistake:** Writing vague tool descriptions in JSON schema
  - **Correction:** Describing a search tool simply as 'searches stuff'. Fix: Write detailed descriptions: 'Search Google for current news articles. Input must be a specific search query.'
- **Mistake:** Omitting the recursion limit
  - **Correction:** Allowing an agent to call tools in an infinite loop when confused. Fix: Always enforce `max_iterations = 5`.
- **Mistake:** Failing to feed tool errors back to the model
  - **Correction:** Crashing the Python script when an API fails. Fix: Catch the exception and return `Tool Error: [details]` to let the agent self-correct.
- **Mistake:** Letting conversation history grow indefinitely
  - **Correction:** Exceeding token limits after 10 turns. Fix: Prune older messages or summarize history.

### 7. Capstone Portfolio Project & Grading Rubric
**Project Title:** Autonomous Financial & Market Research AI Agent

**Scenario:**
A financial consulting firm needs an Autonomous Research Agent that can take a company ticker or industry name, autonomously search financial news, fetch SEC filing data, calculate revenue growth rates using a python math tool, and synthesize a structured 2-page investment memorandum with zero human intervention.

**Required Deliverables:**
1. Complete Agent Source Code Repository (`agent.py`, `tools.py`, `config.py`, `requirements.txt`).
2. Custom Tool Suite (Web Search Tool, Stock Data Tool, Financial Calculator Tool).
3. System Prompt & Persona Architecture Document.
4. Agent Execution Trace Log showing full Thought-Action-Observation loops across 3 live queries.
5. Agent Evaluation & Benchmark Report (testing 10 edge-case scenarios with accuracy scores).
6. Production Guardrails & Deployment SOP.

**Submission Instructions:** Submit a single PDF Technical Architecture & Test Report containing all code listings, execution logs, prompt architecture, and benchmark evaluations.
**File Requirements:** Single comprehensive PDF report (`.pdf`) and GitHub repository / Python source files (`.py`).
**Completion Standard:** Passing submissions must deliver functional, bug-free agent source code with at least 3 custom tools, verified execution logs, and strict production guardrails.

**Grading Rubric Matrix:**

| Criterion | Weight | Required Standard & Observable Evidence |
| :--- | :--- | :--- |
| Agentic Architecture & Code Quality | 30% | Code is modular, cleanly documented, and implements a robust ReAct execution and tool-dispatch loop. |
| Tool Design & Schema Precision | 25% | Tools are defined with rigorous JSON schemas, clear documentation, and robust error handling. |
| Reasoning Quality & Self-Correction | 20% | Agent demonstrates high reasoning fidelity, handles ambiguous queries, and self-corrects on tool failures. |
| Guardrails & Production Hardening | 15% | Includes recursion limits, timeout handlers, token pruning, and credential security best practices. |
| Documentation & Benchmark Report | 10% | Architecture report meets senior software engineering standards with complete execution logs. |


---
