import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import styles from "./index.css"
import App from './App';

// Import thirdweb provider and Goerli ChainId
import { ThirdwebProvider } from '@thirdweb-dev/react';


// This is the chainId your dApp will work on.
const clientId = process.env.REACT_APP_CLIENT_ID;
const activeChain = process.env.REACT_APP_ACTIVE_CHAIN;

// Wrap your app with the thirdweb provider
const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={clientId}
    >
      <App />
    </ThirdwebProvider>
  </React.StrictMode>
);