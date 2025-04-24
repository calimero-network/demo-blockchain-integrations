import axios from 'axios';

import {
  ApprovalsCount,
  ContextDetails,
  ContextVariables,
  ContractApi,
  ContractProposal,
  GetProposalsRequest,
  Members,
} from '../contractApi';

import { ApiResponse, getAppEndpointKey, getContextId } from '@calimero-network/calimero-client';

export class ContextApiDataSource implements ContractApi {
  async getContractProposals(
    request: GetProposalsRequest,
  ): ApiResponse<ContractProposal[]> {
    try {
      const contextId = getContextId();
      const apiEndpoint = `${getAppEndpointKey()}/admin-api/contexts/${contextId}/proposals`;
      const body = request;

      const response = await axios.post(apiEndpoint, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data ?? [],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  async getProposalApprovals(proposalId: String): ApiResponse<ApprovalsCount> {
    try {
      const contextId = getContextId();
      const apiEndpoint = `${getAppEndpointKey()}/admin-api/contexts/${contextId}/proposals/${proposalId}/approvals/users`;

      const response = await axios.get(apiEndpoint);

      return {
        data: response.data ?? [],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  async getNumOfProposals(): ApiResponse<number> {
    try {
      const contextId = getContextId();
      const apiEndpointLimit = `${getAppEndpointKey()}/admin-api/contexts/${contextId}/proposals/count`;

      const limitResponse = await axios.get(apiEndpointLimit);

      const apiEndpoint = `${getAppEndpointKey()}/admin-api/contexts/${contextId}/proposals`;
      const body = {
        offset: 0,
        limit: limitResponse.data.data,
      };

      const response = await axios.post(apiEndpoint, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        data: response.data.data.length ?? 0,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  async getContextVariables(): ApiResponse<ContextVariables[]> {
    try {
      const contextId = getContextId();
      const apiEndpoint = `${getAppEndpointKey()}/admin-api/contexts/${contextId}/proposals/context-storage-entries`;
      const body = {
        offset: 0,
        limit: 10,
      };

      const response = await axios.post(apiEndpoint, body, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.data) {
        return {
          data: [],
          error: null,
        };
      }

      // Convert both key and value from Vec<u8> to string
      const parsedData = response.data.data.map((item: any) => ({
        key: new TextDecoder().decode(new Uint8Array(item.key)),
        value: new TextDecoder().decode(new Uint8Array(item.value)),
      }));

      return {
        data: parsedData ?? [],
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
      };
    }
  }

  getContextMembers(): ApiResponse<Members[]> {
    throw new Error('Method not implemented.');
  }
  getContextMembersCount(): ApiResponse<number> {
    throw new Error('Method not implemented.');
  }

  getContextDetails(contextId: String): ApiResponse<ContextDetails> {
    throw new Error('Method not implemented.');
  }
  
  deleteProposal(proposalId: string): ApiResponse<void> {
    throw new Error('Method not implemented.');
  }
}
