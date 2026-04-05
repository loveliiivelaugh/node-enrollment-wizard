import { create } from 'zustand';
import type {
  NormalizedDevice,
  RegisteredNode,
  WizardFormData,
  WizardStep,
  VerificationChecklist,
} from '../../types/nodes';

const DEFAULT_FORM_DATA: WizardFormData = {
  selectedDevice: null,
  displayName: '',
  sshUser: 'ubuntu',
  environment: 'development',
  roles: [],
  capabilityPreset: 'observer',
  allowedActions: [],
  agentEnabled: false,
};

const DEFAULT_VERIFICATION: VerificationChecklist = {
  discoveredInTailnet: false,
  tokenCreated: false,
  bootstrapGenerated: false,
  registrationCreated: false,
  nodeReady: false,
};

interface NodeEnrollmentState {
  wizardStep: WizardStep;
  selectedDevice: NormalizedDevice | null;
  formData: WizardFormData;
  registeredNode: RegisteredNode | null;
  enrollmentToken: string | null;
  bootstrapCommand: string | null;
  verificationStatus: VerificationChecklist;

  setWizardStep: (step: WizardStep) => void;
  setSelectedDevice: (device: NormalizedDevice | null) => void;
  setFormData: (data: Partial<WizardFormData>) => void;
  setRegisteredNode: (node: RegisteredNode | null) => void;
  setEnrollmentToken: (token: string | null) => void;
  setBootstrapCommand: (command: string | null) => void;
  setVerificationStatus: (status: VerificationChecklist) => void;
  resetWizard: () => void;
}

const useNodeEnrollmentStore = create<NodeEnrollmentState>((set) => ({
  wizardStep: 0,
  selectedDevice: null,
  formData: DEFAULT_FORM_DATA,
  registeredNode: null,
  enrollmentToken: null,
  bootstrapCommand: null,
  verificationStatus: DEFAULT_VERIFICATION,

  setWizardStep: (step) => set({ wizardStep: step }),
  setSelectedDevice: (device) =>
    set((state) => ({
      selectedDevice: device,
      formData: {
        ...state.formData,
        selectedDevice: device,
        displayName: device?.name ?? state.formData.displayName,
      },
    })),
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  setRegisteredNode: (node) => set({ registeredNode: node }),
  setEnrollmentToken: (token) => set({ enrollmentToken: token }),
  setBootstrapCommand: (command) => set({ bootstrapCommand: command }),
  setVerificationStatus: (status) => set({ verificationStatus: status }),
  resetWizard: () =>
    set({
      wizardStep: 0,
      selectedDevice: null,
      formData: DEFAULT_FORM_DATA,
      registeredNode: null,
      enrollmentToken: null,
      bootstrapCommand: null,
      verificationStatus: DEFAULT_VERIFICATION,
    }),
}));

export { useNodeEnrollmentStore };
export type { NodeEnrollmentState };
