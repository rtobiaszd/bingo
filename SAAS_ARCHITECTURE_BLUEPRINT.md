# Multi-Tenant Omnichannel Automation & Dynamic CRM Platform (NexusFlow)
## Production-Ready Architecture & UX Blueprint

---

### Executive Overview
NexusFlow is a modular-monolith, multi-tenant B2B SaaS platform designed to operate efficiently on a single modest virtual machine (e.g., 2 vCPU, 4GB RAM) using Node.js/TypeScript, PostgreSQL (Prisma ORM), Redis (BullMQ for async workflows/queues), and Next.js (App Router, Tailwind CSS, Lucide Icons).

---

## 1. Full UX Structure & Navigation Design

### 1.1 Navigation & Global Shell
- **Top Bar (Global Header)**:
  - Tenant/Company Switcher (e.g., "Acme Corp ▾" with sub-account switching).
  - Global Search (`Cmd+K` palette: deals, contacts, conversations, workflow runs).
  - Quick Status / Webhook Health indicator (Green ping dot).
  - Notification Bell (deal SLA breaches, workflow errors, urgent inbox mentions).
  - User Profile dropdown (Role badge: `ADMIN` | `MANAGER` | `AGENT`, theme toggle, API keys, logout).
- **Sidebar (Collapsible 64px / 260px)**:
  - 📊 **Dashboard** (`/dashboard`)
  - 📥 **Unified Inbox** (`/inbox`) — badge with unassigned/open count
  - 📋 **Pipelines & CRM** (`/pipelines`) — Kanban & table view of deals
  - 👥 **Contacts & Companies** (`/contacts`)
  - ⚡ **Workflows (n8n style)** (`/workflows`) — Visual graph builder & execution history
  - 🤖 **Chatbot Studio** (`/chatbots`) — Menu flows, LLM prompts & hybrid routing
  - 📅 **Calendar & Appointments** (`/calendar`) — Booking slots & sync
  - 📡 **Event Logs & Webhooks** (`/events`) — Ingestion inspector & replay
  - 🔌 **Integrations Hub** (`/integrations`) — WhatsApp, Telegram, Email, Jira, GitHub
  - ⚙️ **Settings** (`/settings`) — Organization, Team & RBAC, Billing, Custom Fields

---

### 1.2 Screen-by-Screen Layout Specifications

#### Screen 1: Dashboard (`/dashboard`)
- **Metric Cards (Row 1)**:
  - Active Conversations (live across WhatsApp, Telegram, Email).
  - Open Pipeline Value (total deal value in active stages).
  - Automation Success Rate (workflow executions: success vs failed, 24h).
  - Appointments Booked (today & upcoming 7 days).
- **Operational View (Row 2 - 2 Columns)**:
  - *Left (65%)*: Real-time Activity Stream (incoming messages, deal stage transitions, webhook events, chatbot handoffs to human agents).
  - *Right (35%)*: SLA & Escalation Radar (deals stuck > 48h in stages, unanswered inquiries > 15m, failed workflow retries).

#### Screen 2: Unified Omnichannel Inbox (`/inbox`)
- **3-Pane Split Layout**:
  - *Pane 1 (Left - 280px)*: Filter tabs (`All`, `Mine`, `Unassigned`, `WhatsApp`, `Telegram`, `Email`, `Waiting on Client`), search bar, conversation preview list with channel badges, unread badges, timestamp, and contact avatar.
  - *Pane 2 (Center - Flex)*:
    - Channel header: Contact name, channel icon + sender ID (e.g., `+1 555-0199`), connected deal quick badge, "Assign to Agent" dropdown, "Take Over from Bot" button.
    - Chat timeline: Rich message bubbles (inbound, outbound, bot responses, internal notes highlighted in light amber).
    - Composer: Text, canned responses (`/`), attachment uploader, internal note toggle (`Private Note` vs `Send to WhatsApp/Telegram`), AI Copilot draft button.
  - *Pane 3 (Right - 320px Collapsible)*: Contextual Drawer:
    - Contact Card (phone, email, tags, custom fields).
    - Associated Deals (current stage, pipeline progress, move stage button).
    - Active Workflow triggers & Chatbot status (`Bot Active: Hybrid Mode`, `Pause Bot 1h`).
    - Quick actions: "Schedule Meeting", "Create Jira Issue", "Create Deal".

