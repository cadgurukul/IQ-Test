import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if Google OAuth is configured
const isGoogleConfigured = process.env.REACT_APP_GOOGLE_CLIENT_ID && 
                           process.env.REACT_APP_GOOGLE_CLIENT_ID !== 'your_google_client_id';

                           
const AppContent = (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

root.render(
  <React.StrictMode>
    {isGoogleConfigured ? (
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        {AppContent}
      </GoogleOAuthProvider>
    ) : (
      AppContent
    )}
  </React.StrictMode>
);
