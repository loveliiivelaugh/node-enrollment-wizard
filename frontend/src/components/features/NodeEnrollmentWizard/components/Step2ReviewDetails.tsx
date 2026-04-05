import {
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import type { NodeRole } from '../../../../types/nodes';

const ALL_ROLES: NodeRole[] = [
  'gateway',
  'agent-host',
  'gpu',
  'frontend-host',
  'worker',
  'misc',
];

export default function Step2ReviewDetails() {
  const formData = useNodeEnrollmentStore((s) => s.formData);
  const setFormData = useNodeEnrollmentStore((s) => s.setFormData);
  const selectedDevice = useNodeEnrollmentStore((s) => s.selectedDevice);

  function toggleRole(role: NodeRole) {
    const current = formData.roles;
    const next = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setFormData({ roles: next });
  }

  return (
    <Stack spacing={3}>
      {selectedDevice && (
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Selected device
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {selectedDevice.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" fontFamily="monospace">
            {selectedDevice.tailscaleDnsName}
          </Typography>
        </Box>
      )}

      <TextField
        label="Display Name"
        value={formData.displayName}
        onChange={(e) => setFormData({ displayName: e.target.value })}
        fullWidth
        required
      />

      <TextField
        label="SSH User"
        value={formData.sshUser}
        onChange={(e) => setFormData({ sshUser: e.target.value })}
        fullWidth
        placeholder="ubuntu"
      />

      <FormControl fullWidth>
        <InputLabel>Environment</InputLabel>
        <Select
          value={formData.environment}
          label="Environment"
          onChange={(e) =>
            setFormData({
              environment: e.target.value as 'development' | 'staging' | 'production',
            })
          }
        >
          <MenuItem value="development">Development</MenuItem>
          <MenuItem value="staging">Staging</MenuItem>
          <MenuItem value="production">Production</MenuItem>
        </Select>
      </FormControl>

      <Box>
        <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
          Roles
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {ALL_ROLES.map((role) => (
            <Chip
              key={role}
              label={role}
              clickable
              onClick={() => toggleRole(role)}
              color={formData.roles.includes(role) ? 'primary' : 'default'}
              variant={formData.roles.includes(role) ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>

      <FormControlLabel
        control={
          <Switch
            checked={formData.agentEnabled}
            onChange={(e) => setFormData({ agentEnabled: e.target.checked })}
          />
        }
        label="Agent Enabled"
      />
    </Stack>
  );
}
