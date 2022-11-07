import logo from './logo.svg';
import './App.css';
import { useNewBiometricAuth, useVerifyBiometricAuth } from './hooks/auth';

function App() {
  const { createPublickey, getChallenge } = useNewBiometricAuth();
  const { requestAuth } = useVerifyBiometricAuth();

  const registerBio = async () => {
    const challenge = getChallenge();
    const result = await createPublickey(challenge);
    console.log('register', result);
    localStorage.setItem('credId', result.id);
    console.log('credId= result.id', result.id);
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
    const pbKey = localStorage.getItem('credId')!;
    const newChallenge = '6c2c79443c4a327054b8f8e030c89938';
    const result = await requestAuth(pbKey, newChallenge);
    console.log('verify', result);
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <button onClick={registerBio}>New Auth</button>
        <button onClick={verifyBio}> Re Auth</button>
      </header>
    </div>
  );
}

export default App;
