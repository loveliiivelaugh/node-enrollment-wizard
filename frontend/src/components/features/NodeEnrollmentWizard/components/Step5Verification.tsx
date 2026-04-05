import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import { useVerifyNode } from '../hooks/useNodeEnrollment';
import type { VerificationChecklist } from '../../../../types/nodes';

interface CheckItem {
  key: keyof VerificationChecklist;
  label: string;
}

const CHECK_ITEMS: CheckItem[] = [
  { key: 'discoveredInTailnet', label: 'Machine discovered in Tailnet' },
  { key: 'tokenCreated', label: 'Enrollment token created' },
  { key: 'bootstrapGenerated', label: 'Bootstrap command generated' },
  { key: 'registrationCreated', label: 'Registration record created' },
  { key: 'nodeReady', label: 'Node ready' },
];

const containerVariants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

function StatusIcon({ done }: { done: boolean | undefined }) {
  if (done === true) return <span style={{ fontSize: 20 }}>✅</span>;
  if (done === false) return <span style={{ fontSize: 20 }}>⏳</span>;
  return <span style={{ fontSize: 20 }}>⏳</span>;
}

export default function Step5Verification() {
  const registeredNode = useNodeEnrollmentStore((s) => s.registeredNode);
  const verificationStatus = useNodeEnrollmentStore((s) => s.verificationStatus);
  const setVerificationStatus = useNodeEnrollmentStore((s) => s.setVerificationStatus);

  const nodeId = registeredNode?.id ?? null;
  const verifyNode = useVerifyNode(nodeId);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allDone =
    verificationStatus.registrationCreated && verificationStatus.nodeReady;

  const runCheck = useCallback(() => {
    verifyNode.mutate(undefined, {
      onSuccess: (data) => setVerificationStatus(data),
    });
  }, [verifyNode, setVerificationStatus]);

  useEffect(() => {
    if (!allDone) {
      intervalRef.current = setInterval(runCheck, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [allDone, runCheck]);

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        Waiting for the node agent to call back. This may take a moment after
        running the bootstrap command.
      </Typography>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Stack spacing={1.5}>
          {CHECK_ITEMS.map((item) => (
            <motion.div key={item.key} variants={itemVariants}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <StatusIcon done={verificationStatus[item.key]} />
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            </motion.div>
          ))}
        </Stack>
      </motion.div>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="outlined"
          onClick={runCheck}
          disabled={verifyNode.isPending}
          size="small"
        >
          {verifyNode.isPending ? <CircularProgress size={16} /> : 'Check Status'}
        </Button>
        {!allDone && (
          <Typography variant="caption" color="text.secondary">
            Auto-checking every 5s…
          </Typography>
        )}
        {allDone && (
          <Typography variant="caption" color="success.main" fontWeight={700}>
            ✓ Node is ready!
          </Typography>
        )}
      </Stack>
    </Stack>
  );
}
