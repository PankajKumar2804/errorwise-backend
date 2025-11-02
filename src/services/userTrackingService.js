const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const DeletedUserTracking = require('../models/DeletedUserTracking');
const ErrorQuery = require('../models/ErrorQuery');
const { sendEmail } = require('../utils/emailService');

/**
 * Hash sensitive data for tracking
 */
const hashData = (data) => {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
};

/**
 * Check if user has deleted account before
 */
const checkDeletedUserHistory = async (email, phoneNumber = null, googleId = null) => {
  const emailHash = hashData(email);
  
  const whereClause = {
    emailHash
  };
  
  if (phoneNumber) {
    whereClause.phoneHash = hashData(phoneNumber);
  }
  
  if (googleId) {
    whereClause.googleId = googleId;
  }
  
  const deletedUser = await DeletedUserTracking.findOne({
    where: whereClause,
    order: [['deletionDate', 'DESC']]
  });
  
  return deletedUser;
};

/**
 * Register new user with abuse prevention
 */
const registerUser = async (userData) => {
  const { username, email, password, phoneNumber = null, googleId = null } = userData;
  
  // Check if email already exists (including soft-deleted)
  const existingUser = await User.findOne({
    where: { email },
    paranoid: false // Include soft-deleted users
  });
  
  if (existingUser && !existingUser.deletedAt) {
    throw new Error('Email already in use');
  }
  
  // Check deleted user history
  const deletedHistory = await checkDeletedUserHistory(email, phoneNumber, googleId);
  
  let originalRegistrationDate = new Date();
  let accountRecreationCount = 0;
  let isAbuser = false;
  let subscriptionTier = 'free';
  
  if (deletedHistory) {
    // User has deleted account before
    originalRegistrationDate = deletedHistory.originalRegistrationDate;
    accountRecreationCount = deletedHistory.deletionCount;
    
    // Check for abuse patterns
    if (deletedHistory.deletionCount >= 3) {
      isAbuser = true;
      subscriptionTier = 'restricted'; // No free tier benefits
    }
    
    // If user deleted within 30 days, they're likely abusing
    const daysSinceDeletion = (Date.now() - new Date(deletedHistory.deletionDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceDeletion < 30 && deletedHistory.deletionCount >= 2) {
      isAbuser = true;
    }
  }
  
  // If restoring soft-deleted user
  if (existingUser && existingUser.deletedAt) {
    // Restore the user
    await existingUser.restore();
    
    // Update with new info but keep tracking data
    existingUser.username = username;
    if (password) {
      existingUser.password = await bcrypt.hash(password, 10);
    }
    existingUser.accountRecreationCount = accountRecreationCount + 1;
    existingUser.originalRegistrationDate = originalRegistrationDate;
    existingUser.isActive = !isAbuser;
    
    await existingUser.save();
    
    return {
      user: existingUser,
      isReturningUser: true,
      accountRecreationCount: existingUser.accountRecreationCount,
      hasFreeTierAccess: !isAbuser,
      message: isAbuser ? 'Account restored but free tier access restricted due to previous abuse' : 'Welcome back! Account restored.'
    };
  }
  
  // Create new user
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  
  const emailVerificationToken = crypto.randomBytes(32).toString('hex');
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    googleId,
    phoneNumber,
    originalRegistrationDate,
    accountRecreationCount,
    isActive: !isAbuser,
    emailVerificationToken,
    emailVerificationExpires,
    isEmailVerified: !!googleId, // Auto-verify if Google signup
    subscriptionStatus: isAbuser ? 'free' : 'free'
  });
  
  // Send verification email
  if (!googleId) {
    await sendVerificationEmail(user);
  }
  
  return {
    user,
    isReturningUser: !!deletedHistory,
    accountRecreationCount,
    hasFreeTierAccess: !isAbuser,
    requiresEmailVerification: !googleId,
    message: isAbuser 
      ? 'Account created but free tier access restricted. Please contact support.'
      : 'Account created successfully. Please verify your email.'
  };
};

/**
 * Send email verification
 */
