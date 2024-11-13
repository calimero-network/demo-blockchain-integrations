import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
  getAppEndpointKey,
  getRefreshToken,
  ResponseData,
} from '@calimero-is-near/calimero-p2p-sdk';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { LogicApiDataSource } from '../../api/dataSource/LogicApiDataSource';
import {
  ApproveProposalRequest,
  ApproveProposalResponse,
  CreateProposalRequest,
  CreateProposalResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
} from '../../api/clientApi';
import { getStorageApplicationId } from '../../utils/node';
import {
  clearApplicationId,
  getStorageExecutorPublicKey,
} from '../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { ContextApiDataSource } from '../../api/dataSource/ContractApiDataSource';
import { ContractProposal } from '../../api/contractApi';

const FullPageCenter = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #111111;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const TextStyle = styled.div`
  color: white;
  margin-bottom: 2em;
  font-size: 2em;
`;

const Button = styled.button`
  color: white;
  padding: 0.25em 1em;
  margin: 0.25em;
  border-radius: 8px;
  font-size: 2em;
  background: #5dbb63;
  cursor: pointer;
  justify-content: center;
  display: flex;
  border: none;
  outline: none;
`;

const ButtonSm = styled.button`
  color: white;
  padding: 0.25em 1em;
  margin: 0.25em;
  border-radius: 8px;
  font-size: 1rem;
  background: #5dbb63;
  cursor: pointer;
  justify-content: center;
  display: flex;
  border: none;
  outline: none;
`;

const LogoutButton = styled.div`
  color: black;
  margin-top: 2rem;
  padding: 0.25em 1em;
  border-radius: 8px;
  font-size: 1em;
  background: white;
  cursor: pointer;
  justify-content: center;
  display: flex;
