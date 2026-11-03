import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const JULES_API_BASE = 'https://jules.googleapis.com/v1alpha';

app.use(express.json());

// In-memory mock storage for demo mode
let mockSessions: any[] = [
  {
    name: 'sessions/sess-101',
    id: 'sess-101',
    title: 'Fix failing unit tests in auth middleware',
    prompt: 'Run unit tests in src/auth.test.ts, fix JWT expiration edge case handling, and ensure all mock tests pass cleanly.',
    source: 'sources/github.com/google/hollow-code',
    startingBranch: 'main',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: true,
    state: 'AWAITING_PLAN_APPROVAL',
    createTime: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    updateTime: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    outputs: {
      pullRequest: {
        url: 'https://github.com/google/hollow-code/pull/42',
        number: 42,
        title: 'fix(auth): handle expired JWT tokens gracefully',
        headBranch: 'jules/fix-auth-jwt',
        baseBranch: 'main'
      }
    }
  },
  {
    name: 'sessions/sess-102',
    id: 'sess-102',
    title: 'Add rate-limiting unit tests for proxy routes',
    prompt: 'Write comprehensive test suite for Express proxy rate limiter to verify 429 response handling under heavy concurrency.',
    source: 'sources/github.com/acme-corp/payment-gateway',
    startingBranch: 'main',
    automationMode: 'AUTO_CREATE_PR',
    requirePlanApproval: false,
    state: 'IN_PROGRESS',
    createTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updateTime: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    name: 'sessions/sess-103',
    id: 'sess-103',
    title: 'Refactor database connection pool timeout logic',
    prompt: 'Update pool retry logic in db/pool.ts to use exponential backoff with jitter. Update tests.',
    source: 'sources/github.com/acme-corp/microservice-auth',
    startingBranch: 'master',
    automationMode: 'AUTOMATION_MODE_UNSPECIFIED',
    requirePlanApproval: true,
    state: 'COMPLETED',
    createTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updateTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    outputs: {
      pullRequest: {
        url: 'https://github.com/acme-corp/microservice-auth/pull/108',
        number: 108,
        title: 'refactor(db): implement exponential backoff on pool connection',
        headBranch: 'jules/db-pool-retry',
        baseBranch: 'master'
      }
    }
  }
];

let mockActivitiesMap: Record<string, any[]> = {
  'sess-101': [
    {
      name: 'sessions/sess-101/activities/act-1',
      id: 'act-1',
      createTime: new Date(Date.now() - 1000 * 60 * 17).toISOString(),
      originator: 'AGENT',
      progressUpdate: {
        message: 'Cloned repository google/hollow-code on branch main. Analyzing workspace structure...'
      }
    },
    {
      name: 'sessions/sess-101/activities/act-2',
      id: 'act-2',
      createTime: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
      originator: 'AGENT',
      bashOutput: {
        command: 'npx tsx --test src/auth.test.ts',
        output: 'FAIL: src/auth.test.ts\n  ✕ JWT token with expired exp claim should throw AuthExpiredError\n  AssertionError: expected status 500 to equal 401\nTests: 1 failed, 8 passed, 9 total.',
        exitCode: 1
      }
    },
    {
      name: 'sessions/sess-101/activities/act-3',
      id: 'act-3',
      createTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      originator: 'AGENT',
      plan: {
        steps: [
          { id: 'step-1', title: 'Inspect src/auth/jwt.ts token verification handler', state: 'COMPLETED' },
          { id: 'step-2', title: 'Update ExpiredTokenError handler to map to HTTP 401 status code', state: 'PENDING' },
          { id: 'step-3', title: 'Run test suite and verify 0 failures', state: 'PENDING' },
          { id: 'step-4', title: 'Create Pull Request on GitHub', state: 'PENDING' }
        ]
      }
    },
    {
      name: 'sessions/sess-101/activities/act-4',
      id: 'act-4',
      createTime: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
      originator: 'AGENT',
      progressUpdate: {
        message: 'Created execution plan. Plan approval is required before applying file changes.'
      }
    }
  ],
  'sess-102': [
    {
      name: 'sessions/sess-102/activities/act-1',
      id: 'act-1',
      createTime: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
      originator: 'AGENT',
      progressUpdate: {
        message: 'Repo acme-corp/payment-gateway loaded. Beginning test suite generation...'
      }
    },
    {
      name: 'sessions/sess-102/activities/act-2',
      id: 'act-2',
      createTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      originator: 'AGENT',
      plan: {
        steps: [
          { id: 'step-1', title: 'Create src/middleware/rateLimiter.test.ts', state: 'COMPLETED' },
          { id: 'step-2', title: 'Simulate 100 concurrent requests to /api/checkout', state: 'IN_PROGRESS' },
          { id: 'step-3', title: 'Verify headers X-RateLimit-Remaining and Retry-After', state: 'PENDING' }
        ]
      }
    },
    {
      name: 'sessions/sess-102/activities/act-3',
      id: 'act-3',
      createTime: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      originator: 'AGENT',
      fileChanges: {
        summary: 'Added src/middleware/rateLimiter.test.ts',
        files: [
          {
            path: 'src/middleware/rateLimiter.test.ts',
            status: 'ADDED',
            additions: 45,
            deletions: 0,
            patch: `+ import test from 'node:test';\n+ import assert from 'node:assert/strict';\n+ import { rateLimiter } from './rateLimiter';\n+\n+ test('returns 429 when bucket depleted', async () => {\n+   const res = await rateLimiter.simulateOverload();\n+   assert.equal(res.status, 429);\n+ });`
          }
        ]
      }
    }
  ],
  'sess-103': [
    {
      name: 'sessions/sess-103/activities/act-1',
      id: 'act-1',
      createTime: new Date(Date.now() - 1000 * 60 * 175).toISOString(),
      originator: 'AGENT',
      progressUpdate: {
        message: 'Completed DB connection pool refactoring. All tests passed.'
      }
    },
    {
      name: 'sessions/sess-103/activities/act-2',
      id: 'act-2',
      createTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      originator: 'AGENT',
      bashOutput: {
        command: 'git push origin jules/db-pool-retry && gh pr create --fill',
        output: 'https://github.com/acme-corp/microservice-auth/pull/108',
        exitCode: 0
      }
    }
  ]
};

