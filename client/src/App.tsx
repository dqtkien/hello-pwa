import logo from './logo.svg';
import './App.css';
import { useNewBiometricAuth, useVerifyBiometricAuth } from './hooks/auth';
import { useState } from 'react';
import axios from 'axios';

function App() {
  const { createPublickey, getChallenge, verifyAndStorePublicKey } =
    useNewBiometricAuth();
  const { requestAuth } = useVerifyBiometricAuth();
  const [text, setText] = useState('');

  const registerBio = async () => {
    const challenge = getChallenge();
    const result = await createPublickey(challenge);
    console.log('register', result);
    localStorage.setItem('credId', result.id);
    console.log('credId= result.id', result.id);
    await verifyAndStorePublicKey(result);
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(
        (uvpaa) => {
          if (uvpaa) {
            console.log('system support');
          } else {
            console.log('not');
          }
        }
      );
    } else {
      console.log('not');
    }
  };

  const verifyBio = async () => {
    try {
      const pbKey = localStorage.getItem('credId')!;
      const newChallenge = '6c2c79443c4a327054b8f8e030c89938';
      const result = await requestAuth(pbKey, newChallenge);
      console.log('verify', result);
      const response = await axios.post(
        'http://localhost:4000/v1/verify-signature',
        {
          data: result,
        }
      );
      console.log(response);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <button onClick={registerBio}>New Auth</button>
        <button onClick={verifyBio}> Re Auth</button>
      </header>
    </div>
  );
}

export default App;
