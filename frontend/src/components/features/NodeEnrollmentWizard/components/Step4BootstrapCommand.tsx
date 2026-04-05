import { Alert, Box, Button, CircularProgress, Stack, Tooltip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import { useGenerateEnrollmentToken } from '../hooks/useNodeEnrollment';

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Step4BootstrapCommand() {
  const registeredNode = useNodeEnrollmentStore((s) => s.registeredNode);
  const bootstrapCommand = useNodeEnrollmentStore((s) => s.bootstrapCommand);
  const enrollmentToken = useNodeEnrollmentStore((s) => s.enrollmentToken);
  const setEnrollmentToken = useNodeEnrollmentStore((s) => s.setEnrollmentToken);
  const setBootstrapCommand = useNodeEnrollmentStore((s) => s.setBootstrapCommand);

  const generateToken = useGenerateEnrollmentToken();

  // Use a ref to track whether token generation has been initiated for the
  // current node, avoiding stale-closure issues with mutation state in the deps array.
  const tokenRequestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (registeredNode && !enrollmentToken && tokenRequestedRef.current !== registeredNode.id) {
      tokenRequestedRef.current = registeredNode.id;
      generateToken.mutate(
        { nodeId: registeredNode.id },
        {
          onSuccess: (data) => {
            setEnrollmentToken(data.token);
            setBootstrapCommand(data.bootstrapCommand);
          },
          onError: () => {
            tokenRequestedRef.current = null; // allow retry
          },
        }
      );
    }
  }, [registeredNode, enrollmentToken, generateToken, setEnrollmentToken, setBootstrapCommand]);

  function copyToClipboard() {
    if (bootstrapCommand) {
      navigator.clipboard.writeText(bootstrapCommand).catch(() => undefined);
    }
  }

  if (generateToken.isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (generateToken.isError) {
    return (
      <Alert severity="error">
        Failed to generate enrollment token. Please try again.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Alert severity="success" variant="outlined">
        Enrollment token generated. Run the command below on the target machine
        to complete enrollment.
      </Alert>

      {bootstrapCommand && (
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
      )}

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
