import { Alert, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Step4BootstrapCommand() {
  const bootstrapCommand = useNodeEnrollmentStore((s) => s.bootstrapCommand);
  const enrollmentToken = useNodeEnrollmentStore((s) => s.enrollmentToken);

  function copyToClipboard() {
    if (bootstrapCommand) {
      navigator.clipboard.writeText(bootstrapCommand).catch(() => undefined);
    }
  }

  if (!bootstrapCommand) {
    return (
      <Alert severity="warning">
        No bootstrap command available. Please go back and complete registration.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Alert severity="success" variant="outlined">
        Enrollment token generated. Run the command below on the target machine
        to complete enrollment.
      </Alert>

      <motion.div variants={fadeIn} initial="hidden" animate="visible">
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'grey.900',
            border: '1px solid',
            borderColor: 'grey.800',
            overflowX: 'auto',
          }}
        >
          <Typography
            component="pre"
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: 'success.light',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              m: 0,
            }}
          >
            {bootstrapCommand}
          </Typography>
        </Box>
      </motion.div>

      <Stack direction="row" spacing={2} alignItems="center">
        <Tooltip title="Copy bootstrap command">
          <Button variant="contained" onClick={copyToClipboard} size="small">
            Copy to clipboard
          </Button>
        </Tooltip>
        {enrollmentToken && (
          <Typography variant="caption" color="text.secondary">
            Token expires in 1 hour.
          </Typography>
        )}
      </Stack>

      <Alert severity="info" variant="outlined">
        Run this command on the target machine to complete enrollment. The agent
        will call back to this control plane automatically.
      </Alert>
    </Stack>
  );
}