#### Screen 3: Dynamic CRM Pipelines (`/pipelines`)
- **Header**: Pipeline selector (e.g., "Sales Pipeline", "Customer Onboarding", "Support Escalations"), View Mode (`Kanban` vs `Table`), "Add Deal" button, "Customize Stages & Automation" button.
- **Kanban Board**:
  - Columns represent Stages (`Lead In`, `AI Qualified`, `Demo Scheduled`, `Proposal Sent`, `Closed Won`).
  - Stage Header shows stage name, deal count, total monetary value, and automation status indicators (`⚡ 3 triggers configured`).
  - **Deal Cards (Jira-style)**:
    - Deal Title, Contact/Company name, Deal value ($).
    - Channel source icon (WhatsApp logo, Webhook source).
    - Days in stage badge (color-coded: green < 24h, red > 72h).
    - Assigned agent avatar + next action reminder tag.
    - Drag-and-drop to move between stages (triggers `onEnter` / `auto-move` automation).

#### Screen 4: Workflow Engine (`/workflows`)
- **List View**: Active workflows, trigger type (Message, Stage Change, Webhook, Schedule), execution statistics, toggle ON/OFF.
- **Node-Based Visual Editor (`/workflows/[id]`)**:
  - Top Toolbar: Workflow Name, Active status, Run Test Payload, Execution Logs Drawer, Save.
  - Canvas: Infinite pan/zoom grid with draggable node connectors (Inputs/Outputs).
  - Node Palette:
    - *Triggers*: `Inbound Message`, `Stage Changed`, `Webhook Ingested`, `Timer/Cron`.
    - *Conditions*: `If/Else (JSON Path & regex)`, `Channel is WhatsApp`, `Lead Score > 70`.
    - *Actions*: `Send Omnichannel Message`, `Update Deal Stage`, `Create Jira Issue`, `HTTP Webhook Request`, `Assign Agent`.
    - *AI Nodes*: `LLM Intent Classifier`, `Entity Extractor`, `Generate Response`.
    - *Delays*: `Wait 15 Minutes`, `Wait Until Business Hours`.
  - Node Inspector Panel (Right drawer): Dynamic JSON form to configure node parameters, variable interpolation tags like `{{trigger.contact.phone}}`.

#### Screen 5: Chatbot Studio (`/chatbots`)
- **Flow Selector**:
  - 1. Deterministic Menu Flow: Quick reply buttons, keyword branching, carousel menus.
  - 2. AI Prompt & Knowledge: System instructions, temperature, grounding documents/FAQs, fallback human handoff trigger.
  - 3. Hybrid Orchestrator:
    - Level 1: Deterministic routing (e.g., Press 1 for Sales, 2 for Support).
    - Level 2: AI intent analysis if user types freeform text.
    - Level 3: Automatic fallback to human inbox if intent is "speak_to_agent" or sentiment is angry.

#### Screen 6: Integrations Hub (`/integrations`)
- Grid of provider cards with connection status, webhook endpoints, and credential forms:
  - Messaging: WhatsApp Cloud API (Meta), Telegram Bot, SMTP/IMAP & SendGrid.
  - External Tools: Atlassian Jira (API Token + Domain), GitHub (Personal Access Token / App), Custom Webhooks.
  - Each integration modal features credential validation (`Test Connection`), event subscription toggles, and encrypted credential storage.

---

