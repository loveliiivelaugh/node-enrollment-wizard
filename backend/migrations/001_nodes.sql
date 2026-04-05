-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── nodes ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nodes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name         TEXT NOT NULL,
  hostname             TEXT NOT NULL,
  tailscale_device_id  TEXT NOT NULL UNIQUE,
  tailscale_name       TEXT NOT NULL,
  ssh_user             TEXT NOT NULL DEFAULT 'ubuntu',
  os                   TEXT NOT NULL DEFAULT '',
  arch                 TEXT,
  environment          TEXT NOT NULL DEFAULT 'development'
                         CHECK (environment IN ('development', 'staging', 'production')),
  roles                TEXT[]  NOT NULL DEFAULT '{}',
  capability_preset    TEXT NOT NULL DEFAULT 'observer'
                         CHECK (capability_preset IN ('observer', 'operator', 'admin', 'custom')),
  allowed_actions      TEXT[]  NOT NULL DEFAULT '{}',
  agent_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  status               TEXT NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'verified', 'unhealthy', 'offline', 'registered')),
  last_seen_at         TIMESTAMPTZ,
  registered_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata             JSONB,
  homepage_url         TEXT,
  homepage_description TEXT
);

CREATE INDEX IF NOT EXISTS idx_nodes_status              ON nodes (status);
CREATE INDEX IF NOT EXISTS idx_nodes_tailscale_device_id ON nodes (tailscale_device_id);
CREATE INDEX IF NOT EXISTS idx_nodes_environment         ON nodes (environment);

-- ─── node_capabilities ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS node_capabilities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id     UUID NOT NULL REFERENCES nodes (id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  granted_by  TEXT NOT NULL DEFAULT 'system',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_node_capabilities_node_id ON node_capabilities (node_id);

-- ─── node_enrollment_tokens ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS node_enrollment_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id     UUID NOT NULL REFERENCES nodes (id) ON DELETE CASCADE,
  token       TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollment_tokens_node_id  ON node_enrollment_tokens (node_id);
CREATE INDEX IF NOT EXISTS idx_enrollment_tokens_token    ON node_enrollment_tokens (token);

-- ─── node_heartbeats ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS node_heartbeats (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id     UUID NOT NULL REFERENCES nodes (id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  ip          TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heartbeats_node_id    ON node_heartbeats (node_id);
CREATE INDEX IF NOT EXISTS idx_heartbeats_created_at ON node_heartbeats (created_at DESC);

-- ─── node_command_logs ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS node_command_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  node_id      UUID NOT NULL REFERENCES nodes (id) ON DELETE CASCADE,
  command      TEXT NOT NULL,
  output       TEXT,
  exit_code    INTEGER,
  executed_by  TEXT NOT NULL DEFAULT 'system',
  executed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_command_logs_node_id     ON node_command_logs (node_id);
CREATE INDEX IF NOT EXISTS idx_command_logs_executed_at ON node_command_logs (executed_at DESC);