const sendVerificationEmail = async (user) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${user.emailVerificationToken}`;
  
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email - ErrorWise',
    html: `
      <h2>Welcome to ErrorWise!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">
        Verify Email
      </a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `
  });
};

/**
 * Verify email
 */
const verifyEmail = async (token) => {
  // First check if user exists with this token
  let user = await User.findOne({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { [require('sequelize').Op.gt]: new Date() }
    }
  });
  
  if (!user) {
    // Check if user is already verified (token was already used)
    user = await User.findOne({
      where: {
        isEmailVerified: true,
        email: { [require('sequelize').Op.ne]: null }
      }
    });
    
    if (user) {
      // User exists and is already verified - allow auto-login
      return {
        alreadyVerified: true,
        user: user
      };
    }
    
    throw new Error('Invalid or expired verification token');
  }
  
  // Verify the user for the first time
  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();
  
  return user;
};

/**
 * Send phone verification OTP
 */
const sendPhoneVerificationOTP = async (userId, phoneNumber) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  
  user.phoneNumber = phoneNumber;
  user.phoneVerificationToken = otpHash;
  user.phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();
  
  // TODO: Integrate with SMS service (Twilio, etc.)
  // For now, send OTP via email
  await sendEmail({
    to: user.email,
    subject: 'Phone Verification OTP - ErrorWise',
    html: `
      <h2>Phone Verification</h2>
      <p>Your verification code is: <strong style="font-size: 24px; color: #667eea;">${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `
  });
  
  return { message: 'OTP sent successfully', otpSentTo: 'email' };
};

/**
 * Verify phone OTP
 */
const verifyPhoneOTP = async (userId, otp) => {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');
  
  if (!user.phoneVerificationToken || !user.phoneVerificationExpires) {
    throw new Error('No OTP request found');
  }
  
  if (new Date() > user.phoneVerificationExpires) {
    throw new Error('OTP expired');
  }
  
  const isValid = await bcrypt.compare(otp, user.phoneVerificationToken);
  if (!isValid) {
    throw new Error('Invalid OTP');
  }
  
  user.isPhoneVerified = true;
  user.phoneVerificationToken = null;
  user.phoneVerificationExpires = null;
  await user.save();
  
  return user;
};

/**
 * Delete user account (soft delete + track)
 */
const deleteUserAccount = async (userId, reason = null, ipAddress = null) => {
  const user = await User.findByPk(userId);
  
  if (!user) throw new Error('User not found');
  
  // Count total queries
  const totalQueries = await ErrorQuery.count({ where: { userId } });
  
  // Check if already tracked
  const emailHash = hashData(user.email);
  let deletedTracking = await DeletedUserTracking.findOne({
    where: { emailHash }
  });
  
  if (deletedTracking) {
    // Update existing tracking
    deletedTracking.deletionCount += 1;
    deletedTracking.deletionDate = new Date();
    deletedTracking.totalQueriesBeforeDeletion = totalQueries;
    deletedTracking.subscriptionTierAtDeletion = user.subscriptionStatus;
    deletedTracking.deletionReason = reason;
    deletedTracking.ipAddressAtDeletion = ipAddress;
    
    // Mark as abuser if deleted 3+ times
    if (deletedTracking.deletionCount >= 3) {
      deletedTracking.isAbuser = true;
      deletedTracking.abuseReason = 'Multiple account deletions detected';
    }
    
    await deletedTracking.save();
  } else {
    // Create new tracking entry
    await DeletedUserTracking.create({
      originalUserId: user.id,
      email: user.email,
      emailHash,
      phoneNumber: user.phoneNumber,
      phoneHash: user.phoneNumber ? hashData(user.phoneNumber) : null,
      googleId: user.googleId,
      originalRegistrationDate: user.originalRegistrationDate || user.createdAt,
      deletionDate: new Date(),
      deletionCount: 1,
      totalQueriesBeforeDeletion: totalQueries,
      subscriptionTierAtDeletion: user.subscriptionStatus,
      deletionReason: reason,
      ipAddressAtDeletion: ipAddress
    });
  }
  
  // Soft delete the user
  await user.destroy();
  
  return {
    message: 'Account deleted successfully',
    canRecreate: true,
    note: 'Your account history is preserved. If you return, your original registration date will be maintained.'
  };
};

module.exports = {
  hashData,
  registerUser,
  verifyEmail,
  sendPhoneVerificationOTP,
  verifyPhoneOTP,
  deleteUserAccount,
  checkDeletedUserHistory,
  sendVerificationEmail
};
