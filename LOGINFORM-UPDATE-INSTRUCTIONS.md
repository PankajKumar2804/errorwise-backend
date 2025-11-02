# LoginForm.tsx Update Instructions

## 📍 Location
`errorwise-frontend/src/components/auth/LoginForm.tsx`

## 🎯 What We're Adding
Handling for the "Email Not Verified" error that occurs when users try to login before verifying their email.

---

## 🔧 Step-by-Step Instructions

### Step 1: Add New State Variables

Add these state variables at the top of the component (after existing useState declarations):

```typescript
const [requiresVerification, setRequiresVerification] = useState(false);
const [verificationEmail, setVerificationEmail] = useState('');
const [resendingVerification, setResendingVerification] = useState(false);
const [verificationMessage, setVerificationMessage] = useState('');
```

### Step 2: Import the Resend Verification Function

At the top of the file, ensure you have this import (add if missing):

```typescript
import { loginStep1, loginStep2, resendVerification } from '../services/auth';
```

### Step 3: Update the handleStep1Submit Function

Find your `handleStep1Submit` function and update it to catch email verification errors:

```typescript
const handleStep1Submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setRequiresVerification(false);
  setVerificationMessage('');

  try {
    const result = await loginStep1(email, password);
    
    if (result.success) {
      // OTP was sent successfully
      setOtpTimer(600); // 10 minutes
      setCanResendOtp(false);
    } else if (result.error) {
      // Check if error is about email verification
      const errorMessage = result.error.toLowerCase();
      if (errorMessage.includes('email not verified') || 
          errorMessage.includes('verify your email') ||
          errorMessage.includes('verification')) {
        setRequiresVerification(true);
        setVerificationEmail(email);
      }
      setError(result.error);
    }
  } catch (error: any) {
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('email not verified') || 
        errorMessage.includes('verify your email')) {
      setRequiresVerification(true);
      setVerificationEmail(email);
    }
    setError(error.message || 'Login failed');
  }
};
```

### Step 4: Add Resend Verification Handler

Add this new function after `handleStep1Submit`:

```typescript
const handleResendVerification = async () => {
  setResendingVerification(true);
  setVerificationMessage('');
  setError('');

  try {
    await resendVerification(verificationEmail);
    setVerificationMessage('Verification email sent! Check your inbox.');
  } catch (err: any) {
    setError(err.message || 'Failed to resend verification email');
  } finally {
    setResendingVerification(false);
  }
};
```

### Step 5: Add the UI for Email Not Verified

Find where the error message is displayed in your JSX (likely a div showing `{error && ...}`).

**RIGHT AFTER** the error div, add this new section:

```typescript
{/* Email Not Verified Warning */}
{requiresVerification && (
  <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-4 rounded-lg mb-4">
    <div className="flex items-start space-x-3">
      {/* Warning Icon */}
      <svg 
        className="h-6 w-6 mt-0.5 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      
      <div className="flex-1">
        <h3 className="font-semibold mb-1">Email Not Verified</h3>
        <p className="text-sm mb-3">
          Please verify your email address before logging in. We sent a verification link to <strong>{verificationEmail}</strong>.
        </p>
        
        {/* Success message for resend */}
        {verificationMessage && (
          <div className="bg-green-500/20 text-green-400 px-3 py-2 rounded mb-3 text-sm">
            {verificationMessage}
          </div>
        )}
        
        {/* Resend button */}
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={resendingVerification}
          className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendingVerification ? (
            <>
              <span className="inline-block animate-spin mr-2">⟳</span>
              Sending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 📝 Complete Example of the Login Form Structure

Here's how the JSX structure should look:

```typescript
return (
  <div className="w-full max-w-md">
    {!otpSent ? (
      // STEP 1: Email + Password Form
      <form onSubmit={handleStep1Submit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ⭐ NEW: Email Not Verified Warning */}
        {requiresVerification && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-400 px-4 py-4 rounded-lg">
            {/* ... email verification UI from Step 5 ... */}
          </div>
        )}

        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded-lg text-white"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-dark-lighter border border-gray-700 rounded-lg text-white"
            required
          />
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Register Link */}
        <p className="text-center text-gray-400 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Sign up
          </Link>
        </p>
      </form>
    ) : (
      // STEP 2: OTP Verification Form
      <form onSubmit={handleStep2Submit} className="space-y-6">
        {/* ... your existing OTP form ... */}
      </form>
    )}
  </div>
);
```

---

## 🧪 Testing Your Changes

After making these updates:

### Test 1: Try Login Before Email Verification

1. Register a new account
2. **Don't click the verification link**
3. Go to login page
4. Enter your email and password
5. Click "Sign In"

**Expected Result:**
- Yellow warning box appears
- Message: "Email Not Verified"
- Shows your email address
- "Resend Verification Email" button is visible

### Test 2: Resend Verification Email

1. Click "Resend Verification Email" button
2. Button should show "Sending..." with loading spinner
3. Success message should appear: "Verification email sent! Check your inbox."
4. Check backend console for email preview URL

### Test 3: Complete Verification and Login

1. Copy verification link from backend console
2. Open link in browser
3. Should see success message
4. Go back to login page
5. Enter email and password
6. Should now proceed to OTP step (no yellow warning)

---

## 🎨 Styling Notes

The code uses these Tailwind classes that match your existing design:

- `bg-yellow-500/10` - Yellow background with 10% opacity
- `border-yellow-500/50` - Yellow border with 50% opacity
- `text-yellow-400` - Yellow text
- `bg-green-500/20` - Green background for success messages
- `hover:bg-yellow-500/30` - Hover effect
- `disabled:opacity-50` - Disabled state
- `disabled:cursor-not-allowed` - Disabled cursor

Adjust these classes if your design system uses different colors or patterns.

---

## 📋 Complete Checklist

- [ ] Added 4 new state variables
- [ ] Imported `resendVerification` from auth service
- [ ] Updated `handleStep1Submit` to detect email verification errors
- [ ] Added `handleResendVerification` function
- [ ] Added email not verified UI in JSX
- [ ] Tested with unverified account
- [ ] Tested resend functionality
- [ ] Tested complete flow after verification

---

## 🆘 Troubleshooting

### Issue: `resendVerification` is not defined

**Solution:** Make sure you have this in your imports:

```typescript
import { loginStep1, loginStep2, resendVerification } from '../services/auth';
```

If the function doesn't exist in `auth.ts`, add it:

```typescript
export const resendVerification = async (email: string) => {
  const response = await api.post('/api/auth/resend-verification', { email });
  return response.data;
};
```

### Issue: Warning box doesn't show

**Check:**
1. Is `requiresVerification` being set to `true`?
2. Add a console.log in `handleStep1Submit`:
   ```typescript
   console.log('Login error:', result.error);
   console.log('Requires verification:', requiresVerification);
   ```

### Issue: Backend returns 403 but error not detected

**Solution:** The backend returns status 403 with this response:
```json
{
  "error": "Email not verified",
  "requiresEmailVerification": true,
  "email": "user@example.com"
}
```

Make sure your auth service catches 403 errors properly.

---

## ✅ Done!

Once you've made these changes, your LoginForm will properly handle email verification errors and provide a great user experience! 🎉
