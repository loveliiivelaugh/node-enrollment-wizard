import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import {
  RegisteredNodeSchema,
  NormalizedDeviceSchema,
  WizardFormDataSchema,
  NodeHeartbeatSchema,
} from '../types/nodes';
import { getTailscaleDevices } from '../utilities/lib/tailscale';

const nodesRoutes = new OpenAPIHono();

// ─── Mock data ─────────────────────────────────────────────────────────────────
// TODO: Replace with real DB queries using db.query() once DATABASE_URL is set.

const MOCK_NODES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    displayName: 'prod-gateway-01',
    hostname: 'prod-gateway-01',
    tailscaleDeviceId: 'ts-device-abc123',
    tailscaleName: 'prod-gateway-01.tail1234.ts.net',
    sshUser: 'ubuntu',
    os: 'linux',
    arch: 'amd64',
    environment: 'production' as const,
    roles: ['gateway'] as const,
    capabilityPreset: 'operator' as const,
    allowedActions: ['restart-service', 'deploy-app'],
    agentEnabled: true,
    status: 'verified' as const,
    lastSeenAt: new Date().toISOString(),
    registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    metadata: {},
    homepageUrl: '',
    homepageDescription: '',
  },
];

const MOCK_DEVICES = [
  {
    id: 'ts-device-abc123',
    name: 'prod-gateway-01',
    hostname: 'prod-gateway-01',
    tailscaleDnsName: 'prod-gateway-01.tail1234.ts.net',
    os: 'linux',
    tags: ['tag:server'],
    ipAddresses: ['100.64.0.1'],
    lastSeenAt: new Date().toISOString(),
    isOnline: true,
    isRegistered: true,
  },
  {
    id: 'ts-device-def456',
    name: 'dev-worker-02',
    hostname: 'dev-worker-02',
    tailscaleDnsName: 'dev-worker-02.tail1234.ts.net',
    os: 'linux',
    tags: [],
    ipAddresses: ['100.64.0.2'],
    lastSeenAt: new Date(Date.now() - 300000).toISOString(),
    isOnline: false,
    isRegistered: false,
  },
];

// ─── GET / – list registered nodes ────────────────────────────────────────────

nodesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/',
    summary: 'List all registered nodes',
    tags: ['nodes'],
    responses: {
      200: {
        description: 'Array of registered nodes',
        content: { 'application/json': { schema: z.array(RegisteredNodeSchema) } },
      },
    },
  }),
  (c) => {
    // TODO: return await db.query('SELECT * FROM nodes ORDER BY registered_at DESC')
    return c.json(MOCK_NODES);
  }
);

// ─── GET /discover – discover from Tailscale ──────────────────────────────────

nodesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/discover',
    summary: 'Discover machines from Tailscale',
    tags: ['nodes'],
    responses: {
      200: {
        description: 'Array of discovered (normalized) devices',
        content: { 'application/json': { schema: z.array(NormalizedDeviceSchema) } },
      },
    },
  }),
  async (c) => {
    const apiKey = Bun.env.TAILSCALE_API_KEY;
    const tailnet = Bun.env.TAILSCALE_TAILNET;

    if (!apiKey || !tailnet) {
      // Return mock data when not configured
      return c.json(MOCK_DEVICES);
    }

    try {
      const devices = await getTailscaleDevices(tailnet, apiKey);
      // TODO: enrich isRegistered by querying db for matching tailscaleDeviceId values
      return c.json(devices);
    } catch (err) {
      console.error('[nodes/discover] Tailscale API error:', err);
      return c.json(MOCK_DEVICES);
    }
  }
);

// ─── GET /:id – get single node ────────────────────────────────────────────────