`;

const ProposalsWrapper = styled.div`
  .select-dropdown {
    text-align: center;
    color: white;
    padding: 0.25em 1em;
    margin: 0.25em;
    border-radius: 8px;
    font-size: 1rem;
    background: #5dbb63;
    cursor: pointer;
    justify-content: center;
    display: flex;
    border: none;
    outline: none;
  }

  .proposal-data {
    font-size: 0.75rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .actions-headers {
    display: flex;
    justify-content: space-between;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .flex-container {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .center {
    justify-content: center;
    margin-top: 0.5rem;
  }

  .title {
    padding: 0;
    margin: 0;
  }

  .actions-title {
    padding-top: 0.5rem;
  }

  .highlight {
    background: #ffa500;
  }
`;

export default function HomePage() {
  const navigate = useNavigate();
  const url = getAppEndpointKey();
  const applicationId = getStorageApplicationId();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const [approveProposalLoading, setApproveProposalLoading] = useState(false);
  const [proposals, setProposals] = useState<ContractProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ContractProposal>();

  useEffect(() => {
    if (!url || !applicationId || !accessToken || !refreshToken) {
      navigate('/auth');
    }
  }, [accessToken, applicationId, navigate, refreshToken, url]);

  async function fetchProposalMessages(proposalId: String) {
    const params: GetProposalMessagesRequest = {
      proposal_id: proposalId,
    };
    const result: ResponseData<GetProposalMessagesResponse> =
      await new LogicApiDataSource().getProposalMessages(params);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  async function sendProposalMessage(request: SendProposalMessageRequest) {
    const params: SendProposalMessageRequest = {
      proposal_id: request.proposal_id,
      author: request.author,
      text: request.text,
    };
    const result: ResponseData<GetProposalMessagesResponse> =
      await new LogicApiDataSource().getProposalMessages(params);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  async function createProposal() {
    setCreateProposalLoading(true);
    let request: CreateProposalRequest = {
      receiver: 'vuki.testnet',
    };

    const result: ResponseData<CreateProposalResponse> =
      await new LogicApiDataSource().createProposal(request);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      setCreateProposalLoading(false);
      return;
    }
    await getProposals();
    window.alert(
      `Proposal with id: ${result.data.proposal_id} created successfully`,
    );
    setCreateProposalLoading(false);
  }

  const getProposals = async () => {
    const result: ResponseData<ContractProposal[]> =
      await new ContextApiDataSource().getContractProposals({
        offset: 0,
        limit: 10,
      });
    if (result?.error) {
      console.error('Error:', result.error);
    } else {
      // @ts-ignore
      setProposals(result.data.data);
    }
  };
  useEffect(() => {
    const setAllProposals = async () => {
      await getProposals();
    };
    setAllProposals();
  }, []);

  async function getProposalDetails() {
    //TODO implement this function
  }

  async function getNumOfProposals() {
    //TODO implement this function
  }

  async function approveProposal(proposalId: string) {
    setApproveProposalLoading(true);
    let request: ApproveProposalRequest = {
      proposal_id: proposalId,
    };

    const result: ResponseData<ApproveProposalResponse> =
      await new LogicApiDataSource().approveProposal(request);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      setApproveProposalLoading(false);
      return;
    }
    setApproveProposalLoading(false);
    window.alert(`Proposal approved successfully`);
  }

  async function getContextDetails() {
    //TODO implement this function
  }

  async function getContextMembers() {
    //TODO implement this function
  }

  async function getContextMembersCount() {
    //TODO implement this function
  }

  // const observeNodeEvents = async () => {
  //   let subscriptionsClient: SubscriptionsClient = getWsSubscriptionsClient();
  //   await subscriptionsClient.connect();
  //   subscriptionsClient.subscribe([getContextId()]);

  //   subscriptionsClient?.addCallback((data: NodeEvent) => {
  //     if (data.data.events && data.data.events.length > 0) {
  //       let currentValue = String.fromCharCode(...data.data.events[0].data);
  //       let currentValueInt = isNaN(parseInt(currentValue))
  //         ? 0
  //         : parseInt(currentValue);
  //       setCount(currentValueInt);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   observeNodeEvents();
  // }, []);

  const logout = () => {
    clearAppEndpoint();
    clearJWT();
    clearApplicationId();
    navigate('/auth');
  };

  return (
    <FullPageCenter>
      <TextStyle>
        <span> Welcome to home page!</span>
      </TextStyle>

      <div> Proposals </div>

      <Button onClick={createProposal} disabled={createProposalLoading}>
        {createProposalLoading ? 'Loading...' : 'Create new proposals'}
      </Button>

      <ProposalsWrapper>
        <select
          value={selectedProposal ? selectedProposal.id : 'Select Proposal'}
          onChange={(e) =>
            setSelectedProposal(proposals.find((p) => p.id === e.target.value))
          }
          className="select-dropdown"
        >
          <option value="">Select a proposal</option>
          {proposals &&
            proposals.map((proposal) => (
              <option key={proposal.id} value={proposal.id}>
                {proposal.id}
              </option>
            ))}
        </select>
        {selectedProposal && (
          <div className="proposal-data">
            <div className="flex-container">
              <h3 className="title">Proposal ID:</h3>
              <span>{selectedProposal.id}</span>
            </div>
            <div className="flex-container">
              <h3 className="title">Author ID:</h3>
              <span>{selectedProposal.author_id}</span>
            </div>

            <h3 className="title actions-title">Actions</h3>
            <div className="actions-headers highlight">
              <div>Scope</div>
              <div>Amount</div>
              <div>Receiver ID</div>
            </div>
            <div>
              {selectedProposal.actions.map((action, index) => (
                <div key={index} className="actions-headers">
                  <div>{action.scope}</div>
                  <div>{action.params.amount}</div>
                  <div>{action.params.receiver_id}</div>
                </div>
              ))}
            </div>
            <div className="flex-container center">
              <ButtonSm onClick={() => approveProposal(selectedProposal.id)}>
                {approveProposalLoading ? 'Loading...' : 'Approve proposal'}
              </ButtonSm>
              <ButtonSm
                onClick={() => {
                  fetchProposalMessages(selectedProposal.id);
                }}
              >
                Get Messages
              </ButtonSm>
              <ButtonSm
                onClick={() => {
                  sendProposalMessage({
                    proposal_id: selectedProposal.id,
                    author: getStorageExecutorPublicKey(),
                    text: 'test' + Math.random(),
                  } as SendProposalMessageRequest);
                }}
              >
                Send Message
              </ButtonSm>
            </div>
          </div>
        )}
      </ProposalsWrapper>
      <LogoutButton onClick={logout}>Logout</LogoutButton>
    </FullPageCenter>
  );
}