## 2. System Architecture (Modular Monolith)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (Next.js 14+)                    │
│      App Router, Tailwind CSS, TanStack Query, React Flow (Workflows)   │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / REST / WebSockets
┌──────────────────────────────────▼─────────────────────────────────────┐
│                   APPLICATION CORE (Modular Monolith)                  │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │ Multi-Tenant Context  │  │ Authentication & RBAC │  │ Rate Limiter│ │
│  │ (TenantId Middleware) │  │ (JWT, Roles, Scopes)  │  │ & Security  │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬──────┘ │
│              │                          │                     │        │
│  ┌───────────▼──────────────────────────▼─────────────────────▼─────┐  │
│  │                     DOMAIN MODULES & ENGINES                     │  │
│  │                                                                  │  │
│  │  [Channel Ingestion Engine]   [Unified Conversation Service]     │  │
│  │  - WhatsApp Cloud API Webhook - Threading & Message Normalization│  │
│  │  - Telegram LongPoll/Webhook  - Outbound Dispatcher              │  │
│  │  - Email Inbound Parser       - Canned Responses & Notes         │  │
│  │                                                                  │  │
│  │  [Chatbot Engine]             [Workflow Execution Engine]        │  │
│  │  - Menu/Workflow Runner       - Node-Graph Evaluator (DAG)       │  │
│  │  - LLM Intent Classifier      - BullMQ Async Job Processor       │  │
│  │  - Hybrid Router & Fallback   - Retry, Delay & Dead-Letter Queue │  │
│  │                                                                  │  │
│  │  [Dynamic CRM Engine]         [Integration Service Bridge]       │  │
│  │  - Pipeline & Stage Manager   - Pluggable Provider Registry      │  │
│  │  - Stage Automation (onEnter) - Jira, GitHub, Generic Webhook    │  │
│  │  - Deal Transitions & SLAs    - Credential Encryption (AES-GCM)  │  │
│  │                                                                  │  │
│  │  [Event Ingestion Engine]     [Calendar & Scheduling Service]    │  │
│  │  - Raw /events Webhook Bus    - Slot Calculation & Booking       │  │
│  │  - Schema Validation & Match  - Reminders & Calendar Invites     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│  ┌──────────────────────────────────▼───────────────────────────────┐  │
│  │                     DATA ACCESS & STORAGE                        │  │
│  │  - Prisma ORM with Row-Level Tenant Isolation                    │  │
│  │  - PostgreSQL (Relational Data, JSONB for configs & node graphs) │  │
│  │  - Redis (BullMQ Queues, Session Store, Distributed Locking)     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities:
1. **Tenant Middleware**: Extracts `companyId` from authenticated token/subdomain and injects `where: { companyId }` into all Prisma queries to enforce isolation.
2. **Channel Ingestion Service**: Normalizes inbound events from WhatsApp, Telegram, and Email into a unified `InboundMessagePayload`.
3. **Workflow Engine**: Interprets a JSON DAG (Directed Acyclic Graph) of nodes. Enqueues step executions into BullMQ for reliability on low-resource machines.
4. **CRM Stage Automation Service**: Listens to `DEAL_STAGE_CHANGED` events, evaluates stage `onEnter` rules, executes actions (e.g. notify channel, create Jira issue, run AI evaluation).
5. **Integration Provider Registry**: Standard interface `IntegrationProvider` that exports `executeAction(actionName, params, credentials)`.

---

## 3. Database Schema (Prisma ORM)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ---------------- TENANCY & RBAC ----------------

model Company {
  id             String         @id @default(cuid())
  name           String
  slug           String         @unique
  plan           String         @default("PRO")
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  users          User[]
  contacts       Contact[]
  channels       ChannelAccount[]
  conversations  Conversation[]
  pipelines      Pipeline[]
  workflows      Workflow[]
  workflowRuns   WorkflowRun[]
  integrations   Integration[]
  events         IngestedEvent[]
  appointments   Appointment[]
  chatbots       ChatbotConfig[]
}

enum Role {
  ADMIN
  MANAGER
  AGENT
}

model User {
  id             String         @id @default(cuid())
  companyId      String
  email          String         @unique
  passwordHash   String
  name           String
  role           Role           @default(AGENT)
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  assignedDeals  Deal[]
  assignedConvs  Conversation[]
}

// ---------------- CONTACTS & CRM ----------------

model Contact {
  id             String         @id @default(cuid())
  companyId      String
  name           String
  email          String?
  phone          String?
  telegramId     String?
  avatarUrl      String?
  customFields   Json           @default("{}") // Flexible key-value store
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  conversations  Conversation[]
  deals          Deal[]
  appointments   Appointment[]

  @@unique([companyId, phone])
  @@unique([companyId, email])
}

model Pipeline {
  id             String         @id @default(cuid())
  companyId      String
  name           String
  isDefault      Boolean        @default(false)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  stages         Stage[]
  deals          Deal[]
}

model Stage {
  id             String         @id @default(cuid())
  pipelineId     String
  name           String
  order          Int
  color          String         @default("#3b82f6")
  autoMoveRules  Json           @default("[]") // [{ condition: "daysInStage > 3", moveToStageId: "xyz" }]
  onEnterActions Json           @default("[]") // [{ type: "send_whatsapp", template: "hi" }, { type: "create_jira" }]
  aiConfig       Json?          // { prompt: "Evaluate deal win probability", autoAction: true }
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  pipeline       Pipeline       @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  deals          Deal[]
}

