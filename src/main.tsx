import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { createStore } from './store/createStore';

import './index.css';

if (import.meta.env.DEV) {
  import('./index.dev.css');
}

const root = createRoot(document.getElementById('root')!);
const store = createStore();

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
