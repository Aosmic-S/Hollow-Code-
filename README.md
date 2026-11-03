# Hollow Code — Jules API Dashboard

> **"Code while you're gone."**

Hollow Code is a production-grade, dark-themed dashboard for Google's asynchronous coding agent, **Jules API** (`https://jules.googleapis.com/v1alpha`).

---

## 🌟 Key Features

1. **Connected Sources (`GET /sources`)**: Paginated list of connected GitHub repositories for task targeting.
2. **New Task Session Form (`POST /sessions`)**:
   - Prompt textarea with preset helpers.
   - Connected repository selector.
   - Starting branch selection (defaults to `main`).
   - Title input.
   - Automation toggles (`automationMode: "AUTO_CREATE_PR"` and `requirePlanApproval: true|false`).
3. **Sessions Queue (`GET /sessions`)**:
   - Status filters and live search.
   - Cards showing status badges, created time, branch, and direct links to GitHub PRs when generated.
   - Automatic background refresh every 10 seconds.
4. **Session Activity Timeline (`GET /sessions/{id}/activities`)**:
   - Chat-style stream visually separating Agent activities from User messages.
   - Interactive execution plan steps (completed, in-progress, pending).
   - Collapsible bash terminal outputs with syntax highlighting and copy functionality.
   - File diff changes with line addition/deletion metrics.
5. **Human Plan Approval (`POST /sessions/{id}:approvePlan`)**:
   - Approves proposed plan steps when plan approval is required.
6. **Agent Steering (`POST /sessions/{id}:sendMessage`)**:
   - Send guidance or feedback messages to steer the agent during execution.
7. **Task Templates**:
   - Saved prompts for common tasks (*Fix failing tests*, *Add unit tests*, *Review this PR*, *Update dependencies*, etc.).
8. **Resilient Error & Rate Limit Handling**:
   - Detailed UI feedback for `429 Too Many Requests` rate limits and `5xx` server responses.

---

## 🛡️ Security Architecture

The Jules API Key **never** leaves the server. All requests are routed through a secure Express proxy (`/api/jules/*`) which attaches the secret key to outgoing Google API requests via the `X-Goog-Api-Key` header.

```
+------------------+         HTTP /api/jules/*         +--------------------+        X-Goog-Api-Key        +-----------------------------------+
|  React Frontend  |  =============================>  | Express Server     |  =========================>  | Google Jules API                  |
|  (Hollow Code)   |                                  | (JULES_API_KEY env)|                              | (jules.googleapis.com/v1alpha)   |
+------------------+                                  +--------------------+                              +-----------------------------------+
```

---

## 🚀 Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your Jules API key in `.env`:
```env
JULES_API_KEY="YOUR_ACTUAL_JULES_API_KEY"
PORT=3000
```

*Note: If `JULES_API_KEY` is omitted, Hollow Code will automatically operate in **Demo Sandbox Mode**, allowing full visual and functional testing with synthetic agent activities.*

### 3. Run Development Server
```bash
npm run dev
```

The app will start at `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ℹ️ Disclaimer
The **Google Jules API** is currently in alpha (`v1alpha`). Endpoint behaviors and response schemas may evolve. Hollow Code is designed to handle schema adjustments gracefully.