nodesRoutes.openapi(
  createRoute({
    method: 'get',
    path: '/:id',
    summary: 'Get a single registered node',
    tags: ['nodes'],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Registered node',
        content: { 'application/json': { schema: RegisteredNodeSchema } },
      },
      404: {
        description: 'Node not found',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid('param');
    // TODO: const result = await db.query('SELECT * FROM nodes WHERE id = $1', [id]);
    const node = MOCK_NODES.find((n) => n.id === id);
    if (!node) return c.json({ error: 'Node not found' }, 404);
    return c.json(node);
  }
);

// ─── POST / – register a node ─────────────────────────────────────────────────

nodesRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/',
    summary: 'Register a new node from wizard form data',
    tags: ['nodes'],
    request: {
      body: {
        content: { 'application/json': { schema: WizardFormDataSchema } },
      },
    },
    responses: {
      201: {
        description: 'Newly registered node',
        content: { 'application/json': { schema: RegisteredNodeSchema } },
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    const device = body.selectedDevice;

    // TODO: INSERT INTO nodes (...) VALUES (...) RETURNING *
    const newNode = {
      id: crypto.randomUUID(),
      displayName: body.displayName || device?.name || 'unnamed-node',
      hostname: device?.hostname ?? '',
      tailscaleDeviceId: device?.id ?? '',
      tailscaleName: device?.tailscaleDnsName ?? '',
      sshUser: body.sshUser,
      os: device?.os ?? '',
      arch: undefined,
      environment: body.environment,
      roles: body.roles,
      capabilityPreset: body.capabilityPreset,
      allowedActions: body.allowedActions,
      agentEnabled: body.agentEnabled,
      status: 'pending' as const,
      lastSeenAt: null,
      registeredAt: new Date().toISOString(),
      metadata: {},
      homepageUrl: '',
      homepageDescription: '',
    };

    return c.json(newNode, 201);
  }
);

// ─── PATCH /:id – update node ─────────────────────────────────────────────────

nodesRoutes.openapi(
  createRoute({
    method: 'patch',
    path: '/:id',
    summary: 'Update node status or details',
    tags: ['nodes'],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: {
          'application/json': {
            schema: RegisteredNodeSchema.partial().omit({ id: true, registeredAt: true }),
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Updated node',
        content: { 'application/json': { schema: RegisteredNodeSchema } },
      },
      404: {
        description: 'Node not found',
        content: { 'application/json': { schema: z.object({ error: z.string() }) } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const updates = c.req.valid('json');
    const node = MOCK_NODES.find((n) => n.id === id);
    if (!node) return c.json({ error: 'Node not found' }, 404);
    // TODO: UPDATE nodes SET ... WHERE id = $1 RETURNING *
    return c.json({ ...node, ...updates });
  }
);

// ─── DELETE /:id – delete node ────────────────────────────────────────────────

nodesRoutes.openapi(
  createRoute({
    method: 'delete',
    path: '/:id',
    summary: 'Delete a registered node',
    tags: ['nodes'],
    request: {
      params: z.object({ id: z.string().uuid() }),
    },
    responses: {
      200: {
        description: 'Deletion confirmation',
        content: { 'application/json': { schema: z.object({ success: z.boolean() }) } },
      },
    },
  }),
  (c) => {
    // TODO: DELETE FROM nodes WHERE id = $1
    return c.json({ success: true });
  }
);

// ─── POST /:id/heartbeat ──────────────────────────────────────────────────────

const HeartbeatBodySchema = z.object({
  status: z.enum(['pending', 'verified', 'unhealthy', 'offline', 'registered']),
  ip: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

nodesRoutes.openapi(
  createRoute({
    method: 'post',
    path: '/:id/heartbeat',
    summary: 'Record a heartbeat for a node',
    tags: ['nodes'],
    request: {
      params: z.object({ id: z.string().uuid() }),
      body: {
        content: { 'application/json': { schema: HeartbeatBodySchema } },
      },
    },
    responses: {
      200: {
        description: 'Heartbeat recorded',
        content: { 'application/json': { schema: NodeHeartbeatSchema } },
      },
    },
  }),
  async (c) => {
    const { id } = c.req.valid('param');
    const body = c.req.valid('json');
    // TODO: INSERT INTO node_heartbeats (node_id, status, ip, metadata) VALUES (...)
    const heartbeat = {
      id: crypto.randomUUID(),
      nodeId: id,
      status: body.status,
      ip: body.ip,
      metadata: body.metadata,
      createdAt: new Date().toISOString(),
    };
    return c.json(heartbeat);
  }
);

export { nodesRoutes };
