# PowerShell Script to Update Frontend with Abuse Prevention System
# Run this from the backend directory

$frontendPath = "C:\Users\panka\Webprojects\errorwise-frontend"

Write-Host "🚀 Updating ErrorWise Frontend with Abuse Prevention System..." -ForegroundColor Cyan
Write-Host ""

# Check if frontend exists
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found at: $frontendPath" -ForegroundColor Red
    exit 1
}

# Navigate to frontend
cd $frontendPath

Write-Host "📁 Working in: $frontendPath" -ForegroundColor Green
Write-Host ""

# 1. Update auth.ts service
Write-Host "1️⃣ Updating auth service (src/services/auth.ts)..." -ForegroundColor Yellow

$authServiceContent = @'
// Enhanced Auth Service with Abuse Prevention
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
  isReturningUser: boolean;
  accountRecreationCount: number;
  hasFreeTierAccess: boolean;
  requiresEmailVerification: boolean;
  message: string;
}

interface AccountHistoryResponse {
  hasHistory: boolean;
  deletionCount?: number;
  originalRegistrationDate?: string;
  isAbuser?: boolean;
  message: string;
  abuseReason?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  // Enhanced registration with abuse prevention
  async registerEnhanced(data: RegisterData): Promise<RegisterResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/register/enhanced`, data);
    
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Regular login (keep existing for compatibility)
  async login(data: LoginData) {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data);
    
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Check account history before registration
  async checkAccountHistory(email: string): Promise<AccountHistoryResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/account/history`, { email });
    return response.data;
  },

  // Verify email with token from URL
  async verifyEmail(token: string) {
    const response = await axios.get(`${API_BASE_URL}/auth/verify-email?token=${token}`);
    return response.data;
  },

  // Resend verification email
  async resendVerification() {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/auth/resend-verification`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Send phone OTP
  async sendPhoneOTP(phoneNumber: string) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/auth/send-phone-otp`,
      { phoneNumber },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Verify phone OTP
  async verifyPhoneOTP(otp: string) {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_BASE_URL}/auth/verify-phone-otp`,
      { otp },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete account with tracking
  async deleteAccount(reason?: string) {
    const token = localStorage.getItem('token');
    const response = await axios.delete(
      `${API_BASE_URL}/auth/account`,
      {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason }
      }
    );
    
    // Clear local storage after deletion
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return response.data;
  },

  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};
'@

Set-Content -Path "src\services\auth.ts" -Value $authServiceContent
Write-Host "   ✅ Auth service updated" -ForegroundColor Green

# 2. Create VerifyEmail page
Write-Host "2️⃣ Creating VerifyEmail page (src/pages/VerifyEmail.tsx)..." -ForegroundColor Yellow

$verifyEmailContent = @'
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const email = location.state?.email || '';
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('No verification token found');
    }
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Token may be expired.');
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.resendVerification();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Verifying Email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2 text-green-600">Email Verified!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold mb-2 text-red-600">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>

            {email && (
              <div>
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Sent to: {email}
                </p>
              </div>
            )}

            <button
              onClick={() => navigate('/login')}
              className="mt-4 text-blue-500 hover:underline"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
'@

Set-Content -Path "src\pages\VerifyEmail.tsx" -Value $verifyEmailContent
Write-Host "   ✅ VerifyEmail page created" -ForegroundColor Green

# 3. Create PhoneVerificationModal component
Write-Host "3️⃣ Creating PhoneVerificationModal component..." -ForegroundColor Yellow

# Create components/auth directory if it doesn't exist
if (-not (Test-Path "src\components\auth")) {
    New-Item -Path "src\components\auth" -ItemType Directory -Force | Out-Null
}

$phoneModalContent = @'
import React, { useState } from 'react';
import { authService } from '../../services/auth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PhoneVerificationModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.sendPhoneOTP(phoneNumber);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await authService.verifyPhoneOTP(otp);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Verify Phone Number</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm">
            {error}
          </div>
        )}

        {step === 'phone' && (
          <div>
            <p className="text-gray-600 mb-4">
              Enter your phone number to receive a verification code
            </p>
            <input
              type="tel"
              placeholder="+1234567890"
              className="w-full px-4 py-2 border rounded-lg mb-4"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSendOTP}
                disabled={loading || !phoneNumber}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div>
            <p className="text-gray-600 mb-4">
              Enter the 6-digit code sent to {phoneNumber}
            </p>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              className="w-full px-4 py-2 border rounded-lg mb-4 text-center text-2xl tracking-widest"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <div className="flex gap-2">
              <button
                onClick={handleVerifyOTP}
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={() => setStep('phone')}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            </div>
            <button
              onClick={handleSendOTP}
              disabled={loading}
              className="w-full mt-2 text-sm text-blue-500 hover:underline"
            >
              Resend Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
'@

Set-Content -Path "src\components\auth\PhoneVerificationModal.tsx" -Value $phoneModalContent
Write-Host "   ✅ PhoneVerificationModal created" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Frontend files created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update your Register component to use authService.registerEnhanced()" -ForegroundColor White
Write-Host "2. Add route for /verify-email in App.tsx" -ForegroundColor White
Write-Host "3. Import: import { VerifyEmail } from './pages/VerifyEmail';" -ForegroundColor White
Write-Host "4. Add route: <Route path='/verify-email' element={<VerifyEmail />} />" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to test!" -ForegroundColor Green
'@