model Deal {
  id             String         @id @default(cuid())
  companyId      String
  pipelineId     String
  stageId        String
  contactId      String?
  assignedUserId String?
  title          String
  value          Decimal        @default(0.00) @db.Decimal(12, 2)
  priority       String         @default("MEDIUM") // LOW, MEDIUM, HIGH, URGENT
  stageEnteredAt DateTime       @default(now())
  customFields   Json           @default("{}")
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  pipeline       Pipeline       @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  stage          Stage          @relation(fields: [stageId], references: [id])
  contact        Contact?       @relation(fields: [contactId], references: [id], onDelete: SetNull)
  assignedUser   User?          @relation(fields: [assignedUserId], references: [id], onDelete: SetNull)
}

// ---------------- CHANNELS & OMNICHANNEL INBOX ----------------

enum ChannelType {
  WHATSAPP
  TELEGRAM
  EMAIL
}

model ChannelAccount {
  id             String         @id @default(cuid())
  companyId      String
  type           ChannelType
  name           String
  identifier     String         // e.g., WhatsApp Phone Number ID or Telegram Bot Username
  credentials    String         // Encrypted JSON (AES-256-GCM)
  chatbotId      String?
  defaultPipelineId String?
  defaultStageId String?
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  conversations  Conversation[]
}

enum ConversationStatus {
  OPEN
  WAITING_CLIENT
  BOT_HANDLING
  RESOLVED
}

model Conversation {
  id             String             @id @default(cuid())
  companyId      String
  channelId      String
  contactId      String
  assignedUserId String?
  status         ConversationStatus @default(BOT_HANDLING)
  subject        String?
  lastMessageAt  DateTime           @default(now())
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  company        Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  channel        ChannelAccount     @relation(fields: [channelId], references: [id], onDelete: Cascade)
  contact        Contact            @relation(fields: [contactId], references: [id], onDelete: Cascade)
  assignedUser   User?              @relation(fields: [assignedUserId], references: [id], onDelete: SetNull)
  messages       Message[]
}

enum SenderType {
  CONTACT
  AGENT
  BOT
  SYSTEM
}

model Message {
  id             String         @id @default(cuid())
  conversationId String
  senderType     SenderType
  senderId       String?        // Contact ID, User ID, or Bot ID
  content        String
  mediaUrl       String?
  isInternalNote Boolean        @default(false)
  rawPayload     Json?          // Provider specific delivery info
  createdAt      DateTime       @default(now())

  conversation   Conversation   @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}

// ---------------- CHATBOT ENGINE ----------------

enum ChatbotMode {
  MENU
  AI
  HYBRID
}

