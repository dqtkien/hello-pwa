import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import useNewBiometricAuth from './hooks/auth';

function App() {
  const [text, setText] = useState<any>('');
  const { createPublickey, getChallenge } = useNewBiometricAuth();

  const handleButton = async () => {
    const challenge = getChallenge();
    const result = await createPublickey(challenge);
    console.log(result);
    setText(JSON.stringify(result));
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
        <button onClick={handleButton}>Test New Auth</button>
        {text}
      </header>
    </div>
  );
}

export default App;
