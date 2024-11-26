import {
  ApiResponse,
  JsonRpcClient,
  RequestConfig,
  WsSubscriptionsClient,
  RpcError,
  handleRpcError,
  RpcQueryParams,
} from '@calimero-is-near/calimero-p2p-sdk';
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
import { getContextId, getNodeUrl } from '../../utils/node';
import {
  getJWTObject,
  getStorageAppEndpointKey,
  JsonWebToken,
} from '../../utils/storage';
import { AxiosHeader, createJwtHeader } from '../../utils/jwtHeaders';
import { getRpcPath } from '../../utils/env';

export function getJsonRpcClient() {
  return new JsonRpcClient(getStorageAppEndpointKey() ?? '', getRpcPath());
}

export function getWsSubscriptionsClient() {
  return new WsSubscriptionsClient(getStorageAppEndpointKey() ?? '', '/ws');
}

export function getConfigAndJwt() {
  const jwtObject: JsonWebToken | null = getJWTObject();
  const headers: AxiosHeader | null = createJwtHeader();
  if (!headers) {
    return {
      error: { message: 'Failed to create auth headers', code: 500 },
    };
  }
  if (!jwtObject) {
    return {
      error: { message: 'Failed to get JWT token', code: 500 },
    };
  }
  if (jwtObject.executor_public_key === null) {
    return {
      error: { message: 'Failed to get executor public key', code: 500 },
    };
  }

  const config: RequestConfig = {
    headers: headers,
    timeout: 10000,
  };

  return { jwtObject, config };
}

export class LogicApiDataSource implements ClientApi {
  async createProposal(
    request: CreateProposalRequest,
  ): ApiResponse<CreateProposalResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    const params: RpcQueryParams<CreateProposalRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.CREATE_PROPOSAL_MESSAGES,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<
      CreateProposalRequest,
      CreateProposalResponse
    >(params, config);

    if (response?.error) {
      return await this.handleError(response.error, {}, this.createProposal);
    }

    return {
      data: response.result.output as CreateProposalResponse,
      error: null,
    };
  }

  async approveProposal(
    request: ApproveProposalRequest,
  ): ApiResponse<ApproveProposalResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    console.log('appoveProposal', request);

    const params: RpcQueryParams<ApproveProposalRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.APPROVE_PROPOSAL_MESSAGE,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<
      ApproveProposalRequest,
      ApproveProposalResponse
    >(params, config);

    console.log('appoveProposal response', response);

    if (response?.error) {
      return await this.handleError(response.error, {}, this.approveProposal);
    }

    return {
      data: {},
      error: null,
    };
  }

  async getProposalMessages(
    request: GetProposalMessagesRequest,
  ): ApiResponse<GetProposalMessagesResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    console.log('getProposalMessages', request);

    const params: RpcQueryParams<GetProposalMessagesRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_PROPOSAL_MESSAGES,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<
      GetProposalMessagesRequest,
      GetProposalMessagesResponse
    >(params, config);

    console.log('getProposalMessages response', response);

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
  }
  async sendProposalMessage(
    request: SendProposalMessageRequest,
  ): ApiResponse<SendProposalMessageResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    const response = await getJsonRpcClient().execute<
      SendProposalMessageRequest,
      SendProposalMessageResponse
    >(
      {
        contextId: jwtObject?.context_id ?? getContextId(),
        method: ClientMethod.SEND_PROPOSAL_MESSAGE,
        argsJson: request,
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
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
  }

  private async handleError(
    error: RpcError,
    params: any,
    callbackFunction: any,
  ) {
    if (error && error.code) {
      const response = await handleRpcError(error, getNodeUrl);
      if (response.code === 403) {
        return await callbackFunction(params);
      }
      return {
        error: await handleRpcError(error, getNodeUrl),
      };
    }
  }
}
