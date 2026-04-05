import { Box, Card, CardContent, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import type { PermissionPreset } from '../../../../types/nodes';

const PRESETS: {
  id: PermissionPreset;
  title: string;
  description: string;
  actions: string[];
}[] = [
  {
    id: 'observer',
    title: 'Observer',
    description: 'Read-only access: health checks, logs, and status reads.',
    actions: ['read-health', 'read-logs', 'read-status'],
  },
  {
    id: 'operator',
    title: 'Operator',
    description: 'Observer + ability to restart services and deploy apps.',
    actions: ['read-health', 'read-logs', 'read-status', 'restart-service', 'deploy-app'],
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Operator + arbitrary command execution on the node.',
    actions: ['read-health', 'read-logs', 'read-status', 'restart-service', 'deploy-app', 'exec-command'],
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Select individual capabilities explicitly.',
    actions: [],
  },
];

const ALL_CAPABILITIES = [
  'read-health',
  'read-logs',
  'read-status',
  'restart-service',
  'deploy-app',
  'exec-command',
  'read-secrets',
  'write-config',
];

const cardVariants = {
  rest: { scale: 1, boxShadow: '0 0 0 2px transparent' },
  hover: { scale: 1.02, transition: { duration: 0.15 } },
};

export default function Step3Permissions() {
  const formData = useNodeEnrollmentStore((s) => s.formData);
  const setFormData = useNodeEnrollmentStore((s) => s.setFormData);

  function selectPreset(preset: PermissionPreset) {
    const actions = PRESETS.find((p) => p.id === preset)?.actions ?? [];
    setFormData({ capabilityPreset: preset, allowedActions: actions });
  }

  function toggleAction(action: string) {
    const current = formData.allowedActions;
    const next = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setFormData({ allowedActions: next });
  }

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Choose a permission preset for this node. You can customise individual
        capabilities with the Custom option.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {PRESETS.map((preset) => {
          const isSelected = formData.capabilityPreset === preset.id;
          return (
            <motion.div
              key={preset.id}
              variants={cardVariants}
              initial="rest"
              whileHover="hover"
              animate="rest"
            >
              <Card
                onClick={() => selectPreset(preset.id)}
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderWidth: isSelected ? 2 : 1,
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  transition: 'border-color 0.15s, background-color 0.15s',
                  height: '100%',
                }}
              >
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                    {preset.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {preset.description}
                  </Typography>
                  {preset.actions.length > 0 && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 1, display: 'block', fontFamily: 'monospace' }}
                    >
                      {preset.actions.join(', ')}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </Box>

      {formData.capabilityPreset === 'custom' && (
        <Box
          sx={{
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Select Capabilities
          </Typography>
          <Stack>
            {ALL_CAPABILITIES.map((action) => (
              <FormControlLabel
                key={action}
                control={
                  <Checkbox
                    checked={formData.allowedActions.includes(action)}
                    onChange={() => toggleAction(action)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="body2" fontFamily="monospace">
                    {action}
                  </Typography>
                }
              />
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );
}
