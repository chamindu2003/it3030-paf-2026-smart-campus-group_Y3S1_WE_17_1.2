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
      console.log('[GoogleSignInButton] ✓ Google credential received');

      if (!credentialResponse?.credential) {
        console.error('[GoogleSignInButton] ✗ No credential in response');
        const errorMsg = 'No credential received from Google';
        if (onError) onError(new Error(errorMsg));
        return;
      }

      const googleToken = credentialResponse.credential;
      console.log('[GoogleSignInButton] ✓ Google token retrieved, length:', googleToken.length);
      console.log('[GoogleSignInButton] Sending to backend (/auth/google/login)...');
      
      // Call authService to send token to backend
      const response = await authService.loginWithGoogle(googleToken);

      console.log('[GoogleSignInButton] ✓ Backend responded successfully');
      console.log('[GoogleSignInButton] Response has token:', !!response?.token);

      // Validate that we got a valid token back
      if (!response?.token) {
        console.error('[GoogleSignInButton] ✗ No token in backend response');
        console.error('[GoogleSignInButton] Response:', response);
        const errorMsg = response?.message || 'No authentication token received from server';
        if (onError) onError(new Error(errorMsg));
        return;
      }

      console.log('[GoogleSignInButton] ✓ Validation passed - calling onSuccess');
      // Call parent component's success handler
      if (onSuccess) {
        onSuccess(response);
      } else {
        console.error('[GoogleSignInButton] ✗ No onSuccess callback');
      }
    } catch (error) {
      console.error('[GoogleSignInButton] ✗ Error during Google login:');
      console.error('  Type:', error.constructor.name);
      console.error('  Message:', error.message);
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
      }

      // Call parent component's error handler with detailed error
      if (onError) {
        let errorMessage = 'Google sign-in failed. ';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 400) {
          errorMessage += 'Invalid request to server.';
        } else if (error.response?.status === 401) {
          errorMessage += 'Authentication failed. Token may have expired.';
        } else if (error.response?.status === 500) {
          errorMessage += 'Server error. Please try again later.';
        } else {
          errorMessage += error.message || 'Please try again.';
        }
        console.error('[GoogleSignInButton] Calling onError:', errorMessage);
        onError(new Error(errorMessage));
      }
    }
  };

  const handleError = () => {
    console.warn('[GoogleSignInButton] Google Sign-In was cancelled or failed');
    if (onError) {
      onError(new Error('Google sign-in was cancelled. Please try again.'));
    }
  };

  return (
    <div className="google-signin-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        width="360"
        shape="pill"
        size="large"
        logo_alignment="left"
        locale="en"
      />
    </div>
  );
}

export default GoogleSignInButton;