model ChatbotConfig {
  id             String         @id @default(cuid())
  companyId      String
  name           String
  mode           ChatbotMode    @default(HYBRID)
  menuFlowJson   Json           @default("{}") // Step-by-step tree for deterministic flows
  aiPrompt       String?        // LLM prompt instructions & guidelines
  aiModel        String         @default("gemini-1.5-flash")
  fallbackRules  Json           @default("{}") // e.g., { onUnknownIntent: "handoff_agent", maxAiRetries: 2 }
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

// ---------------- WORKFLOW AUTOMATION ENGINE ----------------

model Workflow {
  id             String         @id @default(cuid())
  companyId      String
  name           String
  description    String?
  isActive       Boolean        @default(true)
  triggerType    String         // "message_received", "stage_changed", "webhook_event", "cron"
  nodesJson      Json           // Array of graph nodes (Trigger, Condition, Action, Delay, AI)
  edgesJson      Json           // Array of connections between nodes
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  runs           WorkflowRun[]
}

model WorkflowRun {
  id             String         @id @default(cuid())
  companyId      String
  workflowId     String
  status         String         // RUNNING, COMPLETED, FAILED
  triggerPayload Json
  stepResults    Json           @default("[]")
  errorMessage   String?
  startedAt      DateTime       @default(now())
  completedAt    DateTime?

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  workflow       Workflow       @relation(fields: [workflowId], references: [id], onDelete: Cascade)
}

// ---------------- INTEGRATIONS & EXTERNAL APIS ----------------

model Integration {
  id             String         @id @default(cuid())
  companyId      String
  provider       String         // "JIRA", "GITHUB", "GENERIC_WEBHOOK"
  name           String
  credentials    String         // Encrypted credentials (API tokens, URLs)
  settings       Json           @default("{}") // e.g., default Jira Project Key, GitHub Repo
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

// ---------------- EVENTS & CALENDAR ----------------

model IngestedEvent {
  id             String         @id @default(cuid())
  companyId      String
  source         String         // e.g. "stripe", "github", "custom_sensor"
  eventType      String         // e.g. "payment.succeeded", "issue.created"
  payload        Json
  status         String         @default("PROCESSED") // UNPROCESSED, PROCESSED, FAILED
  createdAt      DateTime       @default(now())

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
}

model Appointment {
  id             String         @id @default(cuid())
  companyId      String
  contactId      String
  title          String
  startTime      DateTime
  endTime        DateTime
  status         String         @default("CONFIRMED") // CONFIRMED, CANCELLED, COMPLETED
  notes          String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  company        Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  contact        Contact        @relation(fields: [contactId], references: [id], onDelete: Cascade)
}
```

---

## 4. Workflow Engine Architecture

### 4.1 Node-Based DAG Specification
Workflows are modeled as a Directed Acyclic Graph (DAG) with nodes and edges stored in `Workflow.nodesJson` and `Workflow.edgesJson`.

#### Node Types & JSON Schema:
1. **Trigger Node**:
   ```json
   {
     "id": "node_trigger_1",
     "type": "TRIGGER",
     "data": {
       "triggerType": "INBOUND_MESSAGE",
       "channel": "WHATSAPP",
       "filterKeywords": ["pricing", "budget", "plan"]
     }
   }
   ```
2. **Condition Node**:
   ```json
   {
     "id": "node_condition_1",
     "type": "CONDITION",
     "data": {
       "expression": "trigger.contact.dealsCount == 0 && trigger.message.sentiment != 'ANGRY'",
       "branches": {
         "true": "node_ai_qualify",
         "false": "node_human_handoff"
       }
     }
   }
   ```
3. **Action Node (Internal/CRM)**:
   ```json
   {
     "id": "node_action_crm",
     "type": "ACTION",
     "data": {
       "actionName": "CREATE_OR_UPDATE_DEAL",
       "parameters": {
         "pipelineId": "pipeline_sales_01",
         "stageId": "stage_lead_in",
         "title": "Inbound Lead from {{trigger.contact.name}}",
         "value": 1500
       }
     }
   }
   ```
4. **Action Node (External Integration)**:
   ```json
   {
     "id": "node_action_jira",
     "type": "ACTION",
     "data": {
       "provider": "JIRA",
       "actionName": "CREATE_ISSUE",
       "parameters": {
         "projectKey": "SUP",
         "summary": "Urgent Lead Escalation: {{trigger.contact.phone}}",
         "issueType": "Task"
       }
     }
   }
   ```
5. **AI Node**:
   ```json
   {
     "id": "node_ai_qualify",
     "type": "AI_INFERENCE",
     "data": {
       "prompt": "Extract company size, budget, and project urgency from: {{trigger.message.content}}",
       "outputFormat": "JSON",
       "schema": {
         "budget": "number",
         "urgency": "string",
         "recommendedStage": "string"
       }
     }
   }
   ```
6. **Delay Node**:
   ```json
   {
     "id": "node_delay_1",
     "type": "DELAY",
     "data": {
       "delayType": "DURATION",
       "durationSeconds": 1800
     }
   }
   ```

### 4.2 Execution Engine Execution Flow
1. **Event Dispatcher**: Any domain event (`message.created`, `deal.stage_changed`, `webhook.received`) is dispatched to `WorkflowEventBus`.
2. **Matching Engine**: Scans active `Workflow` records matching the tenant ID and `triggerType`.
3. **Queue Enqueue**: Enqueues an execution task into Redis via BullMQ (`workflow-queue`).
4. **Worker Step Execution**:
   - Resolves context variables using JSONPath (e.g. `{{trigger.message.content}}`).
   - Executes node handler:
     - If condition: resolves branch.
     - If delay: utilizes BullMQ delayed jobs (`{ delay: delaySeconds * 1000 }`).
     - If external action: invokes `IntegrationProviderRegistry`.
   - Records step logs into `WorkflowRun.stepResults`.

---

## 5. Integration System Design

### 5.1 Provider Interface
Every integration implements the TypeScript interface:
```typescript
export interface IntegrationProvider<TCredentials, TSettings> {
  providerId: string; // e.g. "JIRA", "GITHUB", "WHATSAPP", "WEBHOOK"
  validateCredentials(credentials: TCredentials): Promise<boolean>;
  getAvailableActions(): ActionDescriptor[];
  executeAction(
    actionName: string,
    params: Record<string, any>,
    credentials: TCredentials,
    settings: TSettings
  ): Promise<ActionResult>;
}
```

### 5.2 Encryption & Credential Security
- Credentials are encrypted at rest using **AES-256-GCM** with an authentication tag and a unique initialization vector (IV) per record:
  - Format: `iv:authTag:encryptedData` (Base64).
  - Key derived from `ENCRYPTION_MASTER_KEY` in environment variables.

### 5.3 Concrete Action Handlers:
- **Jira Provider**:
  - Actions: `create_issue`, `transition_issue`, `add_comment`.
  - Credentials: `{ domain: "company.atlassian.net", email: "user@domain.com", apiToken: "..." }`.
- **GitHub Provider**:
  - Actions: `create_issue`, `add_label`, `create_repository_dispatch`.
  - Credentials: `{ personalAccessToken: "ghp_...", repository: "org/repo" }`.
- **Generic Webhook Provider**:
  - Actions: `http_request` (GET, POST, PUT with custom headers and HMAC signature header).

---

## 6. End-to-End Example User Flows

### Flow A: WhatsApp Message → AI Pipeline Route → Response
1. **Webhook Arrival**: WhatsApp Cloud API delivers a POST payload to `/api/v1/channels/whatsapp/webhook`.
2. **Ingestion & Dedup**:
   - Signature `X-Hub-Signature-256` validated.
   - Contact is looked up by `phone` (created if new).
   - Conversation thread created or retrieved.
   - Message saved to PostgreSQL: `senderType: CONTACT`.
3. **Chatbot Evaluation**:
   - Chatbot is in `HYBRID` mode.
   - Deterministic check: Does content match keyword `menu`? No.
   - LLM Intent Classification triggered:
     - Prompt: *"Classify incoming query: 'Hello, we want to deploy your enterprise plan for 50 users next week'."*
     - Output: `{ intent: "SALES_ENTERPRISE", urgency: "HIGH", estimatedValue: 5000 }`.
4. **CRM Automation Triggered**:
   - System checks if Contact has an active deal.
   - Creates a new `Deal` in "Sales Pipeline" at stage `AI Qualified` with value `$5,000`.
   - Assigns priority `HIGH` and auto-assigns round-robin to an available agent with role `AGENT`.
5. **Outbound Response Dispatched**:
   - Bot replies immediately on WhatsApp:
     *"Hi there! Great to hear from you. I've flagged our enterprise team for priority review. Would you like to schedule a quick 15-minute intro with our solutions specialist right away?"* + sends booking calendar link.
6. **Unified Inbox Update**: Real-time WebSocket notifies the sales team in the Next.js `/inbox` view.

---

### Flow B: Webhook Event Ingestion → Workflow Trigger → External Jira Action
1. **Ingestion**: A third-party SaaS system sends an alert to `/api/v1/events`:
   ```json
   {
     "source": "monitoring_system",
     "eventType": "database.slow_query_alert",
     "payload": {
       "latencyMs": 4200,
       "service": "billing-db",
       "environment": "production"
     }
   }
   ```
2. **Event Logged**: Event persisted to `IngestedEvent` with `status: UNPROCESSED`.
3. **Workflow Matched**:
   - Active workflow "Production Incident Escalator" has trigger `triggerType: "webhook_event"`, filter `source == "monitoring_system" && payload.latencyMs > 3000`.
4. **Workflow Execution**:
   - Node 1 (Condition): `payload.environment == "production"` -> True branch.
   - Node 2 (Action - Jira Integration):
     - Action: `JIRA.create_issue`.
     - Parameters:
       - Summary: `[ALERT] Slow Query in billing-db (4200ms)`.
       - Description: `Auto-generated incident ticket triggered by event ID {{trigger.event.id}}`.
       - IssueType: `Bug`, Priority: `Highest`.
     - Result: Jira ticket `SUP-402` created.
   - Node 3 (Action - Omnichannel Alert):
     - Dispatches a Telegram broadcast to the DevOps channel:
       *"🚨 Production Alert: High DB latency detected. Jira ticket created: https://acme.atlassian.net/browse/SUP-402"*.
5. **Completion**: Workflow run recorded with `status: COMPLETED` and complete step timing metrics.

---

## 7. REST API Structure

### 7.1 Authentication & Tenancy
All protected routes require header `Authorization: Bearer <jwt>` and evaluate the user's role and `companyId`.

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Authenticate user, return JWT + company profile | Public |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Public |
| `GET` | `/api/v1/company` | Retrieve tenant details & feature flags | All |
| `PATCH`| `/api/v1/company` | Update company configuration & branding | ADMIN |

### 7.2 Omnichannel Channels & Conversations
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/channels` | List configured channels (WhatsApp, TG, Email) | All |
| `POST`| `/api/v1/channels` | Connect new channel with credentials | ADMIN |
| `POST`| `/api/v1/channels/whatsapp/webhook` | Meta Cloud API webhook handler | Public (HMAC) |
| `POST`| `/api/v1/channels/telegram/webhook` | Telegram Bot webhook handler | Public (Secret) |
| `GET` | `/api/v1/conversations` | List conversation threads (with filtering & pagination) | All |
| `GET` | `/api/v1/conversations/:id` | Get thread details, messages, and contact info | All |
| `POST`| `/api/v1/conversations/:id/messages`| Send outbound message or internal note | AGENT+ |
| `PATCH`| `/api/v1/conversations/:id/assign`| Assign conversation to user or bot | MANAGER+ |

### 7.3 CRM Pipelines, Stages & Deals
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/pipelines` | List all pipelines with stages & deal summaries | All |
| `POST`| `/api/v1/pipelines` | Create dynamic pipeline | ADMIN |
| `PUT` | `/api/v1/pipelines/:id/stages` | Reorder stages, update colors & automation JSON | ADMIN |
| `GET` | `/api/v1/deals` | Get deals (Kanban/Table data with query filters) | All |
| `POST`| `/api/v1/deals` | Create deal manually or via webhook | All |
| `PATCH`| `/api/v1/deals/:id/stage` | Transition deal stage (triggers stage automation) | All |

### 7.4 Workflows & Automations
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/workflows` | List workflows with run counts & active states | All |
| `POST`| `/api/v1/workflows` | Create workflow (stores nodesJson & edgesJson) | MANAGER+ |
| `PUT` | `/api/v1/workflows/:id` | Update visual graph config | MANAGER+ |
| `POST`| `/api/v1/workflows/:id/test` | Dry-run workflow with mock trigger payload | MANAGER+ |
| `GET` | `/api/v1/workflows/:id/runs` | Execution history & step-by-step logs | All |

### 7.5 Event Ingestion & Integrations
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST`| `/api/v1/events` | Ingest external raw event / webhook payload | API Key / Token |
| `GET` | `/api/v1/events` | List ingested event logs & processing status | MANAGER+ |
| `GET` | `/api/v1/integrations` | List active external providers (Jira, GitHub, etc.) | All |
| `POST`| `/api/v1/integrations` | Connect external provider credentials | ADMIN |
| `POST`| `/api/v1/integrations/:id/test` | Test integration connection health | ADMIN |

### 7.6 Calendar & Appointments
| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `GET` | `/api/v1/calendar/slots` | Retrieve available booking time slots | All |
| `POST`| `/api/v1/calendar/appointments` | Book appointment & link to Contact/Deal | All |

---

## 8. Low-Resource VM Optimization Guidelines
1. **Single Node.js Process with Fastify/Express & Next.js**:
   - Next.js standalone build (`output: 'standalone'`) running behind NGINX or Caddy reverse proxy.
2. **In-Memory & Redis Resource Management**:
   - Redis memory capped with `maxmemory 256mb` and `maxmemory-policy allkeys-lru`.
   - BullMQ concurrency set to 5 concurrent jobs to avoid CPU throttling.
3. **Database Efficiency**:
   - Connection pooling via Prisma Client connection limits (`connection_limit=10`).
   - JSONB GIN indexes on `Contact.customFields`, `Deal.customFields`, and `IngestedEvent.payload`.
4. **Log Pruning**:
   - Automatic 14-day rolling retention cron job for `IngestedEvent` and `WorkflowRun` tables.
