import {
  clearAppEndpoint,
  clearJWT,
  getAccessToken,
  getAppEndpointKey,
  getRefreshToken,
  NodeEvent,
  ResponseData,
  SubscriptionsClient,
} from '@calimero-is-near/calimero-p2p-sdk';
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import {
  getWsSubscriptionsClient,
  LogicApiDataSource,
} from '../../api/dataSource/LogicApiDataSource';
import {
  ApproveProposalRequest,
  ApproveProposalResponse,
  CreateProposalRequest,
  CreateProposalResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
  SendProposalMessageResponse,
  ProposalActionType,
  ExternalFunctionCallAction,
  TransferAction,
} from '../../api/clientApi';
import { getContextId, getStorageApplicationId } from '../../utils/node';
import {
  clearApplicationId,
  getJWTObject,
  getStorageExecutorPublicKey,
} from '../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { ContextApiDataSource } from '../../api/dataSource/ContractApiDataSource';
import { ApprovalsCount, ContractProposal } from '../../api/contractApi';

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

const ButtonReset = styled.div`
  color: white;
  padding: 0.25em 1em;
  border-radius: 8px;
  font-size: 1em;
  background: #ffa500;
  cursor: pointer;
  justify-content: center;
  display: flex;
  margin-top: 1rem;
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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  color: white;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #333;
    color: white;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

export default function HomePage() {
  const navigate = useNavigate();
  const url = getAppEndpointKey();
  const applicationId = getStorageApplicationId();
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const [createProposalLoading, setCreateProposalLoading] = useState(false);
  const [proposals, setProposals] = useState<ContractProposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ContractProposal>();
  const [selectedProposalApprovals, setSelectedProposalApprovals] = useState<
    null | number
  >(null);
  const [proposalCount, setProposalCount] = useState<number>(0);
  const [approveProposalLoading, setApproveProposalLoading] = useState(false);
  const [hasAlerted, setHasAlerted] = useState<boolean>(false);
  const lastExecutedProposalRef = useRef<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposalForm, setProposalForm] = useState({
    actionType: 'Cross contract call',
    protocol: 'NEAR',
    contractId: '',
    methodName: '',
    arguments: [{ key: '', value: '' }],
    deposit: '',
    gas: '',
    receiverId: '',
    amount: '',
    contextVariables: [{ key: '', value: '' }],
    minApprovals: '',
    maxActiveProposals: '',
  });

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
      message: {
        id: request.message.id,
        proposal_id: request.proposal_id,
        author: request.message.author,
        text: request.message.text,
        created_at: new Date().toISOString(),
      },
    };
    const result: ResponseData<SendProposalMessageResponse> =
      await new LogicApiDataSource().sendProposalMessage(params);
    if (result?.error) {
      console.error('Error:', result.error);
      window.alert(`${result.error.message}`);
      return;
    }
  }

  async function createProposal(formData: typeof proposalForm) {
    setCreateProposalLoading(true);
    let request: CreateProposalRequest;

    try {
      console.log('Action type:', formData.actionType);

      switch (formData.actionType) {
        case 'Cross contract call': {
          const argsObject = formData.arguments.reduce(
            (acc, curr) => {
              if (curr.key && curr.value) {
                acc[curr.key] = curr.value;
              }
              return acc;
            },
            {} as Record<string, any>,
          );

          console.log(
            'Creating ExternalFunctionCall proposal with args:',
            argsObject,
          );

          request = {
            action_type: 'ExternalFunctionCall',
            params: {
              receiver_id: formData.contractId,
              method_name: formData.methodName,
              args: JSON.stringify(argsObject),
              deposit: formData.deposit || '0',
              gas:
                formData.protocol === 'NEAR'
                  ? formData.gas || '30000000000000'
                  : '0',
            },
          };

          console.log(
            'Final request structure:',
            JSON.stringify(request, null, 2),
          );
          break;
        }

        case 'Transfer': {
          request = {
            action_type: ProposalActionType.Transfer,
            params: {
              receiver_id: formData.receiverId,
              amount: formData.amount,
            },
          };
          break;
        }

        case 'Set context variable': {
          request = {
            action_type: ProposalActionType.SetContextValue,
            params: {
              key: formData.contextVariables[0].key,
              value: formData.contextVariables[0].value,
            },
          };
          break;
        }

        case 'Change number of approvals needed': {
          request = {
            action_type: ProposalActionType.SetNumApprovals,
            params: {
              num_approvals: Number(formData.minApprovals),
            },
          };
          break;
        }

        case 'Change number of maximum active proposals': {
          request = {
            action_type: ProposalActionType.SetActiveProposalsLimit,
            params: {
              active_proposals_limit: Number(formData.maxActiveProposals),
            },
          };
          break;
        }

        default:
          throw new Error('Invalid action type');
      }

      console.log('Request:', request);

      const result: ResponseData<CreateProposalResponse> =
        await new LogicApiDataSource().createProposal(request);

      if (result?.error) {
        console.error('Error:', result.error);
        window.alert(`${result.error.message}`);
        return;
      }

      if (result?.data) {
        window.alert(`Proposal created successfully`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      window.alert(`Error creating proposal: ${error.message}`);
    } finally {
      setCreateProposalLoading(false);
    }
  }

  const getProposals = async () => {
    const result: ResponseData<ContractProposal[]> =
      await new ContextApiDataSource().getContractProposals({
        offset: 0,
        limit: 10,
      });
    if (result?.error) {
      console.error('Error:', result.error);
      setProposals([]);
    } else {
      // @ts-ignore - we know the data structure has a nested data property
      const proposalsData = result.data?.data || [];

      if (selectedProposal && proposals.length > 0) {
        const stillExists = proposalsData.some(
          (proposal) => proposal.id === selectedProposal.id,
        );

        if (
          !stillExists &&
          lastExecutedProposalRef.current !== selectedProposal.id
        ) {
          window.alert(`Proposal with id: ${selectedProposal.id} was executed`);
          lastExecutedProposalRef.current = selectedProposal.id;
          setSelectedProposal(undefined);
        }
      }

      setProposals(proposalsData);
    }
  };

  useEffect(() => {
    if (selectedProposal) {
      lastExecutedProposalRef.current = null;
    }
  }, [selectedProposal]);

  const [approvers, setApprovers] = useState<string[]>([]);

  const getApprovers = async () => {
    if (selectedProposal) {
      const result = await new ContextApiDataSource().getProposalApprovals(
        selectedProposal.id,
      );
      // @ts-ignore
      setApprovers(result?.data.data ?? []);
    }
  };

  const getProposalApprovals = async () => {
    if (selectedProposal) {
      const result: ResponseData<ApprovalsCount> =
        await new ContextApiDataSource().getProposalApprovals(
          selectedProposal?.id,
        );
      if (result?.error) {
        console.error('Error:', result.error);
      } else {
        // @ts-ignore
        setSelectedProposalApprovals(result.data.data.num_approvals);
      }
    }
  };

  async function getNumOfProposals() {
    const result: ResponseData<number> =
      await new ContextApiDataSource().getNumOfProposals();
    if (result?.error) {
      console.error('Error:', result.error);
    } else {
      // @ts-ignore
      setProposalCount(result.data);
    }
  }

  useEffect(() => {
    const setProposalData = async () => {
      await getProposalApprovals();
      await getProposals();
      await getNumOfProposals();
      await getApprovers();
    };
    setProposalData();
    const intervalId = setInterval(setProposalData, 5000);
    return () => clearInterval(intervalId);
  }, [selectedProposal]);

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
  //       console.log('currentValueInt', currentValueInt);
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

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setProposalForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContextVariableChange = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setProposalForm((prev) => {
      const newVariables = [...prev.contextVariables];
      newVariables[index] = {
        ...newVariables[index],
        [field]: value,
      };
      return {
        ...prev,
        contextVariables: newVariables,
      };
    });
  };

  const addContextVariable = () => {
    setProposalForm((prev) => ({
      ...prev,
      contextVariables: [...prev.contextVariables, { key: '', value: '' }],
    }));
  };

  const removeContextVariable = (index: number) => {
    setProposalForm((prev) => ({
      ...prev,
      contextVariables: prev.contextVariables.filter((_, i) => i !== index),
    }));
  };

  const handleArgumentChange = (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => {
    setProposalForm((prev) => {
      const newArgs = [...prev.arguments];
      newArgs[index] = {
        ...newArgs[index],
        [field]: value,
      };
      return {
        ...prev,
        arguments: newArgs,
      };
    });
  };

  const addArgument = () => {
    setProposalForm((prev) => ({
      ...prev,
      arguments: [...prev.arguments, { key: '', value: '' }],
    }));
  };

  const removeArgument = (index: number) => {
    setProposalForm((prev) => ({
      ...prev,
      arguments: prev.arguments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    await createProposal(proposalForm);

    // Reset form after successful submission
    setProposalForm({
      actionType: 'Cross contract call',
      protocol: 'NEAR',
      contractId: '',
      methodName: '',
      arguments: [{ key: '', value: '' }],
      deposit: '',
      gas: '',
      receiverId: '',
      amount: '',
      contextVariables: [{ key: '', value: '' }],
      minApprovals: '',
      maxActiveProposals: '',
    });
  };

  return (
    <FullPageCenter>
      <TextStyle>
        <span> Welcome to home page!</span>
      </TextStyle>

      <div> Proposals </div>

      <Button
        onClick={() => setIsModalOpen(true)}
        disabled={createProposalLoading}
      >
        {createProposalLoading ? 'Loading...' : 'Create new proposal'}
      </Button>

      {isModalOpen && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2>Create New Proposal</h2>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label htmlFor="actionType">Action Type</label>
                <select
                  id="actionType"
                  name="actionType"
                  value={proposalForm.actionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Cross contract call">
                    Cross contract call
                  </option>
                  <option value="Transfer">Transfer</option>
                  <option value="Set context variable">
                    Set context variable
                  </option>
                  <option value="Change number of approvals needed">
                    Change number of approvals needed
                  </option>
                  <option value="Change number of maximum active proposals">
                    Change number of maximum active proposals
                  </option>
                </select>
              </FormGroup>

              {proposalForm.actionType === 'Cross contract call' && (
                <>
                  <FormGroup>
                    <label htmlFor="protocol">Protocol</label>
                    <select
                      id="protocol"
                      name="protocol"
                      value={proposalForm.protocol}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="NEAR">NEAR</option>
                      <option value="Starknet">Starknet</option>
                    </select>
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="contractId">Contract ID</label>
                    <input
                      type="text"
                      id="contractId"
                      name="contractId"
                      value={proposalForm.contractId}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="methodName">Method Name</label>
                    <input
                      type="text"
                      id="methodName"
                      name="methodName"
                      value={proposalForm.methodName}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="deposit">
                      Deposit{' '}
                      {proposalForm.protocol === 'NEAR'
                        ? '(in octoNEAR)'
                        : '(in STRK)'}
                    </label>
                    <input
                      type="text"
                      id="deposit"
                      name="deposit"
                      value={proposalForm.deposit}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </FormGroup>
                  {proposalForm.protocol === 'NEAR' && (
                    <FormGroup>
                      <label htmlFor="gas">Gas</label>
                      <input
                        type="text"
                        id="gas"
                        name="gas"
                        value={proposalForm.gas}
                        onChange={handleInputChange}
                        placeholder="30000000000000"
                        required
                      />
                    </FormGroup>
                  )}
                  <FormGroup>
                    <label>Arguments</label>
                    {proposalForm.arguments.map((arg, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'flex-end',
                        }}
                      >
                        <FormGroup>
                          <label>Key</label>
                          <input
                            type="text"
                            value={arg.key}
                            onChange={(e) =>
                              handleArgumentChange(index, 'key', e.target.value)
                            }
                            required
                          />
                        </FormGroup>
                        <FormGroup>
                          <label>Value</label>
                          <input
                            type="text"
                            value={arg.value}
                            onChange={(e) =>
                              handleArgumentChange(
                                index,
                                'value',
                                e.target.value,
                              )
                            }
                            required
                          />
                        </FormGroup>
                        <ButtonSm
                          type="button"
                          onClick={() => removeArgument(index)}
                          style={{ background: '#666', marginBottom: '1rem' }}
                        >
                          Remove
                        </ButtonSm>
                      </div>
                    ))}
                    <ButtonSm type="button" onClick={addArgument}>
                      Add Argument
                    </ButtonSm>
                  </FormGroup>
                </>
              )}

              {proposalForm.actionType === 'Transfer' && (
                <>
                  <FormGroup>
                    <label htmlFor="receiverId">Receiver ID</label>
                    <input
                      type="text"
                      id="receiverId"
                      name="receiverId"
                      value={proposalForm.receiverId}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor="amount">Amount</label>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      value={proposalForm.amount}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </>
              )}

              {proposalForm.actionType === 'Set context variable' && (
                <>
                  {proposalForm.contextVariables.map((variable, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'flex-end',
                      }}
                    >
                      <FormGroup>
                        <label>Key</label>
                        <input
                          type="text"
                          value={variable.key}
                          onChange={(e) =>
                            handleContextVariableChange(
                              index,
                              'key',
                              e.target.value,
                            )
                          }
                          required
                        />
                      </FormGroup>
                      <FormGroup>
                        <label>Value</label>
                        <input
                          type="text"
                          value={variable.value}
                          onChange={(e) =>
                            handleContextVariableChange(
                              index,
                              'value',
                              e.target.value,
                            )
                          }
                          required
                        />
                      </FormGroup>
                      <ButtonSm
                        type="button"
                        onClick={() => removeContextVariable(index)}
                        style={{ background: '#666', marginBottom: '1rem' }}
                      >
                        Remove
                      </ButtonSm>
                    </div>
                  ))}
                  <ButtonSm type="button" onClick={addContextVariable}>
                    Add Variable
                  </ButtonSm>
                </>
              )}

              {proposalForm.actionType ===
                'Change number of approvals needed' && (
                <FormGroup>
                  <label htmlFor="minApprovals">
                    Minimum Approvals Required
                  </label>
                  <input
                    type="number"
                    id="minApprovals"
                    name="minApprovals"
                    value={proposalForm.minApprovals}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </FormGroup>
              )}

              {proposalForm.actionType ===
                'Change number of maximum active proposals' && (
                <FormGroup>
                  <label htmlFor="maxActiveProposals">
                    Maximum Active Proposals
                  </label>
                  <input
                    type="number"
                    id="maxActiveProposals"
                    name="maxActiveProposals"
                    value={proposalForm.maxActiveProposals}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </FormGroup>
              )}

              <ButtonGroup>
                <ButtonSm
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: '#666' }}
                >
                  Cancel
                </ButtonSm>
                <ButtonSm type="submit">Create Proposal</ButtonSm>
              </ButtonGroup>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}

      <ProposalsWrapper>
        <div className="flex-container proposal-data">
          <h3 className="title">Number of proposals:</h3>
          <span>{proposalCount}</span>
        </div>
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
            <div className="flex-container">
              <h3 className="title">Number of approvals:</h3>
              <span>{selectedProposalApprovals}</span>
            </div>
            <div className="">
              <h3 className="title">Approvers:</h3>
              {approvers.length !== 0 ? (
                approvers.map((a, i) => (
                  <>
                    <br />
                    <span key={a}>
                      {i + 1}. {a}
                    </span>
                  </>
                ))
              ) : (
                <span>No approvers</span>
              )}
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
                    message: {
                      id: 'test' + Math.random(),
                      proposal_id: selectedProposal.id,
                      author: getJWTObject()?.executor_public_key,
                      text: 'test' + Math.random(),
                      created_at: new Date().toISOString(),
                    },
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
