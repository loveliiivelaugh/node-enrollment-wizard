import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { VerificationChecklistSchema } from '../types/nodes';

const enrollmentRoutes = new OpenAPIHono();

// ─── Helper: generate a short secure token ───────────────────────────────────

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── In-memory store (mock) ───────────────────────────────────────────────────
// TODO: Replace with DB queries using node_enrollment_tokens table.

interface MockToken {
  id: string;
  nodeId: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

const TOKEN_STORE: MockToken[] = [];

// ─── POST /tokens – generate enrollment token ─────────────────────────────────

const GenerateTokenBodySchema = z.object({
  nodeId: z.string().openapi({ description: 'Control-plane node UUID' }),
});

const GenerateTokenResponseSchema = z.object({
  token: z.string(),
  expiresAt: z.string(),
  bootstrapCommand: z.string(),
});

enrollmentRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/tokens',
    summary: 'Generate an enrollment token for a node',
    tags: ['enrollment'],
    request: {
      body: {
        content: { 'application/json': { schema: GenerateTokenBodySchema } },
      },
    },
    responses: {
      201: {
        description: 'Generated enrollment token with bootstrap command',
        content: { 'application/json': { schema: GenerateTokenResponseSchema } },
      },
    },
  }),
  async (c) => {
    const { nodeId } = c.req.valid('json');
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    // TODO: INSERT INTO node_enrollment_tokens (node_id, token, expires_at) VALUES (...)
    TOKEN_STORE.push({
      id: crypto.randomUUID(),
      nodeId,
      token,
      expiresAt,
      usedAt: null,
      createdAt: new Date().toISOString(),
    });

    const bootstrapCommand = `curl -fsSL https://your-control-plane.internal/enroll.sh | ENROLLMENT_TOKEN=${token} NODE_ID=${nodeId} bash`;

    return c.json({ token, expiresAt, bootstrapCommand }, 201);
  }
);

// ─── GET /tokens/:nodeId – active tokens for a node ──────────────────────────

const TokenListItemSchema = z.object({
  id: z.string(),
  nodeId: z.string(),
  token: z.string(),
  expiresAt: z.string(),
  usedAt: z.string().nullable(),
  createdAt: z.string(),
});

enrollmentRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/tokens/:nodeId',
    summary: 'Get active enrollment tokens for a node',
    tags: ['enrollment'],
    request: {
      params: z.object({ nodeId: z.string() }),
    },
    responses: {
      200: {
        description: 'List of active enrollment tokens',
        content: { 'application/json': { schema: z.array(TokenListItemSchema) } },
      },
    },
  }),
  (c) => {
    const { nodeId } = c.req.valid('param');
    // TODO: SELECT * FROM node_enrollment_tokens WHERE node_id = $1 AND used_at IS NULL AND expires_at > NOW()
    const tokens = TOKEN_STORE.filter((t) => t.nodeId === nodeId && t.usedAt === null);
    return c.json(tokens);
  }
);

// ─── POST /verify/:nodeId – run verification checks ──────────────────────────

enrollmentRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/verify/:nodeId',
    summary: 'Run verification checks for a node enrollment',
    tags: ['enrollment'],
    request: {
      params: z.object({ nodeId: z.string() }),
    },
    responses: {
      200: {
        description: 'Verification checklist results',
        content: { 'application/json': { schema: VerificationChecklistSchema } },
      },
    },
  }),
  (c) => {
    const { nodeId } = c.req.valid('param');

    // TODO: Run real checks:
    //   discoveredInTailnet  → query Tailscale API
    //   tokenCreated         → SELECT FROM node_enrollment_tokens
    //   registrationCreated  → SELECT FROM nodes WHERE id = nodeId
    //   nodeReady            → ping agent or check heartbeat table

    const hasToken = TOKEN_STORE.some((t) => t.nodeId === nodeId);

    const checklist = {
      discoveredInTailnet: true,     // mock: assume discovered
      tokenCreated: hasToken,
      bootstrapGenerated: hasToken,
      registrationCreated: false,    // mock: pending until agent calls in
      nodeReady: false,
    };

    return c.json(checklist);
  }
);

// ─── GET /status/:nodeId – get current verification status ───────────────────

enrollmentRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/status/:nodeId',
    summary: 'Get current verification status for a node',
    tags: ['enrollment'],
    request: {
      params: z.object({ nodeId: z.string() }),
    },
    responses: {
      200: {
        description: 'Verification checklist',
        content: { 'application/json': { schema: VerificationChecklistSchema } },
      },
    },
  }),
  (c) => {
    const { nodeId } = c.req.valid('param');
    // TODO: derive status from DB heartbeats + token table
    const hasToken = TOKEN_STORE.some((t) => t.nodeId === nodeId);

    return c.json({
      discoveredInTailnet: true,
      tokenCreated: hasToken,
      bootstrapGenerated: hasToken,
      registrationCreated: false,
      nodeReady: false,
    });
  }
);

export { enrollmentRoutes };
