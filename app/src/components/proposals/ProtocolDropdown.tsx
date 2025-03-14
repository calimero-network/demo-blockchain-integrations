import React from 'react';
import { FormGroup } from './CreateProposalPopup';

interface ProtocolDropdownProps {
  protocol: ProtocolType;
  setProtocol: (protocol: ProtocolType) => void;
}

export enum ProtocolType {
  ICP = 'ICP',
  NEAR = 'NEAR',
  STELLAR = 'STELLAR',
  STARKNET = 'STARKNET',
  EVM = "EVM"
}

export const actionTypes = [
  {
    id: ProtocolType.NEAR,
    label: 'Near',
  },
  {
    id: ProtocolType.ICP,
    label: 'Internet Computer',
  },
  {
    id: ProtocolType.STELLAR,
    label: 'Stellar',
  },
  {
    id: ProtocolType.STARKNET,
    label: 'Starknet',
  },
  {
    id: ProtocolType.EVM,
    label: 'EVM',
  },
];

export default function ProtocolDropdown({
  protocol,
  setProtocol,
}: ProtocolDropdownProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProtocol(e.target.value as ProtocolType);
  };

  return (
    <FormGroup>
      <label htmlFor="actionType">Protocol</label>
      <select
        id="actionType"
        name="actionType"
        value={protocol}
        onChange={handleInputChange}
        required
      >
        {actionTypes.map((action, i) => (
          <option key={i} value={action.id}>
            {action.label}
          </option>
        ))}
      </select>
    </FormGroup>
  );
}
