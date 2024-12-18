import React from 'react';
import { FormGroup, ProposalData } from './CreateProposalPopup';

interface MaxActiveProposalsFormProps {
  proposalForm: ProposalData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
}

export default function MaxActiveProposalsForm({
  proposalForm,
  handleInputChange,
}: MaxActiveProposalsFormProps) {
  return (
    <FormGroup>
      <label htmlFor="maxActiveProposals">Maximum Active Proposals</label>
      <input
        type="number"
        id="maxActiveProposals"
        name="maxActiveProposals"
        placeholder="10"
        value={proposalForm.maxActiveProposals}
        onChange={handleInputChange}
        min="1"
        required
      />
    </FormGroup>
  );
}
