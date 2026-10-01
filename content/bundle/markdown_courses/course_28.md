# NDH Academy — Course 28

## Course 28: No-Code AI Apps
**Track:** AI Engineering | **Pricing:** NGN 50,000 / $69 USD
**Cover Image:** `cover_images/course_28_cover.jpg`

### 1. Course Overview & Target Audience
Building functional, commercial AI software no longer requires writing custom backend code from scratch. This course teaches how to build a production-ready, database-backed AI copywriting web application using Bubble.io and the OpenAI API: designing responsive user interfaces, configuring the API Connector plugin, engineering dynamic prompt templates, parsing JSON API payloads, splitting responses into dynamic lists, and saving generated assets to user database records.

**Who This Course Is For:**
- No-code developers, entrepreneurs, and indie hackers wanting to launch AI SaaS products rapidly.
- Product managers looking to prototype and validate commercial AI software ideas without engineering teams.
- Digital agencies and freelancers wanting to build custom internal AI tools for clients.
- Beginners wanting a hands-on, practical introduction to full-stack no-code application architecture.

**What You Will Produce:**
- A fully functioning, live AI Copywriting Web Application deployed on Bubble.io.
- A configured Bubble API Connector setup connected to OpenAI API with dynamic endpoints.
- A relational database architecture storing Users, Generations, Projects, and Favorite Outputs.
- A complete Product Requirements Document (PRD) and API Integration Architecture Guide.

### 2. Prerequisites & Required Tools
**Prerequisites:** Basic understanding of web application concepts (frontend UI, backend workflows, databases, APIs).
**Required Tools & Platforms:**
- Bubble.io account (Free or Starter plan).
- OpenAI Developer account with active API credit balance.
- Figma for initial UI layout wireframing.
- Postman or browser developer tools for API inspection.
**Preparation Steps:** Create a project workspace: `/bubble-wireframes/`, `/api-prompts/`, `/database-schema/`, `/json-samples/`, and `/app-documentation/`. Create a new blank application in Bubble before starting.

