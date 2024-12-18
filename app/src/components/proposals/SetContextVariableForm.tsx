import React from 'react';
import { ButtonSm, FormGroup, ProposalData } from './CreateProposalPopup';
import { styled } from 'styled-components';

const ScrollWrapper = styled.div`
  max-height: 150px;
  overflow-y: auto;
`;

interface SetContextVariableFormProps {
  proposalForm: ProposalData;
  handleContextVariableChange: (
    index: number,
    field: 'key' | 'value',
    value: string,
  ) => void;
  removeContextVariable: (index: number) => void;
  addContextVariable: () => void;
}

export default function SetContextVariableForm({
  proposalForm,
  handleContextVariableChange,
  removeContextVariable,
  addContextVariable,
}: SetContextVariableFormProps) {
  return (
    <>
      <ScrollWrapper>
        {proposalForm.contextVariables.map(
          (variable: { key: string; value: string }, index: number) => (
            <div
              key={index}
              style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-end',
              }}
            >
              <FormGroup>
                <input
                  type="text"
                  placeholder="key"
                  value={variable.key}
                  onChange={(e) =>
                    handleContextVariableChange(index, 'key', e.target.value)
                  }
                  required
                />
              </FormGroup>
              <FormGroup>
                <input
                  type="text"
                  placeholder="value"
                  value={variable.value}
                  onChange={(e) =>
                    handleContextVariableChange(index, 'value', e.target.value)
                  }
                  required
                />
              </FormGroup>
            </div>
          ),
        )}
      </ScrollWrapper>
    </>
  );
}
