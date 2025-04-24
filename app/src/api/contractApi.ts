import { ApiResponse } from "@calimero-network/calimero-client";

export interface ContextDetails {}

export interface Members {
  publicKey: String;
}

export interface ProposalAction {
  scope: string;
  params: {
    amount: number;
    receiver_id: string;
  };
}

export interface ContractProposal {
  id: string;
  author_id: string;
  actions: ProposalAction[];
}

//
export interface CalimeroProposalMetadata {}

export interface ContextDetails {}

export interface Members {
  publicKey: String;
}

export interface Message {
  publicKey: String;
}

export interface ApprovalsCount {
  proposal_id: string;
  num_approvals: number;
}

export interface ContextVariables {
  key: string;
  value: string;
}

export interface GetProposalsRequest {
  offset: number;
  limit: number;
}

export interface ContractApi {
  //Contract
  getContractProposals(
    request: GetProposalsRequest,
  ): ApiResponse<ContractProposal[]>;
  getProposalApprovals(proposalId: String): ApiResponse<ApprovalsCount>;
  getNumOfProposals(): ApiResponse<number>;
  getContextVariables(): ApiResponse<ContextVariables[]>;
  getContextMembers(): ApiResponse<Members[]>;
  getContextMembersCount(): ApiResponse<number>;
  
  getContextDetails(contextId: String): ApiResponse<ContextDetails>;
  
  deleteProposal(proposalId: string): ApiResponse<void>;
}

// async removeProposal(proposalId: String): ApiResponse<boolean> {
//   return await this.client.delete<boolean>(
//     `${this.endpoint}/admin-api/contexts/${this.contextId}/proposals/${proposalId}`,
//   );
// }

// async getProposalMessage(
//   proposalId: String,
//   messageId: String,
// ): ApiResponse<Message> {
//   return await this.client.get<Message>(
//     `${this.endpoint}/admin-api/contexts/${this.contextId}/proposals/${proposalId}/messages/${messageId}`,
//   );
// }

// async getProposalMessages(proposalId: String): ApiResponse<Message[]> {
//   return await this.client.get<Message[]>(
//     `${this.endpoint}/admin-api/contexts/${this.contextId}/proposals/${proposalId}/messages`,
//   );
// }
// async approveProposal(proposalId: String): ApiResponse<boolean> {
//   return await this.client.post<boolean>(
//     `${this.endpoint}/admin-api/contexts/${this.contextId}/proposals/${proposalId}/vote`,
//   );
// }
