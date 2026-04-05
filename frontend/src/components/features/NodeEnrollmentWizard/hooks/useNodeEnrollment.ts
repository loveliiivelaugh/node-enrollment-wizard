import { useQuery, useMutation } from '@tanstack/react-query';
import { client } from '@api/index';
import type {
  NormalizedDevice,
  RegisteredNode,
  WizardFormData,
  VerificationChecklist,
} from '../../../../types/nodes';

interface GenerateTokenResponse {
  token: string;
  expiresAt: string;
  bootstrapCommand: string;
}

export function useDiscoveredDevices() {
  return useQuery<NormalizedDevice[]>({
    queryKey: ['nodes', 'discover'],
    queryFn: async () => {
      const res = await client.get<NormalizedDevice[]>('/api/v1/nodes/discover');
      return res.data;
    },
  });
}

export function useRegisteredNodes() {
  return useQuery<RegisteredNode[]>({
    queryKey: ['nodes'],
    queryFn: async () => {
      const res = await client.get<RegisteredNode[]>('/api/v1/nodes');
      return res.data;
    },
  });
}

export function useRegisterNode() {
  return useMutation<RegisteredNode, Error, WizardFormData>({
    mutationFn: async (formData) => {
      const res = await client.post<RegisteredNode>('/api/v1/nodes', formData);
      return res.data;
    },
  });
}

export function useGenerateEnrollmentToken() {
  return useMutation<GenerateTokenResponse, Error, { nodeId: string }>({
    mutationFn: async (payload) => {
      const res = await client.post<GenerateTokenResponse>(
        '/api/v1/enrollment/tokens',
        payload
      );
      return res.data;
    },
  });
}

export function useVerifyNode(nodeId: string | null) {
  return useMutation<VerificationChecklist, Error, void>({
    mutationFn: async () => {
      if (!nodeId) throw new Error('No nodeId provided');
      const res = await client.post<VerificationChecklist>(
        `/api/v1/enrollment/verify/${nodeId}`
      );
      return res.data;
    },
  });
}
