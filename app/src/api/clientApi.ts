import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';

export interface Message {
  id: String;
  proposal_id: String;
  author: String;
  text: String;
  created_at: String;
}

export interface GetProposalMessagesRequest {
  // proposalId: String;
  proposal_id: String;
}

export interface GetProposalMessagesResponse {
  messages: Message[];
}

export interface SendProposalMessageRequest {
  // proposalId: String;
  proposal_id: String;
  author: String;
  text: String;
}

export interface SendProposalMessageResponse {
  result: boolean;
}

export interface CreateProposalRequest {
  receiver: String;
}

export interface CreateProposalResponse {
  proposal_id: String;
}

export interface ApproveProposalRequest {
  proposal_id: String;
}

export interface ApproveProposalResponse {
  success: boolean;
}

export enum ClientMethod {
  GET_PROPOSAL_MESSAGES = 'get_proposal_messages',
  SEND_PROPOSAL_MESSAGE = 'send_proposal_message',
  CREATE_PROPOSAL_MESSAGES = 'create_new_proposal',
  APPROVE_PROPOSAL_MESSAGE = 'approve_proposal',
}

export interface ClientApi {
  //Cali Storage
  getProposalMessages(
    proposalsRequest: GetProposalMessagesRequest,
  ): ApiResponse<GetProposalMessagesResponse>;
  sendProposalMessage(
    sendMessageRequest: SendProposalMessageRequest,
  ): ApiResponse<SendProposalMessageResponse>;
  createProposal(
    request: CreateProposalRequest,
  ): ApiResponse<CreateProposalResponse>;
  approveProposal(
    request: ApproveProposalRequest,
  ): ApiResponse<ApproveProposalResponse>;
}
