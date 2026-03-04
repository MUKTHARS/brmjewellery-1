export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  ACCOUNT_DISABLED: 'Your account has been disabled. Please contact support.',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Token is invalid',
  UNAUTHORIZED: 'You must be logged in to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  RESET_TOKEN_INVALID: 'Password reset link is invalid or has expired',

  // User
  USER_NOT_FOUND: 'User not found',

  // Product
  PRODUCT_NOT_FOUND: 'Product not found',
  PRODUCT_SLUG_EXISTS: 'A product with this slug already exists',
  PRODUCT_SKU_EXISTS: 'A product with this SKU already exists',

  // Category
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_SLUG_EXISTS: 'A category with this slug already exists',
  CATEGORY_HAS_PRODUCTS: 'Cannot delete a category that has products',

  // Order
  ORDER_NOT_FOUND: 'Order not found',
  ORDER_CANNOT_CANCEL: 'This order cannot be cancelled in its current state',

  // Cart
  CART_ITEM_NOT_FOUND: 'Cart item not found',

  // Bespoke
  ENQUIRY_NOT_FOUND: 'Bespoke enquiry not found',

  // Appointment
  APPOINTMENT_NOT_FOUND: 'Appointment not found',
  APPOINTMENT_SLOT_TAKEN: 'This appointment slot is no longer available',

  // Payment
  PAYMENT_FAILED: 'Payment processing failed',
  STRIPE_WEBHOOK_INVALID: 'Invalid Stripe webhook signature',

  // General
  VALIDATION_ERROR: 'Validation failed',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again.',
  NOT_FOUND: 'Resource not found',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE: 'Invalid file type. Only images are allowed.',
} as const;
