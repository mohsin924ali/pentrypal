// ========================================
// Validation Schemas - Zod-based validation
// ========================================

import { z } from 'zod';

// ========================================
// Common Validation Rules
// ========================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .refine(password => {
    console.log('🔍 PASSWORD VALIDATION DEBUG:');
    console.log('- Input password:', JSON.stringify(password));
    console.log('- Password length:', password.length);

    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?~`-]/.test(password);

    console.log('- Has lowercase [a-z]:', hasLowercase);
    console.log('- Has uppercase [A-Z]:', hasUppercase);
    console.log('- Has digit [\\d]:', hasDigit);
    console.log('- Has special char:', hasSpecialChar);

    const isValid = hasLowercase && hasUppercase && hasDigit && hasSpecialChar;
    console.log('- Final validation result:', isValid);

    return isValid;
  }, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name is too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
  .optional();

export const urlSchema = z.string().url('Please enter a valid URL').optional();

// ========================================
// Auth Validation Schemas
// ========================================

// Email or mobile number validation
const emailOrMobileSchema = z
  .string()
  .min(1, 'Email or mobile number is required')
  .refine(
    value => {
      // Check if it's a valid email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Check if it's a valid mobile number (flexible pattern for international formats)
      // Supports formats like: 03016933184, +923016933184, +1-555-123-4567, (555) 123-4567, etc.
      const cleanedValue = value.replace(/[\s\-\(\)]/g, '');
      const mobileRegex = /^(\+?\d{1,4})?[0-9]{7,15}$/;

      return emailRegex.test(value) || mobileRegex.test(cleanedValue);
    },
    {
      message: 'Please enter a valid email address or mobile number',
    }
  );

export const loginSchema = z.object({
  email: emailOrMobileSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailOrMobileSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
      required_error: 'Please select your gender',
      invalid_type_error: 'Please select a valid gender option',
    }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
    marketingConsent: z.boolean().optional(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ========================================
// Profile Validation Schemas
// ========================================

export const updateProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  bio: z.string().max(500, 'Bio is too long').optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  website: urlSchema,
  phone: phoneSchema,
});

export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
  notifications: z
    .object({
      pushEnabled: z.boolean(),
      emailEnabled: z.boolean(),
      listUpdates: z.boolean(),
      reminders: z.boolean(),
      promotions: z.boolean(),
    })
    .optional(),
  privacy: z
    .object({
      profileVisibility: z.enum(['public', 'friends', 'private']),
      locationSharing: z.boolean(),
      analyticsOptIn: z.boolean(),
    })
    .optional(),
});

// ========================================
// Shopping List Validation Schemas
// ========================================

export const shoppingListSchema = z.object({
  name: z
    .string()
    .min(2, 'List name must be at least 2 characters')
    .max(100, 'List name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  budget: z.number().min(0, 'Budget must be positive').optional(),
  tags: z.array(z.string()).optional(),
});

export const shoppingItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Item name is too long'),
  quantity: z.number().min(0.1, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  notes: z.string().max(500, 'Notes are too long').optional(),
  estimatedPrice: z.number().min(0, 'Price must be positive').optional(),
});

// ========================================
// Pantry Validation Schemas
// ========================================

export const pantryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(200, 'Item name is too long'),
  quantity: z.number().min(0, 'Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().max(100, 'Location is too long').optional(),
  expirationDate: z.date().optional(),
  minimumStock: z.number().min(0, 'Minimum stock must be positive'),
  notes: z.string().max(500, 'Notes are too long').optional(),
  barcode: z.string().optional(),
});

// ========================================
// Type Inference
// ========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UserPreferencesFormData = z.infer<typeof userPreferencesSchema>;
export type ShoppingListFormData = z.infer<typeof shoppingListSchema>;
export type ShoppingItemFormData = z.infer<typeof shoppingItemSchema>;
export type PantryItemFormData = z.infer<typeof pantryItemSchema>;

// ========================================
// Validation Utilities
// ========================================

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

export const getPasswordStrength = (
  password: string
): {
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include a lowercase letter');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include an uppercase letter');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Include a number');

  if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?~`-]/.test(password)) score += 1;
  else feedback.push('Include a special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');

  return { score, feedback };
};

// ========================================
// Social/Friend Validation Schemas
// ========================================

export const friendRequestMessageSchema = z.string().max(500, 'Message is too long').optional();

export const sendFriendRequestSchema = z.object({
  toUserId: z.string().min(1, 'User ID is required'),
  message: friendRequestMessageSchema,
});

export const respondToFriendRequestSchema = z.object({
  requestId: z.string().min(1, 'Request ID is required'),
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: 'Action must be accept or reject' }),
  }),
  message: friendRequestMessageSchema,
});

export const searchFriendsSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').optional(),
  location: z.string().max(100, 'Location is too long').optional(),
  mutualFriendsOnly: z.boolean().optional(),
  excludeBlocked: z.boolean().optional(),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional(),
});

export const userIdSchema = z.string().min(1, 'User ID is required');

export const friendshipIdSchema = z.string().min(1, 'Friendship ID is required');

export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach(error => {
    const path = error.path.join('.');
    errors[path] = error.message;
  });

  return { success: false, errors };
};
