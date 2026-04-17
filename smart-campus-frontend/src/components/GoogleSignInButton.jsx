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
      console.log('Google credential received:', credentialResponse);

      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Send the ID token to backend for verification and JWT generation
      console.log('Sending token to backend...');
      const response = await authService.loginWithGoogle(credentialResponse.credential);

      console.log('Google login successful:', response);

      // Call parent component's success handler
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      console.error('Google login error details:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);

      // Call parent component's error handler with detailed error
      if (onError) {
        const errorMessage = error.response?.data?.message ||
                            error.message ||
                            'Google sign-in failed. Please try again.';
        onError(new Error(errorMessage));
      }
    }
  };

  const handleError = () => {
    console.error('Google Sign-In failed - user cancelled or popup blocked');
    if (onError) {
      onError(new Error('Google sign-in was cancelled or blocked. Please try again.'));
    }
  };

  return (
    <div className="google-signin-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text="signin_with"
        width="300"
        locale="en"
      />
    </div>
  );
}

export default GoogleSignInButton;

