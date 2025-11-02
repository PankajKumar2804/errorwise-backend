# Frontend Update Instructions

## Run these commands in the FRONTEND directory: `C:\Users\panka\Webprojects\errorwise-frontend`

### Step 1: Update auth.ts service

Navigate to frontend and backup existing auth.ts:
```powershell
cd C:\Users\panka\Webprojects\errorwise-frontend
Copy-Item src\services\auth.ts src\services\auth.ts.backup
```

Create the updated `src/services/auth.ts` with these new methods:
- `registerEnhanced()` - Register with abuse prevention
- `checkAccountHistory()` - Check if user has deletion history
- `verifyEmail()` - Verify email with token
- `sendPhoneOTP()` - Send OTP to phone
- `verifyPhoneOTP()` - Verify phone with OTP
- `deleteAccount()` - Delete account with tracking

### Step 2: Create new files

```powershell
# Create VerifyEmail page
New-Item -Path "src\pages\VerifyEmail.tsx" -ItemType File -Force

# Create auth components directory
New-Item -Path "src\components\auth" -ItemType Directory -Force

# Create PhoneVerificationModal
New-Item -Path "src\components\auth\PhoneVerificationModal.tsx" -ItemType File -Force

# Create RegisterForm (enhanced)
New-Item -Path "src\components\auth\RegisterForm.tsx" -ItemType File -Force

# Create AccountSettings page
New-Item -Path "src\pages\AccountSettings.tsx" -ItemType File -Force
```

### Step 3: Copy the code

I'll provide the complete code for each file. Would you like me to:
1. Create individual .tsx files with the code in the backend directory that you can copy over?
2. Or provide the code in a single reference file?

## Alternative: Use PowerShell to create files directly

Run this from the **frontend** directory:

```powershell
cd C:\Users\panka\Webprojects\errorwise-frontend

# The code files are ready in the guide I created earlier
# Copy them from FRONTEND_INTEGRATION_GUIDE.md
```

Would you like me to open VS Code in the frontend directory so I can create the files there directly?
