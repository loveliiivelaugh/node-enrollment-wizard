// Frontend TypeScript types mirroring backend Zod schemas (no Zod dependency).

export type NodeStatus = 'pending' | 'verified' | 'unhealthy' | 'offline' | 'registered';
export type NodeRole = 'gateway' | 'agent-host' | 'gpu' | 'frontend-host' | 'worker' | 'misc';
export type PermissionPreset = 'observer' | 'operator' | 'admin' | 'custom';
export type NodeEnvironment = 'development' | 'staging' | 'production';

export interface NormalizedDevice {
  id: string;
  name: string;
  hostname: string;
  tailscaleDnsName: string;
  os: string;
  tags: string[];
  ipAddresses: string[];
  lastSeenAt: string;
  isOnline: boolean;
  isRegistered: boolean;
}

export interface RegisteredNode {
  id: string;
  displayName: string;
  hostname: string;
  tailscaleDeviceId: string;
  tailscaleName: string;
  sshUser: string;
  os: string;
  arch?: string;
  environment: NodeEnvironment;
  roles: NodeRole[];
  capabilityPreset: PermissionPreset;
  allowedActions: string[];
  agentEnabled: boolean;
  status: NodeStatus;
  lastSeenAt: string | null;
  registeredAt: string;
  metadata?: Record<string, unknown>;
  homepageUrl?: string;
  homepageDescription?: string;
}

export interface NodeCapability {
  id: string;
  nodeId: string;
  action: string;
  grantedBy: string;
  createdAt: string;
}

export interface EnrollmentToken {
  id: string;
  nodeId: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface NodeHeartbeat {
  id: string;
  nodeId: string;
  status: NodeStatus;
  ip?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NodeCommandLog {
  id: string;
  nodeId: string;
  command: string;
  output?: string;
  exitCode?: number;
  executedBy: string;
  executedAt: string;
}

export interface WizardFormData {
  selectedDevice: NormalizedDevice | null;
  displayName: string;
  sshUser: string;
  environment: NodeEnvironment;
  roles: NodeRole[];
  capabilityPreset: PermissionPreset;
  allowedActions: string[];
  agentEnabled: boolean;
}

export interface VerificationChecklist {
  discoveredInTailnet: boolean;
  tokenCreated: boolean;
  bootstrapGenerated: boolean;
  registrationCreated: boolean;
  nodeReady: boolean;
}

/** Wizard step index 0-5 */
export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface WizardState {
  wizardStep: WizardStep;
  selectedDevice: NormalizedDevice | null;
  formData: WizardFormData;
  registeredNode: RegisteredNode | null;
  enrollmentToken: string | null;
  bootstrapCommand: string | null;
  verificationStatus: VerificationChecklist;
}