// Helper for calling external Jules API
async function callJulesApi(endpoint: string, method: string = 'GET', body?: any) {
  const apiKey = process.env.JULES_API_KEY;
  if (!apiKey) {
    throw { status: 401, message: 'JULES_API_KEY is not set on the server.' };
  }

  const url = `${JULES_API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'X-Goog-Api-Key': apiKey,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const responseText = await response.text();
  let json: any = {};
  try {
    json = JSON.parse(responseText);
  } catch {
    json = { rawText: responseText };
  }

  if (!response.ok) {
    throw {
      status: response.status,
      message: json.error?.message || json.message || responseText || `HTTP ${response.status}`
    };
  }

  return json;
}

// 1. Server & Jules API Status Endpoint
app.get('/api/jules/status', (req: Request, res: Response) => {
  const apiKey = process.env.JULES_API_KEY;
  const forceDemo = req.headers['x-hollow-mode'] === 'demo';
  const hasKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_JULES_API_KEY_HERE');

  res.json({
    configured: hasKey,
    mode: (hasKey && !forceDemo) ? 'live' : 'demo',
    apiKeyPresent: hasKey,
    apiVersion: 'v1alpha'
  });
});

// 2. GET Connected Sources / Repositories
app.get('/api/jules/sources', async (req: Request, res: Response) => {
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!useDemo) {
    try {
      const pageToken = req.query.pageToken ? `&pageToken=${req.query.pageToken}` : '';
      const pageSize = req.query.pageSize ? `&pageSize=${req.query.pageSize}` : '&pageSize=10';
      const data = await callJulesApi(`/sources?${pageSize}${pageToken}`);
      return res.json(data);
    } catch (err: any) {
      console.warn('[Jules API Proxy] Falling back to demo mode due to API error:', err);
      // If error is 429 or 5xx, pass error or fallback gracefully
      if (req.query.strictError === 'true') {
        return res.status(err.status || 500).json({ error: err });
      }
    }
  }

  // Mock Sources Response
  return res.json({
    sources: [
      {
        name: 'sources/github.com/google/hollow-code',
        id: 'github.com/google/hollow-code',
        repository: 'google/hollow-code',
        defaultBranch: 'main'
      },
      {
        name: 'sources/github.com/google/jules-sdk-ts',
        id: 'github.com/google/jules-sdk-ts',
        repository: 'google/jules-sdk-ts',
        defaultBranch: 'main'
      },
      {
        name: 'sources/github.com/acme-corp/payment-gateway',
        id: 'github.com/acme-corp/payment-gateway',
        repository: 'acme-corp/payment-gateway',
        defaultBranch: 'main'
      },
      {
        name: 'sources/github.com/acme-corp/microservice-auth',
        id: 'github.com/acme-corp/microservice-auth',
        repository: 'acme-corp/microservice-auth',
        defaultBranch: 'master'
      },
      {
        name: 'sources/github.com/developer/react-dashboard-v2',
        id: 'github.com/developer/react-dashboard-v2',
        repository: 'developer/react-dashboard-v2',
        defaultBranch: 'main'
      }
    ],
    nextPageToken: ''
  });
});

// 3. GET Sessions List
app.get('/api/jules/sessions', async (req: Request, res: Response) => {
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!useDemo) {
    try {
      const data = await callJulesApi('/sessions');
      const rawSessions = Array.isArray(data?.sessions) ? data.sessions : [];
      const normalizedSessions = rawSessions.map((s: any, idx: number) => ({
        ...s,
        id: s.id || (s.name ? s.name.replace(/^sessions\//, '') : `sess-${idx}`),
        title: s.title || (s.prompt ? (s.prompt.length > 50 ? s.prompt.slice(0, 47) + '...' : s.prompt) : 'Untitled Task'),
        source: s.source || '',
        startingBranch: s.startingBranch || 'main',
        state: s.state || 'IN_PROGRESS',
        createTime: s.createTime || new Date().toISOString()
      }));
      return res.json({
        sessions: normalizedSessions,
        nextPageToken: data?.nextPageToken || ''
      });
    } catch (err: any) {
      console.warn('[Jules API Proxy] List sessions error:', err);
      if (req.query.strictError === 'true') {
        return res.status(err.status || 500).json({ error: err });
      }
    }
  }

  return res.json({
    sessions: mockSessions,
    nextPageToken: ''
  });
});

// 4. POST Create New Session
app.post('/api/jules/sessions', async (req: Request, res: Response) => {
  const { prompt, source, startingBranch, title, automationMode, requirePlanApproval } = req.body;
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!prompt || !source) {
    return res.status(400).json({ error: { message: 'Missing required fields: prompt and source are required.' } });
  }

  if (!useDemo) {
    try {
      const payload = {
        prompt,
        source,
        startingBranch: startingBranch || 'main',
        title: title || prompt.slice(0, 50),
        automationMode: automationMode || 'AUTOMATION_MODE_UNSPECIFIED',
        requirePlanApproval: Boolean(requirePlanApproval)
      };
      const newSession = await callJulesApi('/sessions', 'POST', payload);
      return res.status(201).json(newSession);
    } catch (err: any) {
      console.error('[Jules API Proxy] Create session error:', err);
      return res.status(err.status || 500).json({ error: err });
    }
  }

  // Demo Session Creation
  const newId = `sess-${Date.now().toString().slice(-4)}`;
  const repoName = (source && typeof source === 'string')
    ? source.replace('sources/github.com/', '').replace('sources/', '')
    : 'workspace-repo';
  const sessionTitle = title || (prompt.length > 50 ? prompt.slice(0, 47) + '...' : prompt);

  const initialStatus = requirePlanApproval ? 'AWAITING_PLAN_APPROVAL' : 'IN_PROGRESS';

  const createdSession = {
    name: `sessions/${newId}`,
    id: newId,
    title: sessionTitle,
    prompt,
    source,
    startingBranch: startingBranch || 'main',
    automationMode: automationMode || 'AUTO_CREATE_PR',
    requirePlanApproval: Boolean(requirePlanApproval),
    state: initialStatus,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  };

  mockSessions.unshift(createdSession);

  // Generate initial activities for this mock session
  mockActivitiesMap[newId] = [
    {
      name: `sessions/${newId}/activities/act-1`,
      id: 'act-1',
      createTime: new Date().toISOString(),
      originator: 'AGENT',
      progressUpdate: {
        message: `Task started on repo ${repoName} (${startingBranch || 'main'}). Initializing Jules Agent worker...`
      }
    },
    {
      name: `sessions/${newId}/activities/act-2`,
      id: 'act-2',
      createTime: new Date(Date.now() + 1000).toISOString(),
      originator: 'AGENT',
      plan: {
        steps: [
          { id: 'step-1', title: 'Analyze target repository structure and dependencies', state: 'COMPLETED' },
          { id: 'step-2', title: `Execute prompt request: "${sessionTitle}"`, state: requirePlanApproval ? 'PENDING' : 'IN_PROGRESS' },
          { id: 'step-3', title: 'Run verification tests & formatting checks', state: 'PENDING' },
          { id: 'step-4', title: automationMode === 'AUTO_CREATE_PR' ? 'Generate GitHub Pull Request' : 'Complete task execution', state: 'PENDING' }
        ]
      }
    }
  ];

  return res.status(201).json(createdSession);
});

// 5. GET Single Session Detail
app.get('/api/jules/sessions/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!useDemo) {
    try {
      const data = await callJulesApi(`/sessions/${id}`);
      return res.json(data);
    } catch (err: any) {
      if (req.query.strictError === 'true') {
        return res.status(err.status || 500).json({ error: err });
      }
    }
  }

  const session = mockSessions.find(s => s.id === id || s.name === `sessions/${id}`);
  if (!session) {
    return res.status(404).json({ error: { message: `Session ${id} not found.` } });
  }

  return res.json(session);
});

// 6. GET Session Activities (Timeline)
app.get('/api/jules/sessions/:id/activities', async (req: Request, res: Response) => {
  const { id } = req.params;
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!useDemo) {
    try {
      const data = await callJulesApi(`/sessions/${id}/activities`);
      return res.json(data);
    } catch (err: any) {
      if (req.query.strictError === 'true') {
        return res.status(err.status || 500).json({ error: err });
      }
    }
  }

  const activities = mockActivitiesMap[id] || [];
  return res.json({ activities });
});

// 7. POST Approve Plan
app.post('/api/jules/sessions/:id/approve-plan', async (req: Request, res: Response) => {
  const { id } = req.params;
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!useDemo) {
    try {
      const data = await callJulesApi(`/sessions/${id}:approvePlan`, 'POST');
      return res.json(data);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err });
    }
  }

  const session = mockSessions.find(s => s.id === id || s.name === `sessions/${id}`);
  if (session) {
    session.state = 'IN_PROGRESS';
    session.updateTime = new Date().toISOString();
  }

  if (!mockActivitiesMap[id]) mockActivitiesMap[id] = [];
  mockActivitiesMap[id].push({
    name: `sessions/${id}/activities/act-${Date.now()}`,
    id: `act-${Date.now()}`,
    createTime: new Date().toISOString(),
    originator: 'USER',
    userMessage: {
      text: 'Approved the execution plan. Proceeding with code modifications.'
    }
  });

  mockActivitiesMap[id].push({
    name: `sessions/${id}/activities/act-${Date.now() + 1}`,
    id: `act-${Date.now() + 1}`,
    createTime: new Date(Date.now() + 1000).toISOString(),
    originator: 'AGENT',
    progressUpdate: {
      message: 'Plan approved by user. Executing step 2: Applying file changes...'
    }
  });

  return res.json({ status: 'APPROVED', session });
});

// 8. POST Send Message to Steer Agent
app.post('/api/jules/sessions/:id/send-message', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { prompt, message } = req.body;
  const textPrompt = prompt || message;
  const useDemo = !process.env.JULES_API_KEY || req.headers['x-hollow-mode'] === 'demo';

  if (!textPrompt) {
    return res.status(400).json({ error: { message: 'Message text is required.' } });
  }

  if (!useDemo) {
    try {
      const data = await callJulesApi(`/sessions/${id}:sendMessage`, 'POST', { prompt: textPrompt });
      return res.json(data);
    } catch (err: any) {
      return res.status(err.status || 500).json({ error: err });
    }
  }

  if (!mockActivitiesMap[id]) mockActivitiesMap[id] = [];

  // Add User activity
  mockActivitiesMap[id].push({
    name: `sessions/${id}/activities/act-u-${Date.now()}`,
    id: `act-u-${Date.now()}`,
    createTime: new Date().toISOString(),
    originator: 'USER',
    userMessage: {
      text: textPrompt
    }
  });

  // Add Agent response activity
  mockActivitiesMap[id].push({
    name: `sessions/${id}/activities/act-a-${Date.now()}`,
    id: `act-a-${Date.now()}`,
    createTime: new Date(Date.now() + 800).toISOString(),
    originator: 'AGENT',
    progressUpdate: {
      message: `Received instruction: "${textPrompt}". Adjusting agent plan and workspace state.`
    }
  });

  return res.json({ success: true, message: 'Message sent successfully.' });
});

// Mount Vite middleware or static serving
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`[Hollow Code] Proxy server listening at http://localhost:${port}`);
});
