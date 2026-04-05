import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NodeListTable from '../features/NodeEnrollmentWizard/components/NodeListTable';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function NodesPage() {
  const navigate = useNavigate();

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Control Plane
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h3" fontWeight={800}>
                Node Control Plane
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600 }}>
                Manage and monitor all registered machines in your distributed
                control plane. Use the enrollment wizard to onboard new nodes.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/nodes/enroll')}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Enroll New Node
            </Button>
          </Stack>
        </Box>

        <Alert severity="info" variant="outlined">
          Machine discovery is powered by Tailscale. Devices in your Tailnet
          appear automatically in the enrollment wizard.
        </Alert>

        <Box>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Registered Nodes
          </Typography>
          <NodeListTable />
        </Box>
      </Stack>
    </motion.div>
  );
}
