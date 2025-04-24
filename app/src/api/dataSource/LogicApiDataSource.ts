import {
  ApiResponse,
  getAppEndpointKey,
  getAuthConfig,
  handleRpcError,
  JsonRpcClient,
  RpcError,
  RpcQueryParams,
  WsSubscriptionsClient,
} from '@calimero-network/calimero-client';

import {
  ApproveProposalRequest,
  ApproveProposalResponse,
  ClientApi,
  ClientMethod,
  CreateProposalRequest,
  CreateProposalResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
  SendProposalMessageResponse,
} from '../clientApi';

export function getJsonRpcClient() {
  const appEndpointKey = getAppEndpointKey();
  if (!appEndpointKey) {
    throw new Error(
      'Application endpoint key is missing. Please check your configuration.',
    );
  }
  return new JsonRpcClient(appEndpointKey, '/jsonrpc');
}

export function getWsSubscriptionsClient() {
  const appEndpointKey = getAppEndpointKey();
  if (!appEndpointKey) {
    throw new Error(
      'Application endpoint key is missing. Please check your configuration.',
    );
  }
  return new WsSubscriptionsClient(appEndpointKey, '/ws');
}

const RequestHeaders = {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
};

export class LogicApiDataSource implements ClientApi {
  private async handleError(
    error: RpcError,
    params: any,
    callbackFunction: any,
  ) {
    if (error && error.code) {
      const response = await handleRpcError(error, getAppEndpointKey);
      if (response.code === 403) {
        return await callbackFunction(params);
      }
      return {
        error: await handleRpcError(error, getAppEndpointKey),
      };
    }
  }

  async createProposal(
    request: CreateProposalRequest,
  ): ApiResponse<CreateProposalResponse> {
    try {
      const config = getAuthConfig();

      if (!config || !config.contextId || !config.executorPublicKey) {
        return {
          data: null,
          error: {
            code: 500,
            message: 'Authentication configuration not found',
          },
        };
      }

      const params: RpcQueryParams<typeof request> = {
        contextId: config.contextId,
        method: ClientMethod.CREATE_PROPOSAL,
        argsJson: request,
        executorPublicKey: config.executorPublicKey,
      };

      const response = await getJsonRpcClient().execute<
        typeof request,
        CreateProposalResponse
      >(params, RequestHeaders);

      if (response?.error) {
        console.error('RPC error:', response.error);
        return await this.handleError(response.error, {}, this.createProposal);
      }

      if (!response?.result?.output) {
        console.error('Invalid response format:', response);
        return {
          error: { message: 'Invalid response format', code: 500 },
          data: null,
        };
      }

      return {
        data: response.result.output as CreateProposalResponse,
        error: null,
      };
    } catch (error) {
      console.error('createProposal failed:', error);
      let errorMessage = 'An unexpected error occurred during createProposal';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async approveProposal(
    request: ApproveProposalRequest,
  ): ApiResponse<ApproveProposalResponse> {
    try {
      const config = getAuthConfig();

      if (!config || !config.contextId || !config.executorPublicKey) {
        return {
          data: null,
          error: {
            code: 500,
            message: 'Authentication configuration not found',
          },
        };
      }

      const params: RpcQueryParams<ApproveProposalRequest> = {
        contextId: config.contextId,
        method: ClientMethod.APPROVE_PROPOSAL,
        argsJson: request,
        executorPublicKey: config.executorPublicKey,
      };

      const response = await getJsonRpcClient().execute<
        ApproveProposalRequest,
        ApproveProposalResponse
      >(params, RequestHeaders);

      if (response?.error) {
        return await this.handleError(response.error, {}, this.approveProposal);
      }

      return {
        data: {},
        error: null,
      };
    } catch (error) {
      console.error('approveProposal failed:', error);
      let errorMessage = 'An unexpected error occurred during approveProposal';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async getProposalMessages(
    request: GetProposalMessagesRequest,
  ): ApiResponse<GetProposalMessagesResponse> {
    try {
      const config = getAuthConfig();

      if (!config || !config.contextId || !config.executorPublicKey) {
        return {
          data: null,
          error: {
            code: 500,
            message: 'Authentication configuration not found',
          },
        };
      }

      const params: RpcQueryParams<GetProposalMessagesRequest> = {
        contextId: config.contextId,
        method: ClientMethod.GET_PROPOSAL_MESSAGES,
        argsJson: request,
        executorPublicKey: config.executorPublicKey,
      };

      const response = await getJsonRpcClient().execute<
        GetProposalMessagesRequest,
        GetProposalMessagesResponse
      >(params, RequestHeaders);

      if (response?.error) {
        return await this.handleError(
          response.error,
          {},
          this.getProposalMessages,
        );
      }

      let getProposalsResponse: GetProposalMessagesResponse = {
        messages: response?.result?.output?.messages,
      } as GetProposalMessagesResponse;

      return {
        data: getProposalsResponse,
        error: null,
      };
    } catch (error) {
      console.error('getProposalMessages failed:', error);
      let errorMessage =
        'An unexpected error occurred during getProposalMessages';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }
  async sendProposalMessage(
    request: SendProposalMessageRequest,
  ): ApiResponse<SendProposalMessageResponse> {
    try {
      const config = getAuthConfig();

      if (!config || !config.contextId || !config.executorPublicKey) {
        return {
          data: null,
          error: {
            code: 500,
            message: 'Authentication configuration not found',
          },
        };
      }

      const response = await getJsonRpcClient().execute<
        SendProposalMessageRequest,
        SendProposalMessageResponse
      >(
        {
          contextId: config.contextId,
          method: ClientMethod.SEND_PROPOSAL_MESSAGE,
          argsJson: request,
          executorPublicKey: config.executorPublicKey,
        },
        RequestHeaders,
      );
      if (response?.error) {
        return await this.handleError(
          response.error,
          {},
          this.sendProposalMessage,
        );
      }

      return {
        data: {},
        error: null,
      };
    } catch (error) {
      console.error('sendProposalMessage failed:', error);
      let errorMessage =
        'An unexpected error occurred during sendProposalMessage';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      return {
        error: {
          code: 500,
          message: errorMessage,
        },
      };
    }
  }

  async deleteProposal(proposalId: string): ApiResponse<void> {
    throw new Error('Method not implemented.');
  }
}