### 3. Video Access & Playback Modes
- **Full Course Video URL:** [https://www.youtube.com/watch?v=v9kP0mL7wQ2](https://www.youtube.com/watch?v=v9kP0mL7wQ2)
- **YouTube Video ID:** `v9kP0mL7wQ2`
- **Player Mode Support:** Continuous Full-Course Playback & Reference Lesson Jump Modes

### 4. Detailed Learning Objectives (Assessment Ready)
1. Design and build a fully functional, commercial no-code AI web application from scratch using Bubble.io and OpenAI APIs.
2. Construct a modern, responsive user interface with dynamic input forms, loading states, and result viewing canvases in Bubble.
3. Configure the Bubble API Connector plugin with secure headers, Bearer token authentication, and custom POST request bodies.
4. Engineer dynamic API prompts that interpolate user inputs into structured system messages and user prompts.
5. Handle, parse, and render JSON response payloads from AI endpoints in real time.
6. Implement text manipulation logic (regex/regex splits, string formatting) to present generated content as selectable lists and cards.
7. Architect a relational database in Bubble to save generated copy against user accounts, implement user authentication, and enable CSV/PDF export.

### 5. Structured Lesson Breakdown (8 Lessons)
#### Lesson 1: Application Architecture & User Flow Planning
- **Timestamp:** `00:00` - `02:46` (0s to 166s)
- **Summary & Notes:** Introduces the project vision: building a commercial AI Copywriter web application. Outlines the end-to-end architecture: User Input Form -> Bubble Workflow -> OpenAI API Request -> JSON Response Parsing -> UI Display -> Database Save. Sets up the application structure.
- **Practical Activity:** Draw a user flow diagram mapping the exact steps from user login to input submission, API loading, and copying output to clipboard.
- **Knowledge Check / Reflection:** Why is mapping database schema and user flows prior to building UI essential in no-code app development?

#### Lesson 2: Designing Responsive Front-End UI in Bubble
- **Timestamp:** `02:46` - `12:02` (166s to 722s)
- **Summary & Notes:** Step-by-step UI build using Bubble's modern Flexbox layout engine. Covers building a responsive navigation bar, multi-field input forms (Product Name, Audience, Tone, Copy Type), loading spinners, and styled output cards.
- **Practical Activity:** Build a responsive 2-column layout in Bubble: Left column = Input Form; Right column = Generated Copy Display Area.
- **Knowledge Check / Reflection:** How does clear visual feedback (loading spinners, disabled buttons) prevent users from double-clicking during slow API calls?

#### Lesson 3: OpenAI API Fundamentals: Endpoints, Models & Authentication
- **Timestamp:** `12:02` - `14:40` (722s to 880s)
- **Summary & Notes:** Explores the OpenAI API documentation. Covers endpoints (`/v1/chat/completions`), model selection (GPT-4o / GPT-4o-mini), authentication via Bearer tokens, token limits, and calculating per-generation API costs.
- **Practical Activity:** Obtain an OpenAI API secret key, configure rate limits, and calculate the estimated API cost for 1,000 copy generations.
- **Knowledge Check / Reflection:** Why is model selection (e.g., GPT-4o-mini vs GPT-4o) a critical business tradeoff between speed, quality, and profit margins?

#### Lesson 4: Dynamic Prompt Engineering & Parameter Tuning
- **Timestamp:** `14:40` - `19:50` (880s to 1190s)
- **Summary & Notes:** Deep dive into constructing dynamic API prompts. Demonstrates how to structure system messages and insert user variables (`<product_name>`, `<target_audience>`, `<tone_of_voice>`). Covers temperature tuning (0.7 for creativity) and presence penalties.
- **Practical Activity:** Write a multi-variable prompt template that takes 4 user inputs and guarantees outputting exactly 5 formatted headline options.
- **Knowledge Check / Reflection:** How does adding delimiter formatting (e.g., '1. --- 2. ---') make parsing multi-option AI responses trivial in no-code apps?

#### Lesson 5: Configuring the Bubble API Connector & Handling JSON Payloads
- **Timestamp:** `19:50` - `26:47` (1190s to 1607s)
- **Summary & Notes:** Masterclass on Bubble's API Connector. Demonstrates adding shared headers (`Content-Type: application/json`, `Authorization: Bearer [KEY]`), creating a POST API call, entering sample parameter values, and initializing the call to establish data types in Bubble.
- **Practical Activity:** Configure and successfully initialize the OpenAI Chat Completion API call in Bubble's API Connector plugin.
- **Knowledge Check / Reflection:** Why must the 'Private' checkbox be checked on the API Key parameter in Bubble to prevent exposing credentials to the browser?

#### Lesson 6: Rendering Dynamic AI Responses in Real Time
- **Timestamp:** `26:47` - `32:09` (1607s to 1929s)
- **Summary & Notes:** Wired frontend workflows. Teaches how to create a button workflow that calls the API, stores the response in a Custom State, hides the loading state, and animates the output container into view with rich text formatting.
- **Practical Activity:** Wire the 'Generate Copy' button workflow to call the initialized API and display the returned text in a dynamic text element.
- **Knowledge Check / Reflection:** Why is using Custom States faster and more cost-effective than writing every temporary draft immediately to the database?

#### Lesson 7: Text Parsing, Data Extraction & List Formatting
- **Timestamp:** `32:09` - `38:40` (1929s to 2320s)
- **Summary & Notes:** Covers string manipulation and repeating groups. Demonstrates using Bubble's `:split by` operator and regex to break a single multi-paragraph AI response into individual, selectable copy cards in a Repeating Group.
- **Practical Activity:** Implement a split-by formula that takes a 5-item AI response and displays each item in a distinct repeating group card with a 1-click 'Copy' button.
- **Knowledge Check / Reflection:** How does breaking bulk text into individual modular cards elevate the perceived polish and UX of an AI application?

#### Lesson 8: Relational Database Storage, User Workspaces & Export Capabilities
- **Timestamp:** `38:40` - `43:12` (2320s to 2592s)
- **Summary & Notes:** Final full-stack integration. Covers creating a relational database table (`CopyItem`: Text, Tone, Prompt, Created Date, User), creating 'Save to Favorites' workflows, building a saved projects library, and implementing 1-click clipboard copying.
- **Practical Activity:** Build a 'Save to Project' database action that stores selected copy variations against the logged-in user's account.
- **Knowledge Check / Reflection:** What are the essential database security privacy rules (Privacy Rules in Bubble) required to prevent users from seeing other users' data?

### 6. Written Learning Materials & Quality Assurance
**Actionable Verification Checklist:**
- [ ] Bubble responsive UI built with modern Flexbox container layout.
- [ ] API Connector configured with OpenAI API headers and initialized.
- [ ] Dynamic prompt parameters mapped to input elements.
- [ ] Loading state custom state active during API calls.
- [ ] Response split into individual cards in a Repeating Group.
- [ ] Database table created and 'Save to Project' workflow verified.
- [ ] Bubble Privacy Rules configured to protect user data.

**Common Pitfalls & Fixes:**
- **Mistake:** Forgetting to uncheck 'Private' on dynamic prompt parameters
  - **Correction:** Preventing Bubble from dynamically injecting form inputs into the API body. Fix: Leave prompt parameter un-checked so it can be dynamically populated in workflows.
- **Mistake:** Hardcoding API keys on public client workflows
  - **Correction:** Exposing API keys in browser network tab. Fix: Always use backend API workflows or the server-side API Connector.
- **Mistake:** Failing to handle API errors (e.g. rate limits or insufficient credit)
  - **Correction:** App freezing indefinitely on error. Fix: Add conditional workflow branches checking for empty API responses.
- **Mistake:** Not testing responsive layout on mobile screens
  - **Correction:** Inputs and text overlapping on smaller displays. Fix: Set minimum and maximum container widths and wrap rows.

### 7. Capstone Portfolio Project & Grading Rubric
**Project Title:** Commercial No-Code AI Web Application & Launch Suite

**Scenario:**
You are launching an AI Micro-SaaS called 'CopyCraft AI'—a specialized copywriting assistant for e-commerce Shopify merchants. The app allows users to input product features, select target customer demographics, choose emotional copywriting frameworks (AIDA, PAS, BAB), generate 5 high-converting product descriptions, edit/save variations to their dashboard, and export to CSV.

**Required Deliverables:**
1. Live, Fully Functioning Bubble.io Web Application (accessible via live URL).
2. Complete Product Requirements Document (PRD) detailing user flows, feature specifications, and monetization model.
3. Bubble API Connector Architecture Document (displaying exact headers, JSON bodies, and dynamic parameters).
4. Relational Database Schema Diagram (Users, Products, Generations, SavedCopy).
5. Prompt Engineering Dossier (system instructions and framework formulas used across AIDA/PAS/BAB).
6. Application Usability & Security QA Report (verifying privacy rules and mobile responsiveness).

**Submission Instructions:** Submit a single PDF Technical Architecture & PRD Document containing screenshots of all Bubble workflows, API configurations, database schemas, and live application URLs.
**File Requirements:** Single comprehensive PDF document (`.pdf`) and live Bubble application link.
**Completion Standard:** Passing submissions must deliver a working live Bubble application that reliably generates AI copy via API, renders selectable cards, and stores items in a secure database.

**Grading Rubric Matrix:**

| Criterion | Weight | Required Standard & Observable Evidence |
| :--- | :--- | :--- |
| Application Functionality & Live Execution | 30% | Live application executes flawlessly, calls OpenAI API dynamically, renders parsed output, and saves to database. |
| Frontend UI/UX Design & Responsiveness | 25% | Interface is modern, intuitive, responsive across mobile/desktop, with polished loading states and error handling. |
| API Architecture & Prompt Engineering | 20% | API Connector is configured securely with server-side authentication and robust dynamic multi-variable prompts. |
| Database Design & Data Privacy Rules | 15% | Relational database is properly structured with strict Bubble Privacy Rules enforcing multi-tenant data isolation. |
| PRD & Technical Documentation Polish | 10% | Product documentation meets professional startup CTO and product manager standards. |


---
