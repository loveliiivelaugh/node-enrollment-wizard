import { Chip } from '@mui/material';
import type { NodeStatus } from '../../../../types/nodes';

interface NodeStatusChipProps {
  status: NodeStatus;
}

const STATUS_CONFIG: Record<NodeStatus, { label: string; color: 'success' | 'warning' | 'error' | 'default' }> = {
  verified: { label: 'Verified', color: 'success' },
  registered: { label: 'Registered', color: 'success' },
  pending: { label: 'Pending', color: 'warning' },
  unhealthy: { label: 'Unhealthy', color: 'error' },
  offline: { label: 'Offline', color: 'error' },
};

export default function NodeStatusChip({ status }: NodeStatusChipProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'default' as const };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 600, textTransform: 'capitalize' }}
    />
  );
}
