# Meetly 🤝

**Meetly: AI-Powered Enterprise Consultation Infrastructure**

_Architected for high-throughput scheduling, sub-second latency video conferencing, and fault-tolerant asynchronous workflows. Meetly redefines the virtual consultation experience by integrating autonomous AI agents, real-time transcription, and a unified, edge-native application layer._

[![Next.js](https://img.shields.io/badge/Next.js-16.x-000000?logo=next.js&style=flat-square)]() [![tRPC](https://img.shields.io/badge/tRPC-v11-2596BE?logo=trpc&style=flat-square)]() [![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript&style=flat-square)]() [![Stream](https://img.shields.io/badge/Stream-Video%20%26%20Chat-005FFF?logo=stream&style=flat-square)]() [![Inngest](https://img.shields.io/badge/Inngest-Workflows-000000?logo=inngest&style=flat-square)]() [![Polar](https://img.shields.io/badge/Polar-Monetization-000000?logo=polar&style=flat-square)]() [![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&style=flat-square)]() [![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&style=flat-square)]() [![Better Auth](https://img.shields.io/badge/Better_Auth-v1-FF5F5F?style=flat-square)]()

## 🎯 Architectural Decisions & Problem Solving

### Problem 1: The Latency & Context Switching of Fragmented Toolchains

Traditional workflows force a context switch between scheduling (Calendly), video (Zoom), and payments (Stripe), introducing data silos and friction.

**Solution: Unified Application Layer**
Meetly eliminates disjointed state by integrating **Polar** (Merchant of Record) and **Stream** (Low-latency Video) directly into a **Next.js** application. This creates a single source of truth for meeting state, payment status, and user sessions, reducing TTI (Time to Interactive) and improving conversion rates.

### Problem 2: Ephemeral Compute & Distributed Transaction Failures

Post-meeting side effects—transcoding recordings, generating AI summaries, or sending drip campaigns—are prone to failure in standard serverless environments due to execution timeouts and lack of state persistence.

**Solution: Durable Execution & Idempotency**
Meetly leverages **Inngest** as a durable execution engine. Unlike standard queues, Inngest provides **step-level state persistence**, ensuring that multi-step workflows (e.g., `Payment` -> `Book` -> `Email`) are resilient to failure. It guarantees **at-least-once delivery** and automatic retries with exponential backoff, decoupling business logic from the request-response cycle.

### Problem 3: The Information Black Hole (Lost Context)

Valuable insights from meetings are often lost the moment the call ends. Manual note-taking distracts participants, and static recordings are rarely reviewed.

**Solution: Autonomous AI Agents & Transcription**
Meetly deploys **AI Agents** that join calls as participants. These agents capture real-time audio, pipe it through a **transcription engine**, and generate structured summaries and action items instantly. This transforms ephemeral conversations into persistent, queryable knowledge bases.

### Problem 4: API Type Safety & Developer Velocity

Traditional REST or GraphQL APIs often suffer from drift between the backend schema and frontend types, leading to runtime errors and slow iteration cycles.

**Solution: End-to-End Type Safety with tRPC**
By utilizing **tRPC**, Meetly shares type definitions directly between the client and server. This eliminates the need for code generation or schema syncing, providing instant type inference and autocomplete across the entire stack.

### Problem 5: WebRTC Scalability & Global Reach

Building a custom WebRTC mesh network is unscalable for group calls, leading to high client-side CPU usage and poor uplink bandwidth management.

**Solution: Global Edge Network & SFU Architecture**
Meetly offloads media transport to **Stream's Global Edge Network**. Utilizing a **Selective Forwarding Unit (SFU)** architecture, Meetly ensures that clients receive optimal video streams based on their bandwidth (Adaptive Bitrate Streaming), maintaining sub-100ms latency across regions without the operational overhead of managing TURN/STUN servers.

## System Design & Philosophy

- **Edge-Native & Serverless First:** Built on the **Next.js App Router**, Meetly leverages **React Server Components (RSC)** to minimize client-side bundle size and execute logic closer to the data source.
- **Event-Driven Architecture:** Decoupled micro-processes via **Inngest**. Events like `meeting.ended` trigger asynchronous, non-blocking workflows, ensuring the main thread remains responsive.
- **AI-First Design:** The system treats meeting intelligence (transcription, summarization) as a core primitive, not an afterthought, utilizing the **Model Context Protocol (MCP)** for standardized AI interactions.
- **Developer-Centric Monetization:** **Polar.sh** integration abstracts complex billing logic, handling tax compliance and subscription lifecycles via webhooks.
- **End-to-End Type Safety:** Rigorous **TypeScript** implementation combined with **Zod** for runtime validation ensures contract integrity between the database, API, and client.

## Engineering Deep Dive

### 1. The tRPC & Next.js Hybrid Layer

Meetly combines the best of RPC and Server Actions:

- **tRPC for Data Fetching:** Provides a strictly typed API surface for client-side data fetching, ensuring that if the backend schema changes, the frontend build fails immediately.
- **Server Actions for Mutations:** Leverages Next.js Server Actions for form submissions and progressive enhancement, keeping the bundle size small.

### 2. AI Agent & Transcription Pipeline

The meeting intelligence layer is a sophisticated pipeline:

1.  **Ingestion:** An AI Agent joins the Stream call as a hidden participant.
2.  **Transcription:** Audio streams are processed in real-time to generate diarized transcripts (distinguishing between speakers).
3.  **Synthesis:** LLMs process the transcript to extract key decisions, action items, and sentiment analysis.
4.  **Storage:** Results are indexed and stored, making the meeting content searchable.

### 3. Durable Workflows with Inngest

**Inngest** serves as the orchestration backbone:

- **Flow Control:** Complex logic is broken down into discrete, retriable steps.
- **Sleep & Wait:** Uses `step.sleepUntil` to handle time-based triggers (e.g., "Send reminder 15m before start") serverlessly, avoiding polling overhead.
- **Concurrency Management:** Ensures system stability under load by managing function concurrency limits.

### 4. Real-Time Communication with Stream

The video interface is built on **@stream-io/video-react-sdk**:

- **State Management:** Sophisticated hook-based state management for participant handling, active speaker detection, and track subscriptions.
- **Dynascale:** Automatically adjusts video resolution and frame rates based on device capabilities and network conditions.

## ⚙️ System Architecture & Inngest Flow

```mermaid
graph TD
    subgraph Client_Layer [Client Layer (Next.js 16 + React 19)]
        WebApp["Web App"]
        StreamClient["Stream Video SDK"]
    end

    subgraph Server_Layer [Server Layer]
        TRPC["tRPC Router"]
        Auth["Better Auth"]
        ServerActions["Server Actions"]
    end

    subgraph Data_Layer [Data Persistence]
        NeonDB["Neon Postgres"]
        Drizzle["Drizzle ORM"]
    end

    subgraph Async_Orchestration [Inngest Workflow Engine]
        InngestServer["Inngest Server"]
        AgentWorkflow["AI Agent Workflow"]
        AgentKit["Inngest Agent Kit"]
    end

    subgraph External_Services [Managed Infrastructure]
        StreamAPI["Stream API"]
        OpenAI["OpenAI Realtime API"]
        Polar["Polar.sh"]
    end

    WebApp -->|tRPC / Actions| TRPC
    WebApp -->|Auth| Auth
    WebApp -->|WebRTC| StreamClient

    StreamClient <-->|Signaling/Media| StreamAPI

    TRPC -->|Read/Write| Drizzle
    Drizzle -->|Query| NeonDB

    TRPC -->|Trigger Event| InngestServer

    InngestServer -->|Execute| AgentWorkflow
    AgentWorkflow -->|Use| AgentKit
    AgentKit -->|Inference| OpenAI
    AgentKit -->|Persist State| Drizzle

    TRPC -->|Checkout| Polar
```

## Technology Stack

### Core

- **Next.js 16+**: App Router, Server Actions, RSC.
- **TypeScript**: Strict mode enabled.
- **Tailwind CSS**: Utility-first, JIT compilation.
- **OpenAI Realtime API**: Powering autonomous, sub-second latency voice agents.
- **Gemini API**: Generates intelligent meeting summaries and actionable insights.

### Infrastructure & Services

- **Stream**: SFU-based Video & Audio, Global Edge Network.
- **Inngest**: Durable Execution, Event Bus, Workflow Orchestration.
- **Polar**: MoR (Merchant of Record), SaaS Monetization.
- **Recharts**: D3-based composable visualization.

### Utilities

- **Zod**: Runtime schema validation & type inference.
- **Lucide React**: Tree-shakeable iconography.

## 🚀 Getting Started

Follow these instructions to set up Meetly locally.

### Prerequisites

- **Node.js** (v18+)
- **npm** or **pnpm**
- Keys for **Stream**, **Inngest**, and **Polar**.

### 🛠️ Installation & Setup

1.  **Clone the Repository**

    ```sh
    git clone https://github.com/ParthAhuja4/meetly
    cd meetly
    ```

2.  **Install Dependencies**

    ```sh
    npm install
    # or
    pnpm install
    ```

3.  **Environment Variables**
    Create a `.env` file and add your keys see env.sample for clarity:

    ```env
    NEXT_PUBLIC_STREAM_API_KEY=...
    STREAM_SECRET_KEY=...
    INNGEST_EVENT_KEY=...
    INNGEST_SIGNING_KEY=...
    POLAR_ACCESS_TOKEN=...
    ```

4.  **Start the Development Server**

    ```sh
    npm run dev
    ```

    The app will be available at `http://localhost:3000`.

5.  **Start Inngest Dev Server** (for local workflows)
    ```sh
    npx inngest-cli@latest dev
    ```
    Open `http://localhost:8288` to view and trigger workflows.

## 🤝 Contribution Workflow

We welcome and encourage community contributions. Please adhere to the following workflow:

1.  **Fork the Repository**: Start by forking the main repository to your own GitHub account.
2.  **Create a Feature Branch**: Create a new branch for your work. Use a descriptive name.
    ```sh
    git checkout -b feature/MyAmazingFeature
    ```
3.  **Commit Your Changes**: Make your changes and commit them with clear, descriptive commit messages.
    ```sh
    git commit -m 'feat: Implement MyAmazingFeature'
    ```
4.  **Push to Your Branch**: Push your changes up to your forked repository.
    ```sh
    git push origin feature/MyAmazingFeature
    ```
5.  **Submit a Pull Request**: Open a pull request from your feature branch to the `main` branch of the original repository. Provide a detailed description of your changes.

---

## Contact

**Developer:** Parth Ahuja  
**GitHub:** [@ParthAhuja4](https://github.com/ParthAhuja4)  
**Email:** [parthahuja006@gmail.com](mailto:parthahuja006@gmail.com)
**Linked In:** [Parth Ahuja](https://www.linkedin.com/in/parthahuja4/)
