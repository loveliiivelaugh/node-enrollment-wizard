import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useNodeEnrollmentStore } from '@store/nodeEnrollmentStore';
import { useRegisterNode, useGenerateEnrollmentToken } from './hooks/useNodeEnrollment';
import Step1SelectMachine from './components/Step1SelectMachine';
import Step2ReviewDetails from './components/Step2ReviewDetails';
import Step3Permissions from './components/Step3Permissions';
import Step4BootstrapCommand from './components/Step4BootstrapCommand';
import Step5Verification from './components/Step5Verification';
import Step6Complete from './components/Step6Complete';
import type { WizardStep } from '../../../types/nodes';

const STEP_LABELS = [
  'Select Machine',
  'Review Details',
  'Set Permissions',
  'Bootstrap Command',
  'Verify',
  'Complete',
];

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  0: Step1SelectMachine,
  1: Step2ReviewDetails,
  2: Step3Permissions,
  3: Step4BootstrapCommand,
  4: Step5Verification,
  5: Step6Complete,
};

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  }),
};

export default function NodeEnrollmentWizardPage() {
  const wizardStep = useNodeEnrollmentStore((s) => s.wizardStep);
  const setWizardStep = useNodeEnrollmentStore((s) => s.setWizardStep);
  const selectedDevice = useNodeEnrollmentStore((s) => s.selectedDevice);
  const formData = useNodeEnrollmentStore((s) => s.formData);
  const setRegisteredNode = useNodeEnrollmentStore((s) => s.setRegisteredNode);
  const setEnrollmentToken = useNodeEnrollmentStore((s) => s.setEnrollmentToken);
  const setBootstrapCommand = useNodeEnrollmentStore((s) => s.setBootstrapCommand);

  const registerNode = useRegisterNode();
  const generateToken = useGenerateEnrollmentToken();

  const isLoading = registerNode.isPending || generateToken.isPending;
  const isLastStep = wizardStep === 5;
  const isFirstStep = wizardStep === 0;

  function canProceed(): boolean {
    if (wizardStep === 0) return selectedDevice !== null;
    if (wizardStep === 1) return formData.displayName.trim().length > 0;
    return true;
  }

  async function handleNext() {
    if (!canProceed()) return;

    // On step 2→3 (Permissions → Bootstrap): register node then generate token
    if (wizardStep === 2) {
      try {
        const node = await registerNode.mutateAsync(formData);
        setRegisteredNode(node);
        const tokenData = await generateToken.mutateAsync({ nodeId: node.id });
        setEnrollmentToken(tokenData.token);
        setBootstrapCommand(tokenData.bootstrapCommand);
      } catch {
        return; // stay on step if any async step fails
      }
    }

    setWizardStep((wizardStep + 1) as WizardStep);
  }

  function handleBack() {
    if (!isFirstStep) {
      setWizardStep((wizardStep - 1) as WizardStep);
    }
  }

  const StepComponent = STEP_COMPONENTS[wizardStep];

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={800}>
          Enroll Node
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Register a new machine from your Tailscale network into the control plane.
        </Typography>
      </Box>

      <Stepper activeStep={wizardStep} alternativeLabel>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, minHeight: 320, overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={wizardStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {StepComponent && <StepComponent />}
          </motion.div>
        </AnimatePresence>
      </Paper>

      {!isLastStep && (
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={isFirstStep || isLoading}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={!canProceed() || isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {wizardStep === 2 ? 'Register & Continue' : 'Next'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
