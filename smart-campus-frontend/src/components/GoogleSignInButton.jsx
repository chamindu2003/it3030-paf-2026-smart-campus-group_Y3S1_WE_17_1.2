import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import authService from '../api/authService';

/**
 * Google Sign-In Button Component
 * Handles Google OAuth 2.0 login using Google Sign-In library
 */
function GoogleSignInButton({ onSuccess, onError }) {
  const handleSuccess = async (credentialResponse) => {
    try {
      // Send the ID token to backend for verification and JWT generation
      const response = await authService.loginWithGoogle(credentialResponse.credential);
      console.log('Google login successful:', response);

      // Call parent component's success handler
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Google login error:', error);

      // Call parent component's error handler
      if (onError) {
        onError(error);
      }
    }
  };

  const handleError = () => {
    console.log('Google Sign-In failed');
    if (onError) {
      onError(new Error('Google Sign-In failed'));
    }
  };

  return (
    <div className="google-signin-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        width="300"
      />
    </div>
  );
}

export default GoogleSignInButton;

