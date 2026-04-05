import { Alert, Box, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscoveredDevices } from '../hooks/useNodeEnrollment';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import type { NormalizedDevice } from '../../../../types/nodes';

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.25 },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function Step1SelectMachine() {
  const { data: devices, isLoading, isError } = useDiscoveredDevices();
  const selectedDevice = useNodeEnrollmentStore((s) => s.selectedDevice);
  const setSelectedDevice = useNodeEnrollmentStore((s) => s.setSelectedDevice);

  function handleSelect(device: NormalizedDevice) {
    setSelectedDevice(device);
  }

  return (
    <Stack spacing={3}>
      <Alert severity="info" variant="outlined">
        Machines are discovered from Tailscale. Use this wizard to register them
        into your control plane.
      </Alert>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error">
          Failed to load devices. Check your Tailscale configuration.
        </Alert>
      )}

      <AnimatePresence>
        {devices?.map((device, i) => {
          const isSelected = selectedDevice?.id === device.id;
          return (
            <motion.div
              key={device.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Box
                onClick={() => handleSelect(device)}
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  transition: 'all 0.18s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>
                        {device.name}
                      </Typography>
                      {device.isRegistered && (
                        <Chip label="Registered" size="small" color="success" />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" fontFamily="monospace">
                      {device.hostname}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {device.ipAddresses[0] ?? '—'} · {device.os}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={device.isOnline ? 'Online' : 'Offline'}
                      size="small"
                      color={device.isOnline ? 'success' : 'default'}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(device.lastSeenAt).toLocaleString()}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {!isLoading && !isError && devices?.length === 0 && (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
          No Tailscale devices discovered.
        </Typography>
      )}
    </Stack>
  );
}
