import { z } from '@hono/zod-openapi';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const NodeStatusSchema = z
  .enum(['pending', 'verified', 'unhealthy', 'offline', 'registered'])
  .openapi({ description: 'Lifecycle status of the node' });

export const NodeRoleSchema = z
  .enum(['gateway', 'agent-host', 'gpu', 'frontend-host', 'worker', 'misc'])
  .openapi({ description: 'Functional role of the node' });

export const PermissionPresetSchema = z
  .enum(['observer', 'operator', 'admin', 'custom'])
  .openapi({ description: 'Permission preset applied to this node' });

export type NodeStatus = z.infer<typeof NodeStatusSchema>;
export type NodeRole = z.infer<typeof NodeRoleSchema>;
export type PermissionPreset = z.infer<typeof PermissionPresetSchema>;

// ─── Tailscale API shape (raw) ────────────────────────────────────────────────

export const DiscoveredDeviceSchema = z
  .object({
    id: z.string().openapi({ description: 'Tailscale device ID' }),
    name: z.string().openapi({ description: 'Display name' }),
    hostname: z.string().openapi({ description: 'Hostname' }),
    dnsName: z.string().openapi({ description: 'Tailscale DNS name' }),
    os: z.string().openapi({ description: 'Operating system' }),
    tags: z.array(z.string()).optional().openapi({ description: 'Tailscale ACL tags' }),
    addresses: z.array(z.string()).openapi({ description: 'IP addresses' }),
    lastSeen: z.string().openapi({ description: 'ISO 8601 last seen timestamp' }),
    online: z.boolean().openapi({ description: 'Whether device is online' }),
  })
  .openapi('DiscoveredDevice');

export type DiscoveredDevice = z.infer<typeof DiscoveredDeviceSchema>;

// ─── Normalized internal shape ────────────────────────────────────────────────

export const NormalizedDeviceSchema = z
  .object({
    id: z.string().openapi({ description: 'Tailscale device ID' }),
    name: z.string().openapi({ description: 'Display name' }),
    hostname: z.string().openapi({ description: 'Hostname' }),
    tailscaleDnsName: z.string().openapi({ description: 'Tailscale DNS name' }),
    os: z.string().openapi({ description: 'Operating system' }),
    tags: z.array(z.string()).openapi({ description: 'ACL tags' }),
    ipAddresses: z.array(z.string()).openapi({ description: 'IP addresses' }),
    lastSeenAt: z.string().openapi({ description: 'ISO 8601 last seen timestamp' }),
    isOnline: z.boolean().openapi({ description: 'Whether device is online' }),
    isRegistered: z.boolean().openapi({ description: 'Whether device has been registered in the control plane' }),
  })
  .openapi('NormalizedDevice');

export type NormalizedDevice = z.infer<typeof NormalizedDeviceSchema>;

// ─── Registered node (DB record) ─────────────────────────────────────────────

export const RegisteredNodeSchema = z
  .object({
    id: z.string().uuid().openapi({ description: 'Control-plane node UUID' }),
    displayName: z.string().openapi({ description: 'Human-readable node name' }),
    hostname: z.string().openapi({ description: 'Machine hostname' }),
    tailscaleDeviceId: z.string().openapi({ description: 'Tailscale device ID' }),
    tailscaleName: z.string().openapi({ description: 'Tailscale node name' }),
    sshUser: z.string().openapi({ description: 'SSH user for agent access' }),
    os: z.string().openapi({ description: 'Operating system' }),
    arch: z.string().optional().openapi({ description: 'CPU architecture' }),
    environment: z.enum(['development', 'staging', 'production']).openapi({ description: 'Deployment environment' }),
    roles: z.array(NodeRoleSchema).openapi({ description: 'Node roles' }),
    capabilityPreset: PermissionPresetSchema,
    allowedActions: z.array(z.string()).openapi({ description: 'Explicitly allowed action strings' }),
    agentEnabled: z.boolean().openapi({ description: 'Whether agent is installed and enabled' }),
    status: NodeStatusSchema,
    lastSeenAt: z.string().nullable().openapi({ description: 'ISO 8601 last heartbeat timestamp' }),
    registeredAt: z.string().openapi({ description: 'ISO 8601 registration timestamp' }),
    metadata: z.record(z.unknown()).optional().openapi({ description: 'Arbitrary metadata' }),
    homepageUrl: z.string().optional().openapi({ description: 'Homepage URL for this node' }),
    homepageDescription: z.string().optional().openapi({ description: 'Short description shown on homepage' }),
  })
  .openapi('RegisteredNode');

export type RegisteredNode = z.infer<typeof RegisteredNodeSchema>;

// ─── Capabilities ─────────────────────────────────────────────────────────────

export const NodeCapabilitySchema = z
  .object({
    id: z.string().uuid(),
    nodeId: z.string().uuid(),
    action: z.string().openapi({ description: 'Capability action string, e.g. restart-service' }),
    grantedBy: z.string().openapi({ description: 'User or system that granted this capability' }),
    createdAt: z.string(),
  })
  .openapi('NodeCapability');

export type NodeCapability = z.infer<typeof NodeCapabilitySchema>;

// ─── Enrollment token ─────────────────────────────────────────────────────────

export const EnrollmentTokenSchema = z
  .object({
    id: z.string().uuid(),
    nodeId: z.string().uuid(),
    token: z.string(),
    expiresAt: z.string(),
    usedAt: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi('EnrollmentToken');

export type EnrollmentToken = z.infer<typeof EnrollmentTokenSchema>;

// ─── Heartbeat ────────────────────────────────────────────────────────────────

export const NodeHeartbeatSchema = z
  .object({
    id: z.string().uuid(),
    nodeId: z.string().uuid(),
    status: NodeStatusSchema,
    ip: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    createdAt: z.string(),
  })
  .openapi('NodeHeartbeat');

export type NodeHeartbeat = z.infer<typeof NodeHeartbeatSchema>;

// ─── Command log ──────────────────────────────────────────────────────────────

export const NodeCommandLogSchema = z
  .object({
    id: z.string().uuid(),
    nodeId: z.string().uuid(),
    command: z.string(),
    output: z.string().optional(),
    exitCode: z.number().optional(),
    executedBy: z.string(),
    executedAt: z.string(),
  })
  .openapi('NodeCommandLog');

export type NodeCommandLog = z.infer<typeof NodeCommandLogSchema>;

// ─── Wizard form data ─────────────────────────────────────────────────────────

export const WizardFormDataSchema = z
  .object({
    selectedDevice: NormalizedDeviceSchema.nullable(),
    displayName: z.string(),
    sshUser: z.string(),
    environment: z.enum(['development', 'staging', 'production']),
    roles: z.array(NodeRoleSchema),
    capabilityPreset: PermissionPresetSchema,
    allowedActions: z.array(z.string()),
    agentEnabled: z.boolean(),
  })
  .openapi('WizardFormData');

export type WizardFormData = z.infer<typeof WizardFormDataSchema>;

// ─── Verification checklist ───────────────────────────────────────────────────

export const VerificationChecklistSchema = z
  .object({
    discoveredInTailnet: z.boolean(),
    tokenCreated: z.boolean(),
    bootstrapGenerated: z.boolean(),
    registrationCreated: z.boolean(),
    nodeReady: z.boolean(),
  })
  .openapi('VerificationChecklist');

export type VerificationChecklist = z.infer<typeof VerificationChecklistSchema>;
