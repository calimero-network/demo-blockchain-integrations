import React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import ContentWrapper from '../../components/login/ContentWrapper';
import { ClientLogin } from '@calimero-network/calimero-client';

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #111111;
  position: relative;

  .back-button {
    height: fit-content;
    color: white;
    padding: 1rem;
    cursor: pointer;
  }

  .flex-wrapper {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  .title-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.75rem;
    padding-left: 3.5rem;
    padding-right: 3.5rem;
  }

  .title {
    color: white;
    font-size: 24px;
    font-weight: bold;
  }

  .card {
    background-color: #1c1c1c;
    padding: 2rem;
    border-radius: 0.5rem;
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();

  const successRedirect = () => {
    navigate('/');
  }

  return (
    <ContentWrapper>
      <Wrapper>
        <div className="flex-wrapper">
          <div className="card">
            <div className="title-wrapper">
              <div className="title">App template</div>
            </div>
            <ClientLogin successRedirect={successRedirect} authMode={false}/>
          </div>
        </div>
      </Wrapper>
    </ContentWrapper>
  );
}
