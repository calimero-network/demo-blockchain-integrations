import React from 'react';
import { FormGroup } from './CreateProposalPopup';

interface ActionsDropdownProps {
  actionType: string;
  handleInputChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export enum ActionTypes {
  CROSS_CONTRACT_CALL = 'Cross contract call',
  TRANSFER = 'Transfer',
  SET_CONTEXT_VARIABLE = 'Set context variable',
  CHANGE_APPROVALS_NEEDED = 'Change number of approvals needed',
  CHANGE_MAX_ACTIVE_PROPOSALS = 'Change number of maximum active proposals',
}

export const actionTypes = [
  {
    id: 'CROSS_CONTRACT_CALL',
    label: 'Cross contract call',
  },
  {
    id: 'TRANSFER',
    label: 'Transfer',
  },
  {
    id: 'SET_CONTEXT_VARIABLE',
    label: 'Set context variable',
  },
  {
    id: 'CHANGE_APPROVALS_NEEDED',
    label: 'Change number of approvals needed',
  },
  {
    id: 'CHANGE_MAX_ACTIVE_PROPOSALS',
    label: 'Change number of maximum active proposals',
  },
];

export default function ActionsDropdown({
  actionType,
  handleInputChange,
}: ActionsDropdownProps) {
  return (
    <FormGroup>
      <label htmlFor="actionType">Action Type</label>
      <select
        id="actionType"
        name="actionType"
        value={actionType}
        onChange={handleInputChange}
        required
      >
        {actionTypes.map((action, i) => (
          <option key={i} value={action.label}>
            {action.label}
          </option>
        ))}
      </select>
    </FormGroup>
  );
}
