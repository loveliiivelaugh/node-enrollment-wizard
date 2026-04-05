import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import NodeStatusChip from './NodeStatusChip';

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

export default function Step6Complete() {
  const navigate = useNavigate();
  const registeredNode = useNodeEnrollmentStore((s) => s.registeredNode);
  const resetWizard = useNodeEnrollmentStore((s) => s.resetWizard);

  function handleViewAll() {
    navigate('/nodes');
  }

  function handleEnrollAnother() {
    resetWizard();
  }

  return (
    <Stack spacing={3} alignItems="center">
      <motion.div variants={scaleIn} initial="hidden" animate="visible">
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h2" sx={{ mb: 1 }}>
            🎉
          </Typography>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Enrollment Complete!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your node has been successfully enrolled in the control plane.
          </Typography>
        </Box>
      </motion.div>

      {registeredNode && (
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          style={{ width: '100%', maxWidth: 480 }}
        >
          <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    {registeredNode.displayName}
                  </Typography>
                  <NodeStatusChip status={registeredNode.status} />
                </Stack>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hostname
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {registeredNode.hostname}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Environment
                  </Typography>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {registeredNode.environment}
                  </Typography>
                </Box>

                {registeredNode.roles.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Roles
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {registeredNode.roles.map((role) => (
                        <Chip key={role} label={role} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Box>
                )}

                {registeredNode.allowedActions.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                      Capabilities
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {registeredNode.allowedActions.map((action) => (
                        <Chip
                          key={action}
                          label={action}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleViewAll}>
          View All Nodes
        </Button>
        <Button variant="outlined" onClick={handleEnrollAnother}>
          Enroll Another
        </Button>
      </Stack>
    </Stack>
  );
}
