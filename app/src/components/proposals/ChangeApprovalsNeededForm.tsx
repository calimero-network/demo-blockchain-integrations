import React from 'react';
import { FormGroup, ProposalData } from './CreateProposalPopup';

interface ChangeApprovalsNeededFormProps {
  proposalForm: ProposalData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function ChangeApprovalsNeededForm({
  proposalForm,
  handleInputChange,
}: ChangeApprovalsNeededFormProps) {
  return (
    <FormGroup>
      <label htmlFor="minApprovals">Minimum Approvals Required</label>
      <input
        type="number"
        id="minApprovals"
        name="minApprovals"
        placeholder="2"
        value={proposalForm.minApprovals}
        onChange={handleInputChange}
        min="1"
        required
      />
    </FormGroup>
  );
}
