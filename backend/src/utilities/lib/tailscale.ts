import type { NormalizedDevice } from '../../types/nodes';

interface TailscaleDevicesResponse {
  devices: TailscaleRawDevice[];
}

interface TailscaleRawDevice {
  id: string;
  name: string;
  hostname: string;
  dnsName: string;
  os: string;
  tags?: string[];
  addresses?: string[];
  lastSeen: string;
  online?: boolean;
}

/**
 * Fetch and normalize devices from the Tailscale v2 API.
 * Returns an empty array if the request fails.
 */
export async function getTailscaleDevices(
  tailnet: string,
  apiKey: string
): Promise<NormalizedDevice[]> {
  const url = `https://api.tailscale.com/api/v2/tailnet/${encodeURIComponent(tailnet)}/devices`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Tailscale API error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as TailscaleDevicesResponse;

  return (data.devices ?? []).flatMap((device) => {
    const normalized = normalizeDevice(device);
    return normalized ? [normalized] : [];
  });
}

function normalizeDevice(device: TailscaleRawDevice): NormalizedDevice | null {
  // Skip devices without critical identifying fields
  if (!device.id || !device.hostname || !device.dnsName) {
    console.warn('[tailscale] Skipping device with missing critical fields:', device);
    return null;
  }

  return {
    id: device.id,
    name: device.name || device.hostname,
    hostname: device.hostname,
    tailscaleDnsName: device.dnsName,
    os: device.os ?? 'unknown',
    tags: device.tags ?? [],
    ipAddresses: device.addresses ?? [],
    lastSeenAt: device.lastSeen ?? new Date().toISOString(),
    isOnline: device.online ?? false,
    isRegistered: false, // enriched downstream by comparing against DB
  };
}
